import { create } from 'zustand';\nimport { Incident, FilterOptions, Location, Route } from '../types';\nimport { incidentService, routeService } from '../services/api';\n\n// Debounce helper\nlet filterDebounceTimer: NodeJS.Timeout | null = null;

// Debounce helper
let filterDebounceTimer: NodeJS.Timeout | null = null;

interface AppState {
  // Incidents
  incidents: Incident[];
  filteredIncidents: Incident[];
  selectedIncident: Incident | null;
  filters: Partial<FilterOptions>;
  isLoadingIncidents: boolean;
  lastRefreshTime: Date | null;

  // Map
  userLocation: Location | null;
  mapCenter: Location;
  mapZoom: number;

  // Route
  origin: Location | null;
  destination: Location | null;
  currentRoute: Route | null;
  selectedAlternativeId: number | null; // Track which alternative route is selected
  isCalculatingRoute: boolean;

  // UI
  showFilters: boolean;
  showReportForm: boolean;
  activeLayer: 'all' | 'road_closure' | 'flood' | 'accident' | 'bushfire' | 'other';
  visibleIncidentTypes: Set<string>;

  // Actions
  setIncidents: (incidents: Incident[]) => void;
  setSelectedIncident: (incident: Incident | null) => void;
  setFilters: (filters: Partial<FilterOptions>) => void;
  applyFilters: () => void;
  fetchIncidents: () => Promise<void>;
  refreshIncidents: () => Promise<void>;

  setUserLocation: (location: Location) => void;
  setMapCenter: (location: Location) => void;
  setMapZoom: (zoom: number) => void;

  setOrigin: (location: Location | null) => void;
  setDestination: (location: Location | null) => void;
  calculateRoute: () => Promise<void>;
  clearRoute: () => void;
  selectAlternativeRoute: (alternativeId: number) => void;

  toggleFilters: () => void;
  toggleReportForm: () => void;
  setActiveLayer: (layer: AppState['activeLayer']) => void;
  toggleIncidentType: (type: string) => void;
  isIncidentTypeVisible: (type: string) => boolean;
  focusOnIncident: (incident: Incident) => void;
  debouncedApplyFilters: () => void;
}

// Default location: Darwin, NT
const DEFAULT_LOCATION: Location = {
  latitude: -12.4634,
  longitude: 130.8456,
};

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  incidents: [],
  filteredIncidents: [],
  selectedIncident: null,
  filters: {
    types: [],
    severity: [],
    status: [],
  },
  isLoadingIncidents: false,
  lastRefreshTime: null,

  userLocation: null,
  mapCenter: DEFAULT_LOCATION,
  mapZoom: 11,

  origin: null,
  destination: null,
  currentRoute: null,
  selectedAlternativeId: null,
  isCalculatingRoute: false,

  showFilters: false,
  showReportForm: false,
  activeLayer: 'all',
  visibleIncidentTypes: new Set(['road_closure', 'flood', 'accident', 'bushfire', 'construction', 'hazard', 'weather', 'traffic', 'other']),

  // Actions
  setIncidents: (incidents) => {
    set({ incidents });
    get().applyFilters();
  },

  setSelectedIncident: (incident) => set({ selectedIncident: incident }),

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
    get().applyFilters();
  },

  applyFilters: () => {
    const { incidents, filters, activeLayer, visibleIncidentTypes } = get();
    let filtered = [...incidents];

    // Filter by visible incident types (toggles)
    filtered = filtered.filter((i) => visibleIncidentTypes.has(i.type));

    // Filter by active layer
    if (activeLayer !== 'all') {
      filtered = filtered.filter((i) => i.type === activeLayer);
    }

    // Apply filters
    if (filters.types && filters.types.length > 0) {
      filtered = filtered.filter((i) => filters.types!.includes(i.type));
    }

    if (filters.severity && filters.severity.length > 0) {
      filtered = filtered.filter((i) => filters.severity!.includes(i.severity));
    }

    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter((i) => filters.status!.includes(i.status));
    }

    if (filters.startDate) {
      filtered = filtered.filter((i) => new Date(i.reportedAt) >= filters.startDate!);
    }

    if (filters.endDate) {
      filtered = filtered.filter((i) => new Date(i.reportedAt) <= filters.endDate!);
    }

    set({ filteredIncidents: filtered });
  },

  fetchIncidents: async () => {
    set({ isLoadingIncidents: true });
    try {
      const incidents = await incidentService.getIncidents(get().filters);
      get().setIncidents(incidents);
      set({ lastRefreshTime: new Date() });
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      set({ isLoadingIncidents: false });
    }
  },

  refreshIncidents: async () => {
    try {
      await incidentService.refreshIncidents();
      await get().fetchIncidents();
    } catch (error) {
      console.error('Error refreshing incidents:', error);
    }
  },

  setUserLocation: (location) => set({ userLocation: location }),
  setMapCenter: (location) => set({ mapCenter: location }),
  setMapZoom: (zoom) => set({ mapZoom: zoom }),

  setOrigin: (location) => set({ origin: location }),
  setDestination: (location) => set({ destination: location }),

  calculateRoute: async () => {
    const { origin, destination } = get();
    if (!origin || !destination) {
      console.error('Origin or destination not set');
      return;
    }

    console.log('Starting route calculation...', { origin, destination });
    set({ isCalculatingRoute: true, selectedAlternativeId: null }); // Reset alternative selection
    
    try {
      const route = await routeService.calculateSafeRoute(
        { lat: origin.latitude, lng: origin.longitude },
        { lat: destination.latitude, lng: destination.longitude }
      );
      
      console.log('Route calculated:', route);
      
      if (route) {
        set({ currentRoute: route, selectedAlternativeId: null }); // Default to primary route
      } else {
        console.error('Route is null');
        throw new Error('Failed to calculate route - received null response');
      }
    } catch (error: any) {
      console.error('Error calculating route:', error);
      alert(`Failed to calculate route: ${error.message || 'Unknown error'}`);
      set({ currentRoute: null });
    } finally {
      set({ isCalculatingRoute: false });
    }
  },

  clearRoute: () => set({ origin: null, destination: null, currentRoute: null, selectedAlternativeId: null }),

  selectAlternativeRoute: (alternativeId: number) => {
    set({ selectedAlternativeId: alternativeId });
  },

  toggleFilters: () => set((state) => ({ showFilters: !state.showFilters })),
  toggleReportForm: () => set((state) => ({ showReportForm: !state.showReportForm })),
  setActiveLayer: (layer) => {
    set({ activeLayer: layer });
    get().applyFilters();
  },

  toggleIncidentType: (type: string) => {
    const visibleTypes = new Set(get().visibleIncidentTypes);
    if (visibleTypes.has(type)) {
      visibleTypes.delete(type);
    } else {
      visibleTypes.add(type);
    }
    set({ visibleIncidentTypes: visibleTypes });
    get().debouncedApplyFilters();
  },

  debouncedApplyFilters: () => {
    if (filterDebounceTimer) {
      clearTimeout(filterDebounceTimer);
    }
    filterDebounceTimer = setTimeout(() => {
      get().applyFilters();
      // Optionally recalculate route if one exists
      const { origin, destination, currentRoute } = get();
      if (origin && destination && currentRoute) {
        get().calculateRoute();
      }
    }, 250);
  },

  isIncidentTypeVisible: (type: string) => {
    return get().visibleIncidentTypes.has(type);
  },

  focusOnIncident: (incident: Incident) => {
    // Set the incident as selected (in case we need it for other features)
    set({ selectedIncident: incident });
    
    // Center the map on the incident location
    set({ mapCenter: incident.location });
    
    // Zoom in to a closer level to see the incident clearly
    set({ mapZoom: 14 });
  },
}));
