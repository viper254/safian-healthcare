# Safian Healthcare multi-client workspace

## Production safety boundary

All work described here lives on the `multi-client-isolated-development` branch. The existing Next.js customer shop, its production deployment, production environment variables, production database, and current manual M-Pesa business flow are unchanged. Do not merge this branch into `main` or deploy any new client without a separately reviewed staging release.

## Application map

| Surface | Location | Intended release |
|---|---|---|
| Current customer web shop | Repository root | Existing production deployment; untouched |
| Separate admin web | `apps/admin_web` | Independent staging domain and later independent deployment |
| Android, iPhone, Linux, Windows customer clients | `apps/customer_flutter` | One Flutter codebase with platform-specific packages |
| Shared backend | Existing Supabase plus additive, versioned server endpoints | Staging-only integration first |

## Shared backend rules

Customer clients use Supabase Auth and the publishable key only. RLS must enforce ownership of customer profiles, addresses, orders, reviews, and other private records. Prices, delivery fees, stock deductions, payment actions, admin mutations, and server-role database writes must remain in trusted backend endpoints or Edge Functions.

The current Next.js APIs must remain backward compatible while a versioned mobile/desktop contract is introduced. The first client connection should use a separate staging Supabase project or staging-specific data/policies, never production credentials. Automated M-Pesa remains disabled by default in both the current web application and future customer clients.

## Delivery path

1. Connect the Flutter app to a staging backend and verify the catalogue, authentication, order history, and manual checkout rules.
2. Move the current admin abilities into the separate `apps/admin_web` application behind admin-only authorization and audit logging.
3. Review the CI template under `docs/ci/customer-clients.yml`, then place it in `.github/workflows/` only after repository workflow permission is explicitly granted; do not publish artifacts automatically.
4. Run staged user acceptance testing and security review, then review a pull request before any production migration or deployment.
