-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('order', 'low_stock', 'customer', 'review', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Create function to auto-generate notifications for new orders
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (type, title, message, link)
  VALUES (
    'order',
    'New order received',
    'Order #' || NEW.order_number || ' - KES ' || NEW.total_amount,
    '/admin/orders'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new orders
DROP TRIGGER IF EXISTS trigger_notify_new_order ON orders;
CREATE TRIGGER trigger_notify_new_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_order();

-- Create function to check low stock and create notifications
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS void AS $$
DECLARE
  product_record RECORD;
BEGIN
  FOR product_record IN 
    SELECT id, name, stock_quantity, low_stock_threshold
    FROM products
    WHERE stock_quantity <= low_stock_threshold
      AND is_active = TRUE
      AND NOT EXISTS (
        SELECT 1 FROM notifications
        WHERE type = 'low_stock'
          AND message LIKE '%' || product_record.name || '%'
          AND created_at > NOW() - INTERVAL '24 hours'
      )
  LOOP
    INSERT INTO notifications (type, title, message, link)
    VALUES (
      'low_stock',
      'Low stock alert',
      product_record.name || ' - ' || product_record.stock_quantity || ' units left',
      '/admin/products'
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view notifications
CREATE POLICY "Admins can view notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Policy: Only admins can update notifications (mark as read)
CREATE POLICY "Admins can update notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Insert some initial system notifications
INSERT INTO notifications (type, title, message, link, is_read) VALUES
  ('system', 'Welcome to Safian Healthcare Admin', 'Your admin dashboard is ready. Start by adding products and managing categories.', '/admin', false),
  ('system', 'Database setup complete', 'All tables and migrations have been successfully applied.', '/admin/settings', true);
