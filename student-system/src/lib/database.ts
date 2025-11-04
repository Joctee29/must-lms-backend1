// API Base URL
const API_BASE_URL = 'https://must-lms-backend.onrender.com/api';

// API helper function
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'API call failed');
  }
  
  return data.data;
};

// Password management operations
export const passwordOperations = {
  // Authenticate user
  authenticate: async (username: string, password: string, userType: 'lecturer' | 'student') => {
    try {
      console.log('=== AUTHENTICATION ATTEMPT ===');
      console.log('Username:', username);
      console.log('User Type:', userType);
      console.log('API URL:', `${API_BASE_URL}/auth/login`);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, userType }),
      });
      
      const data = await response.json();
      console.log('Authentication Response:', data);
      
      if (data.success && data.data) {
        return {
          user_id: data.data.id,
          username: data.data.registration_number || data.data.employee_id || data.data.name,
          name: data.data.name,
          email: data.data.email,
          ...data.data
        };
      }
      
      return null;
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }
};
