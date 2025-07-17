
import axios from 'axios';
import { ApiResponse, Service } from '@/types/api';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const serviceAPI = {
  async getAllServices(params?: any): Promise<ApiResponse<Service[]>> {
    try {
      const response = await api.get<ApiResponse<Service[]>>('/services', { params });
      return response.data;
    } catch (error) {
      console.error('Get all services error:', error);
      throw error;
    }
  },

  async getService(id: string): Promise<ApiResponse<Service>> {
    try {
      if (!id) {
        throw new Error('Service ID is required');
      }
      const response = await api.get<ApiResponse<Service>>(`/services/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get service error:', error);
      throw error;
    }
  },

  async createService(serviceData: any): Promise<ApiResponse<Service>> {
    try {
      // Validate required fields
      if (!serviceData.title || !serviceData.description || !serviceData.category) {
        throw new Error('Title, description, and category are required');
      }

      const formData = new FormData();
      
      // Add text fields
      formData.append('title', serviceData.title);
      formData.append('description', serviceData.description);
      formData.append('category', serviceData.category);
      if (serviceData.subcategory) formData.append('subcategory', serviceData.subcategory);
      
      // Safely stringify arrays
      if (serviceData.tags) {
        formData.append('tags', JSON.stringify(Array.isArray(serviceData.tags) ? serviceData.tags : []));
      }
      if (serviceData.pricingPlans) {
        formData.append('pricingPlans', JSON.stringify(serviceData.pricingPlans));
      }
      
      // Add images if they exist
      if (serviceData.images && serviceData.images.length > 0) {
        serviceData.images.forEach((image: File) => {
          if (image instanceof File) {
            formData.append('images', image);
          }
        });
      }

      const response = await api.post<ApiResponse<Service>>('/services', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      return response.data;
    } catch (error) {
      console.error('Create service error:', error);
      throw error;
    }
  },

  async updateService(id: string, serviceData: any): Promise<ApiResponse<Service>> {
    try {
      if (!id) {
        throw new Error('Service ID is required');
      }
      const response = await api.put<ApiResponse<Service>>(`/services/${id}`, serviceData);
      return response.data;
    } catch (error) {
      console.error('Update service error:', error);
      throw error;
    }
  },

  async deleteService(id: string): Promise<ApiResponse<void>> {
    try {
      if (!id) {
        throw new Error('Service ID is required');
      }
      const response = await api.delete<ApiResponse<void>>(`/services/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete service error:', error);
      throw error;
    }
  },

  async getMyServices(params?: any): Promise<ApiResponse<Service[]>> {
    try {
      const response = await api.get<ApiResponse<Service[]>>('/services/my/services', { params });
      return response.data;
    } catch (error) {
      console.error('Get my services error:', error);
      throw error;
    }
  },

  async uploadServiceImages(id: string, images: FormData): Promise<ApiResponse<any>> {
    try {
      if (!id) {
        throw new Error('Service ID is required');
      }
      if (!images) {
        throw new Error('Images are required');
      }
      const response = await api.post<ApiResponse<any>>(`/services/${id}/images`, images, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Upload service images error:', error);
      throw error;
    }
  },

  async getServiceAnalytics(id: string): Promise<ApiResponse<any>> {
    try {
      if (!id) {
        throw new Error('Service ID is required');
      }
      const response = await api.get<ApiResponse<any>>(`/services/${id}/analytics`);
      return response.data;
    } catch (error) {
      console.error('Get service analytics error:', error);
      throw error;
    }
  }
};
