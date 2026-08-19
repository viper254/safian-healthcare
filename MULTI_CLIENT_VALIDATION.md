# Multi-client isolated validation

## Boundary verification

The work is on the `multi-client-isolated-development` branch. No existing `src/` application file, Supabase migration, root deployment configuration, root environment file, M-Pesa feature flag, or production branch commit was changed. The current customer web shop remains on `main` and continues to use its existing deployment and manual payment path.

## Validation results

| Area | Result | Evidence |
|---|---|---|
| Flutter static analysis | Passed | `flutter analyze` completed with no issues |
| Flutter widget smoke test | Passed | Staging-safe shell renders without backend credentials |
| Linux customer build | Passed | Native Flutter Linux release bundle built successfully |
| Linux DEB packaging | Passed | `build/safian-customer_1.0.0_amd64.deb` was produced locally |
| Separate admin type-check | Passed | `pnpm run check` completed successfully |
| Separate admin production build | Passed | `pnpm run build` completed successfully |
| Git whitespace validation | Passed | `git diff --check` completed successfully |
| Android APK local build | Not available locally | Android SDK is not installed; isolated GitHub Actions job is provided |
| iPhone local build | Not available locally | iOS builds require macOS/Xcode and Apple signing; macOS CI preflight is provided |
| Windows EXE local build | Not available locally | Windows build requires a Windows runner; isolated GitHub Actions job is provided |

## Safe next steps

First create a staging Supabase project or staging-specific policies/data and connect the Flutter client only with its publishable key. Then define customer RLS policies and a versioned order endpoint that recomputes prices and delivery fees server-side. Keep automatic M-Pesa disabled while staging checkout is tested.

Next, connect the separate admin application through admin-only authentication, explicit role checks, audit logging, and a dedicated deployment domain. Do not reuse public customer API permissions for admin operations. The CI configuration is stored as `docs/ci/customer-clients.yml`; move it to `.github/workflows/` after repository workflow permission is explicitly granted to collect private APK, DEB, Windows bundle, and iOS preflight artifacts. None of the jobs publish to stores or deploy to production.

> The iPhone application needs an Apple Bundle ID, App Store Connect record, and signing before an IPA/TestFlight upload can be created. The current branch intentionally stops at a no-codesign iOS preflight to avoid an unintended release.
