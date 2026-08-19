# Safian PWA native shells

These packages contain **no replacement shop interface**. Each one opens the approved current Safian PWA at `https://safian-healthcare.vercel.app`, so customers use the existing logo, copy, PWA routes, product catalogue, cart, sign-in, account, checkout, order tracking, and Supabase-backed operations exactly as they do in the browser.

| Package | Location | Output |
|---|---|---|
| Android web shell | `android` | APK/AAB |
| iPhone web shell | `ios` | IPA after Apple signing |
| Linux desktop web shell | `desktop` | DEB |
| Windows desktop web shell | `desktop` | EXE installer |

All shells read the canonical PWA URL from `pwa-release.json`. A PWA release is reviewed once and then appears identically in every shell; the wrappers do not duplicate the UI or data layer. The customer browser session is held by the PWA origin and the existing PWA remains the only application that talks to the shared backend.

## Safety rule

Do not change `pwaUrl` to a different host unless it is an approved Safian PWA release. Do not place any Supabase service-role key, M-Pesa secret, or privileged backend value in a native wrapper. The wrappers cannot create orders, alter inventory, or call a second backend on their own.

The Android shell uses the standard Android WebView API and the iPhone shell uses `WKWebView`; both are browser containers rather than alternative customer apps. [1] [2]

## References

[1]: [Android WebView documentation](https://developer.android.com/develop/ui/views/layout/webapps/webview)
[2]: [Apple WKWebView documentation](https://developer.apple.com/documentation/webkit/wkwebview)
