
import axios from 'axios';
import { ApiResponse } from '@/types/api';

const API_BASE_URL = 'http://localhost:5000/api';

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

export interface Subcategory {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  servicesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  servicesCount: number;
  subcategories: Subcategory[];
  createdAt: string;
  updatedAt: string;
}

export const categoryAPI = {
  // Public routes
  async getAllCategories(): Promise<ApiResponse<Category[]>> {
    const response = await api.get<ApiResponse<Category[]>>('/categories');
    return response.data;
  },

  // Admin routes
  async getAdminCategories(params?: any): Promise<ApiResponse<Category[]>> {
    const response = await api.get<ApiResponse<Category[]>>('/categories/admin', { params });
    return response.data;
  },

  async createCategory(categoryData: { name: string; description: string }): Promise<ApiResponse<Category>> {
    const response = await api.post<ApiResponse<Category>>('/categories/admin', categoryData);
    return response.data;
  },

  async updateCategory(id: string, categoryData: Partial<Category>): Promise<ApiResponse<Category>> {
    const response = await api.put<ApiResponse<Category>>(`/categories/admin/${id}`, categoryData);
    return response.data;
  },

  async deleteCategory(id: string): Promise<ApiResponse> {
    const response = await api.delete<ApiResponse>(`/categories/admin/${id}`);
    return response.data;
  },

  // Subcategory routes
  async addSubcategory(categoryId: string, subcategoryData: { name: string; description: string }): Promise<ApiResponse<Category>> {
    const response = await api.post<ApiResponse<Category>>(`/categories/admin/${categoryId}/subcategories`, subcategoryData);
    return response.data;
  },

  async updateSubcategory(categoryId: string, subcategoryId: string, subcategoryData: Partial<Subcategory>): Promise<ApiResponse<Category>> {
    const response = await api.put<ApiResponse<Category>>(`/categories/admin/${categoryId}/subcategories/${subcategoryId}`, subcategoryData);
    return response.data;
  },

  async deleteSubcategory(categoryId: string, subcategoryId: string): Promise<ApiResponse> {
    const response = await api.delete<ApiResponse>(`/categories/admin/${categoryId}/subcategories/${subcategoryId}`);
    return response.data;
  }
};
