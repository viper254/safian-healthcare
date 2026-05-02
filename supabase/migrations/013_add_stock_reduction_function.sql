-- =============================================================================
-- Add function to reduce product stock when orders are placed
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
