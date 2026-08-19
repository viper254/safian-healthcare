// Safian customer client: one isolated Flutter application for Android, iOS,
// Linux, and Windows. It remains disconnected until staging-only dart-defines
// provide a Supabase URL and publishable key.
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

const clinicalGreen = Color(0xFF167A5A);
const clinicalInk = Color(0xFF14201D);
const clinicalCanvas = Color(0xFFF5F3EE);

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  const url = String.fromEnvironment('SUPABASE_URL');
  const publishableKey = String.fromEnvironment('SUPABASE_PUBLISHABLE_KEY');
  final configured = url.isNotEmpty && publishableKey.isNotEmpty;

  if (configured) {
    await Supabase.initialize(url: url, publishableKey: publishableKey);
  }

  runApp(SafianCustomerApp(backendConfigured: configured));
}

class SafianCustomerApp extends StatefulWidget {
  const SafianCustomerApp({super.key, required this.backendConfigured});
  final bool backendConfigured;

  @override
  State<SafianCustomerApp> createState() => _SafianCustomerAppState();
}

class _SafianCustomerAppState extends State<SafianCustomerApp> {
  final CartStore cart = CartStore();

  @override
  void dispose() {
    cart.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return CartScope(
      store: cart,
      child: MaterialApp(
        title: 'Safian Healthcare',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          colorScheme: ColorScheme.fromSeed(seedColor: clinicalGreen, brightness: Brightness.light),
          scaffoldBackgroundColor: clinicalCanvas,
          appBarTheme: const AppBarTheme(backgroundColor: clinicalCanvas, foregroundColor: clinicalInk, elevation: 0, surfaceTintColor: Colors.transparent),
          cardTheme: CardThemeData(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8), side: const BorderSide(color: Color(0xFFDEDED6))), elevation: 0, color: Colors.white),
        ),
        home: CustomerShell(backendConfigured: widget.backendConfigured),
      ),
    );
  }
}

class CustomerShell extends StatefulWidget {
  const CustomerShell({super.key, required this.backendConfigured});
  final bool backendConfigured;

  @override
  State<CustomerShell> createState() => _CustomerShellState();
}

class _CustomerShellState extends State<CustomerShell> {
  int section = 0;

  @override
  Widget build(BuildContext context) {
    final pages = [
      ShopPage(backendConfigured: widget.backendConfigured),
      OrdersPage(backendConfigured: widget.backendConfigured),
      AccountPage(backendConfigured: widget.backendConfigured),
    ];

    return Scaffold(
      appBar: AppBar(
        titleSpacing: 20,
        title: const BrandLockup(),
        actions: [
          if (!widget.backendConfigured) const Padding(padding: EdgeInsets.only(right: 8), child: EnvironmentChip()),
          IconButton(
            tooltip: 'Cart',
            icon: const Icon(Icons.shopping_bag_outlined),
            onPressed: () => showModalBottomSheet<void>(context: context, isScrollControlled: true, backgroundColor: Colors.transparent, builder: (_) => const CartSheet()),
          ),
          const SizedBox(width: 6),
        ],
      ),
      body: SafeArea(top: false, child: pages[section]),
      bottomNavigationBar: NavigationBar(
        selectedIndex: section,
        onDestinationSelected: (value) => setState(() => section = value),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.grid_view_rounded), label: 'Shop'),
          NavigationDestination(icon: Icon(Icons.receipt_long_outlined), label: 'Orders'),
          NavigationDestination(icon: Icon(Icons.person_outline), label: 'Account'),
        ],
      ),
    );
  }
}

class ShopPage extends StatefulWidget {
  const ShopPage({super.key, required this.backendConfigured});
  final bool backendConfigured;

  @override
  State<ShopPage> createState() => _ShopPageState();
}

class _ShopPageState extends State<ShopPage> {
  late Future<List<StoreProduct>> catalogue;
  String query = '';

  @override
  void initState() {
    super.initState();
    catalogue = loadCatalogue();
  }

  Future<List<StoreProduct>> loadCatalogue() async {
    if (!widget.backendConfigured) return const [];
    final raw = await Supabase.instance.client.from('products').select('id, name, original_price, sale_price, stock_quantity').eq('is_active', true).order('name');
    return (raw as List<dynamic>).map((row) => StoreProduct.fromMap(Map<String, dynamic>.from(row as Map))).toList();
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      color: clinicalGreen,
      onRefresh: () async => setState(() => catalogue = loadCatalogue()),
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 18, 20, 108),
        children: [
          const Text('Healthcare supplies, clearly sourced.', style: TextStyle(fontSize: 29, height: 1.05, letterSpacing: -1.2, fontWeight: FontWeight.w800, color: clinicalInk)),
          const SizedBox(height: 8),
          Text(widget.backendConfigured ? 'Browse the shared Safian catalogue.' : 'This separate client is ready for a staging backend connection.', style: const TextStyle(color: Color(0xFF63716C), fontSize: 15)),
          const SizedBox(height: 20),
          TextField(
            onChanged: (value) => setState(() => query = value.trim().toLowerCase()),
            decoration: InputDecoration(hintText: 'Search supplies', prefixIcon: const Icon(Icons.search), filled: true, fillColor: Colors.white, border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFDEDED6)))),
          ),
          const SizedBox(height: 22),
          if (!widget.backendConfigured)
            const BackendNotice()
          else
            FutureBuilder<List<StoreProduct>>(
              future: catalogue,
              builder: (context, snapshot) {
                if (snapshot.connectionState != ConnectionState.done) return const Center(child: Padding(padding: EdgeInsets.all(40), child: CircularProgressIndicator(color: clinicalGreen)));
                if (snapshot.hasError) return EmptyRecord(icon: Icons.sync_problem_outlined, title: 'Catalogue is unavailable', message: 'Check staging access and try again.');
                final products = snapshot.data!.where((product) => product.name.toLowerCase().contains(query)).toList();
                if (products.isEmpty) return const EmptyRecord(icon: Icons.inventory_2_outlined, title: 'No matching supplies', message: 'Try another search term or refresh the shared catalogue.');
                return LayoutBuilder(
                  builder: (_, constraints) {
                    final columns = constraints.maxWidth > 900 ? 4 : constraints.maxWidth > 600 ? 3 : 2;
                    return GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: products.length,
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: columns, crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: .70),
                      itemBuilder: (_, index) => ProductCard(product: products[index]),
                    );
                  },
                );
              },
            ),
        ],
      ),
    );
  }
}

class ProductCard extends StatelessWidget {
  const ProductCard({super.key, required this.product});
  final StoreProduct product;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(11),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Expanded(child: Container(width: double.infinity, decoration: BoxDecoration(color: const Color(0xFFEAF5EF), borderRadius: BorderRadius.circular(5)), child: const Icon(Icons.medical_services_outlined, color: clinicalGreen, size: 36))),
          const SizedBox(height: 10),
          Text(product.name, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w800, color: clinicalInk, height: 1.15)),
          const SizedBox(height: 4),
          Text(product.inStock ? 'Available for order' : 'Temporarily unavailable', style: TextStyle(color: product.inStock ? clinicalGreen : const Color(0xFF9A651C), fontSize: 11, fontWeight: FontWeight.w700)),
          const Spacer(),
          Text(formatKes(product.price), style: const TextStyle(fontWeight: FontWeight.w800, color: clinicalInk)),
          const SizedBox(height: 7),
          SizedBox(width: double.infinity, child: OutlinedButton.icon(onPressed: product.inStock ? () => CartScope.of(context).add(product) : null, icon: const Icon(Icons.add, size: 16), label: const Text('Add'), style: OutlinedButton.styleFrom(foregroundColor: clinicalGreen, side: const BorderSide(color: clinicalGreen), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4))))),
        ]),
      ),
    );
  }
}

class OrdersPage extends StatelessWidget {
  const OrdersPage({super.key, required this.backendConfigured});
  final bool backendConfigured;

  @override
  Widget build(BuildContext context) {
    if (!backendConfigured) return const EmptyRecord(icon: Icons.cloud_off_outlined, title: 'Orders connect after staging setup', message: 'Provide staging-only backend settings before this client reads customer order records.');
    if (Supabase.instance.client.auth.currentUser == null) return const SignInPrompt(title: 'Sign in to see your orders', message: 'Your Safian order history stays tied to your account across web, mobile, and desktop.');
    return const EmptyRecord(icon: Icons.receipt_long_outlined, title: 'Order history is ready to connect', message: 'The shared contract will expose only the signed-in customer’s orders through Supabase RLS.');
  }
}

class AccountPage extends StatefulWidget {
  const AccountPage({super.key, required this.backendConfigured});
  final bool backendConfigured;
  @override
  State<AccountPage> createState() => _AccountPageState();
}

class _AccountPageState extends State<AccountPage> {
  @override
  Widget build(BuildContext context) {
    if (!widget.backendConfigured) return const EmptyRecord(icon: Icons.admin_panel_settings_outlined, title: 'Shared access is not configured', message: 'This client remains isolated until staging credentials are supplied at build time.');
    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) return const SignInPrompt(title: 'Sign in to Safian', message: 'Use the same customer credentials as the existing web shop.');
    return ListView(padding: const EdgeInsets.all(20), children: [
      const Text('Account', style: TextStyle(fontSize: 29, fontWeight: FontWeight.w800, letterSpacing: -1.2, color: clinicalInk)),
      const SizedBox(height: 16),
      Card(child: Padding(padding: const EdgeInsets.all(18), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [const Text('Signed in as', style: TextStyle(color: Color(0xFF63716C))), const SizedBox(height: 5), Text(user.email ?? user.id, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800)), const SizedBox(height: 18), FilledButton.icon(onPressed: () async { await Supabase.instance.client.auth.signOut(); if (mounted) setState(() {}); }, style: FilledButton.styleFrom(backgroundColor: clinicalInk, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4))), icon: const Icon(Icons.logout), label: const Text('Sign out'))]))),
    ]);
  }
}

class SignInPrompt extends StatelessWidget {
  const SignInPrompt({super.key, required this.title, required this.message});
  final String title;
  final String message;
  @override
  Widget build(BuildContext context) => EmptyRecord(icon: Icons.person_outline, title: title, message: message, action: FilledButton(onPressed: () => showDialog<void>(context: context, builder: (_) => const SignInDialog()), style: FilledButton.styleFrom(backgroundColor: clinicalGreen, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4))), child: const Text('Sign in')));
}

class SignInDialog extends StatefulWidget {
  const SignInDialog({super.key});
  @override
  State<SignInDialog> createState() => _SignInDialogState();
}

class _SignInDialogState extends State<SignInDialog> {
  final email = TextEditingController();
  final password = TextEditingController();
  bool loading = false;
  String? error;
  @override
  void dispose() { email.dispose(); password.dispose(); super.dispose(); }
  Future<void> submit() async {
    setState(() { loading = true; error = null; });
    try { await Supabase.instance.client.auth.signInWithPassword(email: email.text.trim(), password: password.text); if (mounted) Navigator.of(context).pop(); } on AuthException catch (exception) { setState(() => error = exception.message); } finally { if (mounted) setState(() => loading = false); }
  }
  @override
  Widget build(BuildContext context) => AlertDialog(title: const Text('Sign in to Safian'), content: Column(mainAxisSize: MainAxisSize.min, children: [TextField(controller: email, keyboardType: TextInputType.emailAddress, decoration: const InputDecoration(labelText: 'Email')), const SizedBox(height: 10), TextField(controller: password, obscureText: true, decoration: const InputDecoration(labelText: 'Password')), if (error != null) Padding(padding: const EdgeInsets.only(top: 10), child: Text(error!, style: const TextStyle(color: Colors.red)))]), actions: [TextButton(onPressed: loading ? null : () => Navigator.of(context).pop(), child: const Text('Cancel')), FilledButton(onPressed: loading ? null : submit, child: Text(loading ? 'Signing in…' : 'Sign in'))]);
}

class CartSheet extends StatelessWidget {
  const CartSheet({super.key});
  @override
  Widget build(BuildContext context) {
    final cart = CartScope.of(context);
    return AnimatedBuilder(
      animation: cart,
      builder: (context, child) => Container(
        margin: const EdgeInsets.fromLTRB(12, 80, 12, 12),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(color: clinicalCanvas, borderRadius: BorderRadius.circular(16)),
        child: SafeArea(top: false, child: cart.items.isEmpty
            ? const EmptyRecord(icon: Icons.shopping_bag_outlined, title: 'Your cart is empty', message: 'Add supplies from the shared catalogue to prepare an order.')
            : Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [const Text('Cart', style: TextStyle(fontSize: 23, fontWeight: FontWeight.w800)), IconButton(onPressed: () => Navigator.of(context).pop(), icon: const Icon(Icons.close))]),
                Flexible(child: ListView.separated(shrinkWrap: true, itemCount: cart.items.length, separatorBuilder: (context, index) => const Divider(), itemBuilder: (context, index) { final item = cart.items[index]; return ListTile(contentPadding: EdgeInsets.zero, title: Text(item.product.name), subtitle: Text('${formatKes(item.product.price)} × ${item.quantity}'), trailing: IconButton(onPressed: () => cart.remove(item.product.id), icon: const Icon(Icons.remove_circle_outline))); })),
                const SizedBox(height: 12),
                Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [const Text('Subtotal', style: TextStyle(fontWeight: FontWeight.w800)), Text(formatKes(cart.total), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800))]),
                const SizedBox(height: 12),
                const ManualPaymentNotice(),
              ])),
      ),
    );
  }
}

class BackendNotice extends StatelessWidget {
  const BackendNotice({super.key});
  @override
  Widget build(BuildContext context) => Card(child: Padding(padding: const EdgeInsets.all(18), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [const EnvironmentChip(), const SizedBox(height: 13), const Text('Shared catalogue is ready to connect.', style: TextStyle(fontSize: 19, fontWeight: FontWeight.w800, color: clinicalInk)), const SizedBox(height: 6), const Text('Provide staging-only SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY at build time. This client intentionally ships without customer or product data until the shared contract is approved.', style: TextStyle(height: 1.4)), const SizedBox(height: 16), const ManualPaymentNotice()])));
}

class ManualPaymentNotice extends StatelessWidget {
  const ManualPaymentNotice({super.key});
  @override
  Widget build(BuildContext context) => Container(padding: const EdgeInsets.all(13), decoration: BoxDecoration(color: const Color(0xFFFFF7EA), border: Border.all(color: const Color(0xFFEBDCC6)), borderRadius: BorderRadius.circular(6)), child: const Row(crossAxisAlignment: CrossAxisAlignment.start, children: [Icon(Icons.info_outline, color: Color(0xFF9A651C), size: 19), SizedBox(width: 9), Expanded(child: Text('Automated M-Pesa is disabled. Checkout remains manual until staging payment validation is complete.', style: TextStyle(color: Color(0xFF77541A), height: 1.35)))]));
}

class EmptyRecord extends StatelessWidget {
  const EmptyRecord({super.key, required this.icon, required this.title, required this.message, this.action});
  final IconData icon;
  final String title;
  final String message;
  final Widget? action;
  @override
  Widget build(BuildContext context) => Center(child: Padding(padding: const EdgeInsets.all(28), child: Column(mainAxisSize: MainAxisSize.min, children: [CircleAvatar(radius: 28, backgroundColor: const Color(0xFFEAF5EF), foregroundColor: clinicalGreen, child: Icon(icon, size: 28)), const SizedBox(height: 15), Text(title, textAlign: TextAlign.center, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: clinicalInk)), const SizedBox(height: 6), ConstrainedBox(constraints: const BoxConstraints(maxWidth: 450), child: Text(message, textAlign: TextAlign.center, style: const TextStyle(height: 1.4))), if (action != null) Padding(padding: const EdgeInsets.only(top: 17), child: action!)])));
}

class BrandLockup extends StatelessWidget {
  const BrandLockup({super.key});
  @override
  Widget build(BuildContext context) => const Row(mainAxisSize: MainAxisSize.min, children: [Icon(Icons.local_hospital_outlined, color: clinicalGreen, size: 24), SizedBox(width: 7), Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [Text('SAFIΛN', style: TextStyle(color: clinicalInk, fontSize: 16, fontWeight: FontWeight.w800, letterSpacing: -1)), Text('HEALTHCARE', style: TextStyle(color: Color(0xFF63716C), fontSize: 8, fontWeight: FontWeight.w700, letterSpacing: 1.45))])]);
}

class EnvironmentChip extends StatelessWidget {
  const EnvironmentChip({super.key});
  @override
  Widget build(BuildContext context) => Container(padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 4), decoration: BoxDecoration(color: const Color(0xFFFFF7EA), border: Border.all(color: const Color(0xFFEBDCC6))), child: const Text('STAGING', style: TextStyle(fontSize: 9, color: Color(0xFF9A651C), fontWeight: FontWeight.w700, letterSpacing: 1.1)));
}

class StoreProduct {
  const StoreProduct({required this.id, required this.name, required this.price, required this.inStock});
  final String id;
  final String name;
  final double price;
  final bool inStock;
  factory StoreProduct.fromMap(Map<String, dynamic> map) => StoreProduct(id: '${map['id']}', name: '${map['name'] ?? 'Untitled supply'}', price: toDouble(map['sale_price'] ?? map['original_price']), inStock: toDouble(map['stock_quantity']) > 0);
}

class CartItem { const CartItem(this.product, this.quantity); final StoreProduct product; final int quantity; }
class CartStore extends ChangeNotifier {
  final Map<String, CartItem> _items = {};
  List<CartItem> get items => _items.values.toList(growable: false);
  double get total => _items.values.fold(0, (sum, item) => sum + item.product.price * item.quantity);
  void add(StoreProduct product) { final item = _items[product.id]; _items[product.id] = CartItem(product, (item?.quantity ?? 0) + 1); notifyListeners(); }
  void remove(String id) { _items.remove(id); notifyListeners(); }
}
class CartScope extends InheritedNotifier<CartStore> {
  const CartScope({super.key, required CartStore store, required super.child}) : super(notifier: store);
  static CartStore of(BuildContext context) => context.dependOnInheritedWidgetOfExactType<CartScope>()!.notifier!;
}

double toDouble(dynamic value) => value is num ? value.toDouble() : double.tryParse('$value') ?? 0;
String formatKes(double value) => 'KES ${value.toStringAsFixed(0)}';
