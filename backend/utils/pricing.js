/**
 * Pricing calculation utilities for Joiner and Exclusive hikes
 */

/**
 * Calculate joiner price per head based on base price and trip duration
 * 
 * Rules:
 * - If duration = 1 day: joinerPricePerHead = basePricePerHead
 * - If duration ≥ 2 days: joinerPricePerHead = basePricePerHead * (1 + 0.5 * (duration - 1))
 * 
 * @param {number} basePricePerHead - Base price for 1 day, 1 pax
 * @param {number} tripDuration - Number of days for the trip
 * @returns {number} Calculated joiner price per head
 */
function calculateJoinerPricePerHead(basePricePerHead, tripDuration) {
  if (!basePricePerHead || basePricePerHead <= 0) {
    return 0;
  }

  if (tripDuration === 1) {
    return basePricePerHead;
  }

  if (tripDuration >= 2) {
    return basePricePerHead * (1 + 0.5 * (tripDuration - 1));
  }

  return basePricePerHead;
}

/**
 * Calculate exclusive price based on joiner price per head and joiner capacity
 * 
 * Formula: exclusivePrice = joinerPricePerHead * joinerCapacity
 * 
 * @param {number} joinerPricePerHead - Calculated joiner price per head
 * @param {number} joinerCapacity - Maximum number of participants for joiner hikes
 * @returns {number} Calculated exclusive price
 */
function calculateExclusivePrice(joinerPricePerHead, joinerCapacity) {
  if (!joinerPricePerHead || joinerPricePerHead <= 0) {
    return 0;
  }

  if (!joinerCapacity || joinerCapacity <= 0) {
    return 0;
  }

  return joinerPricePerHead * joinerCapacity;
}

/**
 * Calculate total price for a booking
 * 
 * @param {string} bookingType - 'joiner' or 'exclusive'
 * @param {number} joinerPricePerHead - Calculated joiner price per head
 * @param {number} exclusivePrice - Calculated exclusive price
 * @param {number} numberOfParticipants - Number of participants (for joiner bookings)
 * @returns {number} Total price for the booking
 */
function calculateTotalPrice(bookingType, joinerPricePerHead, exclusivePrice, numberOfParticipants = 1) {
  if (bookingType === 'exclusive') {
    return exclusivePrice;
  }

  // For joiner bookings, multiply price per head by number of participants
  return joinerPricePerHead * numberOfParticipants;
}

/**
 * Calculate all pricing for a mountain booking
 * 
 * @param {Object} mountain - Mountain object with pricing fields
 * @param {number} tripDuration - Number of days for the trip
 * @param {string} bookingType - 'joiner' or 'exclusive'
 * @param {number} numberOfParticipants - Number of participants (for joiner bookings)
 * @returns {Object} Object containing all calculated prices
 */
function calculateBookingPrices(mountain, tripDuration, bookingType, numberOfParticipants = 1) {
  const basePricePerHead = parseFloat(mountain.base_price_per_head) || 0;
  const joinerCapacity = parseInt(mountain.joiner_capacity) || 14;

  const joinerPricePerHead = calculateJoinerPricePerHead(basePricePerHead, tripDuration);
  const exclusivePrice = calculateExclusivePrice(joinerPricePerHead, joinerCapacity);
  const totalPrice = calculateTotalPrice(bookingType, joinerPricePerHead, exclusivePrice, numberOfParticipants);

  return {
    basePricePerHead,
    joinerPricePerHead,
    exclusivePrice,
    totalPrice,
    joinerCapacity
  };
}

module.exports = {
  calculateJoinerPricePerHead,
  calculateExclusivePrice,
  calculateTotalPrice,
  calculateBookingPrices
};

