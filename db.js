const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.NODE_ENV === 'test' ? ':memory:' : path.join(__dirname, 'tutorlink.db');
const db = new sqlite3.Database(dbPath);

function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          role TEXT NOT NULL,
          avatar TEXT,
          bio TEXT,
          hourly_rate REAL DEFAULT 0,
          subjects TEXT,
          experience_years INTEGER DEFAULT 0,
          rating REAL DEFAULT 5.0,
          status TEXT DEFAULT 'Active'
        )
      `);

      // Availability / Schedules table
      db.run(`
        CREATE TABLE IF NOT EXISTS schedules (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          tutor_id INTEGER NOT NULL,
          day_of_week INTEGER NOT NULL,
          start_time TEXT NOT NULL,
          end_time TEXT NOT NULL,
          is_open INTEGER DEFAULT 1,
          FOREIGN KEY (tutor_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      // Appointments table
      db.run(`
        CREATE TABLE IF NOT EXISTS appointments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id INTEGER NOT NULL,
          tutor_id INTEGER NOT NULL,
          date TEXT NOT NULL,
          start_time TEXT NOT NULL,
          end_time TEXT NOT NULL,
          subject TEXT NOT NULL,
          status TEXT DEFAULT 'Booked',
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE,
          FOREIGN KEY (tutor_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      // Payments table
      db.run(`
        CREATE TABLE IF NOT EXISTS payments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          appointment_id INTEGER NOT NULL,
          student_id INTEGER NOT NULL,
          amount REAL NOT NULL,
          payment_method TEXT DEFAULT 'Credit Card',
          status TEXT DEFAULT 'Paid',
          transaction_id TEXT UNIQUE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (appointment_id) REFERENCES appointments (id) ON DELETE CASCADE,
          FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      // Notifications table
      db.run(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          is_read INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      // Activity logs table (for Monitoring Reports)
      db.run(`
        CREATE TABLE IF NOT EXISTS activity_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          action TEXT NOT NULL,
          details TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) return reject(err);
        seedInitialData().then(resolve).catch(reject);
      });
    });
  });
}

function seedInitialData() {
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
      if (err) return reject(err);
      if (row.count > 0) return resolve();

      const stmt = db.prepare(`
        INSERT INTO users (name, email, role, avatar, bio, hourly_rate, subjects, experience_years, rating, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      // Seed Admin
      stmt.run('Admin User', 'admin@tutorlink.com', 'admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'System Administrator', 0, 'All', 10, 5.0, 'Active');

      // Seed Tutors
      stmt.run('Dr. Sarah Jenkins', 'sarah.jenkins@tutorlink.com', 'tutor', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'Ph.D. in Applied Mathematics. Specializes in Calculus, Linear Algebra, and SAT Math prep.', 45, 'Mathematics, Physics, Calculus', 8, 4.9, 'Active');
      stmt.run('Prof. Michael Chang', 'michael.chang@tutorlink.com', 'tutor', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150', 'Senior Software Engineer & Educator teaching Computer Science, Python, Web Development, and Algorithms.', 50, 'Computer Science, Python, Web Development', 10, 5.0, 'Active');
      stmt.run('Elena Rostova', 'elena.rostova@tutorlink.com', 'tutor', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', 'M.A. in English Literature. Passionate about Essay Writing, Grammar, and Literature analysis.', 35, 'English Literature, Essay Writing, Grammar', 6, 4.8, 'Active');
      stmt.run('David Kim', 'david.kim@tutorlink.com', 'tutor', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', 'Chemistry and Biology specialist. Helps students excel in AP Chemistry and College Organic Chemistry.', 40, 'Chemistry, Biology, Organic Chemistry', 5, 4.7, 'Active');

      // Seed Students
      stmt.run('Alex Johnson', 'alex.j@example.com', 'student', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', 'High school senior preparing for college Calculus & Physics.', 0, 'Mathematics, Physics', 0, 5.0, 'Active');
      stmt.run('Sophia Martinez', 'sophia.m@example.com', 'student', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'College sophomore studying Computer Science and Python.', 0, 'Computer Science, Python', 0, 5.0, 'Active');

      stmt.finalize((err) => {
        if (err) return reject(err);

        // Seed Default Schedule Slots for Tutors (Tutor IDs 2, 3, 4, 5)
        const schedStmt = db.prepare(`
          INSERT INTO schedules (tutor_id, day_of_week, start_time, end_time, is_open)
          VALUES (?, ?, ?, ?, ?)
        `);

        // Days: 1 (Mon) to 5 (Fri)
        [2, 3, 4, 5].forEach((tutorId) => {
          for (let day = 1; day <= 5; day++) {
            schedStmt.run(tutorId, day, '09:00', '10:00', 1);
            schedStmt.run(tutorId, day, '10:00', '11:00', 1);
            schedStmt.run(tutorId, day, '14:00', '15:00', 1);
            schedStmt.run(tutorId, day, '15:00', '16:00', 1);
          }
        });

        schedStmt.finalize(() => {
          // Log initial system activity
          db.run(`
            INSERT INTO activity_logs (user_id, action, details)
            VALUES (1, 'System Initialization', 'Database schema created and initial mock users and availability seeded.')
          `, resolve);
        });
      });
    });
  });
}

module.exports = {
  db,
  initDatabase
};
