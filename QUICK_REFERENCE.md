# Safian Healthcare - Quick Reference Card

## 🚀 Going Live - 5 Steps

1. **Run Database Migrations** (Supabase SQL Editor)
   - Run files 001 through 009 in `supabase/migrations/`
   
2. **Create Admin Account**
   - Run: `SELECT promote_to_admin('your-email@example.com');`
   
3. **Add Products**
   - Login at `/admin-login`
   - Add 15-20 products with images
   
4. **Deploy to Vercel**
   - Connect GitHub repo
   - Add environment variables
   - Click Deploy
   
5. **Test Everything**
   - Place test order via WhatsApp
   - Update order status in admin
   - Verify customer sees update

---

## 📱 Admin Access

- **URL**: `https://safianhealthcare.com/admin-login`
- **Email**: Your admin email
- **Password**: Set during admin creation

---

## 🛠️ Common Tasks

### Add New Product
1. Go to `/admin/products`
2. Click "New Product"
3. Fill form (name, price, category, images)
4. Click "Create Product"

### Update Order Status
1. Go to `/admin/orders`
2. Find order
3. Use dropdowns to change:
   - Order Status (pending → confirmed → dispatched → delivered)
   - Payment Status (unpaid → paid)

### Approve Review
1. Go to `/admin/reviews`
2. Find pending review
3. Click "Approve" or "Reject"
4. Optionally add response

### Add Category
1. Go to `/admin/categories`
2. Click "Add Category"
3. Enter name and description
4. Click "Create"

---

## 📊 Dashboard Metrics

- **Revenue**: Only counts PAID orders
- **Orders**: Total orders (all statuses except cancelled)
- **AOV**: Average Order Value
- **Charts**: Show last 30 days of data

---

## 💬 WhatsApp Order Flow

1. Customer adds items to cart
2. Customer enters name & phone at checkout
3. Order saved to database
4. WhatsApp opens with pre-filled message
5. You receive WhatsApp message
6. Confirm availability & delivery
7. Update order status in admin
8. Customer sees status update

---

## 🔧 Environment Variables (Production)

Add these in Vercel → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_SITE_URL=https://safianhealthcare.com
NEXT_PUBLIC_CONTACT_PHONE=0756 597 813
NEXT_PUBLIC_CONTACT_WHATSAPP=254756597813
NEXT_PUBLIC_CONTACT_EMAIL=info@safianhealthcare.com
```

---

## 🐛 Troubleshooting

### Orders Not Creating
- Check migrations 008 & 009 ran
- Verify Supabase connection
- Check browser console for errors

### Images Not Showing
- Verify storage bucket exists
- Check image file size (< 200KB)
- Ensure public access enabled

### Admin Can't Login
- Verify admin user created
- Check email is correct
- Try password reset

### Revenue Shows Zero
- Revenue only counts PAID orders
- Update payment status to "paid"
- Refresh dashboard

---

## 📞 Support Contacts

- **WhatsApp**: 0756 597 813
- **Email**: info@safianhealthcare.com
- **Vercel Support**: vercel.com/support
- **Supabase Support**: supabase.com/support

---

## 🎯 Daily Tasks

- [ ] Check new orders in `/admin/orders`
- [ ] Update order statuses
- [ ] Respond to WhatsApp messages
- [ ] Approve new reviews
- [ ] Check low stock alerts

---

## 📈 Weekly Tasks

- [ ] Review dashboard analytics
- [ ] Update product inventory
- [ ] Add new products if needed
- [ ] Respond to customer reviews
- [ ] Check site performance

---

## 🔐 Security Reminders

- Never share admin password
- Keep Supabase keys private
- Use strong passwords
- Regularly backup database
- Monitor error logs

---

## 🚨 Emergency Procedures

### Site Down
1. Check Vercel status
2. Check Supabase status
3. Review error logs
4. Contact support if needed

### Database Issues
1. Check Supabase dashboard
2. Verify connection strings
3. Check RLS policies
4. Restore from backup if needed

### Payment Issues
1. Verify order exists in database
2. Check WhatsApp message sent
3. Update order status manually
4. Contact customer via WhatsApp

---

## 📝 Notes

- Site optimized for 3G networks
- WhatsApp is primary payment method
- Online payments coming soon
- All orders tracked in database
- Customer notifications automatic
