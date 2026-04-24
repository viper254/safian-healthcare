import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, CheckCircle2, Truck, Clock, CircleAlert } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDateTime, formatKES } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WhatsAppSupportButton } from "@/components/orders/whatsapp-support-button";
import type { OrderStatus } from "@/types";

export const dynamic = "force-dynamic";

const statusMeta: Record<
  OrderStatus,
  { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive"; icon: typeof Package }
> = {
  pending: { label: "Pending", variant: "warning", icon: Clock },
  confirmed: { label: "Confirmed", variant: "secondary", icon: CheckCircle2 },
  processing: { label: "Processing", variant: "secondary", icon: Package },
  dispatched: { label: "On the Way", variant: "default", icon: Truck },
  delivered: { label: "Delivered", variant: "success", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", variant: "destructive", icon: CircleAlert },
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("id", id)
    .single();

  if (!order) return notFound();

  const status = statusMeta[order.status as OrderStatus];
  const StatusIcon = status.icon;

  return (
    <div className="container py-10 max-w-4xl">
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="size-4" />
        Back to orders
      </Link>

      <div className="space-y-6">
        {/* Order Header */}
        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-display text-2xl font-bold">Order {order.reference}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Placed on {formatDateTime(order.created_at)}
              </p>
            </div>
            <Badge variant={status.variant} className="text-base px-4 py-2">
              <StatusIcon className="size-4 mr-2" />
              {status.label}
            </Badge>
          </div>

          <div className="mt-6 grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Customer</p>
              <p className="font-medium">{order.customer_name}</p>
              <p className="text-muted-foreground">{order.customer_phone}</p>
              {order.customer_email && (
                <p className="text-muted-foreground">{order.customer_email}</p>
              )}
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Delivery Address</p>
              <p className="font-medium">{order.shipping_address}</p>
              <p className="text-muted-foreground">{order.shipping_city}</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="font-semibold mb-4">Order Items</h2>
          <div className="divide-y">
            {order.items?.map((item: any) => (
              <div key={item.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatKES(item.unit_price)} × {item.quantity}
                  </p>
                </div>
                <p className="font-semibold">{formatKES(item.unit_price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatKES(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery</span>
              <span>{formatKES(order.delivery_fee)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total</span>
              <span>{formatKES(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="font-semibold mb-4">Payment Information</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Payment Method</p>
              <p className="font-medium capitalize">{order.payment_method.replace("_", " ")}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Payment Status</p>
              <Badge variant={order.payment_status === "paid" ? "success" : "warning"} className="capitalize">
                {order.payment_status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <WhatsAppSupportButton orderReference={order.reference} />
          <Button asChild variant="outline">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
