-- Migration: Add exclusive_price field to mountains table
-- This allows admins to set a fixed exclusive price per mountain
-- Exclusive price is NOT computed from joiner prices or capacity

-- Add exclusive_price column (fixed total price for exclusive hike, set by admin)
ALTER TABLE mountains 
ADD COLUMN IF NOT EXISTS exclusive_price DECIMAL(10, 2) DEFAULT NULL CHECK (exclusive_price >= 0);

-- Update existing records: set a default exclusive price if not set
-- Default: 25000 (can be adjusted by admin later)
UPDATE mountains 
SET exclusive_price = 25000.00 
WHERE exclusive_price IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN mountains.exclusive_price IS 'Fixed total price for exclusive hike, set by admin. Independent of joiner pricing, capacity, or duration multipliers.';
