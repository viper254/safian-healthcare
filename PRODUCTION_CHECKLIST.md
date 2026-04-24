# Production Deployment Checklist

## Pre-Launch (Complete Before Going Live)

### Database & Backend
- [ ] All 9 migrations run successfully in Supabase
- [ ] Admin user created and tested
- [ ] Storage bucket configured with proper policies
- [ ] RLS policies verified on all tables
- [ ] Database indexes created (migration 007)
- [ ] Notification trigger fixed (migration 009)

### Content
- [ ] At least 15-20 products added with:
  - [ ] High-quality images (< 200KB each)
  - [ ] Complete descriptions
  - [ ] Accurate pricing
  - [ ] Stock quantities set
  - [ ] Categories assigned
- [ ] 5-10 customer reviews approved and featured
- [ ] All 5 categories populated with products
- [ ] Homepage featured products selected

### Configuration
- [ ] Environment variables set in hosting platform
- [ ] Production Supabase URL configured
- [ ] Site URL updated to production domain
- [ ] Contact information verified (phone, email, WhatsApp)
- [ ] Logo uploaded to `/public/logo.jpeg`

### Testing
- [ ] Homepage loads correctly
- [ ] Product browsing works
- [ ] Search functionality tested
- [ ] Cart add/remove works
- [ ] WhatsApp checkout flow tested end-to-end
- [ ] Order tracking works
- [ ] Review submission works
- [ ] Admin login successful
- [ ] Admin can create/edit products
- [ ] Admin can update order status
- [ ] Order status updates reflect on customer side

### Performance
- [ ] Lighthouse score > 90 on mobile
- [ ] Site tested on 3G connection
- [ ] All images optimized
- [ ] Lazy loading implemented
- [ ] Font loading optimized

### SEO
- [ ] Meta titles and descriptions set
- [ ] Open Graph images configured
- [ ] Sitemap.xml updated with production domain
- [ ] Robots.txt configured
- [ ] Google Search Console verified
- [ ] Google Analytics configured (optional)

### Security
- [ ] `.env.local` not committed to git
- [ ] Admin routes protected
- [ ] RLS policies tested
- [ ] HTTPS enabled
- [ ] CORS configured properly

---

## Launch Day

- [ ] Final database backup
- [ ] Deploy to production
- [ ] Verify all environment variables
- [ ] Test critical user flows
- [ ] Monitor error logs
- [ ] Test WhatsApp integration
- [ ] Verify email notifications (if configured)

---

## Post-Launch (First Week)

- [ ] Monitor Vercel Analytics
- [ ] Check error logs daily
- [ ] Test order flow with real customers
- [ ] Gather customer feedback
- [ ] Monitor site performance
- [ ] Check mobile responsiveness on real devices
- [ ] Verify WhatsApp messages are being received
- [ ] Test admin notifications

---

## Ongoing Maintenance

### Weekly
- [ ] Review new orders
- [ ] Approve/reject customer reviews
- [ ] Check low stock alerts
- [ ] Monitor site performance

### Monthly
- [ ] Update product inventory
- [ ] Review analytics
- [ ] Check for security updates
- [ ] Backup database
- [ ] Review and respond to customer feedback

### Quarterly
- [ ] Update product catalog
- [ ] Review pricing
- [ ] Optimize slow-performing pages
- [ ] Update SEO keywords
- [ ] Review and update content

---

## Emergency Contacts

- **Hosting**: Vercel Support
- **Database**: Supabase Support
- **Developer**: [Your contact info]
- **Business Owner**: 0756 597 813

---

## Rollback Plan

If critical issues occur:

1. Revert to previous deployment in Vercel
2. Check error logs for root cause
3. Fix issue in development
4. Test thoroughly
5. Redeploy

---

## Success Metrics

Track these KPIs:

- Orders per day
- Conversion rate (visitors → orders)
- Average order value
- Customer reviews submitted
- WhatsApp response time
- Site load time
- Mobile vs desktop traffic
- Top-selling products
- Revenue by category
