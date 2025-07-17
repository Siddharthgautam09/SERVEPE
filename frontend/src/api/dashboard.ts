import axios from 'axios';
import { ApiResponse } from '@/types/api';

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

export const dashboardAPI = {
  async getFreelancerStats(): Promise<ApiResponse<any>> {
    try {
      const response = await api.get('/dashboard/freelancer-stats');
      return {
        success: true,
        data: (response.data as any)?.data || response.data,
        message: 'Freelancer stats fetched successfully'
      };
    } catch (error: any) {
      console.error('Error fetching freelancer stats:', error);
      return { 
        success: false, 
        message: 'Failed to fetch freelancer stats', 
        data: null 
      };
    }
  },

  async getClientStats(): Promise<ApiResponse<any>> {
    try {
      const response = await api.get('/dashboard/client-stats');
      return {
        success: true,
        data: (response.data as any)?.data || response.data,
        message: 'Client stats fetched successfully'
      };
    } catch (error: any) {
      console.error('Error fetching client stats:', error);
      return { 
        success: false, 
        message: 'Failed to fetch client stats', 
        data: null 
      };
    }
  },

  async getOrders(): Promise<ApiResponse<any>> {
    try {
      const response = await api.get('/orders/my-orders');
      return {
        success: true,
        data: (response.data as any)?.data || response.data,
        message: 'Orders fetched successfully'
      };
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      return { 
        success: false, 
        message: 'Failed to fetch orders', 
        data: null 
      };
    }
  }
};
