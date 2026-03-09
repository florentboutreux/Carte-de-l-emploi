export interface JobOffer {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  lat: number;
  lng: number;
  distance?: number;
  contractType?: string;
  experienceLevel?: string;
  salary?: string;
  industry?: string;
  travelTime?: string;
  travelDistance?: string;
  transitTime?: string;
  transitSummary?: string;
  companyDescription?: string;
  website?: string;
  rating?: number;
}

export interface SearchFilters {
  contractType: string;
  experienceLevel: string;
  salaryRange: [number, number];
  industry: string;
}

export interface SearchParams {
  query: string;
  location: string;
  radius: number;
  lat?: number;
  lng?: number;
  filters?: SearchFilters;
  userAddress?: string;
}

export interface JobAlert {
  id: string;
  query: string;
  location: string;
  radius: number;
  filters: SearchFilters;
  emailEnabled: boolean;
  createdAt: string;
}
