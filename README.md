# Clinic Doctors Appointment Scheduler (Expo React Native)

A premium-grade, high-fidelity React Native mobile application for scheduling doctor appointments, fully optimized for and runnable on the **Expo Go** application.

---

## 📱 Quick Scan / Expo Go QR Code
To load this application on your phone using **Expo Go**, you can scan the QR Code below:

```
  ┌──────────────────────────────────────────────────────────┐
  │                                                          │
  │   █▀▀▀▀▀█ ▀█ ▄▄▀▄  ▀█▀▄ █▀▀▀▀▀█   Scan this QR code with │
  │   █ ███ █ ▄▀█  █▄▀█▀███ █ ███ █   your phone's camera    │
  │   █ ▀▀▀ █ █ ▀ ▀ █  ▀  ▄ █ ▀▀▀ █   (iOS) or the Expo Go   │
  │   ▀▀▀▀▀▀▀ ▀▄█ ▀▄▀▄▀▄▀▄▀ ▀▀▀▀▀▀▀   app (Android) to load  │
  │   ▄▀▄ ▄▄▀▀▀▄██ █▄█ ▀▀▄▀▀█ ▀▄█ ▀   the live application.  │
  │   ▀ █▀█ ▀▄▀▀▄██▀████▄▀█ ▄███▄ ▄                          │
  │   █  ██▄▀▄▄  █▀ █▄█▀█▀▄███▄ ▄█▀                          │
  │   █▀▀▀▀▀█ █▄███ ▀██▄▄█▀ █▀▀██▀█                          │
  │   █ ███ █ ▀▀  ▄ ▄▀▄▀  ▄ █ ▄█▄██                          │
  │   █ ▀▀▀ █ █▄█ ▀ ▄█ ▄  █ ▀█▀█▀█▀                          │
  │   ▀▀▀▀▀▀▀ ▀▀  ▀▀ ▀  ▀▀▀ ▀  ▀▀  ▀                         │
  │                                                          │
  └──────────────────────────────────────────────────────────┘
```

Alternatively, run the start command to print a dynamic, live QR code in your terminal:
```bash
npm run start
```

---

## ✨ Features

1. **Medical Logo component (SVG)**
   - Recreated from the custom Flutter painter using native SVG structures for high-performance vector rendering.
2. **Double Role Login**
   - Toggle seamlessly between **Patient** and **Doctor** roles.
   - Click-to-autofill demo credential badges for fast testing and sign-in.
3. **Simulated Email OTP Authentication**
   - After signing in, you will be redirected to a secure verification screen.
   - A drop-down mock Push Notification from `verification@clinic.com` will slide down dynamically, displaying your unique 4-digit security OTP code.
   - Authenticate to access your dedicated dashboard.
4. **Fluid Signature Canvas / Drawing Pad**
   - Captured smoothly using React Native touch responder APIs.
   - Fully interactive, allowing users to draw and clear signatures with real-time vector path tracking.
5. **Interactive Patient Dashboard**
   - View your upcoming list of appointments.
   - Search doctor catalog by name or specialty.
   - Tap **Book** to configure dates and available slots, and sign your name to consent and book.
6. **Robust Doctor Dashboard**
   - Clean statistics dashboard displaying counts of *Pending*, *Completed*, and *Cancelled* cases.
   - Actionable list of patient bookings.
   - Complete any pending booking by signing off on a dedicated doctor signature sheet.
   - Render both patient and doctor signatures side-by-side inside completed appointment details.

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js and npm installed on your development machine.

### Installation
1. Clone the repository and install the dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

### Running the App
Start the Expo packager:
```bash
npm run start
```

- **Scan with Expo Go:** Open the Expo Go app on your phone, select "Scan QR Code" and point it at your terminal screen.
- **Run on Android Emulator:** Press `a` in your terminal.
- **Run on iOS Simulator:** Press `i` in your terminal.
- **Run on Web:** Press `w` in your terminal.
