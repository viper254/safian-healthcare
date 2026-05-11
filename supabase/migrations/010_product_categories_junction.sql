-- =============================================================================
-- Add support for products to have multiple categories
-- Create a junction table for many-to-many relationship
-- =============================================================================

-- Create junction table for product-category relationships
CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, category_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_product_categories_product ON public.product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category ON public.product_categories(category_id);

-- Enable RLS
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- Policy: public read
DROP POLICY IF EXISTS "product_categories_public_read" ON public.product_categories;
CREATE POLICY "product_categories_public_read" ON public.product_categories
  FOR SELECT USING (true);

-- Policy: admin write
DROP POLICY IF EXISTS "product_categories_admin_write" ON public.product_categories;
CREATE POLICY "product_categories_admin_write" ON public.product_categories
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Migrate existing category_id data to junction table
INSERT INTO public.product_categories (product_id, category_id)
SELECT id, category_id 
FROM public.products 
WHERE category_id IS NOT NULL
ON CONFLICT (product_id, category_id) DO NOTHING;

-- Note: We keep the category_id column in products table for backward compatibility
-- and as the "primary" category, but products can now belong to multiple categories
-- via the product_categories junction table
