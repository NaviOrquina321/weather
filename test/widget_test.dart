import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:student_registration/main.dart';

void main() {
  testWidgets('RegistrationScreen displays Student ID label', (WidgetTester tester) async {
    await tester.pumpWidget(const MyApp());

    // Verify that 'Student ID' field exists and 'Student No' is not present
    expect(find.text('Student ID'), findsOneWidget);
    expect(find.text('Student No'), findsNothing);
  });
}
