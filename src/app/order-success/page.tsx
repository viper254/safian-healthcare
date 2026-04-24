import Link from "next/link";
import { CheckCircle2, MessageCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderSuccessPage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
  const reference = searchParams.ref || "N/A";

  return (
    <div className="container py-20 max-w-2xl">
      <div className="rounded-3xl border bg-card p-10 text-center shadow-lg">
        <div className="mx-auto size-16 rounded-full bg-brand-green-500/15 grid place-items-center text-brand-green-600">
          <CheckCircle2 className="size-10" />
        </div>
        
        <h1 className="mt-6 font-display font-bold text-3xl">Order Created!</h1>
        
        <p className="mt-2 text-muted-foreground">
          Your order has been saved and sent to our WhatsApp. We'll confirm availability 
          and delivery details shortly. Deliveries processed within 24 hours to 4 working days.
        </p>
        
        <div className="mt-6 rounded-xl bg-muted p-4">
          <p className="text-sm text-muted-foreground mb-1">Your reference:</p>
          <p className="font-bold text-lg">{reference}</p>
        </div>

        <div className="mt-6 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
          <div className="flex items-center gap-3 justify-center text-green-700 dark:text-green-400">
            <MessageCircle className="size-5" />
            <p className="text-sm font-medium">
              Check WhatsApp to complete your order
            </p>
          </div>
        </div>

        <div className="mt-8 flex gap-3 justify-center flex-wrap">
          <Button asChild variant="gradient">
            <Link href="/account/orders">
              <Package className="size-4" />
              Track Order
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          You can track your order status in your account dashboard
        </p>
      </div>
    </div>
  );
}
