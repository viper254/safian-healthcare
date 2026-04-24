# Safian Healthcare & Medical Supplies

A modern, production-ready e-commerce platform for medical supplies in Kenya. Built with Next.js, Supabase, and optimized for performance.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Run migrations in order from `supabase/migrations/`
3. Copy `.env.example` to `.env.local` and add your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_SITE_URL=https://safianhealthcare.com
   ```

### 3. Run Development Server
```bash
npm run dev
```

## 🛠 Tech Stack
- **Framework**: Next.js (App Router)
- **Database & Auth**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Charts**: Recharts

## 📱 Features
- **WhatsApp-First Ordering**: Optimized checkout flow directly to WhatsApp.
- **Real-time Analytics**: Track site traffic and sales in the admin dashboard.
- **Admin Dashboard**: Full control over products, categories, and orders.
- **Mobile Optimized**: Fast loading even on 3G connections.

## 🔐 Admin Setup
To create an admin user:
1. Sign up via the website's registration page.
2. Run the following SQL in your Supabase SQL Editor:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
   ```

## 📦 Deployment
The project is optimized for **Vercel**. Simply connect your GitHub repository, add the environment variables, and deploy.

## 📞 Contact
- **Phone**: 0756 597 813
- **Email**: info@safianhealthcare.com
- **Location**: Platinum Plaza, Nairobi CBD

---
Proprietary - Safian Healthcare & Medical Supplies © 2026
