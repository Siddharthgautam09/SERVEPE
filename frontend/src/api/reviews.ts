
import axios from 'axios';
import { ApiResponse } from '@/types/api';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const reviewAPI = {
  async createReview(reviewData: any): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>('/reviews', reviewData);
    return response.data;
  },

  async getOrderReview(orderId: string): Promise<ApiResponse> {
    const response = await api.get<ApiResponse>(`/reviews/order/${orderId}`);
    return response.data;
  },

  async getServiceReviews(serviceId: string, params?: any): Promise<ApiResponse> {
    const response = await api.get<ApiResponse>(`/reviews/service/${serviceId}`, { params });
    return response.data;
  },

  async getFreelancerReviews(freelancerId: string, params?: any): Promise<ApiResponse> {
    const response = await api.get<ApiResponse>(`/reviews/freelancer/${freelancerId}`, { params });
    return response.data;
  },

  async respondToReview(reviewId: string, responseData: any): Promise<ApiResponse> {
    const response = await api.put<ApiResponse>(`/reviews/${reviewId}/respond`, responseData);
    return response.data;
  }
};
