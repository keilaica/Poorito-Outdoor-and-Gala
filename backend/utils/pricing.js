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
 * @deprecated This function computes exclusive price from joiner pricing, which is no longer used.
 * Exclusive price should now come directly from mountain.exclusive_price (admin-set value).
 * This function is kept for backward compatibility only.
 * 
 * Formula (legacy): exclusivePrice = joinerPricePerHead * joinerCapacity
 * 
 * @param {number} joinerPricePerHead - Calculated joiner price per head
 * @param {number} joinerCapacity - Maximum number of participants for joiner hikes
 * @returns {number} Calculated exclusive price (legacy computation)
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
 * IMPORTANT: Exclusive price comes directly from mountain.exclusive_price (admin-set value).
 * It is NOT computed from joiner prices or capacity. Exclusive pricing is independent of:
 * - Joiner price per head
 * - Number of participants
 * - Joiner capacity
 * - Duration-based pricing multipliers
 * 
 * @param {Object} mountain - Mountain object with pricing fields (must include exclusive_price for exclusive bookings)
 * @param {number} tripDuration - Number of days for the trip
 * @param {string} bookingType - 'joiner' or 'exclusive'
 * @param {number} numberOfParticipants - Number of participants (for joiner bookings, ignored for exclusive)
 * @returns {Object} Object containing all calculated prices
 */
function calculateBookingPrices(mountain, tripDuration, bookingType, numberOfParticipants = 1) {
  const basePricePerHead = parseFloat(mountain.base_price_per_head) || 0;
  const joinerCapacity = parseInt(mountain.joiner_capacity) || 14;

  // Calculate joiner price per head (with duration multiplier)
  const joinerPricePerHead = calculateJoinerPricePerHead(basePricePerHead, tripDuration);
  
  // Exclusive price comes directly from admin-set value, NOT computed
  // This is a fixed total price set by admin per mountain
  const exclusivePrice = parseFloat(mountain.exclusive_price) || 0;
  
  const totalPrice = calculateTotalPrice(bookingType, joinerPricePerHead, exclusivePrice, numberOfParticipants);

  return {
    basePricePerHead,
    joinerPricePerHead,
    exclusivePrice,
    totalPrice,
    joinerCapacity
  };
}

/**
 * Calculate final price based on booking type, base price, and number of joiners
 * 
 * Rules:
 * - JOINER PRICE: The price is per person and multiplies based on the number of joiners
 *   Final price = base_price * number_of_joiners
 * 
 * - EXCLUSIVE PRICE: The price is a fixed total amount and MUST NOT multiply based on the number of joiners
 *   Final price = base_price (ignores joiner count)
 * 
 * @param {string} type - 'EXCLUSIVE' or 'JOINER'
 * @param {number} basePrice - Base price (joiner_price_per_head for JOINER, exclusive_price for EXCLUSIVE)
 * @param {number} joiners - Number of participants/joiners
 * @returns {Object} Object containing type, joiner_count, base_price, final_price, and explanation
 * 
 * @example
 * // Example A (Exclusive)
 * calculateHikePrice('EXCLUSIVE', 18000, 12)
 * // Returns: { type: 'EXCLUSIVE', joiner_count: 12, base_price: 18000, final_price: 18000, explanation: '...' }
 * 
 * @example
 * // Example B (Joiner)
 * calculateHikePrice('JOINER', 999, 10)
 * // Returns: { type: 'JOINER', joiner_count: 10, base_price: 999, final_price: 9990, explanation: '...' }
 */
function calculateHikePrice(type, basePrice, joiners) {
  // Normalize type to uppercase
  const normalizedType = (type || '').toUpperCase();
  
  // Validate inputs
  const basePriceNum = parseFloat(basePrice) || 0;
  const joinerCount = parseInt(joiners) || 0;

  let finalPrice;
  let explanation;

  if (normalizedType === 'EXCLUSIVE') {
    // EXCLUSIVE: Fixed price, ignores joiner count
    finalPrice = basePriceNum;
    explanation = 'Exclusive hike uses fixed pricing; joiner count is ignored.';
  } else if (normalizedType === 'JOINER') {
    // JOINER: Price multiplies based on number of joiners
    finalPrice = basePriceNum * joinerCount;
    explanation = 'Joiner price multiplies based on number of participants.';
  } else {
    // Invalid type, default to 0
    finalPrice = 0;
    explanation = 'Invalid booking type.';
  }

  return {
    type: normalizedType,
    joiner_count: joinerCount,
    base_price: basePriceNum,
    final_price: finalPrice,
    explanation: explanation
  };
}

module.exports = {
  calculateJoinerPricePerHead,
  calculateExclusivePrice,
  calculateTotalPrice,
  calculateBookingPrices,
  calculateHikePrice
};


