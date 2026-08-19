-- =============================================================================
-- SAFIAN HEALTHCARE - Run All Pending Migrations
-- Run this in Supabase Dashboard → SQL Editor
-- =============================================================================

-- =============================================================================
-- MIGRATION 011: Rename 'whatsapp' payment method to 'till'
-- =============================================================================

-- Step 1: Drop the old constraint first
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;

-- Step 2: Add new constraint that includes BOTH 'whatsapp' and 'till' temporarily
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_method_check 
  CHECK (payment_method IN ('mpesa', 'card', 'cash_on_delivery', 'bank_transfer', 'whatsapp', 'till'));

-- Step 3: Update existing orders with 'whatsapp' payment method to 'till'
UPDATE public.orders 
SET payment_method = 'till' 
WHERE payment_method = 'whatsapp';

-- Step 4: Drop the temporary constraint
ALTER TABLE public.orders DROP CONSTRAINT orders_payment_method_check;

-- Step 5: Add final constraint with only 'till' (no 'whatsapp')
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_method_check 
  CHECK (payment_method IN ('mpesa', 'card', 'cash_on_delivery', 'bank_transfer', 'till'));

-- Step 6: Add comment
COMMENT ON COLUMN public.orders.payment_method IS 'Payment method: mpesa (automated), card, cash_on_delivery, bank_transfer, till (M-Pesa Till Number 5517358 - SAFIAN SUPPLIES)';

-- =============================================================================
-- MIGRATION 012: Add DELETE policies for orders (admin only)
-- =============================================================================

-- Add delete policy for orders (admin only)
DROP POLICY IF EXISTS "orders_delete_admin" ON public.orders;
CREATE POLICY "orders_delete_admin" ON public.orders
  AS PERMISSIVE
  FOR DELETE 
  USING (public.is_admin());

-- Add delete policy for order_items (admin only)
DROP POLICY IF EXISTS "order_items_delete_admin" ON public.order_items;
CREATE POLICY "order_items_delete_admin" ON public.order_items
  AS PERMISSIVE
  FOR DELETE 
  USING (public.is_admin());

-- Add comments
COMMENT ON POLICY "orders_delete_admin" ON public.orders IS 'Allow admins to delete orders (e.g., for resetting test data)';
COMMENT ON POLICY "order_items_delete_admin" ON public.order_items IS 'Allow admins to delete order items (e.g., for resetting test data)';

-- =============================================================================
-- MIGRATION 013: Add stock reduction function
-- =============================================================================

-- Create function to safely reduce product stock
CREATE OR REPLACE FUNCTION public.reduce_product_stock(
  product_id_param UUID,
  quantity_param INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Reduce stock quantity
  UPDATE public.products
  SET stock_quantity = GREATEST(stock_quantity - quantity_param, 0)
  WHERE id = product_id_param;
END;
$$;

-- Add comment
COMMENT ON FUNCTION public.reduce_product_stock IS 'Reduces product stock quantity when an order is placed. Stock cannot go below 0.';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.reduce_product_stock TO authenticated, anon;

-- =============================================================================
-- SUCCESS!
-- =============================================================================


-- =============================================================================
-- MIGRATION 014: Fix stock management - reduce on confirm, restore on cancel
-- =============================================================================

-- Drop the old function that reduces stock immediately
DROP FUNCTION IF EXISTS public.reduce_product_stock(UUID, INTEGER);

-- Create function to adjust stock based on order status changes
CREATE OR REPLACE FUNCTION public.adjust_product_stock_on_order_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item RECORD;
  old_status_reduces_stock BOOLEAN;
  new_status_reduces_stock BOOLEAN;
BEGIN
  -- Determine if old status reduces stock
  old_status_reduces_stock := OLD.status IN ('confirmed', 'processing', 'dispatched', 'delivered');
  
  -- Determine if new status reduces stock
  new_status_reduces_stock := NEW.status IN ('confirmed', 'processing', 'dispatched', 'delivered');

  -- If transitioning from non-reducing to reducing status, reduce stock
  IF NOT old_status_reduces_stock AND new_status_reduces_stock THEN
    FOR item IN 
      SELECT product_id, quantity 
      FROM public.order_items 
      WHERE order_id = NEW.id
    LOOP
      UPDATE public.products
      SET stock_quantity = GREATEST(stock_quantity - item.quantity, 0)
      WHERE id = item.product_id;
    END LOOP;
  END IF;

  -- If transitioning from reducing to non-reducing status (cancelled), restore stock
  IF old_status_reduces_stock AND NOT new_status_reduces_stock THEN
    FOR item IN 
      SELECT product_id, quantity 
      FROM public.order_items 
      WHERE order_id = NEW.id
    LOOP
      UPDATE public.products
      SET stock_quantity = stock_quantity + item.quantity
      WHERE id = item.product_id;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on orders table
DROP TRIGGER IF EXISTS trigger_adjust_stock_on_order_status ON public.orders;
CREATE TRIGGER trigger_adjust_stock_on_order_status
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.adjust_product_stock_on_order_status();

-- Add comment
COMMENT ON FUNCTION public.adjust_product_stock_on_order_status IS 'Adjusts product stock when order status changes: reduces on confirmed/processing/dispatched/delivered, restores on cancelled/pending';


-- =============================================================================
-- MIGRATION 015: M-Pesa STK Push transaction tracking
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.mpesa_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  merchant_request_id TEXT,
  checkout_request_id TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'initiated'
    CHECK (status IN ('initiated', 'paid', 'failed', 'mismatch')),
  result_code INTEGER,
  result_description TEXT,
  mpesa_receipt_number TEXT UNIQUE,
  transaction_date TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_order
  ON public.mpesa_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_status
  ON public.mpesa_transactions(status);
CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_created
  ON public.mpesa_transactions(created_at DESC);

ALTER TABLE public.mpesa_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mpesa_transactions_select_own" ON public.mpesa_transactions;
CREATE POLICY "mpesa_transactions_select_own"
  ON public.mpesa_transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.orders o
      WHERE o.id = mpesa_transactions.order_id
        AND (o.user_id = auth.uid() OR public.is_admin())
    )
  );

DROP TRIGGER IF EXISTS trg_mpesa_transactions_updated ON public.mpesa_transactions;
CREATE TRIGGER trg_mpesa_transactions_updated
  BEFORE UPDATE ON public.mpesa_transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.mpesa_transactions IS
  'Server-managed Safaricom Daraja STK Push records. Writes are performed only by the server callback/initiation routes.';
