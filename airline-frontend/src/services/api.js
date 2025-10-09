// API Service for connecting to backend (non-authentication endpoints)
// Authentication is now handled by Firebase
import { auth } from '../config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get Firebase token instead of JWT token
    let firebaseToken = null;
    if (auth.currentUser) {
      try {
        firebaseToken = await auth.currentUser.getIdToken();
      } catch (error) {
        console.warn('Could not get Firebase token:', error);
      }
    }
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(firebaseToken && { 'Authorization': `Bearer ${firebaseToken}` })
      }
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return { success: true, data };
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      return { 
        success: false, 
        error: error.message || 'Network error occurred' 
      };
    }
  }

  // Note: Authentication endpoints removed - now handled by Firebase
  // The backend can verify Firebase tokens if needed for protected routes

  // User management endpoints
  async getAllUsers() {
    return this.request('/users');
  }

  async getUserById(id) {
    return this.request(`/users/${id}`);
  }

  async updateUserRole(id, roleId) {
    return this.request(`/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ roleId })
    });
  }

  async toggleUserStatus(id) {
    return this.request(`/users/${id}/status`, {
      method: 'PUT'
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE'
    });
  }

  // Airline endpoints
  async getAllAirlines() {
    return this.request('/airlines');
  }

  async getAirlineById(id) {
    return this.request(`/airlines/${id}`);
  }

  // Flight endpoints
  async getAllFlights() {
    return this.request('/flights');
  }

  async searchFlights(params) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/flights/search?${queryString}`);
  }

  async getFlightById(id) {
    return this.request(`/flights/${id}`);
  }

  // Booking endpoints
  async createBooking(bookingData) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  }

  async getMyBookings() {
    return this.request('/bookings/my-bookings');
  }

  async getBookingById(id) {
    return this.request(`/bookings/${id}`);
  }

  async cancelBooking(id) {
    return this.request(`/bookings/${id}/cancel`, {
      method: 'PATCH'
    });
  }

  // Ticket endpoints
  async getMyTickets() {
    return this.request('/tickets/my-tickets');
  }

  async getTicketByNumber(ticketNumber) {
    return this.request(`/tickets/${ticketNumber}`);
  }

  async checkInTicket(ticketNumber) {
    return this.request(`/tickets/${ticketNumber}/check-in`, {
      method: 'POST'
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export default new ApiService();
