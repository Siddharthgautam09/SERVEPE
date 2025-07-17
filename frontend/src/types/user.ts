export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  role: 'client' | 'freelancer' | 'admin';
  roleSelected: boolean;
  needsRoleSelection?: boolean;
  authProvider: 'otpless' | 'google' | 'email';
  otplessUserId?: string;
  googleId?: string;
  requirements?: any;
  requirementsCompleted: boolean;
  profilePicture?: string;
  
  // Enhanced freelancer fields
  title?: string;
  tagline?: string;
  location?: {
    country?: string;
    city?: string;
    address?: string;
  };
  skills?: Array<{
    name: string;
    level: 'beginner' | 'intermediate' | 'expert';
  }>;
  expertise?: string[];
  hourlyRate?: number;
  portfolio?: Array<{
    title: string;
    description: string;
    imageUrl?: string;
    projectUrl?: string;
  }>;
  bio?: string;
  experience?: string;
  totalExperienceYears?: number;
  companyBrand?: string;
  education?: Array<{
    institution: string;
    degree: string;
    field: string;
    startYear: number;
    endYear: number;
  }>;
  socialLinks?: {
    website?: string;
    linkedin?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    facebook?: string;
    github?: string;
  };
  rating?: {
    average: number;
    count: number;
  };
  isActive: boolean;
  isVerified: boolean;
  lastLogin?: Date;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}
