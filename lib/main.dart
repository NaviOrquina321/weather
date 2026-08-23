import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

void main() {
  runApp(const MyApp());
}

// Root widget of the application.
class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Student Registration',
      home: const RegistrationScreen(),
    );
  }
}

// Screen containing the student registration form.
class RegistrationScreen extends StatefulWidget {
  const RegistrationScreen({super.key});

  @override
  State<RegistrationScreen> createState() => _RegistrationScreenState();
}

// Stores the changing data and controls of the registration screen.
class _RegistrationScreenState extends State<RegistrationScreen> {
  final _formKey = GlobalKey<FormState>();

  final _nameController = TextEditingController();
  final _studentIdController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _addressController = TextEditingController();

  String? _selectedCourse;
  String? _selectedGender;
  bool _isLoading = false;
  bool _obscurePassword = true; // For hide/unhide password

  // 20 Courses list
  final List<String> _courses = [
    'BS Information Technology',
    'BS Computer Science',
    'BS Electronics Engineering',
    'BS Civil Engineering',
    'BS Mechanical Engineering',
    'BS Accountancy',
    'BS Business Administration',
    'BS Nursing',
    'BS Psychology',
    'BS Education',
    'BS Tourism Management',
    'BS Hospitality Management',
    'BS Architecture',
    'BS Criminology',
    'BS Biology',
    'BS Chemistry',
    'BS Mathematics',
    'BS Physics',
    'BS Economics',
    'BS Political Science',
  ];

  final List<String> _genders = ['Male', 'Female', 'Other'];

  Future<void> _submitForm() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isLoading = true;
    });

    await Future.delayed(const Duration(seconds: 2));

    if (!mounted) return;

    setState(() {
      _isLoading = false;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Student registered successfully!'),
        backgroundColor: Colors.green,
      ),
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _studentIdController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Student Registration')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              // Student Name: required and string only
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'Student Name',
                  border: OutlineInputBorder(),
                ),
                inputFormatters: [
                  FilteringTextInputFormatter.allow(RegExp(r'[a-zA-Z\s]')),
                ],
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Student Name is required';
                  }
                  if (!RegExp(r'^[a-zA-Z\s]+$').hasMatch(value.trim())) {
                    return 'Name must contain letters only';
                  }
                  if (value.trim().length < 2) {
                    return 'Name must contain at least 2 characters';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Student ID: required and integer only
              TextFormField(
                controller: _studentIdController,
                keyboardType: TextInputType.number,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                decoration: const InputDecoration(
                  labelText: 'Student ID',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Student ID is required';
                  }
                  if (!RegExp(r'^\d+$').hasMatch(value)) {
                    return 'Student ID must be numbers only';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Student Course: required with 20 courses
              DropdownButtonFormField<String>(
                decoration: const InputDecoration(
                  labelText: 'Student Course',
                  border: OutlineInputBorder(),
                ),
                value: _selectedCourse,
                items: _courses.map<DropdownMenuItem<String>>((course) {
                  return DropdownMenuItem<String>(
                    value: course,
                    child: Text(course),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    _selectedCourse = value;
                  });
                },
                validator: (value) {
                  if (value == null) {
                    return 'Student Course is required';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Gender: required
              DropdownButtonFormField<String>(
                decoration: const InputDecoration(
                  labelText: 'Gender',
                  border: OutlineInputBorder(),
                ),
                value: _selectedGender,
                items: _genders.map<DropdownMenuItem<String>>((gender) {
                  return DropdownMenuItem<String>(
                    value: gender,
                    child: Text(gender),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    _selectedGender = value;
                  });
                },
                validator: (value) {
                  if (value == null) {
                    return 'Gender is required';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Address: required
              TextFormField(
                controller: _addressController,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'Address',
                  border: OutlineInputBorder(),
                  alignLabelWithHint: true,
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Address is required';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Email: required and @gmail.com only
              TextFormField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(
                  labelText: 'Email',
                  border: OutlineInputBorder(),
                  hintText: 'example@gmail.com',
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Email is required';
                  }
                  if (!value.endsWith('@gmail.com')) {
                    return 'Email must end with @gmail.com';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Password: Hide/Unhide and at least 20 characters
              TextFormField(
                controller: _passwordController,
                obscureText: _obscurePassword,
                decoration: InputDecoration(
                  labelText: 'Password',
                  border: const OutlineInputBorder(),
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscurePassword
                          ? Icons.visibility_off
                          : Icons.visibility,
                    ),
                    onPressed: () {
                      setState(() {
                        _obscurePassword = !_obscurePassword;
                      });
                    },
                  ),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Password is required';
                  }
                  if (value.length < 20) {
                    return 'Password must be at least 20 characters';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),

              // Register button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _submitForm,
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Register'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
