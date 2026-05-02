import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * DELETE /api/admin/reset-orders
 * 
 * Deletes all orders, order items, and order-related analytics.
 * Requires admin authentication.
 * 
 * DANGER: This action is irreversible!
 */
export async function DELETE(request: Request) {
  console.log("🔴 Reset orders endpoint called");
  
  try {
    const supabase = await createSupabaseServerClient();
    
    // 1. Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log("User authenticated:", user?.id);
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // 2. Verify user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    console.log("User role:", profile?.role);

    if (profileError || !profile || profile.role !== "admin") {
      console.error("Profile error or not admin:", profileError, profile);
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    // 3. Get confirmation and reset password from request body
    const body = await request.json().catch(() => ({}));
    
    console.log("Confirmation received:", body.confirmation);
    console.log("Reset password provided:", !!body.resetPassword);
    
    if (body.confirmation !== "DELETE ALL ORDERS") {
      return NextResponse.json(
        { error: "Invalid confirmation. Please type 'DELETE ALL ORDERS' exactly." },
        { status: 400 }
      );
    }

    // 4. Verify reset password
    const resetPassword = process.env.ADMIN_RESET_PASSWORD;
    
    console.log("Reset password configured:", !!resetPassword);
    
    if (!resetPassword) {
      return NextResponse.json(
        { error: "Reset password not configured. Please contact system administrator." },
        { status: 500 }
      );
    }

    if (body.resetPassword !== resetPassword) {
      console.error("Invalid reset password provided");
      return NextResponse.json(
        { error: "Invalid reset password. Access denied." },
        { status: 403 }
      );
    }

    console.log("✓ All validations passed. Starting deletion...");


    // 5. Delete order-related analytics first (no foreign key constraints)
    const { error: analyticsError } = await supabase
      .from("analytics_events")
      .delete()
      .in("event_type", ["checkout_started", "order_placed"]);

    if (analyticsError) {
      console.error("Analytics deletion error:", analyticsError);
      throw new Error("Failed to delete analytics events");
    }

    console.log("✓ Deleted order-related analytics");

    // 5. Delete order items (will cascade from orders, but being explicit)
    const { error: itemsError } = await supabase
      .from("order_items")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

    if (itemsError) {
      console.error("Order items deletion error:", itemsError);
      throw new Error("Failed to delete order items");
    }

    console.log("✓ Deleted all order items");

    // 6. Delete all orders
    const { error: ordersError } = await supabase
      .from("orders")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

    if (ordersError) {
      console.error("Orders deletion error:", ordersError);
      throw new Error("Failed to delete orders");
    }

    console.log("✓ Deleted all orders");

    // Get count of remaining orders (should be 0)
    const { count } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({
      success: true,
      message: "All orders and related data have been permanently deleted",
      deleted: {
        orders: "all",
        remainingOrders: count || 0,
        analytics: "order-related events",
      },
    });

  } catch (err: any) {
    console.error("Reset orders error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to reset orders" },
      { status: 500 }
    );
  }
}
