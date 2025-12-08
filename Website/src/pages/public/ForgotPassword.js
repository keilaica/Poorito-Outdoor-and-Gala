import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiService from '../../services/api';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await apiService.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(err.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-block">
            <img
              src="/poorito-logo-nogb.png"
              alt="Poorito"
              className="w-24 h-24 mx-auto object-contain rounded-full shadow-xl mb-4 ring-4 ring-orange-100"
              onError={(e) => {
                e.target.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'w-24 h-24 mx-auto bg-orange-600 rounded-full flex items-center justify-center shadow-xl mb-4 ring-4 ring-orange-100';
                fallback.innerHTML = '<span class="text-white font-bold text-lg">POORITO</span>';
                e.target.parentElement?.appendChild(fallback);
              }}
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password</h1>
          <p className="text-gray-600">Enter your email to reset your password</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="text-red-500 mr-3">⚠️</div>
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}

          {success ? (
            <div className="text-center">
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-center">
                  <div className="text-green-500 mr-3 text-2xl">✓</div>
                  <p className="text-green-800 text-sm font-medium">
                    Password reset email sent! Please check your inbox.
                  </p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-6">
                We've sent a password reset link to <strong>{email}</strong>. 
                Please check your email and click the link to reset your password.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-lg hover:shadow-xl transition-all"
                >
                  Back to Login
                </button>
                <Link
                  to="/forgot-password"
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                  }}
                  className="block text-center text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Try different email
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="Enter your email"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-orange-500 hover:bg-orange-600 shadow-lg hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Sending...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          )}

          {/* Back to Login Link */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link 
                to="/login" 
                className="text-orange-600 hover:text-orange-700 font-semibold"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            © 2025 Poorito. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;

