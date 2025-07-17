
import axios from 'axios';
import { ApiResponse, User } from '@/types/api';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Validate token format before sending
    const parts = token.split('.');
    if (parts.length === 3) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('API - Invalid token format detected, removing from localStorage');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
  return config;
});

// Handle auth errors in responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('API - Received 401, clearing auth data');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect if we're not already on a login page
      if (!window.location.pathname.includes('login') && !window.location.pathname.includes('otp-login')) {
        window.location.href = '/email-otp-login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  // Email OTP authentication
  async sendEmailOTP(email: string): Promise<ApiResponse<{ message: string }>> {
    const response = await api.post('/auth/send-email-otp', { email });
    return response.data as ApiResponse<{ message: string }>;
  },

  async verifyEmailOTP(email: string, otp: string): Promise<ApiResponse<User>> {
    const response = await api.post('/auth/verify-email-otp', { email, otp });
    const data = response.data as ApiResponse<User>;
    if (data.success && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user!));
    }
    return data;
  },

  async resendEmailOTP(email: string): Promise<ApiResponse<{ message: string }>> {
    const response = await api.post('/auth/resend-email-otp', { email });
    return response.data as ApiResponse<{ message: string }>;
  },

  // Google OAuth authentication
  async googleOAuth(code: string, redirectUri: string): Promise<ApiResponse<User>> {
    const response = await api.post('/auth/google-oauth', { code, redirectUri });
    const data = response.data as ApiResponse<User>;
    if (data.success && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user!));
    }
    return data;
  },

  // OTPless authentication
  async sendOTP(phoneNumber: string): Promise<ApiResponse<{ orderId: string }>> {
    const response = await api.post('/auth/send-otp', { phoneNumber });
    return response.data as ApiResponse<{ orderId: string }>;
  },

  async verifyOTP(phoneNumber: string, otp: string, orderId: string): Promise<ApiResponse<User>> {
    const response = await api.post('/auth/verify-otp', { phoneNumber, otp, orderId });
    const data = response.data as ApiResponse<User>;
    if (data.success && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user!));
    }
    return data;
  },

  async googleLogin(idToken: string): Promise<ApiResponse<User>> {
    const response = await api.post('/auth/google-login', { idToken });
    const data = response.data as ApiResponse<User>;
    if (data.success && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user!));
    }
    return data;
  },

  async selectRole(role: 'client' | 'freelancer'): Promise<ApiResponse<User>> {
    const response = await api.post('/auth/select-role', { role });
    const data = response.data as ApiResponse<User>;
    if (data.success && data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  // Traditional authentication
  async register(userData: any): Promise<ApiResponse<User>> {
    const response = await api.post('/auth/register', userData);
    const data = response.data as ApiResponse<User>;
    if (data.success && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user!));
    }
    return data;
  },

  async login(credentials: any): Promise<ApiResponse<User>> {
    const response = await api.post('/auth/login', credentials);
    const data = response.data as ApiResponse<User>;
    if (data.success && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user!));
    }
    return data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  async getMe(): Promise<ApiResponse<User>> {
    const response = await api.get('/auth/me');
    return response.data as ApiResponse<User>;
  },

  async updateProfile(profileData: any): Promise<ApiResponse<User>> {
    const response = await api.put('/auth/profile', profileData);
    const data = response.data as ApiResponse<User>;
    if (data.success && data.data) {
      localStorage.setItem('user', JSON.stringify(data.data));
    }
    return data;
  },

  async changePassword(passwordData: any): Promise<ApiResponse> {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data as ApiResponse;
  },

  async updateRequirements(requirements: any): Promise<ApiResponse<User>> {
    const response = await api.put('/auth/requirements', { requirements });
    const data = response.data as ApiResponse<User>;
    if (data.success && data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  }
};
