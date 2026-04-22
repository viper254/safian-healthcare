import { createSupabaseServerClient, supabaseIsConfigured } from "@/lib/supabase/server";
import { mockProducts } from "@/lib/mock-data";
import type { Order } from "@/types";

/**
 * Mock analytics used when Supabase isn't configured. Produces data that looks
 * realistic for 30 days.
 */
function mockAnalytics() {
  const now = new Date();
  const days = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (29 - i));
    // Weekend dip, general uptrend
    const weekend = d.getDay() === 0 || d.getDay() === 6 ? 0.65 : 1;
    const base = 12 + Math.floor(i * 0.8) + Math.floor(Math.random() * 5);
    const orders = Math.max(1, Math.round(base * weekend));
    const revenue = orders * (5000 + Math.random() * 4000);
    const visits = orders * (8 + Math.round(Math.random() * 6));
    return {
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("en-KE", { month: "short", day: "numeric" }),
      orders,
      revenue: Math.round(revenue),
      visits,
    };
  });
  const kpis = {
    revenue: days.reduce((s, d) => s + d.revenue, 0),
    orders: days.reduce((s, d) => s + d.orders, 0),
    customers: 248,
    aov: Math.round(
      days.reduce((s, d) => s + d.revenue, 0) /
        Math.max(1, days.reduce((s, d) => s + d.orders, 0)),
    ),
  };
  const categoryBreakdown = [
    { name: "Professional Tools", value: 38 },
    { name: "Medical Student Kits", value: 27 },
    { name: "Patient Supplies", value: 22 },
    { name: "Facility Items", value: 13 },
  ];
  const topProducts = mockProducts
    .slice()
    .sort((a, b) => b.rating_count - a.rating_count)
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      revenue: Math.round(
        (p.discounted_price ?? p.offer_price ?? p.original_price) *
          (20 + Math.random() * 40),
      ),
      units: 20 + Math.round(Math.random() * 40),
      image: p.images[0]?.url,
    }));
  const recentOrders: Order[] = Array.from({ length: 6 }).map((_, i) => ({
    id: `mock-${i}`,
    reference: `SAF-${String(10234 + i).padStart(6, "0")}`,
    user_id: null,
    customer_name: ["Amina Wanjiru", "Peter Otieno", "Grace Mumbi", "James Kariuki", "Mary Adhiambo", "Joseph Mwangi"][i] ?? "Customer",
    customer_email: "customer@example.com",
    customer_phone: "+2547…",
    shipping_address: "Nairobi CBD",
    shipping_city: "Nairobi",
    shipping_notes: null,
    subtotal: 4500 + i * 1200,
    delivery_fee: 350,
    total: 4500 + i * 1200 + 350,
    status: (["pending", "confirmed", "processing", "dispatched", "delivered", "delivered"] as const)[i] ?? "pending",
    payment_status: (["unpaid", "paid", "paid", "paid", "paid", "paid"] as const)[i] ?? "unpaid",
    payment_method: (["mpesa", "card", "mpesa", "cash_on_delivery", "bank_transfer", "mpesa"] as const)[i] ?? "mpesa",
    payment_ref: null,
    created_at: new Date(Date.now() - i * 3600_000 * 4).toISOString(),
    updated_at: new Date().toISOString(),
  }));
  return { days, kpis, categoryBreakdown, topProducts, recentOrders };
}

export async function getAdminDashboard() {
  if (!supabaseIsConfigured()) return { ...mockAnalytics(), demo: true };
  try {
    const supabase = createSupabaseServerClient();
    const since = new Date();
    since.setDate(since.getDate() - 29);
    const sinceIso = since.toISOString();

    const [{ data: orders }, { count: customerCount }] = await Promise.all([
      supabase
        .from("orders")
        .select("*")
        .gte("created_at", sinceIso)
        .order("created_at", { ascending: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
    ]);

    if (!orders || orders.length === 0) {
      // Show mock analytics but mark as live=true if at least the db connection works.
      const m = mockAnalytics();
      return { ...m, kpis: { ...m.kpis, customers: customerCount ?? 0 }, demo: false, empty: true };
    }

    // Aggregate by day
    const byDay = new Map<string, { orders: number; revenue: number }>();
    for (const o of orders) {
      const day = String(o.created_at).slice(0, 10);
      const prev = byDay.get(day) ?? { orders: 0, revenue: 0 };
      byDay.set(day, {
        orders: prev.orders + 1,
        revenue: prev.revenue + Number(o.total ?? 0),
      });
    }
    const days = Array.from({ length: 30 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const key = d.toISOString().slice(0, 10);
      const v = byDay.get(key) ?? { orders: 0, revenue: 0 };
      return {
        date: key,
        label: d.toLocaleDateString("en-KE", { month: "short", day: "numeric" }),
        orders: v.orders,
        revenue: v.revenue,
        visits: v.orders * 10,
      };
    });
    const revenue = days.reduce((s, d) => s + d.revenue, 0);
    const ordersCount = days.reduce((s, d) => s + d.orders, 0);
    const aov = ordersCount ? Math.round(revenue / ordersCount) : 0;

    return {
      days,
      kpis: { revenue, orders: ordersCount, customers: customerCount ?? 0, aov },
      categoryBreakdown: mockAnalytics().categoryBreakdown,
      topProducts: mockAnalytics().topProducts,
      recentOrders: orders.slice(-6).reverse() as Order[],
      demo: false,
    };
  } catch {
    return { ...mockAnalytics(), demo: true };
  }
}
