
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

export const freelancerProjectAPI = {
  async getProjects(params?: any): Promise<ApiResponse> {
    try {
      const response = await api.get<ApiResponse>('/freelancer-projects', { params });
      return response.data;
    } catch (error) {
      return { success: false, message: 'Failed to fetch projects' };
    }
  },

  async getMyProjects(params?: any): Promise<ApiResponse> {
    try {
      const response = await api.get<ApiResponse>('/freelancer-projects/my', { params });
      return response.data;
    } catch (error) {
      return { success: false, message: 'Failed to fetch my projects' };
    }
  },

  async createProject(projectData: any): Promise<ApiResponse> {
    try {
      const response = await api.post<ApiResponse>('/freelancer-projects', projectData);
      return response.data;
    } catch (error) {
      return { success: false, message: 'Failed to create project' };
    }
  },

  async updateProject(id: string, projectData: any): Promise<ApiResponse> {
    try {
      const response = await api.put<ApiResponse>(`/freelancer-projects/${id}`, projectData);
      return response.data;
    } catch (error) {
      return { success: false, message: 'Failed to update project' };
    }
  },

  async deleteProject(id: string): Promise<ApiResponse> {
    try {
      const response = await api.delete<ApiResponse>(`/freelancer-projects/${id}`);
      return response.data;
    } catch (error) {
      return { success: false, message: 'Failed to delete project' };
    }
  },

  async getProject(id: string): Promise<ApiResponse> {
    try {
      const response = await api.get<ApiResponse>(`/freelancer-projects/${id}`);
      return response.data;
    } catch (error) {
      return { success: false, message: 'Failed to fetch project' };
    }
  },

  async uploadImage(formData: FormData): Promise<ApiResponse> {
    try {
      const response = await api.post<ApiResponse>('/freelancer-projects/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return { success: false, message: 'Failed to upload image' };
    }
  }
};
