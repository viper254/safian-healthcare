# Admin Dashboard Setup Guide

## Security Features

The admin dashboard is now fully secured with:

✅ **Authentication Required** - Must be logged in to access `/admin`
✅ **Role-Based Access** - Only users with `role = 'admin'` can access
✅ **Auto-Redirect** - Unauthorized users redirected to login page
✅ **Session Management** - Secure sign-in/sign-out functionality

## Creating Your First Admin User

### Method 1: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase project dashboard**
   - Navigate to: https://supabase.com/dashboard

2. **Create a new user**
   - Go to **Authentication** → **Users**
   - Click **"Add user"** → **"Create new user"**
   - Enter email: `admin@safianhealthcare.com` (or your preferred email)
   - Enter a strong password
   - Click **"Create user"**

3. **Promote user to admin**
   - Copy the user's UUID from the users list
   - Go to **SQL Editor**
   - Run this query (replace `YOUR_USER_UUID` with the actual UUID):
   
   ```sql
   UPDATE profiles 
   SET role = 'admin' 
   WHERE id = 'YOUR_USER_UUID';
   ```

4. **Verify**
   - Go to **Table Editor** → **profiles**
   - Find your user and confirm `role` is set to `'admin'`

### Method 2: Using SQL Function (Easier)

1. **Create a user** (same as Method 1, steps 1-2)

2. **Run the promotion function**
   - Go to **SQL Editor**
   - Run this query:
   
   ```sql
   SELECT promote_to_admin('admin@safianhealthcare.com');
   ```
   
   Replace the email with your admin user's email.

3. **You should see**: `Success: User admin@safianhealthcare.com promoted to admin`

## Logging In

1. Navigate to: `http://localhost:3000/admin/login`
2. Enter your admin email and password
3. Click **"Sign In"**
4. You'll be redirected to the admin dashboard

## Admin Features

Once logged in, you can:

- 📊 View dashboard analytics
- 📦 Manage products (add, edit, delete)
- 🏷️ Edit categories
- 🛒 View and manage orders
- 👥 View customers
- 🔔 Receive notifications
- ⚙️ Configure settings

## Security Best Practices

1. **Use a strong password** for admin accounts
2. **Don't share admin credentials**
3. **Enable 2FA** in Supabase (recommended)
4. **Regularly review** admin user list
5. **Use environment variables** for sensitive data

## Troubleshooting

### "Access denied" error
- Verify the user's `role` is set to `'admin'` in the profiles table
- Check that the user is confirmed (not pending email verification)

### Can't log in
- Verify email and password are correct
- Check Supabase Auth logs for errors
- Ensure `.env.local` has correct Supabase credentials

### Redirected to login page
- Your session may have expired - log in again
- Check browser console for errors

## Adding More Admins

To add additional admin users, repeat the steps above for each new admin.

## Removing Admin Access

To revoke admin access from a user:

```sql
UPDATE profiles 
SET role = 'customer' 
WHERE id = 'USER_UUID_HERE';
```

Or by email:

```sql
UPDATE profiles 
SET role = 'customer' 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'user@example.com'
);
```
