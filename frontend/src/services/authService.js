import api from './api';

export const authService = {
  login: async (email, password) => {
    // Attempting to hit the FastAPI backend
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Store token if successful
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      // Create a mock fallback for testing the UI if the backend is not running
      if (error.code === 'ERR_NETWORK' || error.response?.status >= 500 || error.response?.status === 404) {
        console.warn("Backend not reachable. Simulating successful login for UI development.");
        
        return new Promise((resolve) => {
          setTimeout(() => {
             const mockData = {
                 token: "mock-jwt-token-12345",
                 user: {
                     id: 1,
                     email: email,
                     name: "Demo Operator",
                 }
             };
             localStorage.setItem('token', mockData.token);
             resolve(mockData);
          }, 800);
        });
      }
      
      // otherwise, throw actual error
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getCurrentUser: () => {
    // In a real app we'd decode JWT or call /auth/me
    return localStorage.getItem('token') ? { loggedIn: true } : null;
  }
};
