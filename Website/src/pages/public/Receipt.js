import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';

function Receipt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
    fetchReceipt();
  }, [id]);

  const checkAuth = () => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('authToken');
    
    if (!userData || !token) {
      navigate('/login');
      return;
    }
  };

  const fetchReceipt = async () => {
    try {
      setLoading(true);
      const response = await apiService.getBookingReceipt(id);
      setReceipt(response.receipt);
    } catch (err) {
      console.error('Error fetching receipt:', err);
      setError(err.message || 'Failed to load receipt');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateRange = (startDate, endDate) => {
    if (!startDate) return 'N/A';
    const start = formatDate(startDate);
    if (!endDate || startDate === endDate) {
      return start;
    }
    const end = formatDate(endDate);
    return `${start} - ${end}`;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600';
      case 'cancelled':
        return 'text-red-600';
      case 'completed':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Receipt Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The receipt you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-8">
      {/* Print Header - Hidden on screen, visible when printing */}
      <div className="hidden print:block mb-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Poorito</h1>
          <p className="text-gray-600">Booking Receipt</p>
        </div>
      </div>

      {/* Screen Header - Hidden when printing */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 print:hidden">
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 transition-colors"
          >
            🖨️ Print Receipt
          </button>
        </div>
      </div>

      {/* Receipt Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8 print:shadow-none print:rounded-none">
          {/* Receipt Header */}
          <div className="border-b-2 border-gray-200 pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Poorito</h1>
                <p className="text-gray-600">Trail Booking Receipt</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Receipt Number</p>
                <p className="text-lg font-semibold text-gray-900">{receipt.receipt_number}</p>
                <p className="text-sm text-gray-600 mt-2">Issued: {formatDateTime(receipt.issued_date)}</p>
              </div>
            </div>
          </div>

          {/* Booking Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Information</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-baseline">
                  <span className="w-40 text-gray-600">Booking ID:</span>
                  <span className="font-medium text-gray-900">#{receipt.booking_id}</span>
                </div>
                <div className="flex items-baseline">
                  <span className="w-40 text-gray-600">Booking Date:</span>
                  <span className="font-medium text-gray-900">
                    {formatDateRange(receipt.booking.start_date || receipt.booking.booking_date, receipt.booking.end_date || receipt.booking.booking_date)}
                  </span>
                </div>
                <div className="flex items-baseline">
                  <span className="w-40 text-gray-600">Status:</span>
                  <span className={`font-medium ${getStatusColor(receipt.booking.status)}`}>
                    {receipt.booking.status.charAt(0).toUpperCase() + receipt.booking.status.slice(1)}
                  </span>
                </div>
                {receipt.booking.number_of_participants && (
                  <div className="flex items-baseline">
                    <span className="w-40 text-gray-600">Participants:</span>
                    <span className="font-medium text-gray-900">
                      {receipt.booking.number_of_participants} {receipt.booking.number_of_participants === 1 ? 'person' : 'people'}
                    </span>
                  </div>
                )}
                <div className="flex items-baseline">
                  <span className="w-40 text-gray-600">Booked On:</span>
                  <span className="font-medium text-gray-900">{formatDateTime(receipt.booking.created_at)}</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Username:</span>
                  <span className="font-medium text-gray-900">{receipt.user.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-gray-900">{receipt.user.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mountain Details */}
          <div className="border-t-2 border-gray-200 pt-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Trail Details</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                {receipt.mountain?.image_url ? (
                  <img
                    src={receipt.mountain.image_url}
                    alt={receipt.mountain.name}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-3xl">⛰️</span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{receipt.mountain?.name}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-baseline">
                      <span className="w-24 text-gray-600">Location:</span>
                      <span className="font-medium text-gray-900">{receipt.mountain?.location}</span>
                    </div>
                    <div className="flex items-baseline">
                      <span className="w-24 text-gray-600">Difficulty:</span>
                      <span className="font-medium text-gray-900">{receipt.mountain?.difficulty}</span>
                    </div>
                    <div className="flex items-baseline">
                      <span className="w-24 text-gray-600">Elevation:</span>
                      <span className="font-medium text-gray-900">{receipt.mountain?.elevation}m</span>
                    </div>
                  </div>
                  {receipt.mountain?.description && (
                    <p className="text-sm text-gray-600 mt-3">{receipt.mountain.description}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Fees Breakdown */}
          {receipt.mountain?.budgeting && Array.isArray(receipt.mountain.budgeting) && receipt.mountain.budgeting.length > 0 && (
            <div className="border-t-2 border-gray-200 pt-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Fees Breakdown</h2>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="space-y-3 mb-4">
                  {receipt.mountain.budgeting.map((fee, index) => {
                    const feeAmount = parseFloat(fee.item_amount || 0);
                    const numberOfParticipants = receipt.booking.number_of_participants || 1;
                    const totalForFee = feeAmount * numberOfParticipants;
                    return (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex-1">
                          <span className="text-gray-900 font-medium">{fee.item_name}</span>
                          {numberOfParticipants > 1 && (
                            <span className="text-gray-500 text-sm ml-2">
                              (₱{feeAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} × {numberOfParticipants} {fee.item_unit || 'pax'})
                            </span>
                          )}
                          {numberOfParticipants === 1 && fee.item_unit && (
                            <span className="text-gray-500 text-sm ml-2">({fee.item_unit})</span>
                          )}
                        </div>
                        <span className="font-semibold text-gray-900">
                          ₱{totalForFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t-2 border-gray-300 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total Fees:</span>
                    <span className="text-2xl font-bold text-orange-600">
                      ₱{(
                        receipt.mountain.budgeting.reduce((total, fee) => {
                          const numberOfParticipants = receipt.booking.number_of_participants || 1;
                          return total + (parseFloat(fee.item_amount || 0) * numberOfParticipants);
                        }, 0)
                      ).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t-2 border-gray-200 pt-6 mt-8">
            <div className="text-center text-sm text-gray-600">
              <p className="mb-2">Thank you for booking with Poorito!</p>
              <p>For any inquiries, please contact us at support@poorito.com</p>
              <p className="mt-4 text-xs">This is an official booking receipt. Please keep this for your records.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Receipt;

