const express = require('express');
const supabase = require('../config/database');
const { createUserClient } = require('../config/user-database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { sendBookingConfirmation } = require('../services/emailService');
const { calculateBookingPrices } = require('../utils/pricing');
const { calculateAvailability, validateBooking } = require('../utils/availability');

const router = express.Router();

// Get availability for a date range (public endpoint)
router.get('/availability/:mountainId', async (req, res) => {
  try {
    const { mountainId } = req.params;
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    // Get mountain with joiner capacity
    const { data: mountain, error: mountainError } = await supabase
      .from('mountains')
      .select('id, joiner_capacity')
      .eq('id', mountainId)
      .single();

    if (mountainError || !mountain) {
      return res.status(404).json({ error: 'Mountain not found' });
    }

    const joinerCapacity = mountain.joiner_capacity || 14;

    // Get all bookings for this mountain that overlap with the date range
    // Parse dates as local dates to avoid timezone issues
    const [startYear, startMonth, startDay] = start_date.split('-').map(Number);
    const [endYear, endMonth, endDay] = end_date.split('-').map(Number);
    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, start_date, end_date, booking_date, booking_type, number_of_participants, status')
      .eq('mountain_id', mountainId)
      .in('status', ['confirmed', 'completed']); // Only active bookings

    if (bookingsError) {
      console.error('Get bookings error:', bookingsError);
      return res.status(500).json({ 
        error: 'Failed to fetch bookings',
        details: process.env.NODE_ENV !== 'production' ? bookingsError.message : undefined
      });
    }

    // Filter bookings that overlap with the requested date range
    const overlappingBookings = (bookings || []).filter(booking => {
      let bookingStart, bookingEnd;
      
      if (booking.start_date && booking.end_date) {
        // Parse as local dates to avoid timezone issues
        const startDateStr = booking.start_date.split('T')[0];
        const endDateStr = booking.end_date.split('T')[0];
        const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number);
        const [endYear, endMonth, endDay] = endDateStr.split('-').map(Number);
        bookingStart = new Date(startYear, startMonth - 1, startDay);
        bookingEnd = new Date(endYear, endMonth - 1, endDay);
      } else if (booking.booking_date) {
        // Parse as local date
        const bookingDateStr = booking.booking_date.split('T')[0];
        const [year, month, day] = bookingDateStr.split('-').map(Number);
        bookingStart = new Date(year, month - 1, day);
        bookingEnd = new Date(year, month - 1, day);
      } else {
        return false;
      }
      
      bookingStart.setHours(0, 0, 0, 0);
      bookingEnd.setHours(23, 59, 59, 999);
      
      // Check if date ranges overlap
      return bookingStart <= end && bookingEnd >= start;
    });

    // Calculate availability
    const availability = calculateAvailability(
      overlappingBookings,
      joinerCapacity,
      start_date,
      end_date
    );

    res.json({ availability });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ error: 'Failed to get availability' });
  }
});

// Get all bookings (admin only - for admin dashboard)
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query; // Optional filter by status
    
    let query = supabase
      .from('bookings')
      .select(`
        id,
        user_id,
        mountain_id,
        start_date,
        end_date,
        booking_date,
        status,
        number_of_participants,
        booking_type,
        joiner_price_per_head,
        exclusive_price,
        total_price,
        created_at,
        updated_at,
        cancelled_at,
        rejected_at,
        users (
          id,
          username,
          email
        ),
        mountains (
          id,
          name,
          location,
          difficulty,
          elevation,
          image_url
        )
      `)
      .order('created_at', { ascending: false });

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }

    const { data: bookings, error } = await query;

    if (error) {
      console.error('Get all bookings error:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch bookings',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }

    res.json({ bookings: bookings || [] });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get all bookings for a user
router.get('/my-bookings', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.userId;
    
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        id,
        mountain_id,
        start_date,
        end_date,
        booking_date,
        status,
        number_of_participants,
        booking_type,
        joiner_price_per_head,
        exclusive_price,
        total_price,
        created_at,
        mountains (
          id,
          name,
          location,
          difficulty,
          elevation,
          image_url
        )
      `)
      .eq('user_id', user_id)
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Get bookings error:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch bookings',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }

    res.json({ bookings: bookings || [] });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Create a new booking
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { mountain_id, start_date, end_date, number_of_participants, booking_type } = req.body;
    const user_id = req.user.userId;

    if (!mountain_id || !start_date || !end_date) {
      return res.status(400).json({ error: 'Mountain ID, start date, and end date are required' });
    }

    // Validate booking_type
    const validBookingType = booking_type === 'exclusive' ? 'exclusive' : 'joiner';

    // Validate date range
    const start = new Date(start_date);
    const end = new Date(end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({ error: 'Start date must be in the future' });
    }

    if (end < start) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    // Validate number of participants (default to 1 if not provided)
    const participants = number_of_participants ? parseInt(number_of_participants) : 1;
    if (participants < 1 || participants > 20) {
      return res.status(400).json({ error: 'Number of participants must be between 1 and 20' });
    }

    // Create user-scoped client
    const userSupabase = createUserClient(req.headers.authorization?.split(' ')[1]);

    // Check if mountain exists and get pricing fields
    const { data: mountain, error: mountainError } = await supabase
      .from('mountains')
      .select('id, name, base_price_per_head, joiner_capacity, exclusive_price, is_joiner_available, is_exclusive_available, trip_duration')
      .eq('id', mountain_id)
      .single();

    if (mountainError || !mountain) {
      return res.status(404).json({ error: 'Mountain not found' });
    }

    // Validate booking type availability
    if (validBookingType === 'joiner' && !mountain.is_joiner_available) {
      return res.status(400).json({ error: 'Joiner hikes are not available for this mountain' });
    }

    if (validBookingType === 'exclusive' && !mountain.is_exclusive_available) {
      return res.status(400).json({ error: 'Exclusive hikes are not available for this mountain' });
    }

    // Calculate trip duration from dates (start and end are already declared above)
    const tripDuration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
    const actualTripDuration = mountain.trip_duration || tripDuration;

    // Calculate prices
    const prices = calculateBookingPrices(mountain, actualTripDuration, validBookingType, participants);

    // Check availability for the date range
    const { data: existingBookingsForAvailability, error: availabilityError } = await supabase
      .from('bookings')
      .select('id, start_date, end_date, booking_date, booking_type, number_of_participants, status')
      .eq('mountain_id', mountain_id)
      .in('status', ['confirmed', 'completed']); // Only active bookings

    if (availabilityError) {
      console.error('Check availability error:', availabilityError);
      return res.status(500).json({ 
        error: 'Failed to check availability',
        details: process.env.NODE_ENV !== 'production' ? availabilityError.message : undefined
      });
    }

    // Filter bookings that overlap with the requested date range
    const overlappingBookingsForAvailability = (existingBookingsForAvailability || []).filter(booking => {
      let bookingStart, bookingEnd;
      
      if (booking.start_date && booking.end_date) {
        bookingStart = new Date(booking.start_date);
        bookingEnd = new Date(booking.end_date);
      } else if (booking.booking_date) {
        bookingStart = new Date(booking.booking_date);
        bookingEnd = new Date(booking.booking_date);
      } else {
        return false;
      }
      
      bookingStart.setHours(0, 0, 0, 0);
      bookingEnd.setHours(23, 59, 59, 999);
      const checkStart = new Date(start);
      const checkEnd = new Date(end);
      checkStart.setHours(0, 0, 0, 0);
      checkEnd.setHours(23, 59, 59, 999);
      
      // Check if date ranges overlap
      return bookingStart <= checkEnd && bookingEnd >= checkStart;
    });

    // Calculate availability
    const availability = calculateAvailability(
      overlappingBookingsForAvailability,
      mountain.joiner_capacity || 14,
      start_date,
      end_date
    );

    // Validate booking
    const validation = validateBooking(availability, validBookingType, participants);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.message });
    }

    // Check if user already has a booking for this mountain that overlaps with the date range
    // Only check confirmed/completed bookings (not cancelled ones)
    const { data: existingBookings, error: checkError } = await supabase
      .from('bookings')
      .select('id, start_date, end_date, booking_date, status')
      .eq('user_id', user_id)
      .eq('mountain_id', mountain_id)
      .in('status', ['confirmed', 'completed']); // Only check active bookings

    if (checkError) {
      console.error('Check booking error:', checkError);
      console.error('Check booking error details:', {
        message: checkError.message,
        code: checkError.code,
        details: checkError.details,
        hint: checkError.hint
      });
      return res.status(500).json({ 
        error: 'Failed to check existing bookings',
        details: process.env.NODE_ENV !== 'production' ? checkError.message : undefined
      });
    }

    // Check for overlapping bookings
    if (existingBookings && existingBookings.length > 0) {
      // More detailed overlap check
      const hasOverlap = existingBookings.some(booking => {
        // Handle backward compatibility - use booking_date if start_date/end_date don't exist
        let existingStart, existingEnd;
        
        if (booking.start_date && booking.end_date) {
          // New format with date range
          existingStart = new Date(booking.start_date);
          existingEnd = new Date(booking.end_date);
        } else if (booking.booking_date) {
          // Old format - single date (treat as same day)
          existingStart = new Date(booking.booking_date);
          existingEnd = new Date(booking.booking_date);
        } else {
          // No date info, skip
          return false;
        }
        
        // Reset time to midnight for accurate date comparison
        existingStart.setHours(0, 0, 0, 0);
        existingEnd.setHours(23, 59, 59, 999);
        const checkStart = new Date(start);
        const checkEnd = new Date(end);
        checkStart.setHours(0, 0, 0, 0);
        checkEnd.setHours(23, 59, 59, 999);
        
        // Check if date ranges overlap
        // Two ranges overlap if: start <= existingEnd && end >= existingStart
        const overlaps = checkStart <= existingEnd && checkEnd >= existingStart;
        
        return overlaps;
      });

      if (hasOverlap) {
        return res.status(400).json({ 
          error: 'You already have a confirmed booking for this mountain that overlaps with the selected date range. Please choose different dates or cancel your existing booking first.' 
        });
      }
    }

    // Create booking using service role client (bypasses RLS)
    // Bookings start as 'pending' and only affect availability after admin confirmation
    const bookingData = {
      user_id,
      mountain_id,
      start_date,
      end_date,
      booking_date: start_date, // Keep booking_date for backward compatibility
      status: 'pending', // Changed from 'confirmed' to 'pending' - requires admin approval
      number_of_participants: participants,
      booking_type: validBookingType,
      joiner_price_per_head: prices.joinerPricePerHead,
      exclusive_price: prices.exclusivePrice,
      total_price: prices.totalPrice
    };

    const { data: newBooking, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select(`
        id,
        mountain_id,
        start_date,
        end_date,
        booking_date,
        status,
        number_of_participants,
        booking_type,
        joiner_price_per_head,
        exclusive_price,
        total_price,
        created_at,
        mountains (
          id,
          name,
          location,
          difficulty,
          elevation,
          image_url
        )
      `)
      .single();

    if (error) {
      console.error('Create booking error:', error);
      return res.status(500).json({ 
        error: 'Failed to create booking',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }

    // Note: Email notification is NOT sent here
    // Email will only be sent when admin confirms the booking (status changes from pending to confirmed)

    res.status(201).json({
      message: 'Booking request submitted successfully. It is now pending admin approval.',
      booking: newBooking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Admin: Approve booking (admin only)
router.put('/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, status, start_date, end_date, booking_date, booking_type, number_of_participants, mountain_id')
      .eq('id', id)
      .single();

    if (bookingError || !booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ error: `Cannot approve booking with status: ${booking.status}. Only pending bookings can be approved.` });
    }

    // Check global date blocking (single driver rule)
    // If any confirmed booking exists on these dates across ALL mountains, block the approval
    const bookingStartDate = booking.start_date || booking.booking_date;
    const bookingEndDate = booking.end_date || booking.booking_date;
    
    // Parse dates as local dates
    const [startYear, startMonth, startDay] = bookingStartDate.split('T')[0].split('-').map(Number);
    const [endYear, endMonth, endDay] = bookingEndDate.split('T')[0].split('-').map(Number);
    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // Check for any confirmed bookings on these dates across ALL mountains
    const { data: globalBookings, error: globalError } = await supabase
      .from('bookings')
      .select('id, start_date, end_date, booking_date, mountain_id')
      .in('status', ['confirmed', 'completed'])
      .neq('id', id); // Exclude current booking

    if (globalError) {
      console.error('Check global bookings error:', globalError);
      return res.status(500).json({ 
        error: 'Failed to check global date availability',
        details: process.env.NODE_ENV !== 'production' ? globalError.message : undefined
      });
    }

    // Check if any confirmed booking overlaps with the requested dates
    const hasGlobalConflict = (globalBookings || []).some(existingBooking => {
      let existingStart, existingEnd;
      
      if (existingBooking.start_date && existingBooking.end_date) {
        const [eStartYear, eStartMonth, eStartDay] = existingBooking.start_date.split('T')[0].split('-').map(Number);
        const [eEndYear, eEndMonth, eEndDay] = existingBooking.end_date.split('T')[0].split('-').map(Number);
        existingStart = new Date(eStartYear, eStartMonth - 1, eStartDay);
        existingEnd = new Date(eEndYear, eEndMonth - 1, eEndDay);
      } else if (existingBooking.booking_date) {
        const [eYear, eMonth, eDay] = existingBooking.booking_date.split('T')[0].split('-').map(Number);
        existingStart = new Date(eYear, eMonth - 1, eDay);
        existingEnd = new Date(eYear, eMonth - 1, eDay);
      } else {
        return false;
      }
      
      existingStart.setHours(0, 0, 0, 0);
      existingEnd.setHours(23, 59, 59, 999);
      
      // Check if date ranges overlap
      return existingStart <= end && existingEnd >= start;
    });

    if (hasGlobalConflict) {
      return res.status(400).json({ 
        error: 'Cannot approve booking: These dates are already blocked by another confirmed booking (single driver rule). The date must be available across all mountains.' 
      });
    }

    // Check mountain-specific availability for joiner bookings
    if (booking.booking_type === 'joiner') {
      const { data: mountain, error: mountainError } = await supabase
        .from('mountains')
        .select('joiner_capacity')
        .eq('id', booking.mountain_id)
        .single();

      if (mountainError || !mountain) {
        return res.status(404).json({ error: 'Mountain not found' });
      }

      // Get all confirmed joiner bookings for this mountain on these dates
      const { data: existingJoinerBookings, error: joinerError } = await supabase
        .from('bookings')
        .select('number_of_participants, start_date, end_date, booking_date')
        .eq('mountain_id', booking.mountain_id)
        .eq('booking_type', 'joiner')
        .in('status', ['confirmed', 'completed'])
        .neq('id', id);

      if (joinerError) {
        console.error('Check joiner availability error:', joinerError);
        return res.status(500).json({ 
          error: 'Failed to check joiner availability',
          details: process.env.NODE_ENV !== 'production' ? joinerError.message : undefined
        });
      }

      // Calculate total booked pax for each date in the range
      const dateRange = [];
      const currentDate = new Date(start);
      while (currentDate <= end) {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
        dateRange.push(dateStr);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Check if approving would exceed capacity
      for (const date of dateRange) {
        let totalBooked = 0;
        
        existingJoinerBookings.forEach(existingBooking => {
          const existingStartDate = existingBooking.start_date || existingBooking.booking_date;
          const existingEndDate = existingBooking.end_date || existingBooking.booking_date;
          
          const [eStartYear, eStartMonth, eStartDay] = existingStartDate.split('T')[0].split('-').map(Number);
          const [eEndYear, eEndMonth, eEndDay] = existingEndDate.split('T')[0].split('-').map(Number);
          const eStart = new Date(eStartYear, eStartMonth - 1, eStartDay);
          const eEnd = new Date(eEndYear, eEndMonth - 1, eEndDay);
          
          const [checkYear, checkMonth, checkDay] = date.split('-').map(Number);
          const checkDate = new Date(checkYear, checkMonth - 1, checkDay);
          
          if (checkDate >= eStart && checkDate <= eEnd) {
            totalBooked += existingBooking.number_of_participants || 0;
          }
        });
        
        const remainingSlots = (mountain.joiner_capacity || 14) - totalBooked;
        if (remainingSlots < (booking.number_of_participants || 0)) {
          return res.status(400).json({ 
            error: `Cannot approve booking: Date ${date} only has ${remainingSlots} slot(s) available, but this booking requires ${booking.number_of_participants} slot(s).` 
          });
        }
      }
    }

    // Check mountain-specific availability for exclusive bookings
    if (booking.booking_type === 'exclusive') {
      // Check if any joiner bookings exist on these dates for this mountain
      const { data: existingBookings, error: exclusiveError } = await supabase
        .from('bookings')
        .select('id, booking_type, start_date, end_date, booking_date')
        .eq('mountain_id', booking.mountain_id)
        .in('status', ['confirmed', 'completed'])
        .neq('id', id);

      if (exclusiveError) {
        console.error('Check exclusive availability error:', exclusiveError);
        return res.status(500).json({ 
          error: 'Failed to check exclusive availability',
          details: process.env.NODE_ENV !== 'production' ? exclusiveError.message : undefined
        });
      }

      // Check if any confirmed bookings overlap with these dates
      const hasConflict = (existingBookings || []).some(existingBooking => {
        let existingStart, existingEnd;
        
        if (existingBooking.start_date && existingBooking.end_date) {
          const [eStartYear, eStartMonth, eStartDay] = existingBooking.start_date.split('T')[0].split('-').map(Number);
          const [eEndYear, eEndMonth, eEndDay] = existingBooking.end_date.split('T')[0].split('-').map(Number);
          existingStart = new Date(eStartYear, eStartMonth - 1, eStartDay);
          existingEnd = new Date(eEndYear, eEndMonth - 1, eEndDay);
        } else if (existingBooking.booking_date) {
          const [eYear, eMonth, eDay] = existingBooking.booking_date.split('T')[0].split('-').map(Number);
          existingStart = new Date(eYear, eMonth - 1, eDay);
          existingEnd = new Date(eYear, eMonth - 1, eDay);
        } else {
          return false;
        }
        
        existingStart.setHours(0, 0, 0, 0);
        existingEnd.setHours(23, 59, 59, 999);
        
        return existingStart <= end && existingEnd >= start;
      });

      if (hasConflict) {
        return res.status(400).json({ 
          error: 'Cannot approve exclusive booking: These dates already have confirmed bookings (joiner or exclusive) for this mountain.' 
        });
      }
    }

    // All checks passed - approve the booking
    const now = new Date().toISOString();
    const { data: updatedBooking, error } = await supabase
      .from('bookings')
      .update({ 
        status: 'confirmed',
        updated_at: now
      })
      .eq('id', id)
      .select(`
        id,
        user_id,
        mountain_id,
        start_date,
        end_date,
        booking_date,
        status,
        number_of_participants,
        booking_type,
        joiner_price_per_head,
        exclusive_price,
        total_price,
        updated_at,
        mountains (
          id,
          name,
          location,
          difficulty,
          elevation,
          image_url
        )
      `)
      .single();

    if (error) {
      console.error('Approve booking error:', error);
      return res.status(500).json({ 
        error: 'Failed to approve booking',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }

    // Get user details for email notification
    // Email is only sent when status changes from pending to confirmed
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, email')
      .eq('id', updatedBooking.user_id)
      .single();

    // Send confirmation email (non-blocking - don't fail approval if email fails)
    if (user && !userError && updatedBooking && updatedBooking.mountains) {
      sendBookingConfirmation(
        user.email,
        user.username,
        updatedBooking,
        updatedBooking.mountains
      ).catch((emailError) => {
        // Log error but don't throw - booking approval was successful
        console.error('Failed to send booking confirmation email:', emailError);
      });
    }

    res.json({
      message: 'Booking approved successfully. Availability has been updated.',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Approve booking error:', error);
    res.status(500).json({ error: 'Failed to approve booking' });
  }
});

// Admin: Reject booking (admin only)
router.put('/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, status')
      .eq('id', id)
      .single();

    if (bookingError || !booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ error: `Cannot reject booking with status: ${booking.status}. Only pending bookings can be rejected.` });
    }

    // Reject the booking (no availability changes needed since it was never confirmed)
    const now = new Date().toISOString();
    const { data: updatedBooking, error } = await supabase
      .from('bookings')
      .update({ 
        status: 'rejected',
        updated_at: now,
        rejected_at: now
      })
      .eq('id', id)
      .select(`
        id,
        mountain_id,
        start_date,
        end_date,
        booking_date,
        status,
        number_of_participants,
        booking_type,
        updated_at,
        rejected_at,
        mountains (
          id,
          name,
          location,
          difficulty,
          elevation,
          image_url
        )
      `)
      .single();

    if (error) {
      console.error('Reject booking error:', error);
      return res.status(500).json({ 
        error: 'Failed to reject booking',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }

    res.json({
      message: 'Booking rejected successfully.',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Reject booking error:', error);
    res.status(500).json({ error: 'Failed to reject booking' });
  }
});

// Update booking status (cancel booking)
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.userId;

    // Check if booking exists and belongs to user
    const { data: booking, error: checkError } = await supabase
      .from('bookings')
      .select('id, status')
      .eq('id', id)
      .eq('user_id', user_id)
      .single();

    if (checkError || !booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking is already cancelled' });
    }

    if (booking.status === 'rejected') {
      return res.status(400).json({ error: 'Cannot cancel a rejected booking' });
    }

    // Note: Cancelling a pending booking doesn't restore slots (they were never deducted)
    // Cancelling a confirmed booking will restore slots (handled by availability checking which excludes cancelled bookings)

    // Update booking status
    const now = new Date().toISOString();
    const { data: updatedBooking, error } = await supabase
      .from('bookings')
      .update({ 
        status: 'cancelled',
        updated_at: now,
        cancelled_at: now
      })
      .eq('id', id)
      .eq('user_id', user_id)
      .select(`
        id,
        mountain_id,
        booking_date,
        status,
        number_of_participants,
        updated_at,
        mountains (
          id,
          name,
          location,
          difficulty,
          elevation,
          image_url
        )
      `)
      .single();

    if (error) {
      console.error('Cancel booking error:', error);
      return res.status(500).json({ 
        error: 'Failed to cancel booking',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }

    res.json({
      message: 'Booking cancelled successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// Get booking receipt (must be before /:id route)
router.get('/:id/receipt', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.userId;

    // Get booking with mountain details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id,
        mountain_id,
        start_date,
        end_date,
        booking_date,
        status,
        number_of_participants,
        created_at,
        updated_at,
        mountains (
          id,
          name,
          location,
          difficulty,
          elevation,
          description,
          image_url,
          budgeting
        )
      `)
      .eq('id', id)
      .eq('user_id', user_id)
      .single();

    if (bookingError || !booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, email, created_at')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Format receipt data
    const receipt = {
      receipt_number: `POOR-${String(booking.id).padStart(6, '0')}`,
      booking_id: booking.id,
      issued_date: new Date().toISOString(),
      user: {
        username: user.username,
        email: user.email
      },
      booking: {
        start_date: booking.start_date || booking.booking_date,
        end_date: booking.end_date || booking.booking_date,
        booking_date: booking.booking_date,
        status: booking.status,
        number_of_participants: booking.number_of_participants || 1,
        created_at: booking.created_at,
        updated_at: booking.updated_at
      },
      mountain: booking.mountains
    };

    res.json({ receipt });
  } catch (error) {
    console.error('Get receipt error:', error);
    res.status(500).json({ error: 'Failed to fetch receipt' });
  }
});

// Get booking details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.userId;

    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        id,
        mountain_id,
        booking_date,
        status,
        number_of_participants,
        created_at,
        updated_at,
        mountains (
          id,
          name,
          location,
          difficulty,
          elevation,
          description,
          image_url
        )
      `)
      .eq('id', id)
      .eq('user_id', user_id)
      .single();

    if (error) {
      console.error('Get booking error:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch booking',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ booking });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

module.exports = router;
