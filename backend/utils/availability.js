/**
 * Availability checking utilities for Joiner and Exclusive bookings
 */

/**
 * Generate array of dates from start_date to end_date (inclusive)
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Array<string>} Array of date strings in YYYY-MM-DD format
 */
function getDateRange(startDate, endDate) {
  const dates = [];
  
  // Parse dates as local dates to avoid timezone issues
  const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
  const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
  
  const start = new Date(startYear, startMonth - 1, startDay);
  const end = new Date(endYear, endMonth - 1, endDay);
  
  const currentDate = new Date(start);
  
  while (currentDate <= end) {
    // Format as YYYY-MM-DD using local date components (no timezone conversion)
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    dates.push(dateString);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

/**
 * Check availability for a date range
 * @param {Array} bookings - Array of bookings for the date range
 * @param {number} joinerCapacity - Maximum joiner capacity
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Object} Availability object with date as key
 */
function calculateAvailability(bookings, joinerCapacity, startDate, endDate) {
  const dateRange = getDateRange(startDate, endDate);
  const availability = {};
  
  // Initialize all dates with full availability
  dateRange.forEach(date => {
    availability[date] = {
      joinerBooked: 0,
      joinerAvailable: joinerCapacity,
      isExclusiveBooked: false,
      joinerCapacity: joinerCapacity
    };
  });
  
  // Process bookings (only confirmed/completed, not cancelled)
  bookings.forEach(booking => {
    if (booking.status === 'cancelled') return;
    
    // Parse booking dates as local dates to avoid timezone issues
    const bookingStartDate = booking.start_date || booking.booking_date;
    const bookingEndDate = booking.end_date || booking.booking_date;
    
    // Ensure dates are in YYYY-MM-DD format (remove time if present)
    const startDateStr = bookingStartDate.split('T')[0];
    const endDateStr = bookingEndDate.split('T')[0];
    
    const bookingDates = getDateRange(startDateStr, endDateStr);
    
    bookingDates.forEach(date => {
      if (availability[date]) {
        if (booking.booking_type === 'exclusive') {
          // Exclusive booking blocks entire date
          availability[date].isExclusiveBooked = true;
          availability[date].joinerAvailable = 0;
          availability[date].joinerBooked = joinerCapacity; // Mark as fully booked
        } else if (booking.booking_type === 'joiner') {
          // Joiner booking reduces available slots
          if (!availability[date].isExclusiveBooked) {
            availability[date].joinerBooked += booking.number_of_participants || 0;
            availability[date].joinerAvailable = Math.max(0, joinerCapacity - availability[date].joinerBooked);
          }
        }
      }
    });
  });
  
  return availability;
}

/**
 * Validate if a booking can be made
 * @param {Object} availability - Availability object from calculateAvailability
 * @param {string} bookingType - 'joiner' or 'exclusive'
 * @param {number} numberOfParticipants - Number of participants
 * @returns {Object} Validation result with isValid and message
 */
function validateBooking(availability, bookingType, numberOfParticipants) {
  const dates = Object.keys(availability);
  
  if (bookingType === 'exclusive') {
    // Exclusive cannot be booked if any date has existing bookings
    for (const date of dates) {
      const dateAvailability = availability[date];
      if (dateAvailability.isExclusiveBooked) {
        return {
          isValid: false,
          message: `Date ${date} is already booked exclusively. Please choose different dates.`
        };
      }
      if (dateAvailability.joinerBooked > 0) {
        return {
          isValid: false,
          message: `Date ${date} has existing joiner bookings. Exclusive bookings cannot be placed when joiners have already booked.`
        };
      }
    }
    return { isValid: true };
  } else {
    // Joiner cannot be booked if any date is fully booked or exclusively booked
    for (const date of dates) {
      const dateAvailability = availability[date];
      if (dateAvailability.isExclusiveBooked) {
        return {
          isValid: false,
          message: `Date ${date} is exclusively booked. Joiner bookings are not available for this date.`
        };
      }
      if (dateAvailability.joinerAvailable < numberOfParticipants) {
        return {
          isValid: false,
          message: `Date ${date} only has ${dateAvailability.joinerAvailable} slot(s) available, but you need ${numberOfParticipants}. Please reduce the number of participants or choose different dates.`
        };
      }
    }
    return { isValid: true };
  }
}

module.exports = {
  getDateRange,
  calculateAvailability,
  validateBooking
};

