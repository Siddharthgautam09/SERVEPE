
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

export const orderAPI = {
  async createOrder(orderData: any): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>('/orders', orderData);
    return response.data;
  },

  async getMyOrders(params?: any): Promise<ApiResponse> {
    const response = await api.get<ApiResponse>('/orders/my-orders', { params });
    return response.data;
  },

  async getOrder(id: string): Promise<ApiResponse> {
    const response = await api.get<ApiResponse>(`/orders/${id}`);
    return response.data;
  },

  async updateOrderStatus(id: string, statusData: any): Promise<ApiResponse> {
    const response = await api.put<ApiResponse>(`/orders/${id}/status`, statusData);
    return response.data;
  },

  async submitDeliverables(id: string, formData: FormData): Promise<ApiResponse> {
    const response = await api.put<ApiResponse>(`/orders/${id}/deliverables`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async requestRevision(id: string, revisionData: any): Promise<ApiResponse> {
    const response = await api.put<ApiResponse>(`/orders/${id}/revision`, revisionData);
    return response.data;
  },

  async getOrderAnalytics(params?: any): Promise<ApiResponse> {
    const response = await api.get<ApiResponse>('/orders/analytics', { params });
    return response.data;
  },

  async downloadDeliverable(fileUrl: string): Promise<Blob> {
    const response = await api.get(fileUrl, {
      responseType: 'blob',
    });
    return response.data as Blob;
  }
};
