-- Migration: Add meters_above_sea_level and duration columns to mountains table
-- This adds elevation (altitude) and hike duration fields

-- Add meters_above_sea_level column (altitude/elevation in meters)
ALTER TABLE mountains 
ADD COLUMN IF NOT EXISTS meters_above_sea_level INTEGER;

-- Add duration column (hike duration, e.g., "10-14 hours" or "10 hours")
ALTER TABLE mountains 
ADD COLUMN IF NOT EXISTS duration TEXT;

-- Add comments for documentation
COMMENT ON COLUMN mountains.meters_above_sea_level IS 'Elevation/altitude in meters above sea level';
COMMENT ON COLUMN mountains.duration IS 'Hike duration (e.g., "10-14 hours" or "10 hours")';
