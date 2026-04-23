import Link from "next/link";
import { Package, CheckCircle2, Truck, CircleAlert, Clock } from "lucide-react";
import { createSupabaseServerClient, supabaseIsConfigured } from "@/lib/supabase/server";
import { formatDateTime, formatKES } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Order, OrderStatus } from "@/types";

export const dynamic = "force-dynamic";

const statusMeta: Record<
  OrderStatus,
  { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive"; icon: typeof Package }
> = {
  pending: { label: "Pending", variant: "warning", icon: Clock },
  confirmed: { label: "Confirmed", variant: "secondary", icon: CheckCircle2 },
  processing: { label: "Processing", variant: "secondary", icon: Package },
  dispatched: { label: "Dispatched", variant: "default", icon: Truck },
  delivered: { label: "Delivered", variant: "success", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", variant: "destructive", icon: CircleAlert },
};

async function loadOrders(): Promise<{ orders: Order[]; signedIn: boolean }> {
  if (!supabaseIsConfigured()) return { orders: [], signedIn: false };
  try {
    const supabase = await createSupabaseServerClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return { orders: [], signedIn: false };
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false });
    return { orders: (data as Order[]) ?? [], signedIn: true };
  } catch {
    return { orders: [], signedIn: false };
  }
}

export default async function OrdersPage() {
  const { orders, signedIn } = await loadOrders();
  return (
    <div className="container py-10">
      <h1 className="font-display font-bold text-3xl">My orders</h1>
      <p className="mt-2 text-muted-foreground text-sm">Track and review your past orders.</p>

      {!signedIn ? (
        <div className="mt-8 rounded-2xl border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Sign in to see your orders. Guest orders are tracked via the reference number we emailed you.
          </p>
          <Button asChild className="mt-5" variant="gradient">
            <Link href="/login?redirect=/account/orders">Sign in</Link>
          </Button>
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed p-12 text-center">
          <Package className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">You haven&apos;t placed any orders yet.</p>
          <Button asChild className="mt-5" variant="gradient">
            <Link href="/shop">Start shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-3">
          {orders.map((o) => {
            const s = statusMeta[o.status];
            const Icon = s.icon;
            return (
              <article
                key={o.id}
                className="rounded-2xl border bg-card p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{o.reference}</span>
                    <Badge variant={s.variant}>
                      <Icon className="size-3 mr-1" />
                      {s.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Placed {formatDateTime(o.created_at)} · {formatKES(o.total)}
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/account/orders/${o.id}`}>Details</Link>
                </Button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
