-- Migration: Add distance_km column to mountains table
-- This adds distance in kilometers field, separate from elevation (MASL)

-- Add distance_km column (distance in kilometers)
ALTER TABLE mountains 
ADD COLUMN IF NOT EXISTS distance_km DECIMAL(10, 2);

-- Add comment for documentation
COMMENT ON COLUMN mountains.distance_km IS 'Distance in kilometers (KM), separate from elevation (MASL)';


