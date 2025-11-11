import axios from 'axios';
import { Incident, Route, UserReport, ApiResponse, FilterOptions } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const incidentService = {
  async getIncidents(filters?: Partial<FilterOptions>): Promise<Incident[]> {
    const params: any = {};
    
    if (filters?.types && filters.types.length > 0) {
      params.types = filters.types.join(',');
    }
    if (filters?.severity && filters.severity.length > 0) {
      params.severity = filters.severity.join(',');
    }
    if (filters?.status && filters.status.length > 0) {
      params.status = filters.status.join(',');
    }
    if (filters?.startDate) {
      params.startDate = filters.startDate.toISOString();
    }
    if (filters?.endDate) {
      params.endDate = filters.endDate.toISOString();
    }

    const response = await api.get<ApiResponse<Incident[]>>('/api/incidents', { params });
    return response.data.data || [];
  },

  async getIncidentById(id: string): Promise<Incident | null> {
    try {
      const response = await api.get<ApiResponse<Incident>>(`/api/incidents/${id}`);
      return response.data.data || null;
    } catch (error) {
      console.error('Error fetching incident:', error);
      return null;
    }
  },

  async refreshIncidents(): Promise<number> {
    const response = await api.post<ApiResponse<{ count: number }>>('/api/incidents/refresh');
    return response.data.data?.count || 0;
  },

  async getStatistics(): Promise<any> {
    const response = await api.get<ApiResponse<any>>('/api/stats');
    return response.data.data;
  },
};

export const routeService = {
  async calculateSafeRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    waypoints: { lat: number; lng: number }[] = []
  ): Promise<Route | null> {
    try {
      console.log('Calculating route:', { origin, destination, waypoints });
      
      const response = await api.post<ApiResponse<Route>>('/api/routes/safe', {
        origin: { latitude: origin.lat, longitude: origin.lng },
        destination: { latitude: destination.lat, longitude: destination.lng },
        waypoints: waypoints.map(w => ({ latitude: w.lat, longitude: w.lng })),
      });
      
      console.log('Route response:', response.data);
      
      if (!response.data.success) {
        console.error('Route calculation failed:', response.data.error);
        throw new Error(response.data.error || 'Failed to calculate route');
      }
      
      return response.data.data || null;
    } catch (error: any) {
      console.error('Error calculating route:', error);
      if (error.response) {
        console.error('Response error:', error.response.data);
      }
      throw error;
    }
  },
};

export const reportService = {
  async submitReport(report: UserReport): Promise<UserReport | null> {
    try {
      const response = await api.post<ApiResponse<UserReport>>('/api/reports', report);
      return response.data.data || null;
    } catch (error) {
      console.error('Error submitting report:', error);
      return null;
    }
  },

  async getReports(): Promise<UserReport[]> {
    try {
      const response = await api.get<ApiResponse<UserReport[]>>('/api/reports');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
  },

  async verifyReport(reportId: string, verifiedBy: string): Promise<UserReport | null> {
    try {
      const response = await api.post<ApiResponse<UserReport>>(`/api/reports/${reportId}/verify`, {
        verifiedBy,
      });
      return response.data.data || null;
    } catch (error) {
      console.error('Error verifying report:', error);
      return null;
    }
  },
};
