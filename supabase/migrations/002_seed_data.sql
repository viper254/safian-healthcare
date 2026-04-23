-- =============================================================================
-- Safian Healthcare & Supplies — Seed Data
-- Insert the 5 main product categories
-- =============================================================================

-- Seed categories
insert into public.categories (slug, name, description, icon, image_url, sort_order) values
  (
    'diagnostic-essentials',
    'Diagnostic Essentials',
    'Stethoscopes, blood pressure machines, thermometers, pulse oximeters, glucometers and essential diagnostic tools.',
    'Stethoscope',
    'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=1600&q=80',
    1
  ),
  (
    'procedure-practical-kits',
    'Procedure & Practical Kits',
    'IV cannulation kits, suturing kits, catheterization kits, dressing packs, minor surgical kits and emergency procedure kits.',
    'Syringe',
    'https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1600&q=80',
    2
  ),
  (
    'medical-wear-protective-gear',
    'Medical Wear & Protective Gear',
    'Lab coats, scrubs, theatre caps, disposable gloves, face masks, aprons and protective gowns for medical professionals.',
    'Shield',
    'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=1600&q=80',
    3
  ),
  (
    'clinical-academic-support-tools',
    'Clinical & Academic Support Tools',
    'Clinical pocket guides, OSCE preparation guides, drug reference booklets, logbooks, case presentation templates and revision notes.',
    'BookOpen',
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1600&q=80',
    4
  ),
  (
    'home-care-patient-support-devices',
    'Home Care & Patient Support Devices',
    'Home BP machines, glucometers, wheelchairs, oxygen saturation monitors, home care kits and elderly care support packs.',
    'HeartPulse',
    'https://images.unsplash.com/photo-1583912267550-d44c9c5f6c07?auto=format&fit=crop&w=1600&q=80',
    5
  )
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  image_url = excluded.image_url,
  sort_order = excluded.sort_order;
