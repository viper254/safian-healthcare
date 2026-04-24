-- Performance optimization indexes for faster queries on 3G

-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_active_featured 
  ON products(is_active, is_featured) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_products_category_active 
  ON products(category_id, is_active) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_products_slug_active 
  ON products(slug, is_active) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_products_created 
  ON products(created_at DESC) 
  WHERE is_active = true;

-- Product images index for faster loading
CREATE INDEX IF NOT EXISTS idx_product_images_product_sort 
  ON product_images(product_id, sort_order);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_created 
  ON orders(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_status 
  ON orders(status, created_at DESC);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_approved_featured 
  ON reviews(is_approved, is_featured, created_at DESC) 
  WHERE is_approved = true;

-- Categories index
CREATE INDEX IF NOT EXISTS idx_categories_sort 
  ON categories(sort_order);

-- Analyze tables for query optimization
ANALYZE products;
ANALYZE product_images;
ANALYZE categories;
ANALYZE orders;
ANALYZE reviews;
