import { Incident, Location, SafetyScore, SeverityLevel } from '../types';

export class SafetyScoreService {
  /**
   * Calculate safety score for a route considering nearby incidents
   */
  calculateRouteSafety(
    routePoints: Location[],
    incidents: Incident[],
    routeDistance: number
  ): SafetyScore {
    const nearbyIncidents = this.findIncidentsNearRoute(routePoints, incidents, 5000); // 5km radius

    // Calculate various safety factors
    const incidentDensity = this.calculateIncidentDensity(nearbyIncidents, routeDistance);
    const severityWeight = this.calculateSeverityWeight(nearbyIncidents);
    const routeLength = this.normalizeRouteLength(routeDistance);
    const weatherConditions = 85; // Placeholder - would integrate weather API

    // Weighted overall score (0-100, higher is safer)
    const overall = Math.max(
      0,
      100 -
        incidentDensity * 0.35 -
        severityWeight * 0.45 -
        (100 - routeLength) * 0.1 -
        (100 - weatherConditions) * 0.1
    );

    const recommendation = this.getRecommendation(overall);

    return {
      overall: Math.round(overall),
      factors: {
        incidentDensity: Math.round(100 - incidentDensity),
        severityWeight: Math.round(100 - severityWeight),
        routeLength: Math.round(routeLength),
        weatherConditions: Math.round(weatherConditions),
      },
      recommendation,
    };
  }

  /**
   * Find incidents near a route
   */
  private findIncidentsNearRoute(
    routePoints: Location[],
    incidents: Incident[],
    maxDistance: number
  ): Incident[] {
    return incidents.filter((incident) => {
      return routePoints.some((point) => {
        const distance = this.calculateDistance(point, incident.location);
        return distance <= maxDistance;
      });
    });
  }

  /**
   * Calculate incident density penalty (0-100, higher is worse)
   */
  private calculateIncidentDensity(incidents: Incident[], routeDistance: number): number {
    if (incidents.length === 0) return 0;

    // Active incidents only
    const activeIncidents = incidents.filter(
      (i) => i.status === 'active' || i.status === 'monitoring'
    );

    // Incidents per 100km
    const densityPer100km = (activeIncidents.length / routeDistance) * 100000;

    // Convert to 0-100 penalty scale
    return Math.min(100, densityPer100km * 20);
  }

  /**
   * Calculate severity weight penalty (0-100, higher is worse)
   */
  private calculateSeverityWeight(incidents: Incident[]): number {
    if (incidents.length === 0) return 0;

    const totalSeverity = incidents.reduce((sum, incident) => {
      // Only count active/monitoring incidents
      if (incident.status !== 'active' && incident.status !== 'monitoring') {
        return sum;
      }

      // Weight by severity level
      const severityMultiplier = {
        [SeverityLevel.LOW]: 1,
        [SeverityLevel.MODERATE]: 2,
        [SeverityLevel.HIGH]: 4,
        [SeverityLevel.CRITICAL]: 7,
        [SeverityLevel.EXTREME]: 10,
      };

      return sum + (severityMultiplier[incident.severity] || 2);
    }, 0);

    // Convert to 0-100 penalty scale
    return Math.min(100, totalSeverity * 5);
  }

  /**
   * Normalize route length (0-100, shorter is better)
   */
  private normalizeRouteLength(distance: number): number {
    // Prefer routes under 500km
    const maxPreferredDistance = 500000; // 500km in meters
    return Math.max(0, 100 - (distance / maxPreferredDistance) * 100);
  }

  /**
   * Get safety recommendation based on overall score
   */
  private getRecommendation(score: number): 'safe' | 'caution' | 'avoid' {
    if (score >= 70) return 'safe';
    if (score >= 40) return 'caution';
    return 'avoid';
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  calculateDistance(point1: Location, point2: Location): number {
    const R = 6371000; // Earth's radius in meters
    const lat1 = (point1.latitude * Math.PI) / 180;
    const lat2 = (point2.latitude * Math.PI) / 180;
    const deltaLat = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const deltaLng = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Check if an incident affects a specific route point
   */
  isIncidentAffectingPoint(incident: Incident, point: Location, threshold: number = 1000): boolean {
    const distance = this.calculateDistance(incident.location, point);
    const affectedRadius = incident.radius || threshold;
    return distance <= affectedRadius;
  }
}
