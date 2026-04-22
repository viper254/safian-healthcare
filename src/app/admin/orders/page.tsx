import { AdminTopbar } from "@/components/admin/topbar";
import { Badge } from "@/components/ui/badge";
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
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-3 text-left font-semibold">Reference</th>
                  <th className="p-3 text-left font-semibold">Customer</th>
                  <th className="p-3 text-left font-semibold hidden md:table-cell">Placed</th>
                  <th className="p-3 text-left font-semibold hidden sm:table-cell">Payment</th>
                  <th className="p-3 text-right font-semibold">Total</th>
                  <th className="p-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/30">
                    <td className="p-3 font-medium">{o.reference}</td>
                    <td className="p-3">
                      <p className="font-medium">{o.customer_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {o.customer_email}
                      </p>
                    </td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground">
                      {formatDateTime(o.created_at)}
                    </td>
                    <td className="p-3 hidden sm:table-cell capitalize">
                      {o.payment_method.replace("_", " ")}
                      <div className="text-xs text-muted-foreground capitalize">
                        {o.payment_status}
                      </div>
                    </td>
                    <td className="p-3 text-right font-semibold">
                      {formatKES(o.total)}
                    </td>
                    <td className="p-3">
                      <Badge variant={statusVariant[o.status]} className="capitalize">
                        {o.status}
                      </Badge>
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
