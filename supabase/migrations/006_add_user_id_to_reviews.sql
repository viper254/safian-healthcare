-- Add user_id column to reviews table to link reviews to authenticated users
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- Update RLS policies to allow users to see their own reviews even if not approved
-- (Optional, based on business requirements)
CREATE POLICY "Users can view their own reviews" ON reviews
    FOR SELECT USING (auth.uid() = user_id);
