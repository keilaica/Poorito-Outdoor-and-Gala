-- Migration: Add additional_images column to mountains table
-- Run this in your Supabase SQL Editor

-- Add additional_images column to store array of additional images (as JSONB)
ALTER TABLE mountains 
ADD COLUMN IF NOT EXISTS additional_images JSONB DEFAULT '[]'::jsonb;

-- Also ensure image_url is TEXT type (not VARCHAR(500)) to support base64 images
ALTER TABLE mountains ALTER COLUMN image_url TYPE TEXT;

