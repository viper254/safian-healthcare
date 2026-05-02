"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";

export function ResetOrdersSection() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleReset() {
    if (confirmation !== "DELETE ALL ORDERS") {
      setError("Please type the confirmation text exactly as shown");
      return;
    }

    if (!resetPassword.trim()) {
      setError("Please enter the reset password");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/reset-orders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          confirmation,
          resetPassword: resetPassword.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset orders");
      }

      setSuccess(`Successfully deleted all orders and related analytics`);
      setShowConfirm(false);
      setConfirmation("");
      setResetPassword("");
      
      // Force hard refresh to clear all caches
      setTimeout(() => {
        window.location.href = "/admin/orders";
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to reset orders");
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setShowConfirm(false);
    setConfirmation("");
    setResetPassword("");
    setError("");
  }

  return (
    <div className="rounded-2xl border-2 border-destructive/20 bg-destructive/5 shadow-sm p-6 space-y-4">
      <header className="flex items-start gap-3">
        <div className="size-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
          <AlertTriangle className="size-5 text-destructive" />
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-destructive">Danger Zone</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Irreversible actions that permanently delete data
          </p>
        </div>
      </header>

      {success && (
        <div className="rounded-lg bg-brand-green-50 dark:bg-brand-green-950/20 border border-brand-green-500/30 px-4 py-3 text-sm text-brand-green-700 dark:text-brand-green-400">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            {success}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}

      {!showConfirm ? (
        <div className="space-y-3">
          <div className="rounded-lg border border-destructive/20 bg-background p-4">
            <h3 className="font-semibold text-sm mb-2">Reset All Orders</h3>
            <p className="text-xs text-muted-foreground mb-3">
              This will permanently delete:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 mb-3 ml-4">
              <li>• All orders and order items</li>
              <li>• Order-related analytics events</li>
              <li>• Order history for all customers</li>
            </ul>
            <p className="text-xs font-semibold text-destructive">
              ⚠️ This action cannot be undone!
            </p>
          </div>

          <Button
            type="button"
            variant="destructive"
            onClick={() => setShowConfirm(true)}
            className="w-full"
          >
            <Trash2 className="size-4" />
            Reset All Orders
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border-2 border-destructive bg-destructive/5 p-4">
            <p className="text-sm font-semibold text-destructive mb-3">
              ⚠️ Are you absolutely sure?
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              This will permanently delete all orders, order items, and order-related analytics. 
              This action is irreversible and cannot be undone.
            </p>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="resetPassword" className="text-xs font-semibold">
                  Reset Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="resetPassword"
                  type="password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  placeholder="Enter admin reset password"
                  disabled={loading}
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  Only authorized admins have this password
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmation" className="text-xs">
                  Type <code className="bg-muted px-1 py-0.5 rounded font-mono text-destructive">DELETE ALL ORDERS</code> to confirm:
                </Label>
                <Input
                  id="confirmation"
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  placeholder="DELETE ALL ORDERS"
                  className="font-mono"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleReset}
              disabled={loading || confirmation !== "DELETE ALL ORDERS" || !resetPassword.trim()}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="size-4" />
                  Confirm Delete
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
