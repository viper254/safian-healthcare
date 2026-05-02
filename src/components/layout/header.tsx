"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Menu,
  Search,
  ShoppingCart,
  UserRound,
  X,
  LogIn,
  User,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatKES } from "@/lib/utils";
import { useCart } from "@/store/cart-store";
import { CATEGORY_META, CATEGORY_ORDER, FREE_DELIVERY_OVER_KES } from "@/lib/constants";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ReviewsTicker } from "./reviews-ticker";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { SignOutButton } from "@/components/auth/signout-button";

const primaryNav = [
  { href: "/home", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/track-order", label: "Track Order" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(FREE_DELIVERY_OVER_KES);
  const count = useCart((s) => s.totalQty());

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Check authentication status
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    
    // Get initial session
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch settings and reviews
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    
    // Fetch free delivery threshold from settings table
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("settings")
          .select("value")
          .eq("key", "free_threshold")
          .single();
        
        if (data?.value) {
          setFreeDeliveryThreshold(parseInt(data.value));
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      }
    };

    fetchSettings();

    // Fetch featured reviews
    const timer = setTimeout(() => {
      supabase
        .from("reviews")
        .select("id, customer_name, rating, review_text")
        .eq("is_approved", true)
        .eq("is_featured", true)
        .is("product_id", null) // Only general business reviews for ticker
        .order("created_at", { ascending: false })
        .limit(10)
        .then(({ data }) => {
          if (data) setReviews(data);
        });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

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

  // Hide header chrome on admin pages — admin has its own shell
  if (pathname?.startsWith("/admin")) return null;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b transition-all",
        scrolled
          ? "border-border/70 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70"
          : "border-transparent bg-background",
      )}
    >
      {/* Reviews Ticker */}
      <ReviewsTicker reviews={reviews} />

      {/* Top announcement bar - Eye-catching delivery banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-brand-green-600 via-brand-orange-500 to-brand-blue-600 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
        <div className="container relative flex h-10 items-center justify-between gap-3">
          <div className="flex items-center gap-2 animate-fade-in">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 animate-pulse">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
            <span className="text-sm font-semibold">
              FREE Delivery on orders over {formatKES(freeDeliveryThreshold)}
              <span className="hidden md:inline"> · Fast 24hrs-4 days nationwide</span>
            </span>
          </div>
          <Link
            href="/contact"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium hover:underline underline-offset-4 transition-all hover:gap-2"
          >
            Get in touch
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </div>
      </div>

      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Open menu"
            className="inline-flex size-10 items-center justify-center rounded-full hover:bg-accent lg:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu className="size-5" />
          </button>
          <Logo />
        </div>

        <nav className="hidden lg:flex items-center gap-1">
          {primaryNav.map((item) => {
            const active = mounted && (
              pathname === item.href ||
              (item.href !== "/" && pathname?.startsWith(item.href))
            );
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-full transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground/80 hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <form
            action="/shop"
            method="get"
            className="hidden md:flex items-center gap-2"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Search products…"
                className="h-10 w-56 pl-9 rounded-full"
              />
            </div>
          </form>
          <ThemeToggle />
          <Link
            href="/account"
            className="hidden sm:inline-flex size-10 items-center justify-center rounded-full hover:bg-accent"
            aria-label="Account"
          >
            <UserRound className="size-5" />
          </Link>
          <Link
            href="/cart"
            className="relative inline-flex size-10 items-center justify-center rounded-full hover:bg-accent"
            aria-label="Cart"
          >
            <ShoppingCart className="size-5" />
            {mounted && count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>
          <Button
            asChild
            size="sm"
            variant="gradient"
            className="hidden md:inline-flex"
          >
            {user ? (
              <Link href="/account">
                <User className="size-4" />
                Account
              </Link>
            ) : (
              <Link href="/login">
                <LogIn className="size-4" />
                Sign in
              </Link>
            )}
          </Button>
        </div>
      </div>

      {/* Categories sub-nav (desktop) */}
      <div className="hidden lg:block border-t border-brand-blue-200 bg-brand-blue-50 dark:bg-brand-blue-900/20 dark:border-brand-blue-800">
        <div className="container flex h-11 items-center gap-5 overflow-x-auto no-scrollbar text-sm">
          <span className="text-brand-blue-700 dark:text-brand-blue-300 font-semibold">Browse:</span>
          {CATEGORY_ORDER.map((slug) => (
            <Link
              key={slug}
              href={`/shop/${slug}`}
              className="text-brand-blue-600 dark:text-brand-blue-200 hover:text-brand-blue-800 dark:hover:text-brand-blue-100 transition-colors font-medium whitespace-nowrap hover:underline underline-offset-4"
            >
              {CATEGORY_META[slug].name}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
        <div
          className={cn(
            "absolute left-0 top-0 bottom-0 w-[86%] max-w-sm bg-background shadow-2xl p-5 flex flex-col gap-5 transition-transform duration-300 ease-out overflow-y-auto",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between shrink-0">
            <Logo />
            <button
              aria-label="Close menu"
              className="inline-flex size-10 items-center justify-center rounded-full hover:bg-accent transition-colors"
              onClick={() => setOpen(false)}
            >
              <X className="size-5" />
            </button>
          </div>
          <form action="/shop" method="get" className="flex gap-2 shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input name="q" placeholder="Search products…" className="pl-9" />
            </div>
          </form>
          <nav className="flex flex-col gap-1">
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-3 text-base font-medium rounded-lg hover:bg-accent transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="text-xs uppercase tracking-wide text-muted-foreground px-3 pt-1">
            Categories
          </div>
          <nav className="flex flex-col gap-1 flex-1">
            {CATEGORY_ORDER.map((slug) => (
              <Link
                key={slug}
                href={`/shop/${slug}`}
                className="px-3 py-2.5 text-sm rounded-lg hover:bg-accent text-foreground/80 transition-colors"
              >
                {CATEGORY_META[slug].name}
              </Link>
            ))}
          </nav>
          <div className="mt-auto grid gap-2 shrink-0 pb-2">
            {user ? (
              <>
                <Button asChild variant="gradient">
                  <Link href="/account">
                    <User className="size-4" />
                    My Account
                  </Link>
                </Button>
                <SignOutButton variant="outline" className="w-full" />
              </>
            ) : (
              <>
                <Button asChild variant="gradient">
                  <Link href="/login">
                    <LogIn className="size-4" />
                    Sign in
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/register">Create account</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
