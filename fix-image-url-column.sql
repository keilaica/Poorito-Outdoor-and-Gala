-- Fix image_url column to support base64 images
-- Run this in your Supabase SQL Editor

-- Update mountains table image_url column to TEXT
ALTER TABLE mountains ALTER COLUMN image_url TYPE TEXT;

-- Update articles table image_url column to TEXT  
ALTER TABLE articles ALTER COLUMN image_url TYPE TEXT;

-- Verify the changes
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name IN ('mountains', 'articles') 
AND column_name = 'image_url';
