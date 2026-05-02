import { AdminTopbar } from "@/components/admin/topbar";
import { KpiCard } from "@/components/admin/kpi-card";
import {
  RevenueAreaChart,
  CategoryPieChart,
  VisitsBarChart,
} from "@/components/admin/charts";
import { getAdminDashboard } from "@/lib/admin-data";
import { getNotifications, getUnreadCount } from "@/lib/notifications";
import { formatDateTime, formatKES } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";

// Revalidate every 30 seconds for admin dashboard
export const revalidate = 30;

export default async function AdminDashboardPage() {
  const [data, notifications, unreadCount] = await Promise.all([
    getAdminDashboard(),
    getNotifications(5),
    getUnreadCount(),
  ]);

  const hasData = data.recentOrders.length > 0;
  
  return (
    <>
      <AdminTopbar
        title="Dashboard"
        notifications={notifications}
        unreadCount={unreadCount}
        subtitle="Overview of store performance in the last 30 days"
      />
      <div className="p-4 sm:p-6 space-y-6">
        {/* KPI row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Revenue (30d)"
            value={formatKES(data.kpis.revenue)}
            delta={12}
            icon="DollarSign"
            accent="orange"
            index={0}
          />
          <KpiCard
            label="Orders"
            value={String(data.kpis.orders)}
            delta={8}
            icon="ShoppingBag"
            accent="green"
            index={1}
          />
          <KpiCard
            label="Customers"
            value={String(data.kpis.customers)}
            delta={5}
            icon="Users"
            accent="blue"
            index={2}
          />
          <KpiCard
            label="Avg. order value"
            value={formatKES(data.kpis.aov)}
            delta={-2}
            icon="Package"
            accent="purple"
            index={3}
          />
        </div>

        {!hasData && (
          <div className="rounded-2xl border bg-card shadow-sm p-8 text-center">
            <p className="text-muted-foreground">
              No orders yet. Charts will appear once you have order data.
            </p>
          </div>
        )}

        {hasData && (
          <>
            {/* Charts grid */}
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
              <section className="rounded-2xl border bg-card shadow-sm p-4 sm:p-5 lg:col-span-2">
                <header className="flex items-center justify-between mb-3 sm:mb-2">
                  <div>
                    <h2 className="font-semibold text-sm sm:text-base">Revenue & orders</h2>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Last 30 days</p>
                  </div>
                </header>
                <RevenueAreaChart data={data.days} />
              </section>
              <section className="rounded-2xl border bg-card shadow-sm p-4 sm:p-5">
                <header className="mb-3 sm:mb-2">
                  <h2 className="font-semibold text-sm sm:text-base">Sales by category</h2>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Share of 30-day revenue</p>
                </header>
                <CategoryPieChart data={data.categoryBreakdown} />
              </section>
            </div>

            <section className="rounded-2xl border bg-card shadow-sm p-4 sm:p-5">
              <header className="mb-3 sm:mb-2">
                <h2 className="font-semibold text-sm sm:text-base">Site traffic</h2>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Page views per day</p>
              </header>
              <VisitsBarChart data={data.days} />
            </section>
          </>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border bg-card shadow-sm">
            <header className="p-4 sm:p-5 border-b flex items-center justify-between gap-2">
              <h2 className="font-semibold text-sm sm:text-base">Top products</h2>
              <Link href="/admin/products" className="text-xs font-semibold text-primary hover:underline whitespace-nowrap">
                Manage
              </Link>
            </header>
            <ul className="divide-y">
              {data.topProducts.map((p, i) => (
                <li key={p.id} className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                  <span className="w-4 sm:w-5 text-center text-xs font-bold text-muted-foreground shrink-0">
                    {i + 1}
                  </span>
                  <div className="relative size-10 sm:size-11 rounded-lg overflow-hidden bg-muted shrink-0">
                    {p.image && (
                      <Image src={p.image} alt={p.name} fill sizes="44px" className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium line-clamp-1">{p.name}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      {p.units} units · {formatKES(p.revenue)}
                    </p>
                  </div>
                  <div className="h-2 w-16 sm:w-24 rounded-full bg-muted overflow-hidden hidden xs:block">
                    <div
                      className="h-full bg-brand-gradient"
                      style={{ width: `${Math.min(100, (p.units / 60) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border bg-card shadow-sm">
            <header className="p-4 sm:p-5 border-b flex items-center justify-between gap-2">
              <h2 className="font-semibold text-sm sm:text-base">Recent orders</h2>
              <Link href="/admin/orders" className="text-xs font-semibold text-primary hover:underline whitespace-nowrap">
                All orders
              </Link>
            </header>
            <ul className="divide-y">
              {data.recentOrders.map((o) => (
                <li key={o.id} className="p-3 sm:p-4 flex flex-wrap items-center gap-2 text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs sm:text-sm">{o.reference}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
                      {o.customer_name} · {formatDateTime(o.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-xs sm:text-sm">{formatKES(o.total)}</span>
                    <Badge
                      variant={
                        o.status === "delivered"
                          ? "success"
                          : o.status === "cancelled"
                          ? "destructive"
                          : o.status === "pending"
                          ? "warning"
                          : "secondary"
                      }
                      className="capitalize text-[10px] sm:text-xs"
                    >
                      {o.status}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
