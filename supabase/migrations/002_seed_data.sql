-- Seed categories
insert into public.categories (slug, name, description, icon, image_url, sort_order) values
  ('medical-student-kits', 'Medical Student Kits', 'Essential kits for nursing, clinical and medical students — starter packs that cover the fundamentals.', 'GraduationCap', 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1200&q=80', 1),
  ('professional-tools', 'Professional Tools', 'Stethoscopes, otoscopes, diagnostic kits and surgical instruments for everyday clinical use.', 'Stethoscope', 'https://images.unsplash.com/photo-1583912267550-d44c9e1a4a42?auto=format&fit=crop&w=1200&q=80', 2),
  ('facility-items', 'Facility Items', 'Furniture, lighting, sterilisers and devices that equip the modern clinic or hospital ward.', 'Building2', 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80', 3),
  ('patient-supplies', 'Patient Supplies', 'Consumables, wound care, mobility aids and disposables for ongoing patient management.', 'HeartPulse', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80', 4)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  image_url = excluded.image_url,
  sort_order = excluded.sort_order;
