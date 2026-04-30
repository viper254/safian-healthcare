# Email Templates Setup Guide

## Quick Setup: Disable Email Confirmation

**For development/testing only:**

1. Go to Supabase Dashboard → **Authentication** → **Providers** → **Email**
2. Scroll to **Email Confirmation**
3. Toggle OFF "Enable email confirmations"
4. Click **Save**

Users can now sign in immediately without email verification.

---

## Email Templates

All templates are ready to use. Upload them to Supabase:

### 1. Confirm Signup Email
**File:** `confirm-signup.html`  
**When sent:** User creates new account  
**Purpose:** Verify email address

### 2. Magic Link Email
**File:** `magic-link.html`  
**When sent:** User requests passwordless sign-in  
**Purpose:** One-click sign-in link

### 3. Password Recovery Email
**File:** `recovery.html`  
**When sent:** User clicks "Forgot Password"  
**Purpose:** Reset password link

### 4. Email Change Confirmation
**File:** `email-change.html`  
**When sent:** User changes email address  
**Purpose:** Confirm new email

### 5. Invite Email
**File:** `invite.html`  
**When sent:** Admin invites new user  
**Purpose:** Accept invitation and create account

---

## How to Upload Templates

### Via Supabase Dashboard:

1. Go to **Authentication** → **Email Templates**
2. Select template type (e.g., "Confirm signup")
3. Click **Edit template**
4. Copy content from corresponding `.html` file
5. Paste into editor
6. Click **Save**
7. Repeat for all 5 templates

### Template Variables Available:

All templates use these Supabase variables:
- `{{ .ConfirmationURL }}` - The action link
- `{{ .Token }}` - The confirmation token
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Your site URL
- `{{ .Email }}` - User's email

---

## Customization

All templates use Safian Healthcare branding:
- ✅ Brand colors (Green, Orange, Blue)
- ✅ Logo gradient
- ✅ Contact information
- ✅ Professional design
- ✅ Mobile responsive

To customize:
1. Edit the HTML files
2. Update colors, text, or layout
3. Re-upload to Supabase

---

## Testing

After uploading:

1. **Test Signup:** Create new account → Check email
2. **Test Recovery:** Click "Forgot Password" → Check email
3. **Test Magic Link:** Use passwordless sign-in → Check email

---

## Production Checklist

Before going live:

- [ ] Upload all 5 email templates
- [ ] Test each template
- [ ] Enable email confirmations (for production)
- [ ] Enable leaked password protection
- [ ] Update contact info if needed
- [ ] Test on mobile devices

---

## Support

If emails aren't sending:
1. Check Supabase logs
2. Verify SMTP settings (if custom)
3. Check spam folder
4. Ensure email confirmations are enabled (if required)
