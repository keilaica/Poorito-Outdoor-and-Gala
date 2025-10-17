-- Disable RLS temporarily for development
-- Run this in your Supabase SQL Editor

-- Disable RLS on mountains table
ALTER TABLE mountains DISABLE ROW LEVEL SECURITY;

-- Disable RLS on articles table  
ALTER TABLE articles DISABLE ROW LEVEL SECURITY;

-- Disable RLS on users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Disable RLS on mountain_guides table
ALTER TABLE mountain_guides DISABLE ROW LEVEL SECURITY;

-- Disable RLS on user_activities table
ALTER TABLE user_activities DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('mountains', 'articles', 'users', 'mountain_guides', 'user_activities');

