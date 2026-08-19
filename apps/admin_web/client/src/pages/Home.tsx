/**
 * Clinical Operations Ledger: a Swiss-inspired admin canvas with a permanent rail,
 * ledger rules, clinical-green state signals, and staging-only operational examples.
 */
import {
  ArrowUpRight,
  Bell,
  ChevronRight,
  Clock3,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  Package,
  PackageCheck,
  Plus,
  Search,
  Settings2,
  ShoppingBag,
  SlidersHorizontal,
  Star,
  Truck,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

const assets = {
  mark: "/manus-storage/safian-admin-mark_ca03231e.png",
  operations: "/manus-storage/safian-admin-operations-hero_0a729991.jpg",
  stock: "/manus-storage/safian-admin-stock-detail_0b22607b.jpg",
  dispatch: "/manus-storage/safian-admin-dispatch-detail_998d2572.jpg",
};

type NavItem = { label: string; icon: LucideIcon; active?: boolean; count?: string };

const mainNavigation: NavItem[] = [
  { label: "Overview", icon: LayoutDashboard, active: true },
  { label: "Orders", icon: ShoppingBag, count: "09" },
  { label: "Inventory", icon: Package, count: "04" },
  { label: "Customers", icon: Users },
  { label: "Reviews", icon: Star },
];

const supportNavigation: NavItem[] = [
  { label: "Reports", icon: FileText },
  { label: "Settings", icon: Settings2 },
];

const queue = [
  { ref: "SAF-Q8N2", destination: "Nairobi · Westlands", items: "4 items", state: "Payment review", tone: "amber", due: "08:30" },
  { ref: "SAF-R5H7", destination: "Kiambu · Ruiru", items: "2 items", state: "Ready to pick", tone: "blue", due: "09:15" },
  { ref: "SAF-M4K9", destination: "Nairobi · Kilimani", items: "6 items", state: "Packed", tone: "green", due: "10:00" },
  { ref: "SAF-V2D6", destination: "Machakos · Syokimau", items: "3 items", state: "Address check", tone: "ink", due: "10:30" },
];

function NavButton({ item, condensed = false }: { item: NavItem; condensed?: boolean }) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      title={item.label}
      className={`rail-link ${item.active ? "rail-link-active" : ""} ${condensed ? "rail-link-condensed" : ""}`}
    >
      <Icon aria-hidden="true" />
      {!condensed && <span>{item.label}</span>}
      {!condensed && item.count && <span className="rail-count">{item.count}</span>}
    </button>
  );
}

function Metric({ label, value, note, accent, icon: Icon }: { label: string; value: string; note: string; accent: string; icon: LucideIcon }) {
  return (
    <article className="metric-card">
      <div className={`metric-icon metric-${accent}`}><Icon aria-hidden="true" /></div>
      <div className="metric-copy">
        <p>{label}</p>
        <strong>{value}</strong>
        <span>{note}</span>
      </div>
      <ArrowUpRight className="metric-arrow" aria-hidden="true" />
    </article>
  );
}

function StatusPill({ label, tone }: { label: string; tone: string }) {
  return <span className={`status-pill status-${tone}`}>{label}</span>;
}

export default function Home() {
  const [railOpen, setRailOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const currentDate = useMemo(
    () => new Intl.DateTimeFormat("en-KE", { weekday: "long", day: "numeric", month: "long" }).format(new Date()),
    [],
  );

  return (
    <main className="admin-shell">
      <aside className={`admin-rail ${railOpen ? "admin-rail-open" : ""}`} aria-label="Admin navigation">
        <div className="rail-brand">
          <img src={assets.mark} alt="Safian operations" />
          <div className="rail-wordmark"><span>SAFIΛN</span><small>OPERATIONS</small></div>
          <button type="button" className="rail-close" onClick={() => setRailOpen(false)} aria-label="Close navigation"><X /></button>
        </div>

        <div className="rail-context">
          <span className="live-dot" />
          <span>STAGING DESK</span>
        </div>

        <nav className="rail-nav">
          <p>Workspace</p>
          {mainNavigation.map((item) => <NavButton key={item.label} item={item} />)}
          <p className="rail-section-label">System</p>
          {supportNavigation.map((item) => <NavButton key={item.label} item={item} />)}
        </nav>

        <div className="rail-footer">
          <div className="operator-chip"><span className="operator-avatar">MO</span><div><strong>Ops team</strong><small>Admin workspace</small></div></div>
          <button type="button" className="logout-button" title="Sign out"><LogOut aria-hidden="true" /></button>
        </div>
      </aside>

      <section className="workspace">
        <header className="workspace-header">
          <div className="header-breadcrumb">
            <button type="button" className="menu-button" onClick={() => setRailOpen(true)} aria-label="Open navigation"><Menu /></button>
            <span>Safian Healthcare</span><ChevronRight aria-hidden="true" /><strong>Operations desk</strong>
          </div>
          <div className="header-actions">
            <button type="button" className="search-button"><Search aria-hidden="true" /><span>Search records</span><kbd>⌘ K</kbd></button>
            <button type="button" className="notification-button" aria-label="Notifications"><Bell /><i /></button>
            <Button className="new-order-button"><Plus aria-hidden="true" />New order</Button>
          </div>
        </header>

        <div className="workspace-content">
          <section className="title-row">
            <div>
              <p className="eyebrow"><span />Live operations</p>
              <h1>Good morning, operations.</h1>
              <p className="title-subtitle">{currentDate} · The current display uses an isolated staging data view.</p>
            </div>
            <button type="button" className={`filter-toggle ${filterOpen ? "filter-toggle-active" : ""}`} onClick={() => setFilterOpen(!filterOpen)}><SlidersHorizontal aria-hidden="true" />{filterOpen ? "Filters open" : "Filter view"}</button>
          </section>

          {filterOpen && <section className="filter-strip" aria-label="Preview filters"><span>Staging only</span><button type="button">All locations</button><button type="button">Today</button><button type="button">Open orders</button><button type="button" className="filter-clear">Clear</button></section>}

          <section className="metrics-grid" aria-label="Operational summary">
            <Metric label="Open orders" value="09" note="4 need attention" accent="green" icon={ShoppingBag} />
            <Metric label="Awaiting dispatch" value="06" note="Next cut-off 10:30" accent="blue" icon={Truck} />
            <Metric label="Low stock lines" value="04" note="Review before picking" accent="amber" icon={Package} />
            <Metric label="Today’s sales" value="KES 0" note="Staging display only" accent="ink" icon={PackageCheck} />
          </section>

          <section className="content-grid">
            <article className="ledger-panel queue-panel">
              <div className="panel-heading">
                <div><p className="panel-kicker">Dispatch ledger</p><h2>Orders to move next</h2></div>
                <button type="button" className="panel-action">Open order queue <ArrowUpRight aria-hidden="true" /></button>
              </div>
              <div className="ledger-head"><span>Reference</span><span>Destination</span><span>Status</span><span>Dispatch by</span><span /></div>
              <div className="ledger-list">
                {queue.map((order) => (
                  <button type="button" className="ledger-row" key={order.ref}>
                    <span className="order-ref">{order.ref}</span>
                    <span className="destination"><strong>{order.destination}</strong><small>{order.items}</small></span>
                    <StatusPill label={order.state} tone={order.tone} />
                    <span className="due-time"><Clock3 aria-hidden="true" />{order.due}</span>
                    <MoreHorizontal className="row-more" aria-hidden="true" />
                  </button>
                ))}
              </div>
              <div className="panel-footer"><span><i className="ledger-dot" />Scheduling window closes in 02:14</span><button type="button">View dispatch plan <ChevronRight /></button></div>
            </article>

            <aside className="right-stack">
              <article className="arrival-card">
                <img src={assets.operations} alt="Healthcare supply operations desk" />
                <div className="arrival-overlay"><span>08:00 briefing</span><h3>Start with the four records marked for review.</h3><button type="button">Open daily checklist <ChevronRight /></button></div>
              </article>
              <article className="stock-card">
                <div className="stock-copy"><p className="panel-kicker">Inventory watch</p><h3>Four lines need a stock decision.</h3><button type="button">Review inventory <ArrowUpRight /></button></div>
                <img src={assets.stock} alt="Organised medical supply shelves" />
              </article>
            </aside>
          </section>

          <section className="lower-grid">
            <article className="activity-panel">
              <div className="panel-heading"><div><p className="panel-kicker">Operational trail</p><h2>Latest activity</h2></div><button type="button" className="panel-action">View all activity <ArrowUpRight /></button></div>
              <div className="activity-list">
                <div><span className="activity-mark activity-green" /><p><strong>Dispatch list prepared</strong><small>Staging preview · 08:14</small></p><span>Queue</span></div>
                <div><span className="activity-mark activity-blue" /><p><strong>Inventory review due</strong><small>4 product lines below preferred level</small></p><span>Stock</span></div>
                <div><span className="activity-mark activity-ink" /><p><strong>Customer data view isolated</strong><small>Shared backend connection is not yet enabled</small></p><span>System</span></div>
              </div>
            </article>
            <article className="dispatch-note">
              <img src={assets.dispatch} alt="Healthcare parcel dispatch supplies" />
              <div><p className="panel-kicker">Dispatch protocol</p><h3>Verify product, address, and payment state before handoff.</h3><button type="button">Read staging checklist <ChevronRight /></button></div>
            </article>
          </section>
        </div>
      </section>
      {railOpen && <button type="button" className="rail-scrim" onClick={() => setRailOpen(false)} aria-label="Close navigation" />}
    </main>
  );
}
