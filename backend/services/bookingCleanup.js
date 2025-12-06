const supabase = require('../config/database');

const DAYS_BEFORE_DELETE = 7;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

async function cleanupCancelledBookings() {
  const cutoffDate = new Date(Date.now() - DAYS_BEFORE_DELETE * ONE_DAY_MS).toISOString();

  try {
    // First, query for bookings that need to be deleted
    // Only get bookings with cancelled_at set (not null) and older than cutoff
    const { data: bookingsToDelete, error: queryError } = await supabase
      .from('bookings')
      .select('id')
      .eq('status', 'cancelled')
      .not('cancelled_at', 'is', null)
      .lt('cancelled_at', cutoffDate);

    if (queryError) {
      // Check if it's a network/API error vs a query error
      const errorMsg = queryError.message || '';
      const errorStr = errorMsg || JSON.stringify(queryError);
      
      if (errorStr.includes('html') || errorStr.includes('500') || errorStr.includes('Internal Server Error')) {
        console.error('🧹 Booking cleanup error: Supabase API returned an error (possibly temporary). Will retry on next schedule.');
        if (!errorMsg) {
          console.error('🧹 Error details:', JSON.stringify(queryError, null, 2));
        }
        return;
      } else {
        // Log full error details if message is empty
        if (!errorMsg) {
          console.error('🧹 Booking cleanup query error:', JSON.stringify(queryError, null, 2));
        } else {
          console.error('🧹 Booking cleanup query error:', queryError);
        }
        return;
      }
    }

    // If no bookings to delete, we're done
    if (!bookingsToDelete || bookingsToDelete.length === 0) {
      console.log('🧹 Booking cleanup: no old cancelled bookings to delete.');
      return;
    }

    // Delete the bookings by ID
    const bookingIds = bookingsToDelete.map(b => b.id);
    const { data: deletedBookings, error: deleteError } = await supabase
      .from('bookings')
      .delete()
      .in('id', bookingIds)
      .select('id');

    if (deleteError) {
      const errorMsg = deleteError.message || '';
      const errorStr = errorMsg || JSON.stringify(deleteError);
      
      if (errorStr.includes('html') || errorStr.includes('500') || errorStr.includes('Internal Server Error')) {
        console.error('🧹 Booking cleanup delete error: Supabase API returned an error (possibly temporary). Will retry on next schedule.');
        if (!errorMsg) {
          console.error('🧹 Delete error details:', JSON.stringify(deleteError, null, 2));
        }
      } else {
        // Log full error details if message is empty
        if (!errorMsg) {
          console.error('🧹 Booking cleanup delete error:', JSON.stringify(deleteError, null, 2));
        } else {
          console.error('🧹 Booking cleanup delete error:', deleteError);
        }
      }
      return;
    }

    const deletedCount = Array.isArray(deletedBookings) ? deletedBookings.length : 0;
    if (deletedCount > 0) {
      console.log(`🧹 Booking cleanup: deleted ${deletedCount} cancelled bookings older than ${DAYS_BEFORE_DELETE} days.`);
    }
  } catch (err) {
    // Handle network errors, timeouts, etc.
    const errorMsg = err.message || String(err);
    if (errorMsg.includes('fetch') || errorMsg.includes('network') || errorMsg.includes('timeout') || errorMsg.includes('ECONNREFUSED')) {
      console.error('🧹 Booking cleanup network error (will retry on next schedule):', errorMsg);
    } else {
      console.error('🧹 Booking cleanup unexpected error:', err);
    }
  }
}

function scheduleBookingCleanup() {
  // Allow opting out via env if needed
  if (process.env.BOOKING_CLEANUP_DISABLED === 'true') {
    console.log('🧹 Booking cleanup job is disabled via BOOKING_CLEANUP_DISABLED env variable.');
    return;
  }

  console.log(`🧹 Booking cleanup job scheduled: runs once per day, deleting cancelled bookings older than ${DAYS_BEFORE_DELETE} days.`);

  // Run once shortly after startup
  setTimeout(() => {
    cleanupCancelledBookings();
  }, 10 * 1000);

  // Schedule daily run
  setInterval(cleanupCancelledBookings, ONE_DAY_MS);
}

module.exports = {
  cleanupCancelledBookings,
  scheduleBookingCleanup,
};


