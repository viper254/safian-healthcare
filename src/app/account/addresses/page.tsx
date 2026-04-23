import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/account/addresses");
  }

  return (
    <div className="container py-10 max-w-4xl">
      <Link
        href="/account"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="size-4" />
        Back to account
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl">Delivery Addresses</h1>
          <p className="text-muted-foreground mt-2">
            Manage your saved delivery addresses
          </p>
        </div>
        <Button>Add Address</Button>
      </div>

      <div className="mt-8">
        {/* Placeholder - addresses feature coming soon */}
        <div className="rounded-2xl border bg-card p-12 text-center">
          <div className="inline-flex size-16 items-center justify-center rounded-full bg-muted">
            <MapPin className="size-8 text-muted-foreground" />
          </div>
          <h2 className="mt-4 font-semibold text-lg">No addresses saved yet</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Save your delivery addresses for faster checkout. You can add multiple addresses and set a default one.
          </p>
          <Button className="mt-6">Add Your First Address</Button>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          <strong className="font-semibold text-blue-950">Note:</strong> Currently, all orders are processed via WhatsApp. 
          Delivery addresses will be collected during the order confirmation process.
        </p>
      </div>
    </div>
  );
}
