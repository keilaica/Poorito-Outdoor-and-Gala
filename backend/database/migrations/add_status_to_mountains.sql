-- Add status column to mountains table
-- This migration adds a status field with CHECK constraint for trail types

-- Add status column if it doesn't exist
ALTER TABLE mountains 
ADD COLUMN IF NOT EXISTS status TEXT;

-- Drop existing constraint if it exists
ALTER TABLE mountains 
DROP CONSTRAINT IF EXISTS mountains_status_check;

-- Add CHECK constraint for valid status values: backtrail, traverse, loop
ALTER TABLE mountains 
ADD CONSTRAINT mountains_status_check 
CHECK (status IS NULL OR status IN ('backtrail', 'traverse', 'loop'));

-- Set default value for existing rows
UPDATE mountains 
SET status = 'backtrail' 
WHERE status IS NULL;

-- Set NOT NULL constraint (after setting defaults)
ALTER TABLE mountains 
ALTER COLUMN status SET DEFAULT 'backtrail';

