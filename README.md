# SAFIAN HEALTHCARE & MEDICAL SUPPLIES

Production-ready e-commerce platform for medical supplies and healthcare equipment.

## 🏥 About

**Location**: Platinum Plaza, Nairobi CBD  
**Phone**: 0756 597 813  
**WhatsApp**: 0756 597 813

### Product Categories
1. Diagnostic Essentials
2. Procedure & Practical Kits
3. Medical Wear & Protective Gear
4. Clinical & Academic Support Tools
5. Home Care & Patient Support Devices

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase credentials to .env.local

# Run development server
npm run dev
```

Visit http://localhost:3000

## 📋 Setup Requirements

1. **Supabase Account** - [supabase.com](https://supabase.com)
2. **Node.js 18+**
3. **npm or yarn**

## 🗄️ Database Setup

1. Create Supabase project
2. Run migrations in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_seed_data.sql`
3. Get API keys from Supabase Dashboard → Settings → API
4. Add to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```

## 👤 Create Admin User

After signing up, run in Supabase SQL Editor:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

## 🎨 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Deployment**: Vercel

## 📱 Features

- Product catalog with categories
- Shopping cart
- WhatsApp ordering
- Admin dashboard
- Order management
- Customer accounts
- Product search
- Mobile responsive

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

```
NEXT_PUBLIC_SUPABASE_URL=your_production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_key
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## 📞 Support

- **Phone**: 0756 597 813
- **WhatsApp**: 0756 597 813
- **Email**: info@safianhealthcare.com

## 📄 License

Proprietary - © 2026 Safian Healthcare & Supplies
