import { NextRequest, NextResponse } from "next/server";

/**
 * This route provides a clean URL for product images in WhatsApp messages.
 * Instead of showing the technical Supabase URL, we show:
 * https://safianhealthcare.com/api/media?url=...
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return new NextResponse("Missing image URL", { status: 400 });
  }

  // Redirect to the actual Supabase storage URL
  // This keeps the WhatsApp message looking clean and professional
  return NextResponse.redirect(imageUrl);
}
