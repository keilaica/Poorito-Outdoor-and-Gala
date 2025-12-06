-- Migration: Add booking_type column to bookings table
-- This allows bookings to be either 'joiner' or 'exclusive'

-- Add booking_type column
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS booking_type TEXT CHECK (booking_type IN ('joiner', 'exclusive')) DEFAULT 'joiner';

-- Add price columns to store calculated prices
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS joiner_price_per_head DECIMAL(10, 2);

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS exclusive_price DECIMAL(10, 2);

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS total_price DECIMAL(10, 2);

-- Update existing records to have default booking_type
UPDATE bookings 
SET booking_type = 'joiner' 
WHERE booking_type IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN bookings.booking_type IS 'Type of booking: joiner (shared group) or exclusive (private group)';
COMMENT ON COLUMN bookings.joiner_price_per_head IS 'Calculated joiner price per head based on trip duration';
COMMENT ON COLUMN bookings.exclusive_price IS 'Calculated exclusive price (joiner_price_per_head * joiner_capacity)';
COMMENT ON COLUMN bookings.total_price IS 'Total price for the booking (joiner: price_per_head * participants, exclusive: exclusive_price)';

