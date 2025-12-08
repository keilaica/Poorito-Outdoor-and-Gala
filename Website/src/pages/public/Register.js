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
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    if (!acceptedTerms) {
      setError('You must accept the Terms & Conditions to create an account');
      setLoading(false);
      return;
    }

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
        
        // Redirect to home page
        navigate('/');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
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
              loading="eager"
              decoding="async"
              onError={(e) => {
                e.target.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'w-24 h-24 mx-auto bg-orange-600 rounded-full flex items-center justify-center shadow-xl mb-4 ring-4 ring-orange-100';
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

          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
            {/* Fake hidden inputs to prevent browser autofill */}
            <input type="text" name="fakeusernameremembered" style={{ display: 'none' }} tabIndex="-1" />
            <input type="password" name="fakepasswordremembered" style={{ display: 'none' }} tabIndex="-1" />
            
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
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck="false"
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
                autoComplete="new-email"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck="false"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck="false"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all pr-12 ${
                    formData.password && !isPasswordValid
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : formData.password && isPasswordValid
                      ? 'border-green-300'
                      : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 px-3 text-sm font-semibold text-orange-600 hover:text-orange-700 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
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
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck="false"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all pr-12 ${
                    formData.confirmPassword && !passwordsMatch
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : formData.confirmPassword && passwordsMatch
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                      : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 px-3 text-sm font-semibold text-orange-600 hover:text-orange-700 focus:outline-none"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
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

            {/* Terms & Conditions Section */}
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                "By signing up, you agree to our{' '}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-orange-600 hover:text-orange-700 font-semibold underline"
                >
                  Terms & Conditions
                </button>
                . Please review them carefully before creating your account."
              </p>
              
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  name="acceptTerms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 mr-3 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="acceptTerms" className="text-sm text-gray-700 cursor-pointer">
                  I have read and agree to the{' '}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-orange-600 hover:text-orange-700 font-semibold underline"
                  >
                    Terms & Conditions
                  </button>
                  .
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isPasswordValid || !passwordsMatch || !acceptedTerms}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
                loading || !isPasswordValid || !passwordsMatch || !acceptedTerms
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

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowTermsModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-orange-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Terms & Conditions</h2>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-white hover:text-gray-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-4 overflow-y-auto flex-1">
              <p className="text-gray-700 mb-6">
                Before creating an account, please read and accept the Terms and Conditions below:
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">1. Eligibility</h3>
                  <p className="text-gray-700">
                    By creating an account, you confirm that you are at least 18 years old or have parental/guardian permission to use this platform.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-2">2. Account Information</h3>
                  <p className="text-gray-700">
                    You agree to provide accurate and complete information during registration and to keep your account details updated at all times.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-2">3. Booking Responsibility</h3>
                  <p className="text-gray-700">
                    All bookings made through the platform must be reviewed carefully. You are responsible for verifying dates, prices, and other booking details before confirmation.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-2">4. Payments and Fees</h3>
                  <p className="text-gray-700">
                    You agree to pay all applicable fees associated with your bookings. Prices displayed are subject to change based on admin configuration.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-2">5. Cancellations and Refunds</h3>
                  <p className="text-gray-700">
                    Cancellation rules, refund eligibility, and timeline depend on the admin's policy for each mountain or event. Please review them before booking.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-2">6. User Conduct</h3>
                  <p className="text-gray-700">
                    You agree not to misuse the platform, including attempting unauthorized access, providing false information, or engaging in harmful or abusive behavior.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-2">7. Safety and Liability</h3>
                  <p className="text-gray-700">
                    By booking hikes or outdoor trips, you acknowledge that these activities involve risks. The platform is not liable for injuries, accidents, or losses during the activity. Always follow safety guidelines provided by hike organizers or local authorities.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-2">8. Privacy Policy</h3>
                  <p className="text-gray-700">
                    Your information will be collected and used according to our Privacy Policy. We will not share your personal data with third parties without your consent, except as required to process bookings.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-2">9. Modifications to the Terms</h3>
                  <p className="text-gray-700">
                    The platform may update these Terms & Conditions at any time. Continued use of the app signifies your acceptance of the updated terms.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-2">10. Acceptance of Terms</h3>
                  <p className="text-gray-700">
                    By checking the box and creating an account, you confirm that you have read, understood, and agreed to these Terms & Conditions.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;
