import Link from "next/link";
import { Package, User, MapPin, ArrowRight } from "lucide-react";
import { createSupabaseServerClient, supabaseIsConfigured } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth/signout-button";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  let email: string | null = null;
  let name: string | null = null;
  let role: string = "customer";

  if (supabaseIsConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        email = data.user.email ?? null;
        name = (data.user.user_metadata?.full_name as string) ?? null;
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", data.user.id)
          .maybeSingle();
        if (profile) {
          role = profile.role ?? "customer";
          name = (profile.full_name as string) ?? name;
        }
      }
    } catch {
      // ignore
    }
  }

  const signedIn = Boolean(email);

  return (
    <div className="container py-10">
      <h1 className="font-display font-bold text-3xl">My account</h1>
      {!signedIn ? (
        <div className="mt-6 rounded-2xl border bg-card p-8 text-center">
          <ShieldAlert className="mx-auto size-10 text-muted-foreground" />
          <h2 className="mt-4 font-semibold text-lg">Please sign in</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in to view orders, save favourites and manage your profile.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Button asChild variant="gradient">
              <Link href="/login?redirect=/account">Sign in</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/register">Create account</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <p className="mt-2 text-muted-foreground">
            Welcome back{name ? `, ${name}` : ""}.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <AccountTile
              href="/account/orders"
              icon={Package}
              title="Orders"
              subtitle="Track and review past orders"
            />
            <AccountTile
              href="/account/profile"
              icon={User}
              title="Profile"
              subtitle="Update personal details"
            />
            <AccountTile
              href="/account/addresses"
              icon={MapPin}
              title="Addresses"
              subtitle="Manage delivery addresses"
            />
          </div>
          {role === "admin" && (
            <div className="mt-8 rounded-2xl border bg-brand-gradient p-6 text-white">
              <h3 className="font-semibold">Admin access detected</h3>
              <p className="text-sm text-white/90">Head to the dashboard to manage the store.</p>
              <Button asChild className="mt-4 bg-white text-brand-orange-700 hover:bg-white/90">
                <Link href="/admin">
                  Open admin dashboard
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          )}
          <SignOutButton variant="outline" />
        </>
      )}
    </div>
  );
}

function AccountTile({
  href,
  icon: Icon,
  title,
  subtitle,
}: {
  href: string;
  icon: typeof Package;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md hover:border-primary/40 transition-all"
    >
      <div className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-sm">
        <Icon className="size-5" />
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </Link>
  );
}
