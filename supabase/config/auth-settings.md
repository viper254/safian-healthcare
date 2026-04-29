# Supabase Auth Configuration

## Disable Email Confirmation (For Development/Testing)

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to **Authentication** → **Providers** → **Email**
2. Scroll down to **Email Confirmation**
3. Toggle OFF "Enable email confirmations"
4. Click **Save**

### Option 2: Via Supabase CLI (config.toml)

```toml
[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = false  # Set to false to disable email confirmation
```

Then run:
```bash
supabase db push
```

## What This Does

- Users can sign in immediately without clicking email link
- No confirmation email sent on signup
- Useful for development/testing
- **Warning:** Not recommended for production (allows fake emails)

## Re-enable for Production

Before going live, set `enable_confirmations = true` to:
- Verify email addresses are real
- Prevent spam accounts
- Improve security
