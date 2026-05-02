-- =============================================================================
-- Add 4 new primary categories and reorder existing ones
-- =============================================================================

-- First, update sort order of existing categories to make room
UPDATE public.categories SET sort_order = 5 WHERE slug = 'diagnostic-essentials';
UPDATE public.categories SET sort_order = 6 WHERE slug = 'procedure-practical-kits';
UPDATE public.categories SET sort_order = 7 WHERE slug = 'medical-wear-protective-gear';
UPDATE public.categories SET sort_order = 8 WHERE slug = 'clinical-academic-support-tools';
UPDATE public.categories SET sort_order = 9 WHERE slug = 'home-care-patient-support-devices';

-- Insert new categories at the top
INSERT INTO public.categories (slug, name, description, icon, image_url, sort_order) VALUES
  (
    'medical-students',
    'Medical Students',
    'Essential tools and supplies for medical students including diagnostic equipment, study materials, and practical kits.',
    'GraduationCap',
    '',
    1
  ),
  (
    'doctors-and-professionals',
    'Doctors and Professionals',
    'Professional-grade medical equipment and supplies for practicing doctors and healthcare professionals.',
    'Stethoscope',
    '',
    2
  ),
  (
    'facilities-hospitals-clinics',
    'Facilities, Hospitals and Clinics',
    'Bulk medical supplies, equipment, and facility management solutions for hospitals, clinics, and healthcare facilities.',
    'Building2',
    '',
    3
  ),
  (
    'general-public-patients-hbc',
    'General Public and Patients [HBC]',
    'Home-based care supplies, patient support devices, and medical products for general public use.',
    'Users',
    '',
    4
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order;
