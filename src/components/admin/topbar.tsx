"use client";

import Link from "next/link";
import { Search, Menu, X, LayoutDashboard, Package, Tag, ShoppingBag, Users, Settings } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/brand/logo";
import { NotificationsDropdown } from "./notifications-dropdown";

const mobileItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

interface Notification {
  id: string;
  type: "order" | "low_stock" | "customer" | "review" | "system";
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

interface AdminTopbarProps {
  title: string;
  subtitle?: string;
  notifications?: Notification[];
  unreadCount?: number;
}

export function AdminTopbar({ 
  title, 
  subtitle, 
  notifications = [], 
  unreadCount = 0 
}: AdminTopbarProps) {
  const [open, setOpen] = useState(false);
  
  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
      <div className="h-16 px-4 sm:px-6 flex items-center gap-4">
        <button
          className="inline-flex size-9 items-center justify-center rounded-full hover:bg-accent lg:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open admin menu"
        >
          <Menu className="size-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-bold text-lg sm:text-xl truncate">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search admin…"
            className="h-10 w-64 rounded-full border border-input bg-background pl-9 pr-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        
        <NotificationsDropdown 
          notifications={notifications} 
          unreadCount={unreadCount} 
        />
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[82%] max-w-xs bg-background shadow-2xl p-5 flex flex-col gap-2 overflow-y-auto">
            <div className="flex items-center justify-between">
              <Logo />
              <button
                aria-label="Close"
                className="inline-flex size-9 items-center justify-center rounded-full hover:bg-accent"
                onClick={() => setOpen(false)}
              >
                <X className="size-5" />
              </button>
            </div>
            {mobileItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-accent"
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
