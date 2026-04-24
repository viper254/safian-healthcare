# Safian Healthcare - Deployment Guide

## Pre-Deployment Checklist

### 1. Database Setup (Supabase)

- [ ] Run all migrations in order (001 through 009)
- [ ] Create admin user using migration 004
- [ ] Set up storage bucket using migration 006
- [ ] Verify all tables exist and have proper RLS policies
- [ ] Test database connection from local environment

### 2. Environment Variables

Use the same `.env` file for both local and production. Just update `NEXT_PUBLIC_SITE_URL`:

**Local Development:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Production (add to Vercel/Netlify):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=https://safianhealthcare.com
NEXT_PUBLIC_CONTACT_PHONE=0756 597 813
NEXT_PUBLIC_CONTACT_WHATSAPP=254756597813
NEXT_PUBLIC_CONTACT_EMAIL=info@safianhealthcare.com
```

### 3. Content Preparation

- [ ] Add at least 10-15 products with images
- [ ] Upload product images to Supabase Storage (< 200KB each)
- [ ] Add 5-10 approved customer reviews
- [ ] Test WhatsApp ordering flow end-to-end
- [ ] Verify all product categories are populated

### 4. SEO & Performance

- [ ] Update sitemap.xml with actual domain
- [ ] Add Google Analytics ID (optional)
- [ ] Test site on 3G connection
- [ ] Verify all images are optimized
- [ ] Check Lighthouse scores (aim for 90+)

---

## Deployment Steps

### Option A: Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/safian-healthcare.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure project:
     - Framework Preset: Next.js
     - Root Directory: `./`
     - Build Command: `npm run build`
     - Output Directory: `.next`

3. **Add Environment Variables**
   - In Vercel dashboard → Settings → Environment Variables
   - Add all variables from `.env.production.example`
   - Make sure to add them for Production, Preview, and Development

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Visit your site at `https://your-project.vercel.app`

5. **Custom Domain**
   - Go to Settings → Domains
   - Add `safianhealthcare.com`
   - Update DNS records as instructed

### Option B: Deploy to Netlify

1. **Build Configuration**
   Create `netlify.toml`:
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop your project folder
   - Or connect GitHub repository
   - Add environment variables in Site Settings

---

## Post-Deployment Tasks

### 1. Verify Functionality

- [ ] Test homepage loads correctly
- [ ] Browse products and categories
- [ ] Add items to cart
- [ ] Complete WhatsApp checkout flow
- [ ] Track an order
- [ ] Submit a review
- [ ] Test admin login
- [ ] Create/edit products as admin
- [ ] Update order status as admin

### 2. Admin Setup

- [ ] Login to admin panel at `/admin-login`
- [ ] Add initial products
- [ ] Configure categories
- [ ] Test order management
- [ ] Review notifications system

### 3. SEO & Analytics

- [ ] Submit sitemap to Google Search Console
- [ ] Verify Google Analytics tracking (if configured)
- [ ] Test social media sharing (OG images)
- [ ] Check mobile responsiveness

### 4. Performance Monitoring

- [ ] Run Lighthouse audit
- [ ] Test on 3G connection
- [ ] Monitor Vercel Analytics
- [ ] Check error logs

---

## Database Migrations Checklist

Run these in Supabase SQL Editor in order:

1. ✅ `001_initial_schema.sql` - Core tables
2. ✅ `002_seed_data.sql` - Categories and sample products
3. ✅ `003_notifications.sql` - Admin notifications
4. ✅ `004_create_admin_user.sql` - Admin user setup
5. ✅ `005_reviews_system.sql` - Customer reviews
6. ✅ `006_storage_setup.sql` - Product images storage
7. ✅ `007_performance_indexes.sql` - Database optimization
8. ✅ `008_add_whatsapp_payment.sql` - WhatsApp payment method
9. ✅ `009_fix_notification_trigger.sql` - Fix notification trigger

---

## Troubleshooting

### Build Fails

- Check Node.js version (18.x or higher)
- Clear `.next` folder and rebuild
- Verify all dependencies are installed

### Database Connection Issues

- Verify Supabase URL and anon key
- Check RLS policies are enabled
- Ensure migrations ran successfully

### Images Not Loading

- Verify storage bucket exists
- Check storage policies allow public read
- Ensure image URLs are correct

### Orders Not Creating

- Check migrations 008 and 009 ran
- Verify WhatsApp payment method is allowed
- Check browser console for errors

---

## Support

For issues or questions:
- WhatsApp: 0756 597 813
- Email: info@safianhealthcare.com

---

## Security Notes

- Never commit `.env.local` to version control
- Keep Supabase service role key secret
- Use environment variables for all sensitive data
- Enable RLS on all tables
- Regularly update dependencies
