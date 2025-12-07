-- Migration: Add mountain details columns to mountains table
-- This adds the JSONB columns for what_to_bring, budgeting, itinerary, and how_to_get_there
-- Safe to run multiple times (uses IF NOT EXISTS)

-- Add what_to_bring column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'mountains' AND column_name = 'what_to_bring'
    ) THEN
        ALTER TABLE mountains ADD COLUMN what_to_bring JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Add budgeting column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'mountains' AND column_name = 'budgeting'
    ) THEN
        ALTER TABLE mountains ADD COLUMN budgeting JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Add itinerary column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'mountains' AND column_name = 'itinerary'
    ) THEN
        ALTER TABLE mountains ADD COLUMN itinerary JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Add how_to_get_there column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'mountains' AND column_name = 'how_to_get_there'
    ) THEN
        ALTER TABLE mountains ADD COLUMN how_to_get_there JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Update any NULL values to empty arrays
UPDATE mountains 
SET what_to_bring = '[]'::jsonb 
WHERE what_to_bring IS NULL;

UPDATE mountains 
SET budgeting = '[]'::jsonb 
WHERE budgeting IS NULL;

UPDATE mountains 
SET itinerary = '[]'::jsonb 
WHERE itinerary IS NULL;

UPDATE mountains 
SET how_to_get_there = '[]'::jsonb 
WHERE how_to_get_there IS NULL;

-- Verify the columns were added
SELECT 
    column_name, 
    data_type, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'mountains' 
AND column_name IN ('what_to_bring', 'budgeting', 'itinerary', 'how_to_get_there')
ORDER BY column_name;

