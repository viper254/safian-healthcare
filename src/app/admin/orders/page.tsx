import Link from "next/link";
import { Plus, Phone, Mail, ExternalLink } from "lucide-react";
import { AdminTopbar } from "@/components/admin/topbar";
import { Button } from "@/components/ui/button";
import { OrderStatusUpdater } from "@/components/admin/order-status-updater";
import { getAdminDashboard } from "@/lib/admin-data";
import { formatDateTime, formatKES } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const statusVariant: Record<
  OrderStatus,
  "default" | "secondary" | "success" | "warning" | "destructive"
> = {
  pending: "warning",
  confirmed: "secondary",
  processing: "secondary",
  dispatched: "default",
  delivered: "success",
  cancelled: "destructive",
};

export default async function AdminOrdersPage() {
  const { recentOrders } = await getAdminDashboard();
  return (
    <>
      <AdminTopbar title="Orders" subtitle={`${recentOrders.length} recent orders`} />
      <div className="p-4 sm:p-6">
        <div className="mb-4 flex justify-end">
          <Button asChild variant="gradient">
            <Link href="/admin/orders/new">
              <Plus className="size-4" />
              New Order
            </Link>
          </Button>
        </div>
        
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-3 text-left font-semibold">Reference</th>
                  <th className="p-3 text-left font-semibold">Customer</th>
                  <th className="p-3 text-left font-semibold">Items</th>
                  <th className="p-3 text-left font-semibold hidden md:table-cell">Placed</th>
                  <th className="p-3 text-right font-semibold">Total</th>
                  <th className="p-3 text-left font-semibold">Order Status</th>
                  <th className="p-3 text-left font-semibold">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/30">
                    <td className="p-3 font-medium">{o.reference}</td>
                    <td className="p-3">
                      <p className="font-medium">{o.customer_name}</p>
                      {o.customer_phone && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Phone className="size-3" /> {o.customer_phone}
                        </p>
                      )}
                      {o.customer_email && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Mail className="size-3" /> {o.customer_email}
                        </p>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="space-y-1 max-w-[250px]">
                        {o.order_items?.map((item: any) => (
                          <div key={item.id} className="text-xs">
                            <Link 
                              href={`/product/${item.products?.slug}`}
                              target="_blank"
                              className="text-brand-blue-600 hover:underline flex items-center gap-1 font-medium"
                            >
                              {item.products?.name}
                              <ExternalLink className="size-2.5" />
                            </Link>
                            <p className="text-muted-foreground">
                              {item.quantity} x {formatKES(item.unit_price)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground">
                      {formatDateTime(o.created_at)}
                    </td>
                    <td className="p-3 text-right font-semibold">
                      {formatKES(o.total)}
                    </td>
                    <td className="p-3" colSpan={2}>
                      <OrderStatusUpdater
                        orderId={o.id}
                        currentStatus={o.status}
                        currentPaymentStatus={o.payment_status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
