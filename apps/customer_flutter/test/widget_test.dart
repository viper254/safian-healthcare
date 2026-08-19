import 'package:flutter_test/flutter_test.dart';

import 'package:safian_customer/main.dart';

void main() {
  testWidgets('renders a staging-safe customer shell without backend credentials', (tester) async {
    await tester.pumpWidget(const SafianCustomerApp(backendConfigured: false));

    expect(find.text('Healthcare supplies, clearly sourced.'), findsOneWidget);
    expect(find.text('Shared catalogue is ready to connect.'), findsOneWidget);
    expect(find.text('STAGING'), findsWidgets);
  });
}
