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
import { cn } from "@/lib/utils";
import { useCart } from "@/store/cart-store";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/constants";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ReviewsTicker } from "./reviews-ticker";

const primaryNav = [
  { href: "/", label: "Home" },
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

  // Fetch featured reviews (defer to reduce initial load)
  useEffect(() => {
    const timer = setTimeout(() => {
      const supabase = createSupabaseBrowserClient();
      
      supabase
        .from("reviews")
        .select("id, customer_name, rating, review_text")
        .eq("is_approved", true)
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(10)
        .then(({ data }) => {
          if (data) setReviews(data);
        });
    }, 1000); // Delay by 1 second

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

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

      {/* Top announcement bar */}
      <div className="bg-brand-gradient text-white text-[12px]">
        <div className="container flex h-8 items-center justify-between gap-3">
          <span className="truncate">
            Nationwide delivery · Free over KES 25,000 · Deliveries within 24hrs-4 working days
          </span>
          <Link
            href="/contact"
            className="hidden sm:inline underline-offset-4 hover:underline"
          >
            Get in touch
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
      <div className="hidden lg:block border-t border-border/60 bg-background">
        <div className="container flex h-11 items-center gap-5 overflow-x-auto no-scrollbar text-sm">
          <span className="text-muted-foreground font-medium">Browse:</span>
          {CATEGORY_ORDER.map((slug) => (
            <Link
              key={slug}
              href={`/shop/${slug}`}
              className="text-foreground/70 hover:text-primary transition-colors font-medium whitespace-nowrap"
            >
              {CATEGORY_META[slug].name}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[86%] max-w-sm bg-background shadow-2xl p-5 flex flex-col gap-5 animate-fade-up">
            <div className="flex items-center justify-between">
              <Logo />
              <button
                aria-label="Close menu"
                className="inline-flex size-10 items-center justify-center rounded-full hover:bg-accent"
                onClick={() => setOpen(false)}
              >
                <X className="size-5" />
              </button>
            </div>
            <form action="/shop" method="get" className="flex gap-2">
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
                  className="px-3 py-3 text-base font-medium rounded-lg hover:bg-accent"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="text-xs uppercase tracking-wide text-muted-foreground px-3 pt-1">
              Categories
            </div>
            <nav className="flex flex-col gap-1">
              {CATEGORY_ORDER.map((slug) => (
                <Link
                  key={slug}
                  href={`/shop/${slug}`}
                  className="px-3 py-2.5 text-sm rounded-lg hover:bg-accent text-foreground/80"
                >
                  {CATEGORY_META[slug].name}
                </Link>
              ))}
            </nav>
            <div className="mt-auto grid gap-2">
              {user ? (
                <>
                  <Button asChild variant="gradient">
                    <Link href="/account">
                      <User className="size-4" />
                      My Account
                    </Link>
                  </Button>
                  <form action="/api/auth/signout" method="post">
                    <Button type="submit" variant="outline" className="w-full">
                      Sign out
                    </Button>
                  </form>
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
      )}
    </header>
  );
}
