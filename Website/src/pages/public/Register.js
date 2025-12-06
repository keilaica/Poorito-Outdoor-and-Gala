import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiService from '../../services/api';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Password requirements validation
  const validatePassword = (password) => {
    return {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  };

  const passwordRequirements = validatePassword(formData.password);
  const isPasswordValid = Object.values(passwordRequirements).every(req => req === true);
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== '';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!isPasswordValid) {
      setError('Password does not meet all requirements');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { username, email, password } = formData;
      const response = await apiService.register({ username, email, password });
      
      if (response.token) {
        // Store token and user info
        apiService.setToken(response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Redirect to user dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-block">
            <img
              src="/poorito-logo.jpg"
              alt="Poorito"
              className="w-24 h-24 mx-auto object-contain rounded-full shadow-xl mb-4 ring-4 ring-orange-100"
              onError={(e) => {
                e.target.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'w-24 h-24 mx-auto bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-xl mb-4 ring-4 ring-orange-100';
                fallback.innerHTML = '<span class="text-white font-bold text-lg">POORITO</span>';
                e.target.parentElement?.appendChild(fallback);
              }}
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join Poorito and start booking trails</p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="text-red-500 mr-3">⚠️</div>
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all ${
                  formData.password && !isPasswordValid
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : formData.password && isPasswordValid
                    ? 'border-green-300'
                    : 'border-gray-300'
                }`}
                placeholder="Enter your password"
              />
              {/* Password Requirements */}
              {formData.password && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Password Requirements:</p>
                  <ul className="space-y-1 text-xs">
                    <li className={`flex items-center ${passwordRequirements.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className="mr-2">{passwordRequirements.minLength ? '✓' : '○'}</span>
                      At least 8 characters
                    </li>
                    <li className={`flex items-center ${passwordRequirements.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className="mr-2">{passwordRequirements.hasUpperCase ? '✓' : '○'}</span>
                      One uppercase letter
                    </li>
                    <li className={`flex items-center ${passwordRequirements.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className="mr-2">{passwordRequirements.hasLowerCase ? '✓' : '○'}</span>
                      One lowercase letter
                    </li>
                    <li className={`flex items-center ${passwordRequirements.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className="mr-2">{passwordRequirements.hasNumber ? '✓' : '○'}</span>
                      One number
                    </li>
                    <li className={`flex items-center ${passwordRequirements.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className="mr-2">{passwordRequirements.hasSpecialChar ? '✓' : '○'}</span>
                      One special character (!@#$%^&*...)
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all ${
                  formData.confirmPassword && !passwordsMatch
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : formData.confirmPassword && passwordsMatch
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                    : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
                }`}
                placeholder="Confirm your password"
              />
              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div className="mt-2">
                  {passwordsMatch ? (
                    <p className="text-xs text-green-600 flex items-center">
                      <span className="mr-1">✓</span>
                      Passwords match
                    </p>
                  ) : (
                    <p className="text-xs text-red-600 flex items-center">
                      <span className="mr-1">✗</span>
                      Passwords do not match
                    </p>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !isPasswordValid || !passwordsMatch}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
                loading || !isPasswordValid || !passwordsMatch
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600 shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
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

export default Register;
