# Setup Guide

## Prerequisites

- Node.js 18 or higher
- Supabase account
- Git

## Step 1: Clone & Install

```bash
cd safian-healthcare
npm install
```

## Step 2: Supabase Setup

### Create Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project: "Safian Healthcare"
3. Wait for setup to complete

### Run Migrations
1. Go to SQL Editor in Supabase
2. Run `supabase/migrations/001_initial_schema.sql`
3. Run `supabase/migrations/002_seed_data.sql`

### Get API Keys
1. Go to Settings → API
2. Copy:
   - Project URL
   - anon public key

## Step 3: Environment Variables

Create `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Step 4: Start Development

```bash
npm run dev
```

Visit http://localhost:3000

## Step 5: Create Admin

1. Sign up at http://localhost:3000/login
2. In Supabase SQL Editor, run:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```
3. Access admin at http://localhost:3000/admin

## Step 6: Add Products

1. Go to `/admin/products`
2. Click "New Product"
3. Fill in details and upload images
4. Save

## Production Deployment

### Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL`
4. Deploy

## Troubleshooting

### Can't connect to database
- Check `.env.local` has correct values
- Verify Supabase project is active
- Restart dev server

### Can't access admin
- Make sure you ran the UPDATE query
- Check role in Supabase: `SELECT email, role FROM profiles;`

### Products not showing
- Add products via admin dashboard
- Check products are marked as `is_active = true`
- Verify category exists

## Support

Phone/WhatsApp: 0756 597 813
