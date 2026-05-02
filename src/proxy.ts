import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  // Force HTTPS redirect in production
  const url = request.nextUrl.clone();
  const proto = request.headers.get("x-forwarded-proto");
  
  if (
    process.env.NODE_ENV === "production" &&
    proto === "http" &&
    !url.hostname.includes("localhost")
  ) {
    url.protocol = "https:";
    return NextResponse.redirect(url, 301);
  }

  // Update Supabase session
  const response = await updateSession(request);
  
  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static, _next/image, favicon.ico, public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|logo.jpeg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
