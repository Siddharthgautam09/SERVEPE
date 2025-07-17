
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  token?: string;
  user?: any;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UsernameCheckResponse {
  success: boolean;
  available: boolean;
  message?: string;
}

// Re-export types from other files
export type { User } from './user';
export type { Service } from './service';

// Add missing types that are imported in API files
export interface Project {
  _id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  budget: {
    min: number;
    max: number;
    type: 'fixed' | 'hourly';
  };
  skills: string[];
  deadline: string;
  client: {
    _id: string;
    firstName: string;
    lastName: string;
    username?: string;
    profilePicture?: string;
  };
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  proposals: number;
  createdAt: string;
  updatedAt: string;
}

export interface Proposal {
  _id: string;
  project: string | Project;
  freelancer: {
    _id: string;
    firstName: string;
    lastName: string;
    username?: string;
    profilePicture?: string;
  };
  coverLetter: string;
  proposedBudget: number;
  deliveryTime: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

// Extend Window interface for custom properties
declare global {
  interface Window {
    usernameTimeout?: NodeJS.Timeout;
  }
}
