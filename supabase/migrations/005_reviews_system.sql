-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  admin_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_reviews_approved ON reviews(is_approved);
CREATE INDEX idx_reviews_featured ON reviews(is_featured);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_created ON reviews(created_at DESC);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read approved reviews
CREATE POLICY "Anyone can view approved reviews"
  ON reviews
  FOR SELECT
  USING (is_approved = TRUE);

-- Policy: Authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Admins can do everything
CREATE POLICY "Admins can manage all reviews"
  ON reviews
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_reviews_updated_at();

-- Insert some sample reviews
INSERT INTO reviews (customer_name, rating, review_text, is_approved, is_featured) VALUES
  ('Dr. Sarah Kimani', 5, 'Excellent quality stethoscope! Fast delivery and great customer service.', true, true),
  ('John Mwangi', 5, 'Best medical supplies store in Nairobi. Highly recommend!', true, true),
  ('Mary Wanjiru', 4, 'Good products and reasonable prices. Will order again.', true, true),
  ('David Ochieng', 5, 'Professional service and authentic products. Very satisfied!', true, true),
  ('Grace Akinyi', 5, 'Fast WhatsApp ordering process. Products arrived in perfect condition.', true, true);
