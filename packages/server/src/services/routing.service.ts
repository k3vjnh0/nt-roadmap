import axios from 'axios';
import type { Incident, Location } from '../types';

interface OSRMCoordinate {
  latitude: number;
  longitude: number;
}

interface OSRMRoute {
  geometry: {
    coordinates: [number, number][]; // [lng, lat] format
  };
  distance: number; // meters
  duration: number; // seconds
  weight?: number; // route weight (can be used for optimization)
}

interface OSRMResponse {
  code: string;
  routes: OSRMRoute[];
}

interface RouteWithSafety {
  geometry: OSRMCoordinate[];
  distance: number;
  duration: number;
  safetyScore: number;
  avoidedIncidents: number;
  nearbyIncidents: Incident[];
  hasHazards: boolean;
}

/**
 * Advanced routing service using OSRM with incident avoidance
 * Implements intelligent routing that:
 * - Avoids incident zones dynamically
 * - Provides multiple route alternatives
 * - Uses weighted routing based on safety scores
 * - Recalculates if routes intersect hazards
 */
class RoutingService {
  private readonly OSRM_BASE_URL = 'https://router.project-osrm.org';
  private readonly INCIDENT_BUFFER_DISTANCE = 500; // meters - route should avoid within this distance
  private readonly INCIDENT_WARNING_DISTANCE = 2000; // meters - warn if incident is within this distance
  private readonly MAX_ALTERNATIVES = 3;

  /**
   * Calculate multiple safe route alternatives with incident avoidance
   * @param origin Starting point
   * @param destination End point
   * @param incidents Active incidents to avoid
   * @param waypoints Optional intermediate waypoints
   * @returns Array of route alternatives with safety scores
   */
  async calculateSafeRoutes(
    origin: OSRMCoordinate,
    destination: OSRMCoordinate,
    incidents: Incident[],
    waypoints: OSRMCoordinate[] = []
  ): Promise<RouteWithSafety[]> {
    console.log(`\n🛣️  Calculating safe routes with ${incidents.length} incidents to avoid...`);

    try {
      // Get multiple route alternatives from OSRM
      const routes = await this.getRouteAlternatives(origin, destination, waypoints);
      
      // Analyze each route for safety and incidents
      const routesWithSafety: RouteWithSafety[] = [];

      for (let i = 0; i < routes.length; i++) {
        const route = routes[i];
        const geometry = route.geometry.coordinates.map(coord => ({
          longitude: coord[0],
          latitude: coord[1],
        }));

        // Check if route intersects any critical incident zones
        const { hasHazards, nearbyIncidents, avoidedCount, safetyScore } = 
          this.analyzeRouteSafety(geometry, incidents);

        routesWithSafety.push({
          geometry,
          distance: route.distance,
          duration: route.duration,
          safetyScore,
          avoidedIncidents: avoidedCount,
          nearbyIncidents,
          hasHazards,
        });

        console.log(`Route ${i + 1}: ${(route.distance / 1000).toFixed(2)}km, ` +
          `${(route.duration / 60).toFixed(1)}min, ` +
          `Safety: ${safetyScore}/100, ` +
          `Hazards: ${hasHazards ? 'YES' : 'NO'}, ` +
          `Nearby incidents: ${nearbyIncidents.length}`);
      }

      // Sort routes by safety score (highest first)
      routesWithSafety.sort((a, b) => {
        // Prioritize routes without hazards
        if (a.hasHazards !== b.hasHazards) {
          return a.hasHazards ? 1 : -1;
        }
        // Then by safety score
        return b.safetyScore - a.safetyScore;
      });

      // If the best route has hazards, try to find detours
      if (routesWithSafety[0]?.hasHazards) {
        console.log('⚠️  Best route intersects hazards, attempting detour...');
        const detourRoute = await this.calculateDetourRoute(
          origin, 
          destination, 
          routesWithSafety[0].nearbyIncidents,
          waypoints
        );
        
        if (detourRoute && !detourRoute.hasHazards) {
          console.log('✓ Detour route found without hazards');
          routesWithSafety.unshift(detourRoute);
        }
      }

      console.log(`✓ Returning ${routesWithSafety.length} route alternatives\n`);
      return routesWithSafety;

    } catch (error: any) {
      console.error('Error calculating safe routes:', error.message);
      
      // Fallback: return basic route
      const fallbackRoute = await this.calculateBasicRoute(origin, destination, waypoints);
      const { hasHazards, nearbyIncidents, avoidedCount, safetyScore } = 
        this.analyzeRouteSafety(fallbackRoute.geometry, incidents);

      return [{
        ...fallbackRoute,
        safetyScore,
        avoidedIncidents: avoidedCount,
        nearbyIncidents,
        hasHazards,
      }];
    }
  }

  /**
   * Get route alternatives from OSRM
   */
  private async getRouteAlternatives(
    origin: OSRMCoordinate,
    destination: OSRMCoordinate,
    waypoints: OSRMCoordinate[] = []
  ): Promise<OSRMRoute[]> {
    try {
      // Build coordinate string: origin, waypoints (if any), destination
      const coordinates = [
        origin,
        ...waypoints,
        destination,
      ].map(coord => `${coord.longitude},${coord.latitude}`).join(';');

      // Call OSRM routing API
      // alternatives=true to get multiple route options
      // number=3 to get up to 3 alternatives
      const url = `${this.OSRM_BASE_URL}/route/v1/driving/${coordinates}`;
      const params = {
        geometries: 'geojson',
        overview: 'full',
        steps: 'false',
        alternatives: 'true',
        number: this.MAX_ALTERNATIVES.toString(),
      };

      console.log('Calling OSRM API:', url);
      
      const response = await axios.get<OSRMResponse>(url, { 
        params,
        timeout: 15000, // 15 second timeout
      });

      console.log('OSRM Response code:', response.data.code);

      if (response.data.code !== 'Ok') {
        throw new Error(`OSRM returned code: ${response.data.code}`);
      }

      if (!response.data.routes || response.data.routes.length === 0) {
        throw new Error('No route found by OSRM');
      }

      console.log(`✓ Received ${response.data.routes.length} route alternatives from OSRM`);
      return response.data.routes;

    } catch (error: any) {
      console.error('Error fetching route alternatives:', error.message);
      
      // Return single basic route as fallback
      const basicRoute = await this.calculateBasicRoute(origin, destination, waypoints);
      return [{
        geometry: {
          coordinates: basicRoute.geometry.map(p => [p.longitude, p.latitude] as [number, number])
        },
        distance: basicRoute.distance,
        duration: basicRoute.duration,
      }];
    }
  }

  /**
   * Calculate a basic single route (used as fallback)
   */
  async calculateBasicRoute(
    origin: OSRMCoordinate,
    destination: OSRMCoordinate,
    waypoints: OSRMCoordinate[] = []
  ): Promise<{
    geometry: OSRMCoordinate[];
    distance: number;
    duration: number;
  }> {
    try {
      const coordinates = [origin, ...waypoints, destination]
        .map(coord => `${coord.longitude},${coord.latitude}`).join(';');

      const url = `${this.OSRM_BASE_URL}/route/v1/driving/${coordinates}`;
      const response = await axios.get<OSRMResponse>(url, { 
        params: {
          geometries: 'geojson',
          overview: 'full',
        },
        timeout: 10000,
      });

      if (response.data.code === 'Ok' && response.data.routes[0]) {
        const route = response.data.routes[0];
        const geometry = route.geometry.coordinates.map(coord => ({
          longitude: coord[0],
          latitude: coord[1],
        }));

        return {
          geometry,
          distance: route.distance,
          duration: route.duration,
        };
      }
    } catch (error) {
      console.error('OSRM basic route failed, using fallback');
    }

    return this.calculateStraightLineRoute(origin, destination, waypoints);
  }

  /**
   * Fallback: Calculate a straight line route when OSRM is unavailable
   */
  private calculateStraightLineRoute(
    origin: OSRMCoordinate,
    destination: OSRMCoordinate,
    waypoints: OSRMCoordinate[] = []
  ): {
    geometry: OSRMCoordinate[];
    distance: number;
    duration: number;
  } {
    const points = [origin, ...waypoints, destination];
    
    // Calculate total distance
    let totalDistance = 0;
    for (let i = 0; i < points.length - 1; i++) {
      totalDistance += this.calculateDistance(points[i], points[i + 1]);
    }

    // Estimate duration (assume 50 km/h average)
    const duration = (totalDistance / 1000) * (3600 / 50); // seconds

    return {
      geometry: points,
      distance: totalDistance,
      duration,
    };
  }

  /**
   * Analyze route safety by checking for incidents along the path
   */
  private analyzeRouteSafety(
    geometry: OSRMCoordinate[],
    incidents: Incident[]
  ): {
    hasHazards: boolean;
    nearbyIncidents: Incident[];
    avoidedCount: number;
    safetyScore: number;
  } {
    const nearbyIncidents: Incident[] = [];
    let criticalIncidents = 0;
    let warningIncidents = 0;

    // Check each incident against route points
    for (const incident of incidents) {
      let minDistance = Infinity;

      // Find closest point on route to this incident
      for (const point of geometry) {
        const distance = this.calculateDistance(point, incident.location);
        if (distance < minDistance) {
          minDistance = distance;
        }
      }

      // Categorize based on distance
      if (minDistance <= this.INCIDENT_BUFFER_DISTANCE) {
        criticalIncidents++;
        nearbyIncidents.push(incident);
      } else if (minDistance <= this.INCIDENT_WARNING_DISTANCE) {
        warningIncidents++;
        nearbyIncidents.push(incident);
      }
    }

    const hasHazards = criticalIncidents > 0;
    const avoidedCount = incidents.length - nearbyIncidents.length;

    // Calculate safety score (0-100)
    // Start at 100, reduce for each nearby incident
    let safetyScore = 100;
    safetyScore -= criticalIncidents * 30; // -30 for each critical incident
    safetyScore -= warningIncidents * 10;  // -10 for each warning-level incident
    safetyScore = Math.max(0, Math.min(100, safetyScore));

    return {
      hasHazards,
      nearbyIncidents,
      avoidedCount,
      safetyScore,
    };
  }

  /**
   * Calculate a detour route that avoids specific incidents
   */
  private async calculateDetourRoute(
    origin: OSRMCoordinate,
    destination: OSRMCoordinate,
    incidentsToAvoid: Incident[],
    waypoints: OSRMCoordinate[] = []
  ): Promise<RouteWithSafety | null> {
    try {
      // Create waypoints that route around incidents
      const detourWaypoints = this.generateDetourWaypoints(
        origin,
        destination,
        incidentsToAvoid
      );

      if (detourWaypoints.length === 0) {
        return null;
      }

      // Calculate route with detour waypoints
      const routes = await this.getRouteAlternatives(origin, destination, [...waypoints, ...detourWaypoints]);
      
      if (routes.length === 0) {
        return null;
      }

      const route = routes[0];
      const geometry = route.geometry.coordinates.map(coord => ({
        longitude: coord[0],
        latitude: coord[1],
      }));

      // Analyze the detour route
      const allIncidents = incidentsToAvoid; // In real scenario, get all incidents again
      const { hasHazards, nearbyIncidents, avoidedCount, safetyScore } = 
        this.analyzeRouteSafety(geometry, allIncidents);

      return {
        geometry,
        distance: route.distance,
        duration: route.duration,
        safetyScore,
        avoidedIncidents: avoidedCount,
        nearbyIncidents,
        hasHazards,
      };
    } catch (error) {
      console.error('Failed to calculate detour route:', error);
      return null;
    }
  }

  /**
   * Generate waypoints that route around incidents
   */
  private generateDetourWaypoints(
    origin: OSRMCoordinate,
    destination: OSRMCoordinate,
    incidents: Incident[]
  ): OSRMCoordinate[] {
    if (incidents.length === 0) {
      return [];
    }

    // Find the most problematic incident (closest to direct line)
    const midpoint = {
      latitude: (origin.latitude + destination.latitude) / 2,
      longitude: (origin.longitude + destination.longitude) / 2,
    };

    let closestIncident: Incident | null = null;
    let minDistance = Infinity;

    for (const incident of incidents) {
      const distance = this.calculateDistance(midpoint, incident.location);
      if (distance < minDistance) {
        minDistance = distance;
        closestIncident = incident;
      }
    }

    if (!closestIncident) {
      return [];
    }

    // Create a waypoint perpendicular to the incident
    // This creates a detour around the incident
    const bearing = this.calculateBearing(origin, destination);
    const perpendicularBearing = (bearing + 90) % 360;

    // Generate waypoint 2km away from incident in perpendicular direction
    const detourPoint = this.calculateDestination(
      closestIncident.location,
      2000, // 2km detour
      perpendicularBearing
    );

    return [detourPoint];
  }

  /**
   * Calculate bearing between two points
   */
  private calculateBearing(point1: OSRMCoordinate, point2: OSRMCoordinate): number {
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const θ = Math.atan2(y, x);

    return ((θ * 180) / Math.PI + 360) % 360;
  }

  /**
   * Calculate destination point given start point, distance, and bearing
   */
  private calculateDestination(
    point: OSRMCoordinate,
    distance: number,
    bearing: number
  ): OSRMCoordinate {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (point.latitude * Math.PI) / 180;
    const λ1 = (point.longitude * Math.PI) / 180;
    const θ = (bearing * Math.PI) / 180;
    const δ = distance / R;

    const φ2 = Math.asin(
      Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ)
    );

    const λ2 = λ1 + Math.atan2(
      Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
      Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2)
    );

    return {
      latitude: (φ2 * 180) / Math.PI,
      longitude: (λ2 * 180) / Math.PI,
    };
  }

  /**
   * Calculate distance between two points using Haversine formula
   * @returns Distance in meters
   */
  private calculateDistance(point1: OSRMCoordinate, point2: OSRMCoordinate): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}

export const routingService = new RoutingService();
