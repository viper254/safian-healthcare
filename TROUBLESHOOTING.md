# Troubleshooting Guide

## Site Becomes "Static and Dumb" - Clicks Don't Work

### Symptoms
- Buttons don't respond to clicks
- Links don't navigate
- Forms don't submit
- Site appears frozen or unresponsive
- Console shows hydration errors

### Root Causes

#### 1. **Service Worker Serving Stale Content** (Most Common)
The Progressive Web App (PWA) service worker caches pages for offline use. Sometimes it serves old cached versions that don't match the current JavaScript bundles.

**Solution A: Hard Refresh (Quick Fix)**
```
Windows/Linux: Ctrl + Shift + R or Ctrl + F5
Mac: Cmd + Shift + R
```

**Solution B: Clear Cache via Browser DevTools**
1. Open DevTools (F12)
2. Go to "Application" tab
3. Click "Clear storage" in left sidebar
4. Check all boxes
5. Click "Clear site data"
6. Refresh page

**Solution C: Clear Cache Programmatically**
We've added automatic cache versioning and update checks. The service worker will:
- Check for updates every 60 seconds
- Automatically reload when new version is available
- Clear old caches on activation

**Solution D: Manual Cache Clear (For Users)**
Add the Clear Cache button to your admin settings or footer:

```tsx
import { ClearCacheButton } from "@/components/pwa/clear-cache-button";

// In your component
<ClearCacheButton />
```

#### 2. **JavaScript Hydration Errors**
React hydration errors occur when server-rendered HTML doesn't match client-side React.

**Common Causes:**
- Using `Date.now()` or `Math.random()` in components
- Browser extensions modifying HTML
- Incorrect `suppressHydrationWarning` usage

**Check Console:**
```
Open DevTools → Console tab
Look for: "Hydration failed" or "Text content does not match"
```

**Fix:**
- Use `useEffect` for client-only code
- Add `suppressHydrationWarning` to `<html>` tag (already done)
- Ensure consistent rendering between server and client

#### 3. **JavaScript Bundle Loading Failures**
Network issues or CDN problems can prevent JavaScript from loading.

**Check Network Tab:**
1. Open DevTools (F12)
2. Go to "Network" tab
3. Refresh page
4. Look for failed requests (red)
5. Check `_next/static/chunks/*.js` files

**Solutions:**
- Check internet connection
- Disable browser extensions
- Try incognito/private mode
- Clear browser cache

#### 4. **React Strict Mode Double Rendering**
In development, React Strict Mode renders components twice to detect issues.

**This is normal in development** - not a bug!

#### 5. **Theme Toggle Script Errors**
The theme toggle script in `<head>` might fail if localStorage is blocked.

**Check:**
- Browser privacy settings
- Incognito mode (localStorage disabled)
- Browser extensions blocking storage

---

## Prevention Measures (Already Implemented)

### 1. Service Worker Improvements
✅ **Cache versioning**: Incremented version forces cache refresh
✅ **Network-first strategy**: Always tries network before cache
✅ **Automatic updates**: Checks for updates every 60 seconds
✅ **Skip waiting**: New service worker activates immediately
✅ **Proper cache invalidation**: Old caches deleted on activation

### 2. Hydration Protection
✅ **suppressHydrationWarning**: Added to `<html>` tag
✅ **Theme script**: Wrapped in try-catch
✅ **Client-only components**: Properly marked with "use client"
✅ **Mounted state**: Theme toggle waits for mount

### 3. Error Boundaries
✅ **Global error handler**: Catches all errors
✅ **Page-level error handler**: Catches route errors
✅ **Development error details**: Shows stack traces in dev mode

---

## Quick Diagnostic Checklist

When site becomes unresponsive:

1. **Check Console** (F12 → Console)
   - [ ] Any red errors?
   - [ ] Hydration warnings?
   - [ ] Network errors?

2. **Check Network** (F12 → Network)
   - [ ] All JS files loaded (200 status)?
   - [ ] Any failed requests (red)?
   - [ ] Slow network?

3. **Check Service Worker** (F12 → Application → Service Workers)
   - [ ] Service worker active?
   - [ ] Multiple service workers registered?
   - [ ] Update available?

4. **Try Quick Fixes**
   - [ ] Hard refresh (Ctrl+Shift+R)
   - [ ] Clear cache (DevTools → Application → Clear storage)
   - [ ] Disable service worker temporarily
   - [ ] Try incognito mode

---

## For Developers

### Disable Service Worker During Development
If service worker causes issues during development:

```typescript
// In src/app/layout.tsx
// Comment out this line:
// <ServiceWorkerRegister />
```

### Force Service Worker Update
```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.update());
});
```

### Unregister All Service Workers
```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});
```

### Clear All Caches
```javascript
// In browser console
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});
```

---

## When to Contact Support

If none of the above solutions work:

1. **Collect Information:**
   - Browser name and version
   - Operating system
   - Console errors (screenshot)
   - Network tab (screenshot)
   - Steps to reproduce

2. **Try Different Browser:**
   - Does it work in Chrome?
   - Does it work in Firefox?
   - Does it work in Safari?

3. **Try Different Device:**
   - Does it work on mobile?
   - Does it work on desktop?

4. **Check Server Status:**
   - Is Vercel deployment successful?
   - Is Supabase database online?
   - Any recent deployments?

---

## Recent Fixes Applied

### Service Worker Updates (Latest)
- ✅ Incremented cache version to v2
- ✅ Added network-first strategy for navigation
- ✅ Added automatic update checks every 60 seconds
- ✅ Added skip waiting for immediate updates
- ✅ Improved cache invalidation logic
- ✅ Added proper handling for Next.js data routes

### Component Updates
- ✅ Created ClearCacheButton component for manual cache clearing
- ✅ Improved ServiceWorkerRegister with automatic updates
- ✅ Added proper error boundaries

---

## Testing the Fixes

### Test Service Worker Update
1. Make a code change
2. Deploy to production
3. Visit site (old version loads)
4. Wait 60 seconds
5. Page should auto-reload with new version

### Test Cache Clearing
1. Add ClearCacheButton to a page
2. Click "Clear Cache"
3. Page should reload
4. All caches should be cleared
5. Fresh content should load

### Test Offline Mode
1. Load a page
2. Turn off internet
3. Navigate to cached pages (should work)
4. Try to load new pages (should show offline page)
5. Turn on internet
6. Should resume normal operation

---

## Additional Resources

- [Next.js Hydration Errors](https://nextjs.org/docs/messages/react-hydration-error)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [PWA Best Practices](https://web.dev/pwa-checklist/)
- [Chrome DevTools Guide](https://developer.chrome.com/docs/devtools/)
