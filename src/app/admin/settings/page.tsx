"use client";

import { useState } from "react";
import { AdminTopbar } from "@/components/admin/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SITE_NAME, COMPANY_CONTACT } from "@/lib/constants";
import { ResetOrdersSection } from "@/components/admin/reset-orders-section";
import { ClearCacheButton } from "@/components/pwa/clear-cache-button";

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSaveStore(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    // Simulate save (in production, this would update database/env vars)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  async function handleSaveDelivery(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    // Simulate save (in production, this would update database/env vars)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  return (
    <>
      <AdminTopbar title="Settings" subtitle="Store and brand preferences" />
      
      {success && (
        <div className="mx-4 sm:mx-6 mb-4 rounded-lg bg-brand-green-50 dark:bg-brand-green-950/20 border border-brand-green-500/30 px-4 py-3 text-sm text-brand-green-700 dark:text-brand-green-400">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            Settings saved successfully!
          </div>
        </div>
      )}

      <div className="p-4 sm:p-6 grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleSaveStore} className="rounded-2xl border bg-card shadow-sm p-6 space-y-4">
          <header>
            <h2 className="font-semibold">Store Information</h2>
            <p className="text-xs text-muted-foreground">Displayed across the site and invoices.</p>
          </header>
          <div className="space-y-2">
            <Label htmlFor="store_name">Store name</Label>
            <Input 
              id="store_name" 
              name="store_name"
              defaultValue={SITE_NAME}
              autoComplete="organization"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="store_address">Address</Label>
            <Input 
              id="store_address" 
              name="store_address"
              defaultValue={COMPANY_CONTACT.address}
              autoComplete="street-address"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="store_email">Email</Label>
              <Input 
                id="store_email" 
                name="store_email"
                defaultValue={COMPANY_CONTACT.email} 
                type="email"
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store_phone">Phone</Label>
              <Input 
                id="store_phone" 
                name="store_phone"
                defaultValue={COMPANY_CONTACT.phoneFormatted} 
                type="tel"
                autoComplete="tel"
              />
            </div>
          </div>
          <Button type="submit" variant="gradient" disabled={saving}>
            {saving ? "Saving..." : "Save Store Settings"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Note: These settings are currently read-only. To update, modify the values in <code className="bg-muted px-1 py-0.5 rounded">src/lib/constants.ts</code>
          </p>
        </form>

        <form onSubmit={handleSaveDelivery} className="rounded-2xl border bg-card shadow-sm p-6 space-y-4">
          <header>
            <h2 className="font-semibold">Delivery & Pricing</h2>
            <p className="text-xs text-muted-foreground">Shown at cart & checkout.</p>
          </header>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="delivery_fee">Default delivery fee (KES)</Label>
              <Input 
                id="delivery_fee" 
                name="delivery_fee"
                defaultValue="350" 
                type="number"
                min="0"
                step="50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="free_threshold">Free delivery over (KES)</Label>
              <Input 
                id="free_threshold" 
                name="free_threshold"
                defaultValue="25000" 
                type="number"
                min="0"
                step="1000"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="about">Store short description</Label>
            <Textarea
              id="about"
              name="about"
              rows={4}
              defaultValue="Trusted medical tools, kits & facility supplies across Kenya."
            />
          </div>
          <Button type="submit" variant="gradient" disabled={saving}>
            {saving ? "Saving..." : "Save Delivery Settings"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Note: These settings are currently read-only. To update, modify the values in <code className="bg-muted px-1 py-0.5 rounded">src/lib/constants.ts</code>
          </p>
        </form>
      </div>

      {/* Danger Zone - Full Width */}
      <div className="px-4 sm:px-6 pb-6 space-y-6">
        {/* Cache Management */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 p-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                Cache Management
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                If the site becomes unresponsive or buttons don't work, clear the cache to force reload fresh content. This will clear all cached pages and service workers.
              </p>
              <ClearCacheButton />
            </div>
          </div>
        </div>

        <ResetOrdersSection />
      </div>
    </>
  );
}
