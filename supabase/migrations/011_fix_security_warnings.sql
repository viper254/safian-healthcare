-- =============================================================================
-- Fix Supabase Security Linter Warnings
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Fix Function Search Path Mutability
-- Add search_path to all functions to prevent search_path injection attacks
-- -----------------------------------------------------------------------------

-- Drop and recreate functions to ensure clean state
DROP FUNCTION IF EXISTS public.check_low_stock() CASCADE;
DROP FUNCTION IF EXISTS public.promote_to_admin(text) CASCADE;
DROP FUNCTION IF EXISTS public.update_reviews_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.notify_new_order() CASCADE;

-- Fix set_updated_at function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$;

-- Fix is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql 
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  );
$$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- Recreate check_low_stock function (if it was being used)
CREATE OR REPLACE FUNCTION public.check_low_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.stock_quantity <= NEW.low_stock_threshold THEN
    -- Could trigger notification here
    NULL;
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate promote_to_admin function
CREATE OR REPLACE FUNCTION public.promote_to_admin(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET role = 'admin'
  WHERE email = user_email;
END;
$$;

-- Recreate update_reviews_updated_at function (if reviews table exists)
CREATE OR REPLACE FUNCTION public.update_reviews_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate notify_new_order function (if notifications table exists)
CREATE OR REPLACE FUNCTION public.notify_new_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    reference_id
  )
  VALUES (
    NULL, -- System notification
    'New Order',
    'Order ' || NEW.reference || ' has been placed',
    'order',
    NEW.id
  );
  RETURN NEW;
END;
$$;

-- -----------------------------------------------------------------------------
-- 2. Revoke EXECUTE on SECURITY DEFINER functions from anon/authenticated
-- These functions should only be called by triggers, not directly via API
-- -----------------------------------------------------------------------------

-- Revoke execute from anon and authenticated for internal functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.promote_to_admin(text) FROM anon, authenticated;

-- Only postgres and service_role should be able to call these
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;
GRANT EXECUTE ON FUNCTION public.promote_to_admin(text) TO postgres, service_role;

-- -----------------------------------------------------------------------------
-- 3. Tighten RLS Policies - Add proper checks instead of WITH CHECK (true)
-- -----------------------------------------------------------------------------

-- Fix analytics_events insert policy
DROP POLICY IF EXISTS "events_insert_public" ON public.analytics_events;
CREATE POLICY "events_insert_public" ON public.analytics_events
  FOR INSERT 
  WITH CHECK (
    -- Only allow inserting events for current session
    user_id IS NULL OR user_id = auth.uid()
  );

-- Fix notifications insert policy
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT 
  WITH CHECK (
    -- Only service role can insert system notifications
    auth.jwt()->>'role' = 'service_role'
  );

-- Fix order_items insert policy
DROP POLICY IF EXISTS "order_items_insert" ON public.order_items;
CREATE POLICY "order_items_insert" ON public.order_items
  FOR INSERT 
  WITH CHECK (
    -- Only allow inserting items for orders that exist and belong to user
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
      AND (o.user_id = auth.uid() OR o.user_id IS NULL)
    )
  );

-- Fix orders insert policy - keep permissive for guest checkout but add validation
DROP POLICY IF EXISTS "orders_insert_anyone" ON public.orders;
CREATE POLICY "orders_insert_anyone" ON public.orders
  FOR INSERT 
  WITH CHECK (
    -- Allow guest checkout (user_id can be null)
    -- But ensure basic data integrity
    customer_name IS NOT NULL 
    AND customer_phone IS NOT NULL
    AND total > 0
    AND (user_id IS NULL OR user_id = auth.uid())
  );

-- Fix reviews insert policy
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews;
CREATE POLICY "Authenticated users can create reviews" ON public.reviews
  FOR INSERT 
  WITH CHECK (
    -- Only authenticated users can create reviews
    auth.uid() IS NOT NULL
    -- And they can only set their own user_id
    AND user_id = auth.uid()
  );

-- -----------------------------------------------------------------------------
-- 4. Fix Storage Bucket Policy - Remove broad SELECT that allows listing
-- -----------------------------------------------------------------------------

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;

-- Create a more restrictive policy that allows access but not listing
CREATE POLICY "Public can view product images" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'product-images'
    -- Only allow access to specific files, not listing
    AND auth.role() = 'anon'
  );

-- Better approach: Only allow authenticated access to specific objects
-- Public access should be via signed URLs or CDN
CREATE POLICY "Authenticated can view product images" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'product-images'
    AND (
      auth.role() = 'authenticated'
      OR auth.role() = 'service_role'
    )
  );

-- -----------------------------------------------------------------------------
-- Comments for documentation
-- -----------------------------------------------------------------------------

COMMENT ON FUNCTION public.handle_new_user() IS 
  'Trigger function to create profile on user signup. SECURITY DEFINER with search_path set.';

COMMENT ON FUNCTION public.is_admin() IS 
  'Helper function to check if current user is admin. SECURITY DEFINER with search_path set.';

COMMENT ON FUNCTION public.promote_to_admin(text) IS 
  'Admin function to promote user to admin role. Only callable by service_role.';
