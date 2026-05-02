-- =============================================================================
-- Add DELETE policy for orders (admin only)
-- =============================================================================
-- This allows admins to delete orders (e.g., for resetting test data)

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

-- Add comment
COMMENT ON POLICY "orders_delete_admin" ON public.orders IS 'Allow admins to delete orders (e.g., for resetting test data)';
COMMENT ON POLICY "order_items_delete_admin" ON public.order_items IS 'Allow admins to delete order items (e.g., for resetting test data)';
