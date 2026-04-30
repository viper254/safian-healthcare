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
  validateStock: (productId: string, availableStock: number) => boolean;
  updateLineStock: (productId: string, newStock: number) => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (line) =>
        set((state) => {
          const existing = state.lines.find((l) => l.product_id === line.product_id);
          if (existing) {
            // Don't exceed available stock
            const newQty = Math.min(existing.quantity + line.quantity, line.stock || 99);
            return {
              lines: state.lines.map((l) =>
                l.product_id === line.product_id
                  ? { ...l, quantity: newQty }
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
      validateStock: (productId, availableStock) => {
        const line = get().lines.find((l) => l.product_id === productId);
        if (!line) return true;
        return line.quantity <= availableStock;
      },
      updateLineStock: (productId, newStock) =>
        set((state) => ({
          lines: state.lines.map((l) =>
            l.product_id === productId
              ? { 
                  ...l, 
                  stock: newStock,
                  // Adjust quantity if it exceeds new stock
                  quantity: Math.min(l.quantity, newStock)
                }
              : l,
          ).filter(l => l.stock > 0), // Remove items that are now out of stock
        })),
    }),
    {
      name: "safian-cart",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // If no version or old version, return fresh state
        if (version === 0 || !persistedState) {
          return {
            lines: [],
          };
        }
        // Return persisted state as-is for current version
        return persistedState as CartState;
      },
    },
  ),
);
