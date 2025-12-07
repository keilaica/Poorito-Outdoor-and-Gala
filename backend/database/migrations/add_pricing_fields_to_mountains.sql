-- Migration: Add pricing fields to mountains table
-- This allows each mountain to define pricing for Joiner and Exclusive hikes

-- Add basePricePerHead column (price for 1 day, 1 pax)
ALTER TABLE mountains 
ADD COLUMN IF NOT EXISTS base_price_per_head DECIMAL(10, 2) DEFAULT 0 CHECK (base_price_per_head >= 0);

-- Add joinerCapacity column (max number of participants for joiner hikes)
ALTER TABLE mountains 
ADD COLUMN IF NOT EXISTS joiner_capacity INTEGER DEFAULT 14 CHECK (joiner_capacity >= 1);

-- Add isJoinerAvailable flag
ALTER TABLE mountains 
ADD COLUMN IF NOT EXISTS is_joiner_available BOOLEAN DEFAULT true;

-- Add isExclusiveAvailable flag
ALTER TABLE mountains 
ADD COLUMN IF NOT EXISTS is_exclusive_available BOOLEAN DEFAULT true;

-- Update existing records to have default values
UPDATE mountains 
SET base_price_per_head = 1599.00 
WHERE base_price_per_head IS NULL OR base_price_per_head = 0;

UPDATE mountains 
SET joiner_capacity = 14 
WHERE joiner_capacity IS NULL;

UPDATE mountains 
SET is_joiner_available = true 
WHERE is_joiner_available IS NULL;

UPDATE mountains 
SET is_exclusive_available = true 
WHERE is_exclusive_available IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN mountains.base_price_per_head IS 'Base price per head for 1 day, 1 pax (in PHP)';
COMMENT ON COLUMN mountains.joiner_capacity IS 'Maximum number of participants for joiner hikes';
COMMENT ON COLUMN mountains.is_joiner_available IS 'Whether joiner (shared group) hikes are available for this mountain';
COMMENT ON COLUMN mountains.is_exclusive_available IS 'Whether exclusive (private group) hikes are available for this mountain';


