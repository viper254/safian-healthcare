-- =============================================================================
-- Fix stock management - reduce on confirm/processing/dispatched/delivered, restore on cancel
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
