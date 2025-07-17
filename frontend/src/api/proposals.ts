
import axios from 'axios';
import { ApiResponse, Proposal } from '@/types/api';

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

export const proposalAPI = {
  async getProposalsForProject(projectId: string, params?: any): Promise<ApiResponse<Proposal[]>> {
    const response = await api.get(`/proposals/project/${projectId}`, { params });
    return response.data as ApiResponse<Proposal[]>;
  },

  async submitProposal(projectId: string, proposalData: any): Promise<ApiResponse<Proposal>> {
    const response = await api.post(`/proposals/project/${projectId}`, proposalData);
    return response.data as ApiResponse<Proposal>;
  },

  async updateProposalStatus(id: string, statusData: any): Promise<ApiResponse<Proposal>> {
    const response = await api.put(`/proposals/${id}/status`, statusData);
    return response.data as ApiResponse<Proposal>;
  },

  async getMyProposals(params?: any): Promise<ApiResponse<Proposal[]>> {
    const response = await api.get('/proposals/my-proposals', { params });
    return response.data as ApiResponse<Proposal[]>;
  }
};
