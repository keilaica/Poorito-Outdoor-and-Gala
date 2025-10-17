// API service for backend communication
const API_BASE_URL = 'http://localhost:5000/api';

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
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

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

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
