// src/services/api.js

const API_BASE = process.env.REACT_APP_API_URL || 'https://regulate-fool-playtime.ngrok-free.dev/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, method = 'GET', body = null) {
    const url = `${API_BASE}${endpoint}`;
    const options = {
      method,
      headers: this.getHeaders(),
      mode: 'cors',
      credentials: 'include',
    };
    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        // If the response is a 401, clear the token
        if (response.status === 401) {
          this.setToken(null);
        }
        throw new Error(data.message || data.error || `HTTP ${response.status}`);
      }
      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // ============================================================
  // AUTHENTICATION
  // ============================================================

  login(username, password) {
    return this.request('/auth/login', 'POST', { username, password });
  }

  register(userData) {
    return this.request('/auth/register', 'POST', userData);
  }

  getCurrentUser() {
    return this.request('/auth/me');
  }

  // ============================================================
  // AGENT ENDPOINTS
  // ============================================================

  searchCustomer(msisdn) {
    return this.request(`/agent/customer/${msisdn}`);
  }

  createReplacementPayment(payload) {
    return this.request('/agent/replacement-payment', 'POST', payload);
  }

  createScreenDamagePayment(payload) {
    return this.request('/agent/screen-damage-payment', 'POST', payload);
  }

  checkScreenDamageExcess(msisdn, claimDate) {
    return this.request(`/agent/check-excess/${msisdn}/${claimDate}`);
  }

  // ============================================================
  // CUSTOMER CARE ENDPOINTS
  // ============================================================

  addScreenDamageExcess(payload) {
    return this.request('/customer-care/screen-damage-excess', 'POST', payload);
  }

  // ============================================================
  // FINANCE ENDPOINTS
  // ============================================================

  getReport(startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return this.request(`/finance/report${query ? '?' + query : ''}`);
  }

  getReportCsv(startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    // For CSV, we want the raw blob, not JSON.
    const url = `${API_BASE}/finance/report/csv${query ? '?' + query : ''}`;
    const options = {
      method: 'GET',
      headers: this.getHeaders(),
      mode: 'cors',
      credentials: 'include',
    };
    return fetch(url, options)
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => { throw new Error(err.message || 'CSV download failed'); });
        }
        return response.blob();
      });
  }

  getDashboardStats() {
    return this.request('/finance/dashboard/stats');
  }

  // ============================================================
  // HEALTH CHECK (public)
  // ============================================================

  health() {
    return fetch(`${API_BASE}/health`)
      .then(res => res.json())
      .catch(() => ({ success: false, message: 'Health check failed' }));
  }
}

// Singleton instance
export default new ApiClient();