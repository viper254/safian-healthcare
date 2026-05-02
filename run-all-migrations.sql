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
BEGIN
  -- When order status changes from pending to confirmed, reduce stock
  IF OLD.status = 'pending' AND NEW.status = 'confirmed' THEN
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

  -- When order status changes to cancelled, restore stock
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
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
COMMENT ON FUNCTION public.adjust_product_stock_on_order_status IS 'Adjusts product stock when order status changes: reduces on confirm, restores on cancel';
