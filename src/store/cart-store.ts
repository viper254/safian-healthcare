"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartLine } from "@/types";

type CartState = {
  lines: CartLine[];
  add: (line: CartLine) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  totalQty: () => number;
  subtotal: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (line) =>
        set((state) => {
          const existing = state.lines.find((l) => l.product_id === line.product_id);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.product_id === line.product_id
                  ? {
                      ...l,
                      quantity: Math.min(l.quantity + line.quantity, line.stock || 99),
                    }
                  : l,
              ),
            };
          }
          return { lines: [...state.lines, line] };
        }),
      remove: (productId) =>
        set((state) => ({
          lines: state.lines.filter((l) => l.product_id !== productId),
        })),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          lines: state.lines.map((l) =>
            l.product_id === productId
              ? { ...l, quantity: Math.max(1, Math.min(quantity, l.stock || 99)) }
              : l,
          ),
        })),
      clear: () => set({ lines: [] }),
      totalQty: () => get().lines.reduce((s, l) => s + l.quantity, 0),
      subtotal: () =>
        get().lines.reduce((s, l) => s + l.unit_price * l.quantity, 0),
    }),
    {
      name: "safian-cart",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
