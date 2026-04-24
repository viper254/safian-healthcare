import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("ref");

  if (!reference) {
    return NextResponse.json({ error: "Reference number required" }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    
    const { data: order, error } = await supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("reference", reference)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { error: "Order not found. Please check your reference number." },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error tracking order:", error);
    return NextResponse.json(
      { error: "Failed to track order" },
      { status: 500 }
    );
  }
}
