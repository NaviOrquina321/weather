const assert = require('assert');
const http = require('http');
const { app, startServer } = require('./server');

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting Automated Integration & Functional Tests for TutorLink...\n');
  let server;

  try {
    server = await startServer();

    // Test 1: GET /api/users
    console.log('Test 1: Fetching users...');
    const usersRes = await makeRequest('/api/users');
    assert.strictEqual(usersRes.status, 200, 'GET /api/users should return status 200');
    assert(Array.isArray(usersRes.body.users), 'Response should contain users array');
    assert(usersRes.body.users.length > 0, 'Users array should not be empty');
    console.log('✅ Test 1 Passed: Users retrieved successfully.');

    // Test 2: AI Tutor Matching Endpoint
    console.log('\nTest 2: Testing AI Tutor Matching Engine...');
    const matchRes = await makeRequest('/api/tutors/match', 'POST', {
      subject: 'Mathematics',
      maxBudget: 50
    });
    assert.strictEqual(matchRes.status, 200, 'POST /api/tutors/match should return 200');
    assert(Array.isArray(matchRes.body.matches), 'Should return matches array');
    assert(matchRes.body.matches[0].matchPercentage > 70, 'Top math tutor should have high match percentage');
    console.log(`✅ Test 2 Passed: AI Matcher returned ${matchRes.body.matches.length} tutors (Top match: ${matchRes.body.matches[0].name} - ${matchRes.body.matches[0].matchPercentage}%).`);

    // Test 3: Appointment Booking and Conflict Checking
    console.log('\nTest 3: Testing Appointment Booking & Conflict Rules...');
    const testDate = '2028-03-15';
    const bookRes = await makeRequest('/api/appointments/book', 'POST', {
      student_id: 6,
      tutor_id: 2,
      date: testDate,
      start_time: '10:00',
      end_time: '11:00',
      subject: 'Calculus Advanced'
    });
    assert.strictEqual(bookRes.status, 201, 'Booking appointment should return 201 Created');
    const apptId = bookRes.body.id;
    console.log(`✅ Appointment #${apptId} booked successfully.`);

    // Attempt double booking same slot
    const conflictRes = await makeRequest('/api/appointments/book', 'POST', {
      student_id: 7,
      tutor_id: 2,
      date: testDate,
      start_time: '10:00',
      end_time: '11:00',
      subject: 'Calculus Advanced'
    });
    assert.strictEqual(conflictRes.status, 409, 'Double booking same slot should return 409 Conflict');
    console.log('✅ Test 3 Passed: Appointment conflict prevention rule verified.');

    // Test 4: Online Payment Processing
    console.log('\nTest 4: Testing Online Payment Engine...');
    const payRes = await makeRequest('/api/payments/pay', 'POST', {
      appointment_id: apptId,
      student_id: 6,
      amount: 45.00,
      payment_method: 'Credit Card'
    });
    assert.strictEqual(payRes.status, 201, 'Payment processing should return 201');
    assert(payRes.body.transaction_id.startsWith('TXN-'), 'Transaction ID should be generated');
    console.log(`✅ Test 4 Passed: Payment processed successfully (${payRes.body.transaction_id}).`);

    // Test 5: Real-time Notifications Generation
    console.log('\nTest 5: Testing Real-time Notifications...');
    const notifRes = await makeRequest('/api/notifications/user/6');
    assert.strictEqual(notifRes.status, 200, 'GET notifications should return 200');
    assert(notifRes.body.notifications.length >= 2, 'Student should have booking & payment notifications');
    console.log(`✅ Test 5 Passed: ${notifRes.body.notifications.length} Notifications generated for student.`);

    // Test 6: Admin Monitoring Reports
    console.log('\nTest 6: Testing Admin Monitoring Reports...');
    const adminRes = await makeRequest('/api/admin/reports');
    assert.strictEqual(adminRes.status, 200, 'GET admin reports should return 200');
    assert(adminRes.body.metrics.totalRevenue >= 45, 'Revenue metric should include processed payment');
    assert(adminRes.body.recentActivity.length > 0, 'Activity logs should be populated');
    console.log(`✅ Test 6 Passed: Admin metrics verified (Total Revenue: $${adminRes.body.metrics.totalRevenue}).`);

    // Test 7: AI Chatbot Engine Response
    console.log('\nTest 7: Testing AI Chatbot Response Engine...');
    const botRes = await makeRequest('/api/chatbot/message', 'POST', {
      message: 'Find me a Python tutor'
    });
    assert.strictEqual(botRes.status, 200, 'Chatbot endpoint should return 200');
    assert(botRes.body.recommendedTutors.length > 0, 'Chatbot should return recommended tutors for Python');
    console.log(`✅ Test 7 Passed: AI Chatbot correctly responded with ${botRes.body.recommendedTutors.length} Python tutor recommendations.`);

    console.log('\n🎉 ALL AUTOMATED TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('\n❌ Test Suite Failed:', err);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
  }
}

runTests();
