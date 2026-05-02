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
-- SUCCESS!
-- =============================================================================
