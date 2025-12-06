import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';

function MountainDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mountain, setMountain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [numberOfParticipants, setNumberOfParticipants] = useState(1);
  const [bookingType, setBookingType] = useState('joiner'); // 'joiner' or 'exclusive'
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [mountainDetails, setMountainDetails] = useState({ 
    what_to_bring: [], 
    budgeting: [], 
    itinerary: [], 
    how_to_get_there: [] 
  });
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('What to Bring');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [availability, setAvailability] = useState(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  useEffect(() => {
    fetchMountain();
    fetchMountainDetails();
    checkUser().catch(err => console.error('Error checking user:', err));
  }, [id]);

  // Auto-calculate end date based on start date and trip duration
  useEffect(() => {
    if (startDate && mountain?.trip_duration) {
      // Parse start date as local date to avoid timezone issues
      const [year, month, day] = startDate.split('-').map(Number);
      const start = new Date(year, month - 1, day);
      const end = new Date(start);
      
      // Add trip_duration days to get end date
      // e.g., 1 day trip starting on 5th → end on 6th (both dates included)
      end.setDate(end.getDate() + mountain.trip_duration);
      
      // Format as YYYY-MM-DD for date input (local date, no timezone conversion)
      const endYear = end.getFullYear();
      const endMonth = String(end.getMonth() + 1).padStart(2, '0');
      const endDay = String(end.getDate()).padStart(2, '0');
      const endDateString = `${endYear}-${endMonth}-${endDay}`;
      setEndDate(endDateString);
    } else if (startDate && !mountain?.trip_duration) {
      // Default to 1 day if trip_duration is not set
      const [year, month, day] = startDate.split('-').map(Number);
      const start = new Date(year, month - 1, day);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      const endYear = end.getFullYear();
      const endMonth = String(end.getMonth() + 1).padStart(2, '0');
      const endDay = String(end.getDate()).padStart(2, '0');
      const endDateString = `${endYear}-${endMonth}-${endDay}`;
      setEndDate(endDateString);
    } else if (!startDate) {
      setEndDate('');
    }
  }, [startDate, mountain?.trip_duration]);

  // Reset booking type when mountain changes
  useEffect(() => {
    if (mountain) {
      // Set default booking type based on availability
      if (!mountain.is_joiner_available && mountain.is_exclusive_available) {
        setBookingType('exclusive');
        // Set to joiner capacity for exclusive hikes
        if (mountain.joiner_capacity) {
          setNumberOfParticipants(mountain.joiner_capacity);
        }
      } else if (mountain.is_joiner_available) {
        setBookingType('joiner');
        setNumberOfParticipants(1);
      }
    }
  }, [mountain]);

  // Update number of participants when switching to exclusive
  useEffect(() => {
    if (bookingType === 'exclusive' && mountain?.joiner_capacity && numberOfParticipants !== mountain.joiner_capacity) {
      setNumberOfParticipants(mountain.joiner_capacity);
    } else if (bookingType === 'joiner' && numberOfParticipants > 20) {
      setNumberOfParticipants(20);
    }
  }, [bookingType, mountain?.joiner_capacity, numberOfParticipants]);

  // Fetch availability when dates change
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!mountain || !startDate || !endDate) {
        setAvailability(null);
        return;
      }

      try {
        setAvailabilityLoading(true);
        const response = await apiService.getAvailability(mountain.id, startDate, endDate);
        setAvailability(response.availability);
      } catch (err) {
        console.error('Error fetching availability:', err);
        setAvailability(null);
      } finally {
        setAvailabilityLoading(false);
      }
    };

    fetchAvailability();
  }, [mountain, startDate, endDate]);

  const checkUser = async () => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('authToken');
    
    if (userData && token) {
      setUser(JSON.parse(userData));
      
      // Verify token is still valid by checking current user
      try {
        await apiService.getCurrentUser();
      } catch (err) {
        // Token is invalid, clear user data
        console.warn('Token validation failed, clearing user data');
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  const fetchMountain = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMountain(id);
      setMountain(response.mountain);
    } catch (err) {
      console.error('Error fetching mountain:', err);
      setError('Mountain not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchMountainDetails = async () => {
    try {
      setDetailsLoading(true);
      const response = await apiService.getMountainDetails(id);
      setMountainDetails(response.data);
    } catch (err) {
      console.error('Error fetching mountain details:', err);
      // Keep default empty arrays if fetch fails
      setMountainDetails({ 
        what_to_bring: [], 
        budgeting: [], 
        itinerary: [], 
        how_to_get_there: [] 
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  // Calculate pricing based on booking type and trip duration
  const calculatePricing = () => {
    if (!mountain) return { joinerPricePerHead: 0, exclusivePrice: 0, totalPrice: 0 };

    const basePricePerHead = parseFloat(mountain.base_price_per_head) || 0;
    const tripDuration = mountain.trip_duration || 1;
    const joinerCapacity = parseInt(mountain.joiner_capacity) || 14;

    // Calculate joiner price per head
    let joinerPricePerHead = basePricePerHead;
    if (tripDuration >= 2) {
      joinerPricePerHead = basePricePerHead * (1 + 0.5 * (tripDuration - 1));
    }

    // Calculate exclusive price
    const exclusivePrice = joinerPricePerHead * joinerCapacity;

    // Calculate total price
    let totalPrice = 0;
    if (bookingType === 'exclusive') {
      totalPrice = exclusivePrice;
    } else {
      totalPrice = joinerPricePerHead * numberOfParticipants;
    }

    return {
      joinerPricePerHead: Math.round(joinerPricePerHead * 100) / 100,
      exclusivePrice: Math.round(exclusivePrice * 100) / 100,
      totalPrice: Math.round(totalPrice * 100) / 100
    };
  };

  const handleBookTrail = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowBookingModal(true);
    setStartDate('');
    setEndDate('');
    setNumberOfParticipants(1);
    setBookingType('joiner');
    setBookingError('');
    setBookingSuccess('');
  };

  const handleShareTrail = () => {
    setShowShareModal(true);
    // Generate share message
    const message = `Check out this amazing trail: ${mountain.name} in ${mountain.location}! ${mountain.description || ''} View more details at: ${window.location.href}`;
    setShareMessage(message);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Link copied to clipboard!');
    }
  };

  const shareViaWebAPI = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${mountain.name} - Trail Details`,
          text: shareMessage,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      copyToClipboard();
    }
  };

  const shareViaSocial = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(shareMessage);
    
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      setBookingError('Please log in to make a booking');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }
    
    if (!startDate || !endDate) {
      setBookingError('Please select both start and end dates');
      return;
    }

    if (!numberOfParticipants || numberOfParticipants < 1 || numberOfParticipants > 20) {
      setBookingError('Please enter a valid number of participants (1-20)');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      setBookingError('Start date must be in the future');
      return;
    }

    if (end < start) {
      setBookingError('End date must be after start date');
      return;
    }

    // Validate availability before submitting
    if (availability) {
      if (bookingType === 'joiner') {
        // Check if all dates have enough slots
        const insufficientSlots = Object.entries(availability).filter(([date, dateAvailability]) => {
          return dateAvailability.isExclusiveBooked || dateAvailability.joinerAvailable < numberOfParticipants;
        });
        
        if (insufficientSlots.length > 0) {
          const dates = insufficientSlots.map(([date]) => {
            const d = new Date(date + 'T00:00:00');
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }).join(', ');
          
          setBookingError(`Not enough slots available for ${numberOfParticipants} participant(s) on: ${dates}. Please reduce the number of participants or choose different dates.`);
          return;
        }
      } else if (bookingType === 'exclusive') {
        // Check if any date has existing bookings
        const unavailableDates = Object.entries(availability).filter(([date, dateAvailability]) => {
          return dateAvailability.isExclusiveBooked || dateAvailability.joinerBooked > 0;
        });
        
        if (unavailableDates.length > 0) {
          const dates = unavailableDates.map(([date]) => {
            const d = new Date(date + 'T00:00:00');
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }).join(', ');
          
          setBookingError(`Selected dates are not available for exclusive booking: ${dates}. Please choose different dates.`);
          return;
        }
      }
    }

    setBookingLoading(true);
    setBookingError('');

    try {
      // Verify token is still valid before booking
      try {
        await apiService.getCurrentUser();
      } catch (authErr) {
        // Token expired, redirect to login
        setBookingError('Your session has expired. Please log in again.');
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        setUser(null);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }
      
      await apiService.createBooking(mountain.id, startDate, endDate, numberOfParticipants, bookingType);
      setBookingSuccess('Booking request submitted! Your booking is now pending admin approval. You will be notified once it is confirmed.');
      // Optionally close the modal after a short delay
      setTimeout(() => {
        setShowBookingModal(false);
        setBookingSuccess('');
      }, 2000);
    } catch (err) {
      console.error('Booking error:', err);
      const errorMessage = err.message || 'Failed to create booking';
      
      // Provide more helpful error messages
      if (errorMessage.includes('overlaps')) {
        setBookingError('You already have a booking for this mountain during the selected dates. Please choose different dates or cancel your existing booking from your dashboard.');
      } else if (errorMessage.includes('token') || errorMessage.includes('expired')) {
        setBookingError('Your session has expired. Please log in again.');
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        setUser(null);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setBookingError(errorMessage);
      }
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading mountain details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !mountain) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⛰️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Mountain Not Found</h3>
          <p className="text-gray-600 mb-4">{error || 'This mountain does not exist.'}</p>
          <button
            onClick={() => navigate('/mountains')}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Back to Mountains
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/explore')}
          className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors mb-6 text-sm font-medium"
        >
          ← Back to Explore Trails
        </button>

        {/* Hero Section */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Image Gallery */}
            <div className="lg:w-2/3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Main Image */}
                <div className="md:col-span-3">
                  <div className="aspect-video rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-orange-500 to-orange-700">
                    {mountain.image_url ? (
                      <img 
                        src={mountain.image_url} 
                        alt={mountain.name} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-8xl mb-4">⛰️</div>
                          <p className="text-white text-xl font-semibold">{mountain.name}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Thumbnail Images */}
                <div className="space-y-4">
                  {mountain.additional_images && mountain.additional_images.length > 0 ? (
                    mountain.additional_images.slice(0, 3).map((img, index) => (
                      <div key={index} className="aspect-video rounded-lg overflow-hidden shadow-md bg-gradient-to-br from-gray-200 to-gray-300">
                        <img 
                          src={img} 
                          alt={`${mountain.name} - Image ${index + 2}`} 
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    ))
                  ) : (
                    [1, 2, 3].map((i) => (
                      <div key={i} className="aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <span className="text-2xl text-gray-500">⛰️</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Mountain Info */}
            <div className="lg:w-1/3">
              <div className="space-y-6 sticky top-8">
                {/* Mountain Details Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{mountain.name}</h1>
                <p className="text-gray-600 mb-6">{mountain.location}</p>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg mx-auto mb-2 ${
                      mountain.difficulty === 'Easy' ? 'bg-green-500' :
                      mountain.difficulty === 'Moderate' ? 'bg-yellow-500' :
                      mountain.difficulty === 'Hard' ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}>
                      {mountain.difficulty === 'Easy' ? '🟢' :
                       mountain.difficulty === 'Moderate' ? '🟡' :
                       mountain.difficulty === 'Hard' ? '🟠' : '🔴'}
                    </div>
                    <div className="text-xs text-gray-500">Difficulty</div>
                    <div className="text-sm font-semibold text-gray-900">{mountain.difficulty}</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg mx-auto mb-2">⏱️</div>
                    <div className="text-xs text-gray-500">Duration</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {mountain.difficulty === 'Easy' ? '2-4 hrs' :
                       mountain.difficulty === 'Moderate' ? '4-6 hrs' :
                       mountain.difficulty === 'Hard' ? '6-8 hrs' : '8+ hrs'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white text-lg mx-auto mb-2">📏</div>
                    <div className="text-xs text-gray-500">Length</div>
                    <div className="text-sm font-semibold text-gray-900">{mountain.elevation.toLocaleString()}m</div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {mountain.description || `${mountain.name} is a beautiful mountain located in ${mountain.location}. This ${mountain.difficulty.toLowerCase()} difficulty trail offers stunning views and a great hiking experience for outdoor enthusiasts.`}
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="space-y-3">
                  <button 
                    onClick={handleBookTrail}
                    className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all touch-manipulation min-h-[44px]"
                  >
                    {user ? 'Book This Trail' : 'Sign In to Book'}
                  </button>
                  <button 
                    onClick={handleShareTrail}
                    className="w-full px-4 py-3 border-2 border-orange-500 text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition-all touch-manipulation min-h-[44px]"
                  >
                    Share Trail
                  </button>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap sm:flex-nowrap gap-1 sm:gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
            {['What to Bring', 'Budgeting', 'Itinerary', 'How to get there'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-[120px] sm:min-w-0 px-3 sm:px-4 py-3 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors touch-manipulation min-h-[44px] flex items-center justify-center ${
                  activeTab === tab
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 active:bg-gray-200'
                }`}
              >
                <span className="whitespace-nowrap">{tab}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          {/* What to Bring Section */}
          {activeTab === 'What to Bring' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What to Bring?</h2>
            {detailsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="flex flex-col items-center p-4 bg-gray-50 rounded-xl animate-pulse">
                    <div className="w-12 h-12 bg-gray-300 rounded mb-2"></div>
                    <div className="w-20 h-4 bg-gray-300 rounded"></div>
                  </div>
                ))}
              </div>
            ) : mountainDetails.what_to_bring.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {mountainDetails.what_to_bring.map((item, index) => (
                  <div key={item.id || index} className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors">
                    <div className="text-3xl mb-2">{item.item_icon || '📦'}</div>
                    <div className="text-sm font-medium text-gray-900 text-center">{item.item_name}</div>
                    {item.item_description && (
                      <div className="text-xs text-gray-600 text-center mt-1">{item.item_description}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">🎒</div>
                <p>No items listed yet. Check back soon!</p>
              </div>
            )}
            </div>
          )}

          {/* Budgeting Section */}
          {activeTab === 'Budgeting' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Budgeting</h2>
            <p className="text-gray-600 mb-6">Fees and Regulations</p>
            {detailsLoading ? (
              <div className="grid md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200 animate-pulse">
                    <div className="w-20 h-8 bg-gray-300 rounded mb-2"></div>
                    <div className="w-16 h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="w-32 h-6 bg-gray-300 rounded"></div>
                  </div>
                ))}
              </div>
            ) : mountainDetails.budgeting.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-6">
                {mountainDetails.budgeting.map((item, index) => {
                  const colors = ['green', 'blue', 'purple', 'orange', 'red', 'indigo'];
                  const colorClass = colors[index % colors.length];
                  
                  return (
                    <div key={item.id || index} className={`bg-${colorClass}-50 rounded-xl p-6 border border-${colorClass}-200`}>
                      <div className={`text-2xl font-bold text-${colorClass}-800 mb-2`}>
                        ₱{item.item_amount ? parseFloat(item.item_amount).toFixed(2) : '0.00'}
                      </div>
                      <div className={`text-sm text-${colorClass}-700`}>
                        {item.item_unit || 'per person'}
                      </div>
                      <div className={`text-lg font-semibold text-${colorClass}-900 mt-2`}>
                        {item.item_name}
                      </div>
                      {item.item_description && (
                        <div className={`text-sm text-${colorClass}-600 mt-2`}>
                          {item.item_description}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">💰</div>
                <p>No fees listed yet. Check back soon!</p>
              </div>
            )}
            </div>
          )}

          {/* Itinerary Section */}
          {activeTab === 'Itinerary' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Day Hike Itinerary</h2>
            <p className="text-gray-600 mb-8">from Metro Manila</p>
            
            {detailsLoading ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="space-y-4">
                    <div className="w-32 h-6 bg-gray-300 rounded animate-pulse"></div>
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
                        <div className="flex-1 space-y-2">
                          <div className="w-64 h-4 bg-gray-300 rounded animate-pulse"></div>
                          <div className="w-96 h-3 bg-gray-300 rounded animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : mountainDetails.itinerary.length > 0 ? (
              <div className="space-y-6">
                {mountainDetails.itinerary.map((item, index) => (
                  <div key={item.id || index} className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      index < 2 ? 'bg-orange-500' : 
                      index < 4 ? 'bg-green-500' : 
                      'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {item.item_time && `${item.item_time} - `}{item.item_name}
                        {item.item_duration && ` (${item.item_duration})`}
                      </div>
                      {item.item_description && (
                        <div className="text-gray-600 text-sm mt-1">{item.item_description}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">⏰</div>
                <p>No itinerary available yet. Check back soon!</p>
              </div>
            )}
          </div>

          )}

          {/* How to Get There Section */}
          {activeTab === 'How to get there' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">How to get there?</h2>
            <p className="text-gray-600 mb-8">How to Commute to {mountain.name} from Metro Manila (Public Transport)</p>
            
            {detailsLoading ? (
              <div className="grid md:grid-cols-2 gap-8">
                {[...Array(2)].map((_, index) => (
                  <div key={index} className="space-y-4">
                    <div className="w-32 h-6 bg-gray-300 rounded animate-pulse"></div>
                    <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                      <div className="w-48 h-4 bg-gray-300 rounded animate-pulse"></div>
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-gray-300 rounded-full mt-1 animate-pulse"></div>
                          <div className="w-64 h-3 bg-gray-300 rounded animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : mountainDetails.how_to_get_there.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-8">
                {Object.entries(mountainDetails.how_to_get_there.reduce((acc, item) => {
                  const transportType = item.item_transport_type || 'both';
                  if (!acc[transportType]) {
                    acc[transportType] = [];
                  }
                  acc[transportType].push(item);
                  return acc;
                }, {})).map(([transportType, group]) => (
                  <div key={transportType}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {transportType === 'private' ? 'Private Vehicle' : 
                       transportType === 'public' ? 'Public Transportation' : 
                       'Transportation Options'}
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="space-y-3 text-sm text-gray-700">
                        {group.map((item, index) => (
                          <div key={item.id || index} className="flex items-start gap-2">
                            <span className={`mt-1 ${
                              transportType === 'private' ? 'text-orange-500' : 
                              transportType === 'public' ? 'text-blue-500' : 
                              'text-gray-500'
                            }`}>•</span>
                            <span>{item.item_name}</span>
                            {item.item_description && (
                              <div className="text-xs text-gray-600 mt-1">{item.item_description}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">🚗</div>
                <p>No transportation details available yet. Check back soon!</p>
              </div>
            )}
            </div>
          )}

          {/* Reminders Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Trail Reminders</h2>
                <p className="text-sm text-gray-500">
                  Quick checks before you head out to {mountain.name}.
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-xs font-medium text-green-700">
                <span>✓</span>
                <span>Pack smart, hike safe</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-stretch">
              {/* Checklist */}
              <div className="bg-gradient-to-b from-gray-50 to-white rounded-xl p-5 border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800 mb-4 uppercase tracking-wide">
                  Essentials Checklist
                </h3>
                <div className="space-y-3">
                  {[
                    "Travel earlier if commuting (by van, bus, and tricycle, allow more buffer time).",
                    "Wear proper hiking shoes; some parts of the trail are steep and rocky.",
                    "Bring enough water, trail snacks, and a packed lunch.",
                    "Guide fee is usually ₱750 for a group of 5 (mandatory).",
                    "Environmental + registration fee is around ₱100-₱120 total per person.",
                    "Optional: Bring swimwear and dry bag for river activities."
                  ].map((reminder, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600 text-xs">
                        ✓
                      </span>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {reminder}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety Card */}
              <div className="bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 rounded-xl p-6 flex items-center justify-center border border-orange-100">
                <div className="max-w-sm text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/70 shadow-sm">
                    <span className="text-3xl">⚠️</span>
                  </div>
                  <div className="text-sm font-semibold text-orange-900 tracking-wide uppercase mb-1">
                    Safety First
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    Respect the mountain and your limits.
                  </p>
                  <p className="text-sm text-gray-800 leading-relaxed">
                    Mountain climbing can be dangerous. Always hike with experienced, local guides,
                    check the latest weather, and be extra cautious on{" "}
                    <span className="font-semibold lowercase">{mountain.difficulty}</span> difficulty trails.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Explore {mountain.name}?</h2>
          <p className="text-xl mb-8 opacity-90">Plan your adventure and discover more amazing trails</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/explore')}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-orange-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors touch-manipulation min-h-[44px]"
            >
              Explore More Trails
            </button>
            <button
              onClick={() => navigate('/guides')}
              className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-orange-600 transition-colors touch-manipulation min-h-[44px]"
            >
              Browse Hiking Guides
            </button>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div 
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4 animate-fadeIn overscroll-contain"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowBookingModal(false);
            }
          }}
          style={{ willChange: 'opacity' }}
        >
          <div 
            className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-lg w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col animate-scaleIn overscroll-contain"
            style={{ willChange: 'transform', transform: 'translateZ(0)' }}
          >
            {/* Header */}
            <div className="flex-shrink-0 bg-white rounded-t-xl sm:rounded-t-2xl border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 pr-2">Book {mountain.name}</h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors touch-manipulation flex-shrink-0"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form 
              onSubmit={handleBookingSubmit} 
              className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {bookingError && (
                <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-3">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-800 text-sm font-medium">{bookingError}</p>
                  </div>
                </div>
              )}

              {bookingSuccess && (
                <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-3">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-green-800 text-sm font-medium">{bookingSuccess}</p>
                  </div>
                </div>
              )}

              {/* Date Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-3 py-3 sm:py-2.5 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all hover:border-gray-400 touch-manipulation"
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    End Date <span className="text-gray-500 text-xs font-normal">(Auto-calculated)</span>
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    readOnly
                    disabled
                    className="w-full px-3 py-3 sm:py-2.5 text-base sm:text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                    title={`Automatically calculated based on ${mountain?.trip_duration || 1} day${(mountain?.trip_duration || 1) > 1 ? 's' : ''} trip duration`}
                  />
                  {mountain?.trip_duration && (
                    <p className="text-xs text-gray-500 mt-1">
                      {mountain.trip_duration} day{mountain.trip_duration > 1 ? 's' : ''} trip duration
                    </p>
                  )}
                </div>
              </div>

              {/* Availability Information */}
              {startDate && endDate && (
                <div className={`border rounded-lg p-3 ${
                  availabilityLoading 
                    ? 'bg-gray-50 border-gray-200' 
                    : availability 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <span className={availabilityLoading ? 'text-gray-700' : availability ? 'text-blue-900' : 'text-yellow-900'}>
                      📅 Availability Status
                    </span>
                    {availabilityLoading && (
                      <span className="text-xs text-gray-500">(Loading...)</span>
                    )}
                  </h4>
                  {availabilityLoading ? (
                    <div className="text-xs text-gray-600 flex items-center gap-2">
                      <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Checking availability for selected dates...
                    </div>
                  ) : availability ? (
                    <div className="space-y-2">
                      {Object.entries(availability)
                        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                        .map(([date, dateAvailability]) => {
                        // Parse date as local date to avoid timezone issues
                        const [year, month, day] = date.split('-').map(Number);
                        const dateObj = new Date(year, month - 1, day);
                        const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                        
                        return (
                        <div key={date} className="text-xs bg-white rounded px-2 py-1.5 border border-blue-100">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">
                              {formattedDate}
                            </span>
                            {dateAvailability.isExclusiveBooked ? (
                              <span className="text-red-600 font-semibold flex items-center gap-1">
                                <span>🔒</span>
                                <span>Exclusively Booked</span>
                              </span>
                            ) : bookingType === 'joiner' ? (
                              <span className="flex items-center gap-2">
                                {dateAvailability.joinerAvailable > 0 ? (
                                  <span className="text-green-600 font-semibold">
                                    {dateAvailability.joinerAvailable} slot{dateAvailability.joinerAvailable !== 1 ? 's' : ''} available
                                  </span>
                                ) : (
                                  <span className="text-red-600 font-semibold">❌ Fully Booked</span>
                                )}
                                {dateAvailability.joinerBooked > 0 && (
                                  <span className="text-gray-500 text-xs">
                                    ({dateAvailability.joinerBooked} booked)
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span className="text-green-600 font-semibold flex items-center gap-1">
                                <span>✓</span>
                                <span>Available</span>
                              </span>
                            )}
                          </div>
                        </div>
                        );
                      })}
                      {bookingType === 'joiner' && Object.values(availability).some(a => a.joinerAvailable < numberOfParticipants) && (
                        <div className="bg-red-50 border border-red-200 rounded px-2 py-1.5 mt-2">
                          <div className="text-xs text-red-700 font-semibold flex items-center gap-1">
                            <span>⚠️</span>
                            <span>Not enough slots available for {numberOfParticipants} participant{numberOfParticipants !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      )}
                      {bookingType === 'exclusive' && Object.values(availability).some(a => a.isExclusiveBooked || a.joinerBooked > 0) && (
                        <div className="bg-red-50 border border-red-200 rounded px-2 py-1.5 mt-2">
                          <div className="text-xs text-red-700 font-semibold flex items-center gap-1">
                            <span>⚠️</span>
                            <span>Selected dates are not available for exclusive booking</span>
                          </div>
                        </div>
                      )}
                      {bookingType === 'joiner' && Object.values(availability).every(a => a.joinerAvailable >= numberOfParticipants && !a.isExclusiveBooked) && (
                        <div className="bg-green-50 border border-green-200 rounded px-2 py-1.5 mt-2">
                          <div className="text-xs text-green-700 font-semibold flex items-center gap-1">
                            <span>✓</span>
                            <span>All dates have enough slots available for your booking</span>
                          </div>
                        </div>
                      )}
                      {bookingType === 'exclusive' && Object.values(availability).every(a => !a.isExclusiveBooked && a.joinerBooked === 0) && (
                        <div className="bg-green-50 border border-green-200 rounded px-2 py-1.5 mt-2">
                          <div className="text-xs text-green-700 font-semibold flex items-center gap-1">
                            <span>✓</span>
                            <span>All dates are available for exclusive booking</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-yellow-700">
                      Select dates to see availability
                    </div>
                  )}
                </div>
              )}

              {/* Booking Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Booking Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setBookingType('joiner');
                      if (bookingType === 'exclusive') {
                        setNumberOfParticipants(1);
                      }
                    }}
                    disabled={!mountain?.is_joiner_available}
                    className={`p-4 rounded-xl border-2 transition-all touch-manipulation min-h-[44px] ${
                      bookingType === 'joiner'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-300 bg-white hover:border-gray-400 active:bg-gray-50'
                    } ${!mountain?.is_joiner_available ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 mb-1">Joiner Hike</div>
                      <div className="text-xs text-gray-600 mb-2">Shared Group</div>
                      <div className="text-xs text-gray-500">
                        Join a shared group hike with other hikers. Pricing is per head, and you only pay for the number of participants in your group.
                      </div>
                      {mountain?.is_joiner_available && calculatePricing().joinerPricePerHead > 0 && (
                        <div className="mt-2 space-y-1">
                          <div className="text-sm font-bold text-orange-600">
                            ₱{calculatePricing().joinerPricePerHead.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/head
                          </div>
                          {startDate && endDate && availability && (
                            <div className="text-xs">
                              {Object.values(availability).some(a => a.isExclusiveBooked) ? (
                                <span className="text-red-600 font-semibold">🔒 Dates blocked by exclusive booking</span>
                              ) : Object.values(availability).some(a => a.joinerAvailable === 0) ? (
                                <span className="text-red-600 font-semibold">❌ Some dates fully booked</span>
                              ) : (
                                <span className="text-green-600 font-semibold">
                                  ✓ {Math.min(...Object.values(availability).map(a => a.joinerAvailable))} slot{Math.min(...Object.values(availability).map(a => a.joinerAvailable)) !== 1 ? 's' : ''} min available
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBookingType('exclusive');
                      // Set to joiner capacity for exclusive hikes
                      if (mountain?.joiner_capacity) {
                        setNumberOfParticipants(mountain.joiner_capacity);
                      }
                    }}
                    disabled={!mountain?.is_exclusive_available}
                    className={`p-4 rounded-xl border-2 transition-all touch-manipulation min-h-[44px] ${
                      bookingType === 'exclusive'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-300 bg-white hover:border-gray-400 active:bg-gray-50'
                    } ${!mountain?.is_exclusive_available ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 mb-1">Exclusive Hike</div>
                      <div className="text-xs text-gray-600 mb-2">Private Group</div>
                      <div className="text-xs text-gray-500">
                        Enjoy a private hiking experience just for you and your group. No joiners will be added. The price is fixed and based on the total capacity.
                      </div>
                      {mountain?.is_exclusive_available && calculatePricing().exclusivePrice > 0 && (
                        <div className="mt-2 space-y-1">
                          <div className="text-sm font-bold text-orange-600">
                            ₱{calculatePricing().exclusivePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          {startDate && endDate && availability && (
                            <div className="text-xs">
                              {Object.values(availability).some(a => a.isExclusiveBooked || a.joinerBooked > 0) ? (
                                <span className="text-red-600 font-semibold">🔒 Dates not available</span>
                              ) : (
                                <span className="text-green-600 font-semibold">✓ Dates available</span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* Participants */}
              <div>
                <label htmlFor="numberOfParticipants" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Number of Participants (Pax) <span className="text-red-500">*</span>
                  {bookingType === 'exclusive' && (
                    <span className="text-xs text-gray-500 font-normal ml-2">(Fixed price, regardless of participants)</span>
                  )}
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setNumberOfParticipants(Math.max(1, numberOfParticipants - 1))}
                    disabled={numberOfParticipants <= 1 || bookingType === 'exclusive'}
                    className={`w-11 h-11 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg border-2 transition-all touch-manipulation ${
                      numberOfParticipants <= 1 || bookingType === 'exclusive'
                        ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
                        : 'border-gray-300 text-gray-700 hover:bg-orange-50 hover:border-orange-500 hover:text-orange-600 active:scale-95'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    id="numberOfParticipants"
                    value={numberOfParticipants}
                    onChange={(e) => {
                      if (bookingType === 'exclusive') return; // Prevent changes for exclusive
                      const value = parseInt(e.target.value) || 1;
                      if (value >= 1 && value <= 20) {
                        setNumberOfParticipants(value);
                      }
                    }}
                    min={1}
                    max={bookingType === 'exclusive' ? mountain?.joiner_capacity || 20 : 20}
                    required
                    disabled={bookingType === 'exclusive'}
                    readOnly={bookingType === 'exclusive'}
                    className={`flex-1 px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-center font-semibold text-gray-900 hover:border-gray-400 ${
                      bookingType === 'exclusive' ? 'bg-gray-50 cursor-not-allowed text-gray-600' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setNumberOfParticipants(Math.min(20, numberOfParticipants + 1))}
                    disabled={numberOfParticipants >= 20 || bookingType === 'exclusive'}
                    className={`w-11 h-11 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg border-2 transition-all touch-manipulation ${
                      numberOfParticipants >= 20 || bookingType === 'exclusive'
                        ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
                        : 'border-gray-300 text-gray-700 hover:bg-orange-50 hover:border-orange-500 hover:text-orange-600 active:scale-95'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Booking Details */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-4 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Booking Details</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500 font-medium">Trail:</span>
                    <span className="text-gray-900 font-semibold ml-1">{mountain.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Location:</span>
                    <span className="text-gray-900 font-semibold ml-1">{mountain.location}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Difficulty:</span>
                    <span className="text-gray-900 font-semibold ml-1">{mountain.difficulty}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Elevation:</span>
                    <span className="text-gray-900 font-semibold ml-1">{mountain.elevation.toLocaleString()}m</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Pax:</span>
                    <span className="text-gray-900 font-semibold ml-1">{numberOfParticipants}</span>
                  </div>
                  {startDate && endDate && (
                    <div className="col-span-2">
                      <span className="text-gray-500 font-medium">Date Range:</span>
                      <span className="text-gray-900 font-semibold ml-1">
                        {startDate === endDate 
                          ? new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : `${new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing Summary */}
              {mountain && (mountain.base_price_per_head > 0) && (
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl p-4 shadow-sm">
                  <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Pricing Summary</h4>
                  <div className="space-y-2.5 mb-3">
                    {bookingType === 'joiner' ? (
                      <>
                        <div className="flex justify-between items-center py-1.5">
                          <span className="text-sm text-gray-700 font-medium">Price per head:</span>
                          <span className="text-sm font-semibold text-gray-900">
                            ₱{calculatePricing().joinerPricePerHead.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1.5">
                          <span className="text-sm text-gray-700 font-medium">Number of participants:</span>
                          <span className="text-sm font-semibold text-gray-900">{numberOfParticipants}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-center py-1.5">
                          <span className="text-sm text-gray-700 font-medium">Exclusive price (full capacity):</span>
                          <span className="text-sm font-semibold text-gray-900">
                            ₱{calculatePricing().exclusivePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Based on {mountain.joiner_capacity || 14} pax capacity
                        </div>
                      </>
                    )}
                  </div>
                  <div className="border-t-2 border-orange-300 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900 text-base">Total Price:</span>
                      <span className="font-bold text-2xl text-orange-600">
                        ₱{calculatePricing().totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Fees Breakdown */}
              {mountainDetails.budgeting && mountainDetails.budgeting.length > 0 && (
                <div className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-sm">
                  <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Additional Fees</h4>
                  <div className="space-y-2.5 mb-3">
                    {mountainDetails.budgeting.map((fee, index) => {
                      const feeAmount = parseFloat(fee.item_amount || 0);
                      const totalForFee = feeAmount * numberOfParticipants;
                      return (
                        <div key={index} className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-b-0">
                          <div className="flex-1">
                            <span className="text-sm text-gray-700 font-medium">{fee.item_name}</span>
                            {numberOfParticipants > 1 && (
                              <span className="text-xs text-gray-500 ml-1.5">
                                (₱{feeAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} × {numberOfParticipants})
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            ₱{totalForFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t-2 border-gray-300 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900 text-base">Total Additional Fees:</span>
                      <span className="font-bold text-xl text-orange-600">
                        ₱{(
                          mountainDetails.budgeting.reduce((total, fee) => {
                            return total + (parseFloat(fee.item_amount || 0) * numberOfParticipants);
                          }, 0)
                        ).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex-shrink-0 bg-white border-t border-gray-200 -mx-4 sm:-mx-6 -mb-4 sm:-mb-5 px-4 sm:px-6 py-3 sm:py-4 rounded-b-xl sm:rounded-b-2xl flex gap-2 sm:gap-3" style={{ transform: 'translateZ(0)' }}>
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-4 py-3 sm:py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all active:scale-[0.98] touch-manipulation min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className={`flex-1 px-4 py-3 sm:py-2.5 rounded-lg font-semibold text-white transition-all shadow-lg touch-manipulation min-h-[44px] ${
                    bookingLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:shadow-xl active:scale-[0.98]'
                  }`}
                >
                  {bookingLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Booking...
                    </span>
                  ) : (
                    'Confirm Booking'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overscroll-contain">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto overscroll-contain">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Share Trail</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors touch-manipulation w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Share Message Preview */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Share Message</label>
                <textarea
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none"
                  rows="4"
                  placeholder="Share message..."
                />
              </div>

              {/* Share Options */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Share via</h4>
                
                {/* Native Share (Mobile) */}
                {navigator.share && (
                <button
                  onClick={shareViaWebAPI}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors touch-manipulation min-h-[44px]"
                >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                    </svg>
                    Share
                  </button>
                )}

                {/* Copy Link */}
                <button
                  onClick={copyToClipboard}
                  className="w-full flex items-center justify-center px-4 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors touch-manipulation min-h-[44px]"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Link
                </button>

                {/* Social Media Options */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => shareViaSocial('facebook')}
                    className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors touch-manipulation min-h-[44px]"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </button>

                  <button
                    onClick={() => shareViaSocial('twitter')}
                    className="flex items-center justify-center px-4 py-3 bg-sky-500 text-white rounded-lg font-semibold hover:bg-sky-600 transition-colors touch-manipulation min-h-[44px]"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    Twitter
                  </button>

                  <button
                    onClick={() => shareViaSocial('whatsapp')}
                    className="flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors touch-manipulation min-h-[44px]"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    WhatsApp
                  </button>

                  <button
                    onClick={() => shareViaSocial('telegram')}
                    className="flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors touch-manipulation min-h-[44px]"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                    Telegram
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MountainDetail;

