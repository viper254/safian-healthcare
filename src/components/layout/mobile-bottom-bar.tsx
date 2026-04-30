"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Store, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/store/cart-store";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const items = [
  { href: "/shop", label: "Shop", icon: Store },
  { href: "/cart", label: "Cart", icon: ShoppingBag, badge: true },
  { href: "/account", label: "Account", icon: User },
  { href: "/home", label: "Home", icon: Home },
];

export function MobileBottomBar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const count = useCart((s) => s.totalQty());
  useEffect(() => setMounted(true), []);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <nav
      aria-label="Primary mobile navigation"
      className="fixed bottom-0 inset-x-0 z-30 border-t bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75 lg:hidden"
    >
      <ul className="grid grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname?.startsWith(item.href));
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <span className="relative">
                  <Icon className="size-5" />
                  {item.badge && mounted && count > 0 && (
                    <span className="absolute -top-1 -right-1.5 min-w-[16px] h-[16px] rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center px-1">
                      {count > 9 ? "9+" : count}
                    </span>
                  )}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
