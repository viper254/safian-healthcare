"use client";

import { useState } from "react";
import type { OrderStatus, PaymentStatus } from "@/types";

type Props = {
  orderId: string;
  currentStatus: OrderStatus;
  currentPaymentStatus: PaymentStatus;
};

const orderStatuses: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "dispatched",
  "delivered",
  "cancelled",
];

const paymentStatuses: PaymentStatus[] = ["unpaid", "paid", "refunded", "failed"];

export function OrderStatusUpdater({
  orderId,
  currentStatus,
  currentPaymentStatus,
}: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus);
  const [updating, setUpdating] = useState(false);

  const updateOrderStatus = async (newStatus: OrderStatus) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setStatus(newStatus);
      }
    } catch (err) {
      console.error("Failed to update order status:", err);
    } finally {
      setUpdating(false);
    }
  };

  const updatePaymentStatus = async (newPaymentStatus: PaymentStatus) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_status: newPaymentStatus }),
      });
      if (res.ok) {
        setPaymentStatus(newPaymentStatus);
      }
    } catch (err) {
      console.error("Failed to update payment status:", err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex gap-2">
      <select
        value={status}
        onChange={(e) => updateOrderStatus(e.target.value as OrderStatus)}
        disabled={updating}
        className="px-2 py-1 text-sm border rounded capitalize disabled:opacity-50"
      >
        {orderStatuses.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        value={paymentStatus}
        onChange={(e) => updatePaymentStatus(e.target.value as PaymentStatus)}
        disabled={updating}
        className="px-2 py-1 text-sm border rounded capitalize disabled:opacity-50"
      >
        {paymentStatuses.map((ps) => (
          <option key={ps} value={ps}>
            {ps}
          </option>
        ))}
      </select>
    </div>
  );
}
