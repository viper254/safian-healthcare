import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Order } from "@/types";

/**
 * Production admin analytics - all data from Supabase
 * No mock data - requires proper database setup
 */

export async function getAdminDashboard() {
  try {
    const supabase = await createSupabaseServerClient();

    // Get orders from last 30 days for revenue (only paid)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: paidOrders, error: paidOrdersError } = await supabase
      .from("orders")
      .select("*")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .neq("status", "cancelled")
      .eq("payment_status", "paid");

    // Get all orders (including unpaid) for order count
    const { data: allOrders, error: allOrdersError } = await supabase
      .from("orders")
      .select("*")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .neq("status", "cancelled");

    const { count: customerCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "customer");

    if (paidOrdersError || allOrdersError) throw paidOrdersError || allOrdersError;

    // If no orders, return empty state
    if (!allOrders || allOrders.length === 0) {
      return {
        kpis: {
          revenue: 0,
          orders: 0,
          customers: customerCount ?? 0,
          aov: 0,
        },
        days: Array.from({ length: 30 }).map((_, i) => ({
          date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split("T")[0],
          label: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: 0,
          orders: 0,
          visits: 0,
        })),
        categoryBreakdown: [],
        topProducts: [],
        recentOrders: [],
        empty: true,
      };
    }

    // Calculate KPIs
    const revenue = (paidOrders || []).reduce((sum, o) => sum + Number(o.total), 0);
    const ordersCount = allOrders.length;
    const aov = ordersCount > 0 ? revenue / ordersCount : 0;

    // Group by day (use all orders for chart)
    const dayMap = new Map<string, { revenue: number; orders: number }>();
    (paidOrders || []).forEach((o) => {
      const day = o.created_at.split("T")[0];
      const existing = dayMap.get(day) ?? { revenue: 0, orders: 0 };
      dayMap.set(day, {
        revenue: existing.revenue + Number(o.total),
        orders: existing.orders + 1,
      });
    });

    // Get analytics events for visits
    const { data: events } = await supabase
      .from("analytics_events")
      .select("created_at")
      .gte("created_at", thirtyDaysAgo.toISOString());

    const visitMap = new Map<string, number>();
    (events || []).forEach((e) => {
      const day = e.created_at.split("T")[0];
      visitMap.set(day, (visitMap.get(day) || 0) + 1);
    });

    const days = Array.from({ length: 30 }).map((_, i) => {
      const date = new Date(Date.now() - (29 - i) * 86400000).toISOString().split("T")[0];
      const stats = dayMap.get(date) ?? { revenue: 0, orders: 0 };
      return {
        date,
        label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: stats.revenue,
        orders: stats.orders,
        visits: visitMap.get(date) || 0,
      };
    });

    // Get category breakdown from paid orders
    const { data: orderItems } = await supabase
      .from("order_items")
      .select(`
        line_total,
        product_id,
        products!inner(category_id, categories!inner(name))
      `)
      .in(
        "order_id",
        (paidOrders || []).map((o) => o.id)
      );

    const categoryMap = new Map<string, number>();
    let totalRevenue = 0;

    (orderItems || []).forEach((item: any) => {
      const categoryName = item.products?.categories?.name || "Uncategorized";
      const amount = Number(item.line_total);
      categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + amount);
      totalRevenue += amount;
    });

    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([name, value]) => ({
        name,
        value: totalRevenue > 0 ? Math.round((value / totalRevenue) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value);
    const { data: products } = await supabase
      .from("products")
      .select("id, name, rating_count")
      .eq("is_active", true)
      .order("rating_count", { ascending: false })
      .limit(5);

    const topProducts = (products || []).map((p) => ({
      id: p.id,
      name: p.name,
      units: p.rating_count || 0,
      revenue: 0, // Would need order_items data
      image: null,
    }));

    // Get recent orders with items and product details
    const { data: recentOrdersData } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          id,
          quantity,
          unit_price,
          line_total,
          product_id,
          products (
            id,
            name,
            slug,
            brand
          )
        )
      `)
      .order("created_at", { ascending: false })
      .limit(10);

    return {
      kpis: {
        revenue,
        orders: ordersCount,
        customers: customerCount ?? 0,
        aov,
      },
      days,
      categoryBreakdown,
      topProducts,
      recentOrders: (recentOrdersData || []) as any[],
    };
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    // Return empty state on error
    return {
      kpis: { revenue: 0, orders: 0, customers: 0, aov: 0 },
      days: [],
      categoryBreakdown: [],
      topProducts: [],
      recentOrders: [],
      error: true,
    };
  }
}
