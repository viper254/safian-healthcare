"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, X, LayoutDashboard, Package, Tag, ShoppingBag, Users, Settings, Star, ArrowUpRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Logo } from "@/components/brand/logo";
import { NotificationsDropdown } from "./notifications-dropdown";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@/components/auth/signout-button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const mobileItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Search function
  async function handleSearch(query: string) {
    setSearchQuery(query);
    
    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setSearching(true);
    setShowResults(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const searchTerm = `%${query.trim()}%`;

      // Search products
      const { data: products } = await supabase
        .from("products")
        .select("id, name, slug, sku")
        .or(`name.ilike.${searchTerm},sku.ilike.${searchTerm}`)
        .limit(5);

      // Search orders
      const { data: orders } = await supabase
        .from("orders")
        .select("id, reference, customer_name")
        .or(`reference.ilike.${searchTerm},customer_name.ilike.${searchTerm}`)
        .limit(5);

      const results = [
        ...(products || []).map(p => ({ type: 'product', ...p })),
        ...(orders || []).map(o => ({ type: 'order', ...o })),
      ];

      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  }

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigate to result
  function navigateToResult(result: any) {
    if (result.type === 'product') {
      router.push(`/admin/products/${result.id}`);
    } else if (result.type === 'order') {
      router.push(`/admin/orders`);
    }
    setShowResults(false);
    setSearchQuery("");
  }

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close drawer on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);
  
  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
      <div className="h-16 px-4 sm:px-6 flex items-center gap-3 sm:gap-4">
        <button
          className="inline-flex size-10 items-center justify-center rounded-lg hover:bg-accent transition-colors lg:hidden active:scale-95"
          onClick={() => setOpen(true)}
          aria-label="Open admin menu"
        >
          <Menu className="size-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-bold text-base sm:text-lg md:text-xl truncate">{title}</h1>
          {subtitle && <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{subtitle}</p>}
        </div>
        <div className="relative hidden md:block" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products, orders..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
            className="h-10 w-64 rounded-full border border-input bg-background pl-9 pr-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          
          {/* Search results dropdown */}
          {showResults && (
            <div className="absolute top-full mt-2 w-full bg-card border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
              {searching ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Searching...
                </div>
              ) : searchResults.length > 0 ? (
                <div className="py-2">
                  {searchResults.map((result, index) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => navigateToResult(result)}
                      className="w-full px-4 py-2 text-left hover:bg-accent transition-colors flex items-center gap-3"
                    >
                      {result.type === 'product' ? (
                        <>
                          <Package className="size-4 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{result.name}</p>
                            {result.sku && (
                              <p className="text-xs text-muted-foreground">SKU: {result.sku}</p>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="size-4 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{result.reference}</p>
                            <p className="text-xs text-muted-foreground truncate">{result.customer_name}</p>
                          </div>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No results found
                </div>
              )}
            </div>
          )}
        </div>
        
        <NotificationsDropdown 
          notifications={notifications} 
          unreadCount={unreadCount} 
        />
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
        {/* Drawer panel */}
        <nav
          className={cn(
            "absolute left-0 top-0 bottom-0 w-64 sm:w-72 bg-card shadow-2xl flex flex-col transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-4 sm:px-5 border-b shrink-0">
            <Logo />
            <button
              aria-label="Close menu"
              className="inline-flex size-9 items-center justify-center rounded-full hover:bg-accent transition-colors"
              onClick={() => setOpen(false)}
            >
              <X className="size-5" />
            </button>
          </div>
          {/* Nav items */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {mobileItems.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-brand-gradient text-white shadow-sm"
                      : "text-foreground/70 hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
          {/* Footer */}
          <div className="p-3 border-t space-y-1 shrink-0">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowUpRight className="size-3.5" />
              View storefront
            </Link>
            <SignOutButton asMenuItem />
          </div>
        </nav>
      </div>
    </header>
  );
}
