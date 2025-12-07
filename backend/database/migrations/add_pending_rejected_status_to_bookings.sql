-- Migration: Add 'pending' and 'rejected' status to bookings table
-- Change default status from 'confirmed' to 'pending'
-- This implements the admin confirmation system

-- First, update existing bookings that are 'confirmed' to 'pending' if needed
-- (Optional: You may want to keep existing confirmed bookings as confirmed)
-- UPDATE bookings SET status = 'pending' WHERE status = 'confirmed';

-- Drop the existing check constraint
ALTER TABLE bookings 
DROP CONSTRAINT IF EXISTS bookings_status_check;

-- Add new check constraint with all statuses: pending, confirmed, cancelled, completed, rejected
ALTER TABLE bookings 
ADD CONSTRAINT bookings_status_check 
CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'rejected'));

-- Change default status to 'pending'
ALTER TABLE bookings 
ALTER COLUMN status SET DEFAULT 'pending';

-- Add rejected_at timestamp column
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE;

-- Add comment for documentation
COMMENT ON COLUMN bookings.status IS 'Booking status: pending (awaiting admin approval), confirmed (slots/date reserved), cancelled (cancelled by user/admin), completed (trip completed), rejected (admin declined)';
COMMENT ON COLUMN bookings.rejected_at IS 'Timestamp when booking was rejected by admin';





