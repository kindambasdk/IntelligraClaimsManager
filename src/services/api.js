// src/services/api.js
const AUTH_API_BASE = process.env.REACT_APP_AUTH_URL || 'https://regulate-fool-playtime.ngrok-free.dev/api';
const ENABLE_MOCK = process.env.REACT_APP_ENABLE_MOCK_DATA === 'true';
const LOGGING = process.env.REACT_APP_ENABLE_LOGGING === 'true';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }

  getToken() {
    return localStorage.getItem('token');
  }

  // ---------- HEADERS (with ngrok bypass) ----------
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token.trim()}`;
      }
    }
    return headers;
  }

  // ---------- PRIVATE REQUEST ----------
  async _request(endpoint, method = 'GET', body = null) {
    // Optional mock
    if (ENABLE_MOCK && endpoint.startsWith('/agent/customer/')) {
      const msisdn = endpoint.split('/').pop();
      return this.getMockCustomer(msisdn);
    }

    const url = `${AUTH_API_BASE}${endpoint}`;
    const headers = this.getHeaders(true);
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    if (LOGGING) {
      console.log(`🔹 [${method}] ${url}`);
      console.log('🔹 Headers:', headers);
    }

    try {
      const response = await fetch(url, options);
      const text = await response.text();

      if (LOGGING) {
        console.log(`🔹 [RESPONSE] Status: ${response.status} ${response.statusText}`);
        console.log(`🔹 [RESPONSE] Body: ${text.slice(0, 200)}`);
      }

      let json;
      try { json = JSON.parse(text); } catch {
        throw new Error(`Server returned non‑JSON: ${text.slice(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(json.message || `HTTP ${response.status}`);
      }
      if (!json.success) {
        throw new Error(json.message || 'Request failed');
      }
      return json;
    } catch (error) {
      console.error('❌ API Request Error:', error);
      throw error;
    }
  }

  async _requestBlob(endpoint) {
    const url = `${AUTH_API_BASE}${endpoint}`;
    const headers = this.getHeaders(true);
    const response = await fetch(url, { method: 'GET', headers });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `HTTP ${response.status}`);
    }
    return response.blob();
  }

  // ---------- MOCK DATA (optional) ----------
  getMockCustomer(msisdn) {
    return {
      success: true,
      data: {
        msisdn: msisdn || '255685968876',
        customerName: 'ARAFA CHOPEKE (MOCK)',
        imeiNumber: '359484731242890',
        model: 'ITEL A90',
        brand: 'ITEL',
        policyCreatedDate: '2025-09-04 16:20',
        rrp: 205000,
        insuranceCoverAmount: 7561,
        insuranceClaimDate: '2026-04-23T11:28:54.918653',
        covernoteRefNumber: '162101-250904-920619',
        program: 'crdb'
      }
    };
  }

  // ---------- AUTH ----------
  login(username, password) {
    const headers = this.getHeaders(false);
    return fetch(`${AUTH_API_BASE}/auth/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ username, password })
    }).then(res => {
      if (!res.ok) {
        return res.json().then(data => {
          throw new Error(data.message || `Login failed (HTTP ${res.status})`);
        });
      }
      return res.json();
    });
  }

  register(userData) {
    const headers = this.getHeaders(true);
    return fetch(`${AUTH_API_BASE}/auth/register`, {
      method: 'POST',
      headers,
      body: JSON.stringify(userData)
    }).then(res => res.json());
  }

  getCurrentUser() {
    const headers = this.getHeaders(true);
    return fetch(`${AUTH_API_BASE}/auth/me`, {
      method: 'GET',
      headers
    }).then(res => res.json());
  }

  // ---------- AGENT ----------
  searchCustomer(msisdn) {
    return this._request(`/agent/customer/${msisdn}`);
  }

  // Calculate excess amount based on fault date (for replacement)
  calculateExcess(msisdn, faultDate) {
    return this._request(`/agent/calculate-excess/${msisdn}/${faultDate}`);
  }

  // Check if Customer Care has added excess for a repair claim
  checkScreenDamageExcess(msisdn, claimDate) {
    return this._request(`/agent/check-excess/${msisdn}/${claimDate}`);
  }

  // Create replacement payment (agent)
  createReplacementPayment(payload) {
    return this._request('/agent/replacement-payment', 'POST', payload);
  }

  // Create screen damage (repair) payment (agent)
  createScreenDamagePayment(payload) {
    return this._request('/agent/screen-damage-payment', 'POST', payload);
  }

  // ---------- CUSTOMER CARE ----------
  // Add repair excess (uses repairAmount and faultDate)
  addScreenDamageExcess(payload) {
    return this._request('/customer-care/screen-damage-excess', 'POST', payload);
  }

  // ---------- FINANCE ----------
  getReport(startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return this._request(`/finance/report${query ? '?' + query : ''}`);
  }

  getReportCsv(startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return this._requestBlob(`/finance/report/csv${query ? '?' + query : ''}`);
  }

  getDashboardStats() {
    return this._request('/finance/dashboard/stats');
  }

  health() {
    return this._request('/health');
  }
}

export default new ApiClient();