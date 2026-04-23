-- This migration creates instructions for setting up the first admin user
-- You need to create the admin user manually through Supabase Dashboard or using the Supabase CLI

-- INSTRUCTIONS TO CREATE ADMIN USER:
-- 
-- Option 1: Using Supabase Dashboard
-- 1. Go to Authentication → Users in your Supabase dashboard
-- 2. Click "Add user" → "Create new user"
-- 3. Enter email and password
-- 4. After creating, copy the user's UUID
-- 5. Run this SQL in the SQL Editor:
--
--    UPDATE profiles 
--    SET role = 'admin' 
--    WHERE id = 'YOUR_USER_UUID_HERE';
--
-- Option 2: Using SQL (if you have a user already)
-- Replace 'admin@safianhealthcare.com' with your admin email:
--
--    UPDATE profiles 
--    SET role = 'admin' 
--    WHERE id = (
--      SELECT id FROM auth.users 
--      WHERE email = 'admin@safianhealthcare.com'
--    );

-- Add a comment to the profiles table for documentation
COMMENT ON COLUMN profiles.role IS 'User role: customer or admin. Set to admin for dashboard access.';

-- Create a function to easily promote a user to admin (for convenience)
CREATE OR REPLACE FUNCTION promote_to_admin(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Find user by email
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RETURN 'Error: User not found with email ' || user_email;
  END IF;
  
  -- Update profile to admin
  UPDATE profiles
  SET role = 'admin'
  WHERE id = user_id;
  
  RETURN 'Success: User ' || user_email || ' promoted to admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Usage example (run this after creating a user):
-- SELECT promote_to_admin('admin@safianhealthcare.com');
