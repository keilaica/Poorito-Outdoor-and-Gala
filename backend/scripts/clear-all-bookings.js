/**
 * Script to clear all booking data from the database
 * WARNING: This will permanently delete ALL bookings - use with caution!
 * 
 * Usage: node scripts/clear-all-bookings.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const supabase = require('../config/database');

async function clearAllBookings() {
  try {
    console.log('⚠️  WARNING: This will delete ALL bookings from the database!');
    console.log('Starting deletion...\n');

    // First, get count of bookings
    const { count, error: countError } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting bookings:', countError);
      process.exit(1);
    }

    console.log(`Found ${count || 0} booking(s) to delete.`);

    if (count === 0) {
      console.log('No bookings to delete. Exiting.');
      process.exit(0);
    }

    // Delete all bookings
    // Note: Supabase requires a filter, so we use gte('id', 0) which matches all rows
    const { error: deleteError } = await supabase
      .from('bookings')
      .delete()
      .gte('id', 0); // Delete all (id >= 0 will match all rows)

    if (deleteError) {
      console.error('Error deleting bookings:', deleteError);
      process.exit(1);
    }

    console.log(`✅ Successfully deleted ${count} booking(s)!`);
    console.log('All booking data has been cleared from the database.');

  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

// Run the script
clearAllBookings();

