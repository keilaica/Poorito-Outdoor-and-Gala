-- Migration: Add start_date and end_date columns to bookings table
-- This allows bookings to have a date range instead of just a single date

-- Add start_date column (use booking_date as default for existing records)
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS start_date DATE;

-- Add end_date column (use booking_date as default for existing records)
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS end_date DATE;

-- Update existing records to set start_date and end_date to booking_date
UPDATE bookings 
SET start_date = booking_date 
WHERE start_date IS NULL;

UPDATE bookings 
SET end_date = booking_date 
WHERE end_date IS NULL;

-- Make start_date and end_date NOT NULL after setting defaults
ALTER TABLE bookings 
ALTER COLUMN start_date SET NOT NULL;

ALTER TABLE bookings 
ALTER COLUMN end_date SET NOT NULL;

-- Add index on start_date for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_start_date ON bookings(start_date);

-- Add index on end_date for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_end_date ON bookings(end_date);

-- Update the unique constraint to check for overlapping date ranges
-- Note: This is a simplified approach. For production, you might want a more sophisticated overlap check
-- The existing unique constraint on (user_id, mountain_id, booking_date) is kept for backward compatibility
