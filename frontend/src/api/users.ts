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
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const userAPI = {
  async getUserByUsername(username: string): Promise<ApiResponse<any>> {
    const response = await api.get(`/users/${username}`);
    return response.data as ApiResponse<any>;
  },

  async checkUsernameAvailability(username: string): Promise<ApiResponse<{ available: boolean }>> {
    const response = await api.get(`/users/check-username/${username}`);
    return response.data as ApiResponse<{ available: boolean }>;
  },

  async updateProfile(profileData: any): Promise<ApiResponse<User>> {
    const response = await api.put('/users/profile', profileData);
    return response.data as ApiResponse<User>;
  },

  async getProfile(): Promise<ApiResponse<User>> {
    const response = await api.get('/users/profile');
    return response.data as ApiResponse<User>;
  },

  async searchUsers(username: string): Promise<ApiResponse<User[]>> {
    const response = await api.get(`/users/search/${username}`);
    return response.data as ApiResponse<User[]>;
  },

  async getFreelancers(params?: {
    skills?: string;
    category?: string;
    rating?: number;
    search?: string;
    sort?: string;
  }): Promise<ApiResponse<User[]>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get(`/users/freelancers?${queryParams.toString()}`);
    return response.data as ApiResponse<User[]>;
  }
};