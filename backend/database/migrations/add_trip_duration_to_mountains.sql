-- Migration: Add trip_duration column to mountains table
-- This allows each mountain to have a specific trip duration in days

-- Add trip_duration column (default to 1 day for existing records)
ALTER TABLE mountains 
ADD COLUMN IF NOT EXISTS trip_duration INTEGER DEFAULT 1 CHECK (trip_duration >= 1);

-- Update existing records to have a default trip duration of 1 day if null
UPDATE mountains 
SET trip_duration = 1 
WHERE trip_duration IS NULL;

-- Make trip_duration NOT NULL after setting defaults
ALTER TABLE mountains 
ALTER COLUMN trip_duration SET NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN mountains.trip_duration IS 'Number of days for the trip (default: 1 day)';



