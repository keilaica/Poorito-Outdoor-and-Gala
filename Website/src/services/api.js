// API service for backend communication
// Use environment variable in production, fallback to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  // Clear authentication token
  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Get headers with auth token
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Always get the latest token from localStorage to handle token updates
    const token = localStorage.getItem('authToken') || this.token;
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Always get the latest token from localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      this.token = token;
    }
    
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      console.log(`API Request: ${options.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle token expiration - clear token and redirect to login
        if (response.status === 403 && data.error && data.error.includes('token')) {
          console.warn('Token expired or invalid, clearing authentication');
          this.clearToken();
          localStorage.removeItem('user');
          
          // Only redirect if we're not already on login/register pages
          if (!window.location.pathname.includes('/login') && 
              !window.location.pathname.includes('/register')) {
            // Store the current path to redirect back after login
            sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
            window.location.href = '/login';
          }
        }
        
        const errorMessage = data.error || `HTTP error! status: ${response.status}`;
        console.error(`API Error: ${response.status} - ${errorMessage}`);
        throw new Error(errorMessage);
      }

      console.log(`API Success: ${options.method || 'GET'} ${url}`);
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async logout() {
    this.clearToken();
    return this.request('/auth/logout', { method: 'POST' });
  }

  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token, newPassword) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password: newPassword }),
    });
  }

  // Mountains endpoints
  async getMountains() {
    return this.request('/mountains');
  }

  async getMountain(id) {
    return this.request(`/mountains/${id}`);
  }

  async createMountain(mountainData) {
    return this.request('/mountains', {
      method: 'POST',
      body: JSON.stringify(mountainData),
    });
  }

  async updateMountain(id, mountainData) {
    return this.request(`/mountains/${id}`, {
      method: 'PUT',
      body: JSON.stringify(mountainData),
    });
  }

  async deleteMountain(id) {
    return this.request(`/mountains/${id}`, {
      method: 'DELETE',
    });
  }

  async getMountainsByDifficulty(difficulty) {
    return this.request(`/mountains/difficulty/${difficulty}`);
  }

  // Articles endpoints
  async getArticles() {
    return this.request('/articles');
  }

  async getAdminArticles() {
    return this.request('/articles/admin');
  }

  async getArticle(id) {
    return this.request(`/articles/${id}`);
  }

  async createArticle(articleData) {
    return this.request('/articles', {
      method: 'POST',
      body: JSON.stringify(articleData),
    });
  }

  async updateArticle(id, articleData) {
    return this.request(`/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(articleData),
    });
  }

  async deleteArticle(id) {
    return this.request(`/articles/${id}`, {
      method: 'DELETE',
    });
  }

  async getArticlesByCategory(category) {
    return this.request(`/articles/category/${category}`);
  }

  // Analytics endpoints
  async getDashboardAnalytics() {
    return this.request('/analytics/dashboard');
  }

  async getMountainAnalytics() {
    return this.request('/analytics/mountains');
  }

  async getArticleAnalytics() {
    return this.request('/analytics/articles');
  }

  async getUserAnalytics() {
    return this.request('/analytics/users');
  }

  // Booking endpoints
  async getMyBookings() {
    return this.request('/bookings/my-bookings');
  }

  async createBooking(mountainId, startDate, endDate, numberOfParticipants = 1, bookingType = 'joiner') {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify({ 
        mountain_id: mountainId, 
        start_date: startDate,
        end_date: endDate,
        number_of_participants: numberOfParticipants,
        booking_type: bookingType
      }),
    });
  }

  async cancelBooking(bookingId) {
    return this.request(`/bookings/${bookingId}/cancel`, {
      method: 'PUT',
    });
  }

  async getBooking(bookingId) {
    return this.request(`/bookings/${bookingId}`);
  }

  async getBookingReceipt(bookingId) {
    return this.request(`/bookings/${bookingId}/receipt`);
  }

  async getAvailability(mountainId, startDate, endDate) {
    return this.request(`/bookings/availability/${mountainId}?start_date=${startDate}&end_date=${endDate}`);
  }

  // Admin booking management
  async getAllBookings(status = null) {
    const url = status 
      ? `/bookings/admin/all?status=${status}`
      : '/bookings/admin/all';
    return this.request(url);
  }

  async approveBooking(bookingId) {
    return this.request(`/bookings/${bookingId}/approve`, {
      method: 'PUT',
    });
  }

  async rejectBooking(bookingId) {
    return this.request(`/bookings/${bookingId}/reject`, {
      method: 'PUT',
    });
  }

  // Mountain details endpoints
  async getMountainDetails(mountainId) {
    return this.request(`/mountains/${mountainId}/details`);
  }

  async getAllMountainDetails() {
    // Fetch all mountains with their details
    return this.request('/mountains');
  }

  async createMountainDetail(detailData) {
    // Use new endpoint: POST /mountains/:mountainId/details/:sectionType
    const { mountain_id, section_type, ...itemData } = detailData;
    return this.request(`/mountains/${mountain_id}/details/${section_type}`, {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  async updateMountainDetail(detailId, detailData) {
    // Extract the necessary data
    const { mountain_id, section_type, ...itemData } = detailData;
    // Use new endpoint: PUT /mountains/:mountainId/details/:sectionType/:itemId
    return this.request(`/mountains/${mountain_id}/details/${section_type}/${detailId}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    });
  }

  async deleteMountainDetail(mountainId, sectionType, itemId) {
    // Use new endpoint: DELETE /mountains/:mountainId/details/:sectionType/:itemId
    return this.request(`/mountains/${mountainId}/details/${sectionType}/${itemId}`, {
      method: 'DELETE',
    });
  }

  async bulkUpdateMountainDetails(mountainId, detailsData) {
    return this.request(`/mountains/${mountainId}/details`, {
      method: 'PUT',
      body: JSON.stringify(detailsData),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
