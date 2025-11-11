export interface Location {
  latitude: number;
  longitude: number;
}

export interface Incident {
  id: string;
  type: IncidentType;
  severity: SeverityLevel;
  status: IncidentStatus;
  location: Location;
  title: string;
  description: string;
  reportedAt: string;
  updatedAt: string;
  verifiedBy?: string;
  radius?: number;
  estimatedClearTime?: string;
  source: 'official' | 'user' | 'api';
  metadata?: Record<string, any>;
}

export enum IncidentType {
  ROAD_CLOSURE = 'road_closure',
  FLOOD = 'flood',
  ACCIDENT = 'accident',
  BUSHFIRE = 'bushfire',
  CONSTRUCTION = 'construction',
  HAZARD = 'hazard',
  WEATHER = 'weather',
  TRAFFIC = 'traffic',
  OTHER = 'other'
}

export enum SeverityLevel {
  LOW = 1,
  MODERATE = 2,
  HIGH = 3,
  CRITICAL = 4,
  EXTREME = 5
}

export enum IncidentStatus {
  ACTIVE = 'active',
  MONITORING = 'monitoring',
  RESOLVED = 'resolved',
  UNVERIFIED = 'unverified'
}

export interface Route {
  origin: Location;
  destination: Location;
  waypoints: Location[];
  distance: number;
  duration: number;
  safetyScore: number;
  safetyDetails: SafetyScore;
  incidents: Incident[];
  recommendation: 'safe' | 'caution' | 'avoid';
  geometry?: Location[]; // Array of lat/lng points that follow real roads
  hasHazards?: boolean; // True if route intersects incident zones
  alternatives?: RouteAlternative[]; // Alternative route options
}

export interface RouteAlternative {
  routeId: number;
  geometry: Location[];
  distance: number; // kilometers
  duration: number; // minutes
  safetyScore: number;
  hasHazards: boolean;
  nearbyIncidents: number;
  avoidedIncidents: number;
  recommendation: 'safe' | 'caution' | 'avoid';
}

export interface SafetyScore {
  overall: number;
  factors: {
    incidentDensity: number;
    severityWeight: number;
    routeLength: number;
    weatherConditions: number;
  };
  recommendation: 'safe' | 'caution' | 'avoid';
}

export interface UserReport {
  id?: string;
  userId?: string;
  type: IncidentType;
  location: Location;
  description: string;
  photos?: string[];
  reportedAt?: string;
  verified?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface FilterOptions {
  types: IncidentType[];
  severity: SeverityLevel[];
  status: IncidentStatus[];
  startDate?: Date;
  endDate?: Date;
}
