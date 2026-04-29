# Adding Safian Healthcare to Google

## Current URL
https://safian-healthcare.vercel.app/

## ⚠️ Important Warning
Adding this Vercel URL to Google will make Google show `safian-healthcare.vercel.app` in search results instead of your brand name (like what happened to MedTech Solutions).

## Two Options

### Option 1: Wait for Custom Domain (Recommended)
1. Purchase domain: `safianhealthcare.com` (~$10-20/year from Namecheap)
2. Add domain in Vercel: Settings → Domains
3. Configure DNS (Vercel provides instructions)
4. Update `NEXT_PUBLIC_SITE_URL=https://safianhealthcare.com`
5. Redeploy: `vercel --prod`
6. **Then** add to Google Search Console

**Result:** Google shows `safianhealthcare.com` ✅

### Option 2: Use Vercel URL Now (Not Recommended)
1. Go to https://search.google.com/search-console
2. Add property: `https://safian-healthcare.vercel.app`
3. Verify ownership (HTML file or meta tag)
4. Submit sitemap: `https://safian-healthcare.vercel.app/sitemap.xml`

**Result:** Google shows `safian-healthcare.vercel.app` ❌

---

## Quick Setup (If Using Vercel URL)

### Step 1: Verify Ownership
**Method A - HTML File:**
1. Download verification file from Google (e.g., `google123abc.html`)
2. Place in `public/` folder
3. Commit and push
4. Verify at: https://safian-healthcare.vercel.app/google123abc.html

**Method B - Meta Tag:**
1. Get verification code from Google
2. Add to `src/app/layout.tsx`:
```typescript
verification: {
  google: "your-code-here",
},
```
3. Commit and push

### Step 2: Submit Sitemap
In Google Search Console:
- Go to Sitemaps
- Enter: `https://safian-healthcare.vercel.app/sitemap.xml`
- Click Submit

### Step 3: Request Indexing
Request indexing for:
- `/` (homepage)
- `/shop`
- `/about`
- `/contact`

---

## Switching to Custom Domain Later

When you get a custom domain:
1. Add domain to Vercel
2. Update `NEXT_PUBLIC_SITE_URL`
3. Redeploy
4. Add custom domain to Google Search Console as new property
5. Submit sitemap again

Google will eventually prioritize the custom domain.

---

## Bottom Line
- **Best:** Get custom domain first, then add to Google
- **Okay:** Use Vercel URL now, migrate to custom domain later
- **Cost:** Domain is $10-20/year, Vercel hosting is free
