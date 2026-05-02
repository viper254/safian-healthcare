-- =============================================================================
-- Enable multiple categories per product (many-to-many relationship)
-- =============================================================================

-- Create junction table for product-category relationships
CREATE TABLE IF NOT EXISTS public.product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_id, category_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_product_categories_product ON public.product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category ON public.product_categories(category_id);

-- Enable RLS
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies: public read, admin write
DROP POLICY IF EXISTS "product_categories_public_read" ON public.product_categories;
CREATE POLICY "product_categories_public_read" ON public.product_categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "product_categories_admin_write" ON public.product_categories;
CREATE POLICY "product_categories_admin_write" ON public.product_categories
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Migrate existing product category relationships to the new junction table
INSERT INTO public.product_categories (product_id, category_id)
SELECT id, category_id 
FROM public.products 
WHERE category_id IS NOT NULL
ON CONFLICT (product_id, category_id) DO NOTHING;

-- Note: We keep the category_id column in products table for backward compatibility
-- and as a "primary category" reference, but the junction table is the source of truth
-- for all category relationships

-- Add a comment to document the change
COMMENT ON TABLE public.product_categories IS 'Junction table for many-to-many relationship between products and categories. A product can belong to multiple categories.';
COMMENT ON COLUMN public.products.category_id IS 'Legacy primary category reference. Use product_categories table for full category relationships.';
