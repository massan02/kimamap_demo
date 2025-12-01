// API Service for Kimamap

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || (__DEV__ 
  ? 'http://localhost:3000/api' 
  : 'https://your-production-api.com/api');

// Types
export interface Location {
  lat: number;
  lng: number;
}

export interface PlanRequest {
  query: string;
  transportation: 'walk' | 'bicycle' | 'car';
  duration: number;
  returnToStart: boolean;
  startingLocation: Location;
}

export interface Spot {
  name: string;
  description: string;
  location: Location;
  stayDuration: number;
  address?: string;
}

export interface Plan {
  title: string;
  spots: Spot[];
  totalDuration: number;
}

export interface PlanResponse {
  message: string;
  request: PlanRequest;
  plan: Plan;
}

// API Functions
export const createPlan = async (request: PlanRequest): Promise<PlanResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create plan');
    }

    const data: PlanResponse = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
