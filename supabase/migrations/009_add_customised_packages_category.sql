-- =============================================================================
-- Add "Customised Offer Packages" category
-- =============================================================================

INSERT INTO public.categories (slug, name, description, icon, image_url, sort_order) 
VALUES (
  'customised-offer-packages',
  'Customised Offer Packages',
  'Special bundled packages and customised medical supply kits tailored to your specific needs. Perfect for medical students, clinics, and healthcare facilities.',
  'Package',
  'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=1600&q=80',
  6
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  image_url = EXCLUDED.image_url,
  sort_order = EXCLUDED.sort_order;
