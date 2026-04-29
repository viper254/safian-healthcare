# Deploy Updates

## 1. Run Database Migrations

In Supabase SQL Editor, run these in order:

**Migration 1:** WhatsApp Payment
```sql
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_method_check 
  CHECK (payment_method IN ('mpesa', 'card', 'cash_on_delivery', 'bank_transfer', 'whatsapp'));
```

**Migration 2:** Security Fixes  
Run entire file: `supabase/migrations/011_fix_security_warnings.sql`

**Migration 3:** Password Protection  
Dashboard → Authentication → Policies → Enable "Leaked Password Protection"

## 2. Deploy Code

```bash
git add .
git commit -m "feat: production fixes"
git push origin main
```

## 3. Verify

- [ ] WhatsApp checkout works
- [ ] `/sitemap.xml` shows products
- [ ] `/robots.txt` blocks admin
- [ ] Rate limiting active (6th order in 1min fails)

## What's New

- ✅ Input validation
- ✅ Rate limiting
- ✅ Error boundaries
- ✅ SEO improvements
- ✅ Security fixes
