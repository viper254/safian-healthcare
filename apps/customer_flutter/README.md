# Safian Customer Client

This isolated Flutter application is the customer-client foundation for the requested **Android APK, iPhone/iOS, Linux DEB, and Windows EXE**. It does not modify the existing Next.js shop, its live deployment, the production database, or the current manual M-Pesa business flow.

## Shared-backend configuration

The app accepts a Supabase URL and publishable key only through build-time dart-defines. Start with staging credentials and never include a service-role key, Daraja consumer secret, M-Pesa passkey, or any other privileged credential.

```bash
flutter run \
  --dart-define=SUPABASE_URL=https://your-staging-project.supabase.co \
  --dart-define=SUPABASE_PUBLISHABLE_KEY=your_staging_publishable_key
```

Supabase RLS must protect all customer-facing records. Server-side endpoints or Edge Functions must retain authority over prices, delivery, inventory deductions, payments, and admin actions.

## Current client scope

The starter provides catalogue loading, local cart management, customer sign-in, account state, and an order-history connection point. It stays visibly disconnected until staging credentials are provided. Automated M-Pesa remains inactive, and the cart explicitly explains that checkout is manual until staging payment validation is approved.

## Isolated package outputs

| Target | Build command | Intended safe output |
|---|---|---|
| Android | `flutter build apk --debug` | Internal testing APK |
| iPhone | `flutter build ipa` on macOS with Apple signing | TestFlight-ready IPA after signing |
| Linux | `tool/package_linux_deb.sh` on Linux | Debian package under `build/` |
| Windows | `flutter build windows --release` on Windows | Native executable bundle under `build/windows/` |

The Linux script requires `dpkg-deb`. iPhone builds require macOS, Xcode, an Apple Bundle ID, and signing. No script here publishes an app or connects to production automatically.
