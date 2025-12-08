-- Migration: Add INSERT policy for user registration
-- This allows public registration while maintaining RLS security
-- Run this in your Supabase SQL Editor

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow public user registration" ON users;

-- Create policy to allow anyone to insert new users (for registration)
-- This is safe because:
-- 1. The backend validates all input
-- 2. Passwords are hashed before insertion
-- 3. Email and username uniqueness is enforced
CREATE POLICY "Allow public user registration" ON users
    FOR INSERT 
    WITH CHECK (true);

-- Note: This policy allows INSERT operations from any authenticated or anonymous user
-- The backend should still use SUPABASE_SERVICE_ROLE_KEY for other operations
-- to bypass RLS when needed (e.g., admin operations)









