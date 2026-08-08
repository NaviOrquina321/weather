import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
  Dimensions
} from 'react-native';
import Svg, {
  Path,
  Rect,
  Circle,
  RRect,
  G
} from 'react-native-svg';

// ==========================================
// 1. DATA MODELS & IN-MEMORY DATABASE
// ==========================================

const INITIAL_DOCTORS = [
  {
    id: 'DOC-1',
    name: 'Dr. Sarah Connor',
    specialty: 'Cardiologist',
    rating: '4.9',
    fee: '$150',
    imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
    availableSlots: ['09:00 AM', '10:30 AM', '02:00 PM', '04:30 PM'],
  },
  {
    id: 'DOC-2',
    name: 'Dr. Marcus Aurelius',
    specialty: 'Neurologist',
    rating: '4.8',
    fee: '$180',
    imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
    availableSlots: ['08:30 AM', '11:00 AM', '01:30 PM', '03:00 PM'],
  },
  {
    id: 'DOC-3',
    name: 'Dr. Elizabeth Blackwell',
    specialty: 'Pediatrician',
    rating: '5.0',
    fee: '$120',
    imageUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=200',
    availableSlots: ['09:30 AM', '10:00 AM', '11:30 AM', '03:30 PM'],
  },
  {
    id: 'DOC-4',
    name: 'Dr. Albert Schweitzer',
    specialty: 'General Physician',
    rating: '4.7',
    fee: '$90',
    imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200',
    availableSlots: ['10:00 AM', '12:00 PM', '02:30 PM', '04:00 PM'],
  },
];

const INITIAL_APPOINTMENTS = [
  {
    id: 'APT-1001',
    doctor: INITIAL_DOCTORS[0],
    patientName: 'John Doe',
    date: '2026-08-15',
    time: '10:30 AM',
    status: 'Pending',
    patientSignature: 'M 20,40 Q 40,20 60,40 T 100,40', // pre-filled sample signature paths
    doctorSignature: null,
  },
  {
    id: 'APT-1002',
    doctor: INITIAL_DOCTORS[2],
    patientName: 'Jane Watson',
    date: '2026-08-16',
    time: '11:30 AM',
    status: 'Completed',
    patientSignature: 'M 10,50 L 50,50 L 90,20',
    doctorSignature: 'M 15,35 C 40,15 60,65 85,35',
  },
];

// ==========================================
// 2. MEDICAL LOGO SVG COMPONENT
// ==========================================
const MedicalLogo = () => {
  return (
    <Svg width="120" height="120" viewBox="0 0 100 100">
      {/* Calendar Outer Border */}
      <Rect
        x="38"
        y="16"
        width="48"
        height="44"
        rx="10"
        fill="none"
        stroke="#0F52BA"
        strokeWidth="3.5"
      />

      {/* Calendar Header */}
      <Rect
        x="38"
        y="16"
        width="48"
        height="14"
        rx="4"
        fill="#0F52BA"
      />

      {/* Calendar Rings */}
      <Rect x="46" y="10" width="5" height="11" rx="1.5" fill="#0A2540" />
      <Rect x="74" y="10" width="5" height="11" rx="1.5" fill="#0A2540" />

      {/* Grid Dots */}
      <Circle cx="46.5" cy="38.5" r="2.5" fill="#B0BEC5" />
      <Circle cx="54.5" cy="38.5" r="2.5" fill="#B0BEC5" />
      <Circle cx="62.5" cy="38.5" r="2.5" fill="#B0BEC5" />
      <Circle cx="70.5" cy="38.5" r="2.5" fill="#B0BEC5" />
      <Circle cx="78.5" cy="38.5" r="2.5" fill="#B0BEC5" />

      <Circle cx="46.5" cy="46.5" r="2.5" fill="#B0BEC5" />
      <Circle cx="54.5" cy="46.5" r="2.5" fill="#B0BEC5" />

      {/* Blue Checked date box */}
      <Rect x="60" y="44" width="5" height="5" rx="1.5" fill="#0F52BA" />
      <Path d="M 61 46.5 L 62 47.5 L 64 45" fill="none" stroke="#FFFFFF" strokeWidth="1" />

      <Circle cx="70.5" cy="46.5" r="2.5" fill="#B0BEC5" />
      <Circle cx="78.5" cy="46.5" r="2.5" fill="#B0BEC5" />

      <Circle cx="46.5" cy="54.5" r="2.5" fill="#B0BEC5" />
      <Circle cx="54.5" cy="54.5" r="2.5" fill="#B0BEC5" />
      <Circle cx="62.5" cy="54.5" r="2.5" fill="#B0BEC5" />
      <Circle cx="70.5" cy="54.5" r="2.5" fill="#B0BEC5" />
      <Circle cx="78.5" cy="54.5" r="2.5" fill="#B0BEC5" />

      {/* Stethoscope Swoop */}
      <Path
        d="M 20 30 C 12 46, 16 74, 46 76 C 70 78, 82 64, 78 48"
        fill="none"
        stroke="#0A2540"
        strokeWidth="4.5"
        strokeLinecap="round"
      />

      {/* Stethoscope Ear Tubes */}
      <Path d="M 20 30 Q 22 20, 28 22" fill="none" stroke="#0A2540" strokeWidth="3.5" />
      <Path d="M 20 30 Q 26 40, 34 36" fill="none" stroke="#0A2540" strokeWidth="3.5" />

      {/* Earpieces */}
      <Circle cx="28" cy="22" r="2.5" fill="#0A2540" />
      <Circle cx="34" cy="36" r="2.5" fill="#0A2540" />

      {/* Chestpiece */}
      <Circle cx="78" cy="46" r="10" fill="#0A2540" />
      <Circle cx="78" cy="46" r="6" fill="#2A82E4" />
      <Circle cx="78" cy="46" r="3" fill="#FFFFFF" />

      {/* Medical Cross Badge */}
      <Circle cx="50" cy="74" r="15" fill="#FFFFFF" />
      <Circle cx="50" cy="74" r="13" fill="#1E88E5" />

      {/* Plus Sign */}
      <Path d="M 50 67 L 50 81" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
      <Path d="M 43 74 L 57 74" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
    </Svg>
  );
};

// ==========================================
// 3. INTERACTIVE SIGNATURE PAD COMPONENT
// ==========================================
const SignaturePad = ({ onSave, onClearPad, height = 150 }) => {
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState('');

  const handleTouchStart = (event) => {
    const { locationX, locationY } = event.nativeEvent;
    const path = `M ${locationX.toFixed(1)} ${locationY.toFixed(1)}`;
    setCurrentPath(path);
  };

  const handleTouchMove = (event) => {
    const { locationX, locationY } = event.nativeEvent;
    if (currentPath) {
      const newPoint = ` L ${locationX.toFixed(1)} ${locationY.toFixed(1)}`;
      const updatedPath = currentPath + newPoint;
      setCurrentPath(updatedPath);
    }
  };

  const handleTouchEnd = () => {
    if (currentPath) {
      const updatedPaths = [...paths, currentPath];
      setPaths(updatedPaths);
      setCurrentPath('');
      onSave(updatedPaths.join(' '));
    }
  };

  const clear = () => {
    setPaths([]);
    setCurrentPath('');
    onSave('');
  };

  return (
    <View style={styles.signatureContainer}>
      <View
        style={[styles.canvas, { height }]}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Svg style={StyleSheet.absoluteFill}>
          {paths.map((p, index) => (
            <Path key={index} d={p} fill="none" stroke="#0F52BA" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {currentPath ? (
            <Path d={currentPath} fill="none" stroke="#0F52BA" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          ) : null}
        </Svg>
        {paths.length === 0 && !currentPath && (
          <View style={styles.signaturePlaceholder}>
            <Text style={styles.signaturePlaceholderText}>Draw your signature here</Text>
          </View>
        )}
      </View>
      <View style={styles.signatureActions}>
        <TouchableOpacity style={styles.signatureClearButton} onPress={clear}>
          <Text style={styles.signatureClearButtonText}>Clear Canvas</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ==========================================
// 4. MAIN APPLICATION COMPONENT
// ==========================================
export default function App() {
  // Authentication & Session States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('Patient'); // 'Patient' or 'Doctor'
  const [loggedInName, setLoggedInName] = useState('Guest');

  // Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('Patient');

  // OTP Verification States
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [showNotification, setShowNotification] = useState(false);

  // App Database & Filters
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [doctors, setDoctors] = useState(INITIAL_DOCTORS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState(INITIAL_DOCTORS);

  // Modals & Forms
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('2026-08-15');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [patientSignaturePath, setPatientSignaturePath] = useState('');

  // Doctor Complete-Appointment Signature Modal
  const [doctorModalVisible, setDoctorModalVisible] = useState(false);
  const [selectedAptId, setSelectedAptId] = useState('');
  const [doctorSignaturePath, setDoctorSignaturePath] = useState('');

  // Search logic
  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = doctors.filter(
      (doc) =>
        doc.name.toLowerCase().includes(query) ||
        doc.specialty.toLowerCase().includes(query)
    );
    setFilteredDoctors(filtered);
  }, [searchQuery, doctors]);

  // Handle Log In Trigger (Initiates simulated OTP flow)
  const handleLoginRequest = () => {
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters');
      return;
    }

    // Generate random 4-digit code
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setOtpCode(generatedOtp);
    setIsVerifying(true);
    setEnteredOtp('');

    // Trigger sliding push notification alert
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 9000);
  };

  // Complete OTP validation and finalize session login
  const handleVerifyOtp = () => {
    if (enteredOtp === otpCode || enteredOtp === '1234') { // Allow 1234 as fallback
      setIsVerifying(false);
      setIsLoggedIn(true);
      setUserRole(selectedRole);
      setLoggedInName(selectedRole === 'Doctor' ? 'Dr. Sarah Connor' : email.split('@')[0]);
      setShowNotification(false);
    } else {
      Alert.alert('Verification Failed', 'Incorrect OTP. Please check your simulated email notification.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
    setIsVerifying(false);
  };

  // Book dynamic appointment
  const handleBookAppointment = () => {
    if (!selectedSlot) {
      Alert.alert('Selection Required', 'Please choose an available time slot.');
      return;
    }
    if (!patientSignaturePath) {
      Alert.alert('Signature Required', 'Please sign the consent box to confirm appointment.');
      return;
    }

    const newApt = {
      id: `APT-${1000 + appointments.length + 1}`,
      doctor: selectedDoctor,
      patientName: loggedInName,
      date: selectedDate,
      time: selectedSlot,
      status: 'Pending',
      patientSignature: patientSignaturePath,
      doctorSignature: null,
    };

    setAppointments([newApt, ...appointments]);
    setBookingModalVisible(false);
    setSelectedSlot('');
    setPatientSignaturePath('');

    Alert.alert('Booking Confirmed!', `Successfully booked appointment with ${selectedDoctor.name}.`);
  };

  const cancelAppointment = (id) => {
    setAppointments(
      appointments.map((apt) =>
        apt.id === id ? { ...apt, status: 'Cancelled' } : apt
      )
    );
    Alert.alert('Status Update', 'Appointment has been cancelled.');
  };

  // Trigger Completion Flow with Doctor Signature Modal
  const triggerDoctorSignoff = (aptId) => {
    setSelectedAptId(aptId);
    setDoctorSignaturePath('');
    setDoctorModalVisible(true);
  };

  const handleDoctorCompleteAppointment = () => {
    if (!doctorSignaturePath) {
      Alert.alert('Signature Required', 'Please sign the canvas to complete the sign-off.');
      return;
    }

    setAppointments(
      appointments.map((apt) =>
        apt.id === selectedAptId
          ? { ...apt, status: 'Completed', doctorSignature: doctorSignaturePath }
          : apt
      )
    );
    setDoctorModalVisible(false);
    setSelectedAptId('');
    setDoctorSignaturePath('');
    Alert.alert('Completed', 'Appointment successfully signed off and marked completed.');
  };

  // Quick Login pre-fills
  const prefillCredentials = (role) => {
    setSelectedRole(role);
    if (role === 'Patient') {
      setEmail('patient@clinic.com');
      setPassword('password123');
    } else {
      setEmail('doctor@clinic.com');
      setPassword('doctor123');
    }
  };

  // Counts for Doctor Dashboard Statistics
  const pendingCount = appointments.filter((a) => a.status === 'Pending').length;
  const completedCount = appointments.filter((a) => a.status === 'Completed').length;
  const cancelledCount = appointments.filter((a) => a.status === 'Cancelled').length;

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#0F52BA" />

      {/* SIMULATED PUSH NOTIFICATION ALERT (EMAIL RECEIVED) */}
      {showNotification && (
        <View style={styles.notificationAlert}>
          <View style={styles.notificationHeader}>
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>Mail</Text>
            </View>
            <Text style={styles.notificationSender}>verification@clinic.com</Text>
            <TouchableOpacity onPress={() => setShowNotification(false)}>
              <Text style={styles.notificationClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.notificationTitle}>Your OTP Verification Code</Text>
          <Text style={styles.notificationBody}>
            Hi {selectedRole}, your Doctor Appointment security code is:{' '}
            <Text style={styles.notificationCodeText}>{otpCode}</Text>. Use this to sign in.
          </Text>
        </View>
      )}

      {/* APP HEADER */}
      {isLoggedIn && (
        <View style={styles.appBar}>
          <View>
            <Text style={styles.appBarSubtitle}>Hi, {loggedInName}</Text>
            <Text style={styles.appBarTitle}>
              {userRole === 'Doctor' ? 'Doctor Dashboard' : 'Clinic Appointments'}
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* LOGIN OR AUTH VERIFICATION FLOW */}
      {!isLoggedIn ? (
        <View style={styles.authContainer}>
          {!isVerifying ? (
            // SIGN IN SCREEN
            <ScrollView contentContainerStyle={styles.scrollAuth} keyboardShouldPersistTaps="handled">
              <View style={styles.loginCard}>
                {/* Custom Svg Logo Rendering */}
                <View style={styles.logoWrapper}>
                  <MedicalLogo />
                </View>

                <Text style={styles.loginTitle}>Doctors Appointment</Text>
                <Text style={styles.loginSubtitle}>Login to book or manage appointments</Text>

                {/* Patient/Doctor Choice segment */}
                <View style={styles.toggleRow}>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      selectedRole === 'Patient' && styles.toggleActive,
                    ]}
                    onPress={() => setSelectedRole('Patient')}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        selectedRole === 'Patient' && styles.toggleTextActive,
                      ]}
                    >
                      Patient
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      selectedRole === 'Doctor' && styles.toggleActive,
                    ]}
                    onPress={() => setSelectedRole('Doctor')}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        selectedRole === 'Doctor' && styles.toggleTextActive,
                      ]}
                    >
                      Doctor
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Quick evaluation demo buttons */}
                <View style={styles.demoRow}>
                  <TouchableOpacity
                    style={styles.demoBadge}
                    onPress={() => prefillCredentials('Patient')}
                  >
                    <Text style={styles.demoBadgeText}>Patient Demo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.demoBadge, styles.demoDoctorBadge]}
                    onPress={() => prefillCredentials('Doctor')}
                  >
                    <Text style={styles.demoBadgeDoctorText}>Doctor Demo</Text>
                  </TouchableOpacity>
                </View>

                {/* Email input field */}
                <Text style={styles.fieldLabel}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor="#A0AEC0"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />

                {/* Password input field */}
                <Text style={styles.fieldLabel}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#A0AEC0"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />

                <TouchableOpacity style={styles.primaryButton} onPress={handleLoginRequest}>
                  <Text style={styles.primaryButtonText}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            // SIMULATED EMAIL OTP VERIFICATION SCREEN
            <View style={styles.verifyCard}>
              <View style={styles.verifyIconWrapper}>
                <Svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#0F52BA" strokeWidth="2">
                  <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <Path d="M22 6l-10 7L2 6" />
                </Svg>
              </View>
              <Text style={styles.loginTitle}>Enter Verification Code</Text>
              <Text style={styles.loginSubtitle}>
                We sent a 4-digit code to <Text style={{ fontWeight: 'bold' }}>{email}</Text>. Check the simulated slide-down notification alert above.
              </Text>

              <TextInput
                style={[styles.input, styles.otpInput]}
                placeholder="0000"
                placeholderTextColor="#A0AEC0"
                keyboardType="numeric"
                maxLength={4}
                value={enteredOtp}
                onChangeText={setEnteredOtp}
              />

              <TouchableOpacity style={styles.primaryButton} onPress={handleVerifyOtp}>
                <Text style={styles.primaryButtonText}>Confirm and Verify</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.backToLoginButton} onPress={() => setIsVerifying(false)}>
                <Text style={styles.backToLoginText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        // DASHBOARDS
        <View style={styles.container}>
          {userRole === 'Patient' ? (
            // ==========================================
            // PATIENT DASHBOARD INTERFACE
            // ==========================================
            <FlatList
              data={filteredDoctors}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.dashboardScroll}
              ListHeaderComponent={
                <View>
                  {/* Current Active bookings */}
                  <Text style={styles.sectionHeader}>Your Scheduled Appointments</Text>
                  {appointments.filter((apt) => apt.patientName === loggedInName).length === 0 ? (
                    <View style={styles.emptyCard}>
                      <Text style={styles.emptyCardText}>No active appointments booked yet.</Text>
                    </View>
                  ) : (
                    appointments
                      .filter((apt) => apt.patientName === loggedInName)
                      .map((apt) => {
                        let statusColor = '#ED8936'; // orange
                        if (apt.status === 'Completed') statusColor = '#38A169'; // green
                        if (apt.status === 'Cancelled') statusColor = '#E53E3E'; // red

                        return (
                          <View key={apt.id} style={styles.appointmentCard}>
                            <View style={styles.aptHeader}>
                              <Text style={styles.aptDoctorName}>{apt.doctor.name}</Text>
                              <View style={[styles.statusBadge, { backgroundColor: statusColor + '1F' }]}>
                                <Text style={[styles.statusText, { color: statusColor }]}>{apt.status}</Text>
                              </View>
                            </View>
                            <Text style={styles.aptDetails}>
                              {apt.doctor.specialty} • {apt.date} at {apt.time}
                            </Text>

                            {/* Show Patient Consent Signature */}
                            {apt.patientSignature ? (
                              <View style={styles.signaturePreviewSection}>
                                <Text style={styles.signaturePreviewTitle}>Patient Consent Signature:</Text>
                                <View style={styles.miniCanvas}>
                                  <Svg width="150" height="40" viewBox="0 0 150 40">
                                    <Path d={apt.patientSignature} fill="none" stroke="#0F52BA" strokeWidth="2" />
                                  </Svg>
                                </View>
                              </View>
                            ) : null}

                            {/* Show Doctor Completion Signature */}
                            {apt.doctorSignature ? (
                              <View style={[styles.signaturePreviewSection, { marginTop: 4 }]}>
                                <Text style={styles.signaturePreviewTitle}>Doctor Sign-off Signature:</Text>
                                <View style={styles.miniCanvas}>
                                  <Svg width="150" height="40" viewBox="0 0 150 40">
                                    <Path d={apt.doctorSignature} fill="none" stroke="#2B6CB0" strokeWidth="2" />
                                  </Svg>
                                </View>
                              </View>
                            ) : null}

                            {apt.status === 'Pending' && (
                              <TouchableOpacity
                                style={styles.cancelAptButton}
                                onPress={() => cancelAppointment(apt.id)}
                              >
                                <Text style={styles.cancelAptButtonText}>Cancel Booking</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        );
                      })
                  )}

                  <Text style={[styles.sectionHeader, { marginTop: 24 }]}>Find and Book a Doctor</Text>
                  {/* Search doctor field */}
                  <View style={styles.searchContainer}>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search by Doctor name or specialty..."
                      placeholderTextColor="#718096"
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                    />
                  </View>
                </View>
              }
              renderItem={({ item: doc }) => (
                <View style={styles.doctorCard}>
                  <Image source={{ uri: doc.imageUrl }} style={styles.doctorAvatar} />
                  <View style={styles.doctorDetails}>
                    <Text style={styles.doctorName}>{doc.name}</Text>
                    <Text style={styles.doctorSpecialty}>{doc.specialty}</Text>
                    <View style={styles.doctorRatingRow}>
                      <Text style={styles.doctorStar}>★</Text>
                      <Text style={styles.doctorRatingText}>{doc.rating}</Text>
                      <Text style={styles.doctorFeeText}>• Fee: {doc.fee}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.bookButton}
                    onPress={() => {
                      setSelectedDoctor(doc);
                      setSelectedSlot(doc.availableSlots[0]);
                      setPatientSignaturePath('');
                      setBookingModalVisible(true);
                    }}
                  >
                    <Text style={styles.bookButtonText}>Book</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          ) : (
            // ==========================================
            // DOCTOR DASHBOARD INTERFACE
            // ==========================================
            <ScrollView contentContainerStyle={styles.dashboardScroll}>
              {/* Statistic cards */}
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Pending</Text>
                  <Text style={[styles.statValue, { color: '#ED8936' }]}>{pendingCount}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Completed</Text>
                  <Text style={[styles.statValue, { color: '#38A169' }]}>{completedCount}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Cancelled</Text>
                  <Text style={[styles.statValue, { color: '#E53E3E' }]}>{cancelledCount}</Text>
                </View>
              </View>

              <Text style={styles.sectionHeader}>Patient Bookings List</Text>
              {appointments.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyCardText}>No appointments listed.</Text>
                </View>
              ) : (
                appointments.map((apt) => {
                  let statusColor = '#ED8936';
                  if (apt.status === 'Completed') statusColor = '#38A169';
                  if (apt.status === 'Cancelled') statusColor = '#E53E3E';

                  return (
                    <View key={apt.id} style={styles.doctorAptCard}>
                      <View style={styles.aptHeader}>
                        <Text style={styles.doctorPatientName}>{apt.patientName}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusColor + '1F' }]}>
                          <Text style={[styles.statusText, { color: statusColor }]}>{apt.status}</Text>
                        </View>
                      </View>
                      <Text style={styles.doctorAptLabel}>Schedule: {apt.date} at {apt.time}</Text>
                      <Text style={styles.doctorAptLabel}>Assigned Doctor: {apt.doctor.name}</Text>

                      {/* Display Patient Signature inside Doctor View */}
                      {apt.patientSignature ? (
                        <View style={styles.signaturePreviewSection}>
                          <Text style={styles.signaturePreviewTitle}>Patient Consent Signature:</Text>
                          <View style={styles.miniCanvas}>
                            <Svg width="150" height="40" viewBox="0 0 150 40">
                              <Path d={apt.patientSignature} fill="none" stroke="#0F52BA" strokeWidth="2" />
                            </Svg>
                          </View>
                        </View>
                      ) : null}

                      {/* Display Doctor Signature inside Doctor View */}
                      {apt.doctorSignature ? (
                        <View style={[styles.signaturePreviewSection, { marginTop: 4 }]}>
                          <Text style={styles.signaturePreviewTitle}>Doctor Sign-off Signature:</Text>
                          <View style={styles.miniCanvas}>
                            <Svg width="150" height="40" viewBox="0 0 150 40">
                              <Path d={apt.doctorSignature} fill="none" stroke="#2B6CB0" strokeWidth="2" />
                            </Svg>
                          </View>
                        </View>
                      ) : null}

                      {apt.status === 'Pending' && (
                        <View style={styles.doctorActionsRow}>
                          <TouchableOpacity
                            style={styles.doctorDeclineButton}
                            onPress={() => cancelAppointment(apt.id)}
                          >
                            <Text style={styles.doctorDeclineText}>Cancel</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.doctorAcceptButton}
                            onPress={() => triggerDoctorSignoff(apt.id)}
                          >
                            <Text style={styles.doctorAcceptText}>Complete & Sign</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </ScrollView>
          )}
        </View>
      )}

      {/* ==========================================
          BOOKING SHEET MODAL (PATIENT FLOW)
          ========================================== */}
      {selectedDoctor && (
        <Modal
          visible={bookingModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setBookingModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Book Appointment</Text>
                <TouchableOpacity onPress={() => setBookingModalVisible(false)}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll}>
                <Text style={styles.modalDoctorHeader}>with {selectedDoctor.name}</Text>

                {/* Date Dropdown simulator */}
                <Text style={styles.modalLabel}>Select Date</Text>
                <View style={styles.dateSelectorRow}>
                  {['2026-08-15', '2026-08-16', '2026-08-17', '2026-08-18'].map((date) => (
                    <TouchableOpacity
                      key={date}
                      style={[
                        styles.dateOption,
                        selectedDate === date && styles.dateOptionActive,
                      ]}
                      onPress={() => setSelectedDate(date)}
                    >
                      <Text style={[styles.dateOptionText, selectedDate === date && styles.dateOptionTextActive]}>
                        {date.split('-')[2]}
                      </Text>
                      <Text style={[styles.dateSubtext, selectedDate === date && styles.dateSubtextActive]}>
                        Aug
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Available Time Slots select */}
                <Text style={styles.modalLabel}>Select Available Time Slot</Text>
                <View style={styles.slotsRow}>
                  {selectedDoctor.availableSlots.map((slot) => (
                    <TouchableOpacity
                      key={slot}
                      style={[
                        styles.slotChip,
                        selectedSlot === slot && styles.slotChipActive,
                      ]}
                      onPress={() => setSelectedSlot(slot)}
                    >
                      <Text
                        style={[
                          styles.slotChipText,
                          selectedSlot === slot && styles.slotChipTextActive,
                        ]}
                      >
                        {slot}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Patient Signature Panel */}
                <Text style={styles.modalLabel}>Patient Consent Signature</Text>
                <Text style={styles.signatureNotice}>Please sign inside the canvas below to confirm consent.</Text>
                <SignaturePad onSave={setPatientSignaturePath} />

                {/* Submit button */}
                <TouchableOpacity
                  style={[
                    styles.confirmBookButton,
                    (!selectedSlot || !patientSignaturePath) && styles.confirmBookButtonDisabled,
                  ]}
                  onPress={handleBookAppointment}
                  disabled={!selectedSlot || !patientSignaturePath}
                >
                  <Text style={styles.confirmBookButtonText}>Confirm Booking</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* ==========================================
          DOCTOR SIGN-OFF MODAL (DOCTOR COMPLETION FLOW)
          ========================================== */}
      <Modal
        visible={doctorModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDoctorModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Doctor Sign-off Panel</Text>
              <TouchableOpacity onPress={() => setDoctorModalVisible(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalDoctorHeader}>Verify and sign to complete the medical case</Text>

              {/* Signature pad */}
              <Text style={styles.modalLabel}>Doctor Digital Signature</Text>
              <Text style={styles.signatureNotice}>Your signature will be stored on the digital card.</Text>
              <SignaturePad onSave={setDoctorSignaturePath} />

              <TouchableOpacity
                style={[
                  styles.confirmBookButton,
                  !doctorSignaturePath && styles.confirmBookButtonDisabled,
                ]}
                onPress={handleDoctorCompleteAppointment}
                disabled={!doctorSignaturePath}
              >
                <Text style={styles.confirmBookButtonText}>Complete Sign-off</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ==========================================
// 5. THEMED PALETTE & STYLE SHEETS
// ==========================================
const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F5F8FC',
  },
  appBar: {
    height: 70,
    backgroundColor: '#0F52BA',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  appBarSubtitle: {
    color: '#D2E3FC',
    fontSize: 12,
    fontWeight: '600',
  },
  appBarTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollAuth: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  loginCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    alignItems: 'center',
  },
  logoWrapper: {
    marginBottom: 16,
    shadowColor: '#0F52BA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 10,
  },
  loginTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0B2C5F',
    textAlign: 'center',
    marginBottom: 6,
  },
  loginSubtitle: {
    fontSize: 13,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    width: '100%',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  toggleActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#718096',
  },
  toggleTextActive: {
    color: '#0F52BA',
  },
  demoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  demoBadge: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 6,
    marginHorizontal: 4,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  demoBadgeText: {
    fontSize: 11,
    color: '#0F52BA',
    fontWeight: '600',
  },
  demoDoctorBadge: {
    borderColor: '#E2E8F0',
  },
  demoBadgeDoctorText: {
    fontSize: 11,
    color: '#0A2540',
    fontWeight: '600',
  },
  fieldLabel: {
    alignSelf: 'flex-start',
    fontSize: 13,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFC',
    color: '#2D3748',
    fontSize: 15,
    marginBottom: 16,
  },
  primaryButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#0F52BA',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F52BA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  verifyCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    alignItems: 'center',
  },
  verifyIconWrapper: {
    width: 80,
    height: 80,
    backgroundColor: '#EBF8FF',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  otpInput: {
    textAlign: 'center',
    letterSpacing: 8,
    fontSize: 22,
    fontWeight: 'bold',
    height: 54,
  },
  backToLoginButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  backToLoginText: {
    color: '#718096',
    fontSize: 14,
    fontWeight: '600',
  },
  container: {
    flex: 1,
  },
  dashboardScroll: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0B2C5F',
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyCardText: {
    color: '#A0AEC0',
    fontSize: 14,
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  aptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  aptDoctorName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  aptDetails: {
    fontSize: 13,
    color: '#718096',
    marginBottom: 12,
  },
  signaturePreviewSection: {
    padding: 8,
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    marginTop: 8,
  },
  signaturePreviewTitle: {
    fontSize: 11,
    color: '#718096',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  miniCanvas: {
    height: 40,
    justifyContent: 'center',
  },
  cancelAptButton: {
    marginTop: 12,
    backgroundColor: '#FFF5F5',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  cancelAptButtonText: {
    color: '#C53030',
    fontSize: 13,
    fontWeight: 'bold',
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  searchInput: {
    fontSize: 14,
    color: '#2D3748',
  },
  doctorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  doctorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EDF2F7',
  },
  doctorDetails: {
    flex: 1,
    marginLeft: 14,
  },
  doctorName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  doctorSpecialty: {
    fontSize: 12,
    color: '#718096',
    marginTop: 1,
  },
  doctorRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  doctorStar: {
    color: '#D69E2E',
    fontSize: 14,
  },
  doctorRatingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2D3748',
    marginLeft: 3,
  },
  doctorFeeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F52BA',
    marginLeft: 6,
  },
  bookButton: {
    backgroundColor: '#0F52BA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 2,
    elevation: 1,
  },
  statLabel: {
    fontSize: 11,
    color: '#718096',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 2,
  },
  doctorAptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  doctorPatientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  doctorAptLabel: {
    fontSize: 13,
    color: '#4A5568',
    marginTop: 2,
  },
  doctorActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  doctorDeclineButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFF5F5',
    marginRight: 8,
  },
  doctorDeclineText: {
    color: '#C53030',
    fontWeight: 'bold',
    fontSize: 13,
  },
  doctorAcceptButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#38A169',
  },
  doctorAcceptText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#EDF2F7',
    paddingBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0B2C5F',
  },
  modalCloseText: {
    fontSize: 18,
    color: '#718096',
    paddingHorizontal: 8,
  },
  modalScroll: {
    marginTop: 14,
  },
  modalDoctorHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#4A5568',
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
  },
  dateSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateOption: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateOptionActive: {
    backgroundColor: '#0F52BA',
    borderColor: '#0F52BA',
  },
  dateOptionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  dateOptionTextActive: {
    color: '#FFFFFF',
  },
  dateSubtext: {
    fontSize: 10,
    color: '#718096',
    marginTop: 1,
  },
  dateSubtextActive: {
    color: '#D2E3FC',
  },
  slotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  slotChip: {
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    margin: 4,
  },
  slotChipActive: {
    backgroundColor: '#0F52BA',
    borderColor: '#0F52BA',
  },
  slotChipText: {
    fontSize: 12,
    color: '#2D3748',
  },
  slotChipTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  signatureNotice: {
    fontSize: 11,
    color: '#718096',
    marginBottom: 8,
  },
  signatureContainer: {
    width: '100%',
    marginBottom: 16,
  },
  canvas: {
    width: '100%',
    backgroundColor: '#FAFBFD',
    borderWidth: 1,
    borderColor: '#CBD5E0',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  signaturePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  signaturePlaceholderText: {
    color: '#A0AEC0',
    fontSize: 13,
  },
  signatureActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  signatureClearButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  signatureClearButtonText: {
    color: '#E53E3E',
    fontSize: 12,
    fontWeight: 'bold',
  },
  confirmBookButton: {
    height: 48,
    backgroundColor: '#0F52BA',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 24,
  },
  confirmBookButtonDisabled: {
    backgroundColor: '#A0AEC0',
  },
  confirmBookButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  notificationAlert: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: '#2D3748',
    borderRadius: 12,
    padding: 12,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notificationBadge: {
    backgroundColor: '#E53E3E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  notificationSender: {
    color: '#A0AEC0',
    fontSize: 11,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 8,
  },
  notificationClose: {
    color: '#A0AEC0',
    fontSize: 14,
    paddingHorizontal: 4,
  },
  notificationTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  notificationBody: {
    color: '#E2E8F0',
    fontSize: 12,
    lineHeight: 16,
  },
  notificationCodeText: {
    color: '#63B3ED',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
