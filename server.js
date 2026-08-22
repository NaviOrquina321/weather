const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { db, initDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper to log user/system activity
function logActivity(userId, action, details) {
  db.run(
    'INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)',
    [userId || null, action, details],
    (err) => {
      if (err) console.error('Error logging activity:', err);
    }
  );
}

// Helper to send notification
function createNotification(userId, title, message) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
      [userId, title, message],
      function (err) {
        if (err) return reject(err);
        resolve(this.lastID);
      }
    );
  });
}

// --- USERS & TUTORS API ---

// Get all users (optional role filter)
app.get('/api/users', (req, res) => {
  const { role } = req.query;
  let sql = 'SELECT * FROM users';
  const params = [];

  if (role) {
    sql += ' WHERE role = ?';
    params.push(role);
  }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ users: rows });
  });
});

// Get user details by ID
app.get('/api/users/:id', (req, res) => {
  db.get('SELECT * FROM users WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'User not found' });
    res.json({ user: row });
  });
});

// Register or create user
app.post('/api/users', (req, res) => {
  const { name, email, role, avatar, bio, hourly_rate, subjects, experience_years } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Name, email, and role are required.' });
  }

  const sql = `
    INSERT INTO users (name, email, role, avatar, bio, hourly_rate, subjects, experience_years)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const defaultAvatar = avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';

  db.run(
    sql,
    [name, email, role, defaultAvatar, bio || '', hourly_rate || 0, subjects || '', experience_years || 0],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      logActivity(this.lastID, 'User Registered', `New ${role} created: ${name} (${email})`);
      res.status(201).json({ id: this.lastID, name, email, role });
    }
  );
});

// Search Tutors
app.get('/api/tutors/search', (req, res) => {
  const { subject, maxRate, minRating } = req.query;
  let sql = "SELECT * FROM users WHERE role = 'tutor' AND status = 'Active'";
  const params = [];

  if (subject && subject.trim() !== '') {
    sql += ' AND (subjects LIKE ? OR bio LIKE ?)';
    params.push(`%${subject.trim()}%`, `%${subject.trim()}%`);
  }

  if (maxRate) {
    sql += ' AND hourly_rate <= ?';
    params.push(parseFloat(maxRate));
  }

  if (minRating) {
    sql += ' AND rating >= ?';
    params.push(parseFloat(minRating));
  }

  sql += ' ORDER BY rating DESC';

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ tutors: rows });
  });
});

// AI Tutor Matching Algorithm
app.post('/api/tutors/match', (req, res) => {
  const { subject, maxBudget, preferredDay, skillLevel } = req.body;

  db.all("SELECT * FROM users WHERE role = 'tutor' AND status = 'Active'", [], (err, tutors) => {
    if (err) return res.status(500).json({ error: err.message });

    // Score tutors based on match criteria
    const scoredTutors = tutors.map((tutor) => {
      let score = 50; // base score
      let matchReasons = [];

      // Subject match check
      if (subject && tutor.subjects) {
        const subList = tutor.subjects.toLowerCase().split(',').map((s) => s.trim());
        const searchSub = subject.toLowerCase().trim();
        const hasDirectMatch = subList.some((s) => s.includes(searchSub) || searchSub.includes(s));

        if (hasDirectMatch) {
          score += 30;
          matchReasons.push(`Direct expertise in ${subject}`);
        } else if (tutor.bio.toLowerCase().includes(searchSub)) {
          score += 15;
          matchReasons.push(`Relevant background in ${subject}`);
        }
      }

      // Budget check
      if (maxBudget) {
        const budget = parseFloat(maxBudget);
        if (tutor.hourly_rate <= budget) {
          score += 15;
          matchReasons.push(`Fits within budget ($${tutor.hourly_rate}/hr <= $${budget}/hr)`);
        } else {
          score -= 15;
          matchReasons.push(`Rate ($${tutor.hourly_rate}/hr) exceeds budget ($${budget}/hr)`);
        }
      }

      // Rating bonus
      if (tutor.rating >= 4.8) {
        score += 10;
        matchReasons.push(`High satisfaction rating (${tutor.rating}★)`);
      }

      // Experience bonus
      if (tutor.experience_years >= 5) {
        score += 5;
        matchReasons.push(`${tutor.experience_years} years teaching experience`);
      }

      // Cap match percentage at 99% max, 30% min
      const matchPercentage = Math.min(99, Math.max(30, Math.round(score)));

      return {
        ...tutor,
        matchPercentage,
        matchReasons
      };
    });

    // Sort by match percentage descending
    scoredTutors.sort((a, b) => b.matchPercentage - a.matchPercentage);

    logActivity(null, 'AI Matching Executed', `Subject: ${subject || 'Any'}, Budget: $${maxBudget || 'Any'}`);

    res.json({
      matches: scoredTutors
    });
  });
});

// --- SCHEDULES & APPOINTMENTS API ---

// Get tutor availability schedule
app.get('/api/schedules/tutor/:tutorId', (req, res) => {
  db.all('SELECT * FROM schedules WHERE tutor_id = ? ORDER BY day_of_week, start_time', [req.params.tutorId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ schedules: rows });
  });
});

// Add/update availability schedule slot
app.post('/api/schedules/tutor/:tutorId', (req, res) => {
  const tutorId = req.params.tutorId;
  const { day_of_week, start_time, end_time, is_open } = req.body;

  if (day_of_week === undefined || !start_time || !end_time) {
    return res.status(400).json({ error: 'day_of_week, start_time, and end_time are required.' });
  }

  const sql = `
    INSERT INTO schedules (tutor_id, day_of_week, start_time, end_time, is_open)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(sql, [tutorId, day_of_week, start_time, end_time, is_open !== undefined ? is_open : 1], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    logActivity(tutorId, 'Schedule Updated', `Slot added for day ${day_of_week} (${start_time}-${end_time})`);
    res.status(201).json({ id: this.lastID, tutor_id: tutorId, day_of_week, start_time, end_time, is_open });
  });
});

// Get appointments (filter by student_id or tutor_id)
app.get('/api/appointments', (req, res) => {
  const { student_id, tutor_id } = req.query;
  let sql = `
    SELECT a.*,
           s.name as student_name, s.email as student_email,
           t.name as tutor_name, t.email as tutor_email, t.hourly_rate,
           p.status as payment_status, p.transaction_id
    FROM appointments a
    JOIN users s ON a.student_id = s.id
    JOIN users t ON a.tutor_id = t.id
    LEFT JOIN payments p ON p.appointment_id = a.id
  `;
  const params = [];
  const conditions = [];

  if (student_id) {
    conditions.push('a.student_id = ?');
    params.push(student_id);
  }
  if (tutor_id) {
    conditions.push('a.tutor_id = ?');
    params.push(tutor_id);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY a.date ASC, a.start_time ASC';

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ appointments: rows });
  });
});

// Book appointment (Business Rules: Check for slot conflicts, validate open schedule, optional auto-assign slot)
app.post('/api/appointments/book', (req, res) => {
  const { student_id, tutor_id, date, start_time, end_time, subject, notes } = req.body;

  if (!student_id || !tutor_id || !date || !subject) {
    return res.status(400).json({ error: 'student_id, tutor_id, date, and subject are required.' });
  }

  // Determine actual time slot (if selectedSlot was null or auto-assignment requested)
  let chosenStart = start_time || '09:00';
  let chosenEnd = end_time || '10:00';

  // Check existing appointments for clash
  const checkSql = `
    SELECT * FROM appointments
    WHERE tutor_id = ? AND date = ? AND start_time = ? AND status != 'Cancelled'
  `;

  db.get(checkSql, [tutor_id, date, chosenStart], (err, existing) => {
    if (err) return res.status(500).json({ error: err.message });
    if (existing) {
      return res.status(409).json({ error: 'This time slot is already booked. Please choose another slot.' });
    }

    // Insert new appointment
    const insertSql = `
      INSERT INTO appointments (student_id, tutor_id, date, start_time, end_time, subject, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, 'Booked', ?)
    `;

    db.run(insertSql, [student_id, tutor_id, date, chosenStart, chosenEnd, subject, notes || ''], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      const appointmentId = this.lastID;

      // Get names for notifications
      db.get('SELECT name FROM users WHERE id = ?', [student_id], (err, student) => {
        db.get('SELECT name FROM users WHERE id = ?', [tutor_id], (err, tutor) => {
          const studentName = student ? student.name : 'Student';
          const tutorName = tutor ? tutor.name : 'Tutor';

          // Send real-time notifications to both Student & Tutor
          createNotification(student_id, 'Appointment Booked!', `Your session with ${tutorName} on ${date} at ${chosenStart} is scheduled.`);
          createNotification(tutor_id, 'New Session Scheduled', `${studentName} booked a session for ${subject} on ${date} at ${chosenStart}.`);

          logActivity(student_id, 'Appointment Booked', `Booked appointment #${appointmentId} with Tutor ID ${tutor_id} on ${date} (${chosenStart})`);

          res.status(201).json({
            id: appointmentId,
            student_id,
            tutor_id,
            date,
            start_time: chosenStart,
            end_time: chosenEnd,
            subject,
            status: 'Booked'
          });
        });
      });
    });
  });
});

// Cancel appointment
app.delete('/api/appointments/:id/cancel', (req, res) => {
  const apptId = req.params.id;
  const { user_id } = req.body;

  db.get('SELECT * FROM appointments WHERE id = ?', [apptId], (err, appt) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });

    db.run("UPDATE appointments SET status = 'Cancelled' WHERE id = ?", [apptId], (err) => {
      if (err) return res.status(500).json({ error: err.message });

      // Notify parties
      createNotification(appt.student_id, 'Appointment Cancelled', `Your appointment on ${appt.date} at ${appt.start_time} has been cancelled.`);
      createNotification(appt.tutor_id, 'Appointment Cancelled', `The appointment on ${appt.date} at ${appt.start_time} was cancelled.`);

      logActivity(user_id || appt.student_id, 'Appointment Cancelled', `Cancelled appointment #${apptId}`);

      res.json({ message: 'Appointment cancelled successfully.', id: apptId });
    });
  });
});

// --- PAYMENTS API ---

// Process Payment
app.post('/api/payments/pay', (req, res) => {
  const { appointment_id, student_id, amount, payment_method } = req.body;

  if (!appointment_id || !student_id || !amount) {
    return res.status(400).json({ error: 'appointment_id, student_id, and amount are required.' });
  }

  const transactionId = 'TXN-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  const sql = `
    INSERT INTO payments (appointment_id, student_id, amount, payment_method, status, transaction_id)
    VALUES (?, ?, ?, ?, 'Paid', ?)
  `;

  db.run(sql, [appointment_id, student_id, amount, payment_method || 'Credit Card', transactionId], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    // Send payment confirmation notification
    createNotification(
      student_id,
      'Payment Confirmed!',
      `Receipt #${transactionId}: Payment of $${amount} was successfully processed.`
    );

    logActivity(student_id, 'Payment Processed', `Paid $${amount} for Appointment #${appointment_id} (TXN: ${transactionId})`);

    res.status(201).json({
      id: this.lastID,
      appointment_id,
      student_id,
      amount,
      payment_method: payment_method || 'Credit Card',
      status: 'Paid',
      transaction_id: transactionId,
      receipt_message: `Payment receipt generated for $${amount}. Transaction ID: ${transactionId}`
    });
  });
});

// Get payment history
app.get('/api/payments', (req, res) => {
  const { student_id } = req.query;
  let sql = `
    SELECT p.*, a.date, a.start_time, a.subject, t.name as tutor_name
    FROM payments p
    JOIN appointments a ON p.appointment_id = a.id
    JOIN users t ON a.tutor_id = t.id
  `;
  const params = [];

  if (student_id) {
    sql += ' WHERE p.student_id = ?';
    params.push(student_id);
  }

  sql += ' ORDER BY p.created_at DESC';

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ payments: rows });
  });
});

// --- NOTIFICATIONS API ---

// Get notifications for user
app.get('/api/notifications/user/:userId', (req, res) => {
  db.all(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
    [req.params.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ notifications: rows });
    }
  );
});

// Mark notification as read
app.put('/api/notifications/:id/read', (req, res) => {
  db.run('UPDATE notifications SET is_read = 1 WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Notification marked as read', id: req.params.id });
  });
});

// --- ADMIN MONITORING REPORTS API ---

app.get('/api/admin/reports', (req, res) => {
  db.get('SELECT COUNT(*) as total_students FROM users WHERE role = "student"', [], (err, row1) => {
    db.get('SELECT COUNT(*) as total_tutors FROM users WHERE role = "tutor"', [], (err, row2) => {
      db.get('SELECT COUNT(*) as total_sessions FROM appointments', [], (err, row3) => {
        db.get('SELECT SUM(amount) as total_revenue FROM payments WHERE status = "Paid"', [], (err, row4) => {
          db.all('SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 20', [], (err, logs) => {
            res.json({
              metrics: {
                totalStudents: row1 ? row1.total_students : 0,
                totalTutors: row2 ? row2.total_tutors : 0,
                totalSessions: row3 ? row3.total_sessions : 0,
                totalRevenue: row4 && row4.total_revenue ? row4.total_revenue : 0
              },
              recentActivity: logs || []
            });
          });
        });
      });
    });
  });
});

// --- AI CHATBOT ROUTE ---

app.post('/api/chatbot/message', (req, res) => {
  const { message, context } = req.body;
  if (!message || message.trim() === '') {
    return res.status(400).json({ error: 'Message content is required.' });
  }

  const query = message.toLowerCase().trim();

  // 1. FAQ Intent Check
  if (query.includes('cancel') || query.includes('reschedule') || query.includes('policy')) {
    return res.json({
      reply: "📅 **Cancellation Policy:** You can cancel or reschedule any tutoring session up to 24 hours prior to the scheduled start time directly from your Schedule page for a full refund. Cancellations made within 24 hours may incur a session fee.",
      action: "NAVIGATE_SCHEDULE"
    });
  }

  if (query.includes('pay') || query.includes('refund') || query.includes('cost') || query.includes('fee') || query.includes('price')) {
    return res.json({
      reply: "💳 **Payment & Fees:** Online payments are processed instantly and securely via Credit Card or Digital Wallet upon booking. All transactions are backed by TutorLink Guarantee. Tutors set their rates ranging from $35/hr to $50/hr depending on specialty.",
      action: "NAVIGATE_PAYMENTS"
    });
  }

  if (query.includes('how it works') || query.includes('help') || query.includes('features')) {
    return res.json({
      reply: "🚀 **How TutorLink Works:**\n1. **AI Tutor Matching:** Tell me what subject you need help with and your budget!\n2. **Calendar Scheduling:** Select an open time slot that fits your day.\n3. **Online Payments:** Instant checkout with digital receipt.\n4. **Monitoring Reports:** Track session attendance and learning milestones.",
      action: "SHOW_FAQ"
    });
  }

  // 2. AI Tutor Matching Request Detection
  const mathKeywords = ['math', 'calculus', 'algebra', 'sat', 'physics', 'geometry'];
  const csKeywords = ['python', 'code', 'programming', 'computer', 'web', 'javascript', 'data'];
  const englishKeywords = ['english', 'essay', 'writing', 'grammar', 'literature'];
  const chemistryKeywords = ['chemistry', 'biology', 'science', 'organic'];

  let matchedSubject = null;
  if (mathKeywords.some((k) => query.includes(k))) matchedSubject = 'Mathematics';
  else if (csKeywords.some((k) => query.includes(k))) matchedSubject = 'Computer Science';
  else if (englishKeywords.some((k) => query.includes(k))) matchedSubject = 'English Literature';
  else if (chemistryKeywords.some((k) => query.includes(k))) matchedSubject = 'Chemistry';

  if (matchedSubject || query.includes('tutor') || query.includes('find') || query.includes('match') || query.includes('recommend')) {
    db.all("SELECT * FROM users WHERE role = 'tutor' AND status = 'Active'", [], (err, tutors) => {
      let filtered = tutors;
      if (matchedSubject) {
        filtered = tutors.filter((t) => t.subjects.toLowerCase().includes(matchedSubject.toLowerCase()));
      }

      const recommendations = filtered.slice(0, 3).map((t) => ({
        id: t.id,
        name: t.name,
        subjects: t.subjects,
        rate: `$${t.hourly_rate}/hr`,
        rating: `${t.rating}★`,
        bio: t.bio,
        avatar: t.avatar
      }));

      const replyText = matchedSubject
        ? `✨ **AI Match Found!** Here are top verified tutors for **${matchedSubject}**:`
        : `✨ Here are top rated tutors available on TutorLink for you:`;

      return res.json({
        reply: replyText,
        recommendedTutors: recommendations,
        action: "RECOMMEND_TUTORS"
      });
    });
    return;
  }

  // Default conversational fallback
  return res.json({
    reply: `🤖 Hello! I'm your **TutorLink AI Assistant**. I can help you find expert tutors, book sessions, manage payments, and answer platform questions!\n\nTry asking me:\n• *"Find me a Math tutor under $50/hr"*\n• *"How do cancellations work?"*\n• *"Suggest a Computer Science tutor for Python"*`,
    action: "GENERAL_CHAT"
  });
});

// Serve frontend for root
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    next();
  }
});

// Start server function
function startServer() {
  return new Promise((resolve, reject) => {
    initDatabase().then(() => {
      const server = app.listen(PORT, () => {
        console.log(`TutorLink server running on http://localhost:${PORT}`);
        resolve(server);
      }).on('error', reject);
    }).catch(reject);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
