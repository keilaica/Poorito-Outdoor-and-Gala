-- Migration: Clear all booking data
-- WARNING: This will permanently delete ALL bookings from the database
-- Use with caution - this operation cannot be undone

-- Delete all bookings
DELETE FROM bookings;

-- Optional: Reset the sequence if you want booking IDs to start from 1 again
-- Uncomment the line below if you want to reset the auto-increment counter
-- ALTER SEQUENCE bookings_id_seq RESTART WITH 1;






