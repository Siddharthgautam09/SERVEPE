
import axios from 'axios';
import { ApiResponse, Project } from '@/types/api';

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

export const projectAPI = {
  async getAllProjects(params?: any): Promise<ApiResponse<Project[]>> {
    const response = await api.get('/projects', { params });
    return response.data as ApiResponse<Project[]>;
  },

  async getProject(id: string): Promise<ApiResponse<Project>> {
    const response = await api.get(`/projects/${id}`);
    return response.data as ApiResponse<Project>;
  },

  async createProject(projectData: any): Promise<ApiResponse<Project>> {
    const response = await api.post('/projects', projectData);
    return response.data as ApiResponse<Project>;
  },

  async updateProject(id: string, projectData: any): Promise<ApiResponse<Project>> {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data as ApiResponse<Project>;
  },

  async deleteProject(id: string): Promise<ApiResponse> {
    const response = await api.delete(`/projects/${id}`);
    return response.data as ApiResponse;
  },

  async getMyProjects(params?: any): Promise<ApiResponse<Project[]>> {
    const response = await api.get('/projects/my/projects', { params });
    return response.data as ApiResponse<Project[]>;
  }
};
