import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';

function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchBookings();
  }, []);

  const checkAuth = () => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('authToken');
    
    if (!userData || !token) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role === 'admin') {
      navigate('/admin');
      return;
    }

    setUser(parsedUser);
  };

  const fetchBookings = async () => {
    try {
      const response = await apiService.getMyBookings();
      setBookings(response.bookings || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const openCancelModal = (booking) => {
    setBookingToCancel(booking);
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    if (cancelLoading) return;
    setShowCancelModal(false);
    setBookingToCancel(null);
  };

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;

    try {
      setCancelLoading(true);
      await apiService.cancelBooking(bookingToCancel.id);
      await fetchBookings();
      closeCancelModal();
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Failed to cancel booking. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleLogout = () => {
    apiService.logout();
    localStorage.removeItem('user');
    navigate('/');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">⛰️</span>
            </div>
          </div>
          <p className="text-gray-700 font-semibold text-lg">Loading dashboard...</p>
          <p className="text-gray-500 text-sm mt-2">Preparing your adventure</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center group cursor-pointer" onClick={() => navigate('/')}>
              <div className="relative">
                <img
                  src="/poorito-logo.jpg"
                  alt="Poorito"
                  className="w-12 h-12 rounded-xl mr-3 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.className = 'w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mr-3 shadow-md group-hover:shadow-lg transition-all duration-300';
                    fallback.innerHTML = '<span class="text-white font-bold text-sm">P</span>';
                    e.target.parentElement?.appendChild(fallback);
                  }}
                />
              </div>
              <h1 className="text-2xl font-extrabold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent tracking-tight">
                Poorito
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-gray-900">Welcome back!</p>
                <p className="text-sm text-gray-600 font-medium">{user?.username}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 shadow-sm hover:shadow"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Header */}
        <div className="mb-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3 tracking-tight">
            My Dashboard
          </h2>
          <p className="text-lg text-gray-600 font-medium">
            Manage your trail bookings and explore new adventures
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <button
            onClick={() => navigate('/explore')}
            className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-xl hover:border-orange-200 transition-all duration-300 text-left transform hover:-translate-y-1"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <span className="text-2xl">🗺️</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              Explore Trails
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Discover new mountains and hiking trails
            </p>
          </button>

          <button
            onClick={() => navigate('/mountains')}
            className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-xl hover:border-green-200 transition-all duration-300 text-left transform hover:-translate-y-1"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <span className="text-2xl">⛰️</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
              All Mountains
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Browse all available mountains
            </p>
          </button>

          <button
            onClick={() => navigate('/guides')}
            className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-xl hover:border-purple-200 transition-all duration-300 text-left transform hover:-translate-y-1"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
              Hiking Guides
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Learn tips and techniques
            </p>
          </button>
        </div>

        {/* Bookings Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-2xl font-bold text-gray-900 mb-1">My Bookings</h3>
            <p className="text-sm text-gray-600 font-medium">Manage your trail bookings</p>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm">
                <div className="flex items-center">
                  <div className="text-red-500 mr-3 text-xl">⚠️</div>
                  <p className="text-red-800 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {bookings.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-7xl mb-6 animate-bounce">📅</div>
                <h4 className="text-2xl font-bold text-gray-900 mb-3">No Bookings Yet</h4>
                <p className="text-gray-600 mb-8 text-lg">Start exploring trails and book your first adventure!</p>
                <button
                  onClick={() => navigate('/explore')}
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Explore Trails
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {bookings.map((booking) => (
                  <div 
                    key={booking.id} 
                    className="border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-orange-200 transition-all duration-300 bg-gradient-to-r from-white to-gray-50/50 group"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-start gap-5 mb-4">
                          {booking.mountains?.image_url ? (
                            <img
                              src={booking.mountains.image_url}
                              alt={booking.mountains.name}
                              className="w-24 h-24 rounded-xl object-cover shadow-md group-hover:shadow-lg transition-shadow duration-300"
                            />
                          ) : (
                            <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300">
                              <span className="text-white text-3xl">⛰️</span>
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">
                              {booking.mountains?.name}
                            </h4>
                            <p className="text-gray-600 font-medium mb-3">{booking.mountains?.location}</p>
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className={`px-3 py-1.5 text-xs font-bold rounded-full shadow-sm ${getStatusColor(booking.status)}`}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                              <span className="text-sm text-gray-600 font-medium">
                                {booking.mountains?.difficulty} • {booking.mountains?.elevation}m
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700 bg-white/60 rounded-xl p-4 border border-gray-100">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">📅</span>
                            <span><strong className="text-gray-900">Booking Date:</strong> {formatDate(booking.booking_date)}</span>
                          </div>
                          {booking.number_of_participants && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">👥</span>
                              <span><strong className="text-gray-900">Participants:</strong> {booking.number_of_participants} {booking.number_of_participants === 1 ? 'person' : 'people'}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">🕐</span>
                            <span><strong className="text-gray-900">Booked On:</strong> {formatDate(booking.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 lg:min-w-[180px]">
                        <button
                          onClick={() => navigate(`/receipt/${booking.id}`)}
                          className="px-5 py-3 text-sm font-semibold text-blue-700 bg-blue-50 border-2 border-blue-200 rounded-xl hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                        >
                          📄 View Receipt
                        </button>
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => openCancelModal(booking)}
                            className="px-5 py-3 text-sm font-semibold text-red-700 bg-red-50 border-2 border-red-200 rounded-xl hover:bg-red-100 hover:border-red-300 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                          >
                            Cancel Booking
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/mountain/${booking.mountain_id}`)}
                          className="px-5 py-3 text-sm font-semibold text-orange-700 bg-orange-50 border-2 border-orange-200 rounded-xl hover:bg-orange-100 hover:border-orange-300 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cancel Booking Modal */}
        {showCancelModal && bookingToCancel && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 transform transition-all animate-scaleIn">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Cancel booking?</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    This will free up your slot on this trail and cannot be undone.
                  </p>
                </div>
                <button
                  onClick={closeCancelModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors text-2xl font-light hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="mb-8 rounded-xl bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 p-5 shadow-sm">
                <p className="font-bold text-lg text-gray-900 mb-3">
                  {bookingToCancel.mountains?.name || 'Selected trail'}
                </p>
                <div className="space-y-2 text-sm text-gray-700">
                  <p className="flex items-center gap-2">
                    <span className="text-gray-400">📅</span>
                    <span><span className="font-semibold text-gray-900">Booking Date:</span> {formatDate(bookingToCancel.booking_date)}</span>
                  </p>
                  {bookingToCancel.number_of_participants && (
                    <p className="flex items-center gap-2">
                      <span className="text-gray-400">👥</span>
                      <span><span className="font-semibold text-gray-900">Participants:</span> {bookingToCancel.number_of_participants} {bookingToCancel.number_of_participants === 1 ? 'person' : 'people'}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeCancelModal}
                  disabled={cancelLoading}
                  className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md"
                >
                  Keep Booking
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={cancelLoading}
                  className="px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-700 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 disabled:opacity-60 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {cancelLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Cancelling...
                    </span>
                  ) : (
                    'Yes, Cancel Booking'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
