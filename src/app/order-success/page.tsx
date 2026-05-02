import Link from "next/link";
import { CheckCircle2, MessageCircle, Package, Smartphone, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COMPANY_CONTACT } from "@/lib/constants";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const params = await searchParams;
  const reference = params.ref || "N/A";

  return (
    <div className="container py-12 max-w-3xl">
      <div className="rounded-3xl border bg-card p-8 md:p-10 shadow-lg">
        <div className="mx-auto size-16 rounded-full bg-brand-green-500/15 grid place-items-center text-brand-green-600">
          <CheckCircle2 className="size-10" />
        </div>
        
        <h1 className="mt-6 font-display font-bold text-3xl text-center">Order Created!</h1>
        
        <p className="mt-2 text-muted-foreground text-center">
          Your order has been saved. Please complete payment via M-PESA to confirm your order.
        </p>
        
        <div className="mt-6 rounded-xl bg-muted p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Your Order Reference:</p>
          <p className="font-bold text-xl">{reference}</p>
        </div>

        {/* Till Number Display */}
        <div className="mt-6 p-6 rounded-xl bg-brand-green-50 dark:bg-brand-green-950/20 border-2 border-brand-green-500">
          <h2 className="font-bold text-xl mb-4 text-brand-green-700 dark:text-brand-green-300 text-center">
            Pay to M-PESA Till Number
          </h2>
          
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border-2 border-brand-green-500 mb-6">
            <p className="text-xs text-muted-foreground mb-2 text-center">Buy Goods Till Number</p>
            <p className="text-4xl font-bold text-brand-green-600 dark:text-brand-green-400 tracking-wider text-center">
              {COMPANY_CONTACT.tillNumber}
            </p>
            <p className="text-sm text-muted-foreground mt-2 text-center font-medium">
              SAFIAN SUPPLIES
            </p>
          </div>

          {/* Payment Instructions */}
          <div className="space-y-6">
            {/* Safaricom M-PESA */}
            <div className="bg-white dark:bg-background rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-3">
                <Smartphone className="size-5 text-brand-green-600" />
                <h3 className="font-bold text-base">Using Safaricom M-PESA</h3>
              </div>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground shrink-0">1.</span>
                  <span>Go to the M-PESA Menu on your phone (SIM Toolkit or M-PESA App)</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground shrink-0">2.</span>
                  <span>Select <strong className="text-foreground">Lipa Na M-PESA</strong></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground shrink-0">3.</span>
                  <span>Select <strong className="text-foreground">Buy Goods and Services</strong></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground shrink-0">4.</span>
                  <span>Enter Till Number: <strong className="text-brand-green-600">{COMPANY_CONTACT.tillNumber}</strong></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground shrink-0">5.</span>
                  <span>Enter the Amount</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground shrink-0">6.</span>
                  <span>Enter your M-PESA PIN</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground shrink-0">7.</span>
                  <span>Confirm all details (ensure merchant name is <strong className="text-foreground">SAFIAN SUPPLIES</strong>) and press OK</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground shrink-0">8.</span>
                  <span>You will receive a confirmation message</span>
                </li>
              </ol>
            </div>

            {/* Airtel Money */}
            <div className="bg-white dark:bg-background rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="size-5 text-red-600" />
                <h3 className="font-bold text-base">Using Airtel Money</h3>
              </div>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground shrink-0">1.</span>
                  <span>Dial <strong className="text-foreground">*334#</strong></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground shrink-0">2.</span>
                  <span>Select <strong className="text-foreground">Buy Goods & Services</strong></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground shrink-0">3.</span>
                  <span>Select <strong className="text-foreground">Use M-PESA Till Number</strong> (Airtel supports payments to M-PESA tills)</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground shrink-0">4.</span>
                  <span>Enter Till Number: <strong className="text-brand-green-600">{COMPANY_CONTACT.tillNumber}</strong></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground shrink-0">5.</span>
                  <span>Enter the Amount</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground shrink-0">6.</span>
                  <span>Enter your Airtel Money PIN to confirm</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground shrink-0">7.</span>
                  <span>You will receive a confirmation message</span>
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* WhatsApp Confirmation */}
        <div className="mt-6 p-4 rounded-lg bg-[#25D366]/10 border-2 border-[#25D366]">
          <div className="flex items-start gap-3">
            <MessageCircle className="size-6 text-[#25D366] shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-sm mb-1">Send Payment Confirmation</p>
              <p className="text-sm text-muted-foreground mb-2">
                After payment, send your M-PESA confirmation message to:
              </p>
              <p className="font-bold text-lg">{COMPANY_CONTACT.phoneFormatted}</p>
              <p className="text-xs text-muted-foreground mt-1">via WhatsApp or SMS</p>
            </div>
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

        <p className="mt-6 text-xs text-muted-foreground text-center">
          Keep your order reference <strong>{reference}</strong> for tracking
        </p>
      </div>
    </div>
  );
}
