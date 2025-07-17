
export interface PricingPlan {
  title: string;
  description: string;
  price: number;
  deliveryTime: number;
  revisions: number;
  features: string[];
}

export interface ServiceImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface ServiceAddOn {
  title: string;
  description: string;
  price: number;
  deliveryTime: number;
}

export interface Freelancer {
  _id: string;
  firstName: string;
  lastName: string;
  username?: string;
  profilePicture?: string;
  rating?: {
    average: number;
    count: number;
  };
}

export interface Service {
  _id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  tags: string[];
  pricingPlans: {
    basic: PricingPlan;
    standard?: PricingPlan;
    premium?: PricingPlan;
  };
  addOns: ServiceAddOn[];
  images: ServiceImage[];
  freelancer: Freelancer;
  isActive: boolean;
  clicks: number;
  status: 'active' | 'paused' | 'draft' | 'pending';
  averageRating: number;
  totalReviews: number;
  impressions: number;
  orders: number;
  createdAt: string;
  updatedAt: string;
}
