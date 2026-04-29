import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, org, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Store the contact message in the database
    // Note: We'll use the notifications table or a new contact_messages table
    // For now, we'll create a notification for the admin
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        title: `New Contact Message: ${subject}`,
        message: `From: ${name} (${email})\nPhone: ${phone}\nOrg: ${org || "N/A"}\n\n${message}`,
        type: "info",
        is_read: false,
      });

    if (notificationError) throw notificationError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Contact API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send message" },
      { status: 500 }
    );
  }
}
