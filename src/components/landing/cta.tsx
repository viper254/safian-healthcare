import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COMPANY_CONTACT } from "@/lib/constants";

export function CallToAction() {
  return (
    <section className="container py-20">
      <div className="relative overflow-hidden rounded-3xl bg-brand-gradient p-10 sm:p-14 text-white shadow-xl">
        <div className="absolute -right-20 -top-20 size-80 rounded-full bg-white/10 blur-3xl" aria-hidden />
        <div className="absolute -left-20 -bottom-20 size-80 rounded-full bg-black/10 blur-3xl" aria-hidden />
        <div className="relative max-w-2xl">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-balance">
            Equipping a facility? Talk to our team.
          </h2>
          <p className="mt-3 text-white/90">
            We provide bulk quotations, LPO-friendly invoicing, facility fit-outs
            and on-site training for new equipment. Get a tailored proposal within
            24-48 hours.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="bg-white text-brand-orange-700 hover:bg-white/90"
            >
              <Link href="/contact">
                Request a quote
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/70 text-white hover:bg-white/10"
            >
              <Link href={`tel:${COMPANY_CONTACT.phone.replace(/\s/g, "")}`}>
                <Phone className="size-4" />
                {COMPANY_CONTACT.phone}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
