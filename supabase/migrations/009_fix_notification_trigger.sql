-- Fix notification trigger to use correct column names
-- The orders table uses 'reference' and 'total', not 'order_number' and 'total_amount'

DROP TRIGGER IF EXISTS trigger_notify_new_order ON orders;
DROP FUNCTION IF EXISTS notify_new_order();

-- Recreate function with correct column names and SECURITY DEFINER
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (type, title, message, link)
  VALUES (
    'order',
    'New order received',
    'Order #' || NEW.reference || ' - KES ' || NEW.total,
    '/admin/orders'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER trigger_notify_new_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_order();


-- Add policy to allow trigger to insert notifications
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications"
  ON notifications
  FOR INSERT
  WITH CHECK (true);
