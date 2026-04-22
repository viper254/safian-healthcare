import { DollarSign, ShoppingBag, Users, Package } from "lucide-react";
import { AdminTopbar } from "@/components/admin/topbar";
import { KpiCard } from "@/components/admin/kpi-card";
import {
  RevenueAreaChart,
  CategoryPieChart,
  VisitsBarChart,
} from "@/components/admin/charts";
import { getAdminDashboard } from "@/lib/admin-data";
import { formatDateTime, formatKES } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";

export default async function AdminDashboardPage() {
  const data = await getAdminDashboard();
  return (
    <>
      <AdminTopbar
        title="Dashboard"
        subtitle="Overview of store performance in the last 30 days"
      />
      <div className="p-4 sm:p-6 space-y-6">
        {data.demo && (
          <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 text-amber-900 px-4 py-3 text-xs">
            Demo analytics — connect Supabase to see live numbers.
          </div>
        )}

        {/* KPI row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Revenue (30d)"
            value={formatKES(data.kpis.revenue)}
            delta={12}
            icon={DollarSign}
            accent="orange"
            index={0}
          />
          <KpiCard
            label="Orders"
            value={String(data.kpis.orders)}
            delta={8}
            icon={ShoppingBag}
            accent="green"
            index={1}
          />
          <KpiCard
            label="Customers"
            value={String(data.kpis.customers)}
            delta={5}
            icon={Users}
            accent="blue"
            index={2}
          />
          <KpiCard
            label="Avg. order value"
            value={formatKES(data.kpis.aov)}
            delta={-2}
            icon={Package}
            accent="purple"
            index={3}
          />
        </div>

        {/* Charts grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border bg-card shadow-sm p-5 lg:col-span-2">
            <header className="flex items-center justify-between mb-2">
              <div>
                <h2 className="font-semibold">Revenue & orders</h2>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </div>
            </header>
            <RevenueAreaChart data={data.days} />
          </section>
          <section className="rounded-2xl border bg-card shadow-sm p-5">
            <header className="mb-2">
              <h2 className="font-semibold">Sales by category</h2>
              <p className="text-xs text-muted-foreground">Share of 30-day revenue</p>
            </header>
            <CategoryPieChart data={data.categoryBreakdown} />
          </section>
        </div>

        <section className="rounded-2xl border bg-card shadow-sm p-5">
          <header className="mb-2">
            <h2 className="font-semibold">Site traffic</h2>
            <p className="text-xs text-muted-foreground">Page views per day</p>
          </header>
          <VisitsBarChart data={data.days} />
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border bg-card shadow-sm">
            <header className="p-5 border-b flex items-center justify-between">
              <h2 className="font-semibold">Top products</h2>
              <Link href="/admin/products" className="text-xs font-semibold text-primary hover:underline">
                Manage products
              </Link>
            </header>
            <ul className="divide-y">
              {data.topProducts.map((p, i) => (
                <li key={p.id} className="p-4 flex items-center gap-3">
                  <span className="w-5 text-center text-xs font-bold text-muted-foreground">
                    {i + 1}
                  </span>
                  <div className="relative size-11 rounded-lg overflow-hidden bg-muted shrink-0">
                    {p.image && (
                      <Image src={p.image} alt={p.name} fill sizes="44px" className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.units} units · {formatKES(p.revenue)}
                    </p>
                  </div>
                  <div className="h-2 w-24 rounded-full bg-muted overflow-hidden hidden sm:block">
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
            <header className="p-5 border-b flex items-center justify-between">
              <h2 className="font-semibold">Recent orders</h2>
              <Link href="/admin/orders" className="text-xs font-semibold text-primary hover:underline">
                All orders
              </Link>
            </header>
            <ul className="divide-y">
              {data.recentOrders.map((o) => (
                <li key={o.id} className="p-4 flex items-center gap-3 text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{o.reference}</p>
                    <p className="text-xs text-muted-foreground">
                      {o.customer_name} · {formatDateTime(o.created_at)}
                    </p>
                  </div>
                  <span className="font-bold">{formatKES(o.total)}</span>
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
                    className="ml-2 capitalize"
                  >
                    {o.status}
                  </Badge>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
