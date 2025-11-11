import axios from 'axios';
import { Incident, IncidentType, SeverityLevel, IncidentStatus, Location } from '../types';

export class NTRoadReportService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.NT_ROAD_REPORT_API || 'https://roadreport.nt.gov.au/api/Obstruction/GetAll';
  }

  /**
   * Fetch incidents from NT Road Report API
   */
  async fetchIncidents(): Promise<Incident[]> {
    try {
      const response = await axios.get(this.apiUrl, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SafeMap/1.0'
        }
      });

      return this.transformNTData(response.data);
    } catch (error) {
      console.error('Error fetching NT Road Report data:', error);
      // Return empty array on error to avoid breaking the app
      return [];
    }
  }

  /**
   * Transform NT Road Report data to our Incident format
   */
  private transformNTData(data: any): Incident[] {
    try {
      const incidents: Incident[] = [];

      // NT API returns data in { response: [...] } format
      const items = data.response || data.features || data.incidents || data.items || data || [];
      
      if (!Array.isArray(items)) {
        console.warn('NT Road Report data is not in expected format');
        return [];
      }

      items.forEach((item: any, index: number) => {
        try {
          const incident = this.parseIncident(item, index);
          if (incident) {
            incidents.push(incident);
          }
        } catch (err) {
          console.error('Error parsing incident:', err);
        }
      });

      console.log(`Successfully parsed ${incidents.length} incidents from NT Road Report`);
      return incidents;
    } catch (error) {
      console.error('Error transforming NT data:', error);
      return [];
    }
  }

  /**
   * Parse individual incident from NT Obstruction API format
   */
  private parseIncident(item: any, index: number): Incident | null {
    try {
      // Extract location from NT API format
      let location: Location;
      
      if (item.startPoint && Array.isArray(item.startPoint) && item.startPoint.length === 2) {
        // NT API format: startPoint = [latitude, longitude]
        location = {
          latitude: item.startPoint[0],
          longitude: item.startPoint[1]
        };
      } else if (item.geometry?.coordinates) {
        // GeoJSON format [lng, lat]
        location = {
          longitude: item.geometry.coordinates[0],
          latitude: item.geometry.coordinates[1]
        };
      } else if (item.latitude && item.longitude) {
        location = {
          latitude: parseFloat(item.latitude),
          longitude: parseFloat(item.longitude)
        };
      } else if (item.location) {
        location = {
          latitude: parseFloat(item.location.lat || item.location.latitude),
          longitude: parseFloat(item.location.lng || item.location.longitude)
        };
      } else {
        return null; // Skip incidents without location
      }

      // Build title and description from NT API fields
      const title = item.roadName 
        ? `${item.obstructionType || 'Incident'} on ${item.roadName}`
        : item.obstructionType || 'Road Incident';
      
      const description = [
        item.comment,
        item.locationComment ? `Location: ${item.locationComment}` : null
      ].filter(Boolean).join(' - ') || 'No details available';
      
      const incident: Incident = {
        id: item.obstructionId?.toString() || item.recordId?.toString() || `nt-${index}-${Date.now()}`,
        type: this.mapIncidentType(item.obstructionType || item.restrictionType),
        severity: this.mapSeverity(item.restrictionType || item.obstructionType),
        status: this.mapStatus(item.status),
        location,
        title,
        description,
        reportedAt: item.dateFrom || item.dateActive || new Date().toISOString(),
        updatedAt: item.dateLastUpdated || item.dateActive || new Date().toISOString(),
        source: 'api',
        metadata: {
          roadName: item.roadName,
          obstructionType: item.obstructionType,
          restrictionType: item.restrictionType,
          obstructionTypeCode: item.obstructionTypeCode,
          restrictionTypeCode: item.restrictionTypeCode,
          comment: item.comment,
          locationComment: item.locationComment
        }
      };

      return incident;
    } catch (error) {
      console.error('Error parsing incident item:', error);
      return null;
    }
  }

  /**
   * Map NT API incident types to our enum
   */
  private mapIncidentType(type?: string): IncidentType {
    if (!type) return IncidentType.OTHER;

    const typeStr = type.toLowerCase();
    
    // NT API specific mappings
    if (typeStr.includes('road closed') || typeStr.includes('closure')) return IncidentType.ROAD_CLOSURE;
    if (typeStr.includes('flood') || typeStr.includes('water over')) return IncidentType.FLOOD;
    if (typeStr.includes('accident') || typeStr.includes('crash') || typeStr.includes('incident')) return IncidentType.ACCIDENT;
    if (typeStr.includes('fire') || typeStr.includes('bushfire')) return IncidentType.BUSHFIRE;
    if (typeStr.includes('construction') || typeStr.includes('roadworks') || typeStr.includes('works')) return IncidentType.CONSTRUCTION;
    if (typeStr.includes('weather') || typeStr.includes('storm') || typeStr.includes('cyclone')) return IncidentType.WEATHER;
    if (typeStr.includes('traffic') || typeStr.includes('congestion') || typeStr.includes('delay')) return IncidentType.TRAFFIC;
    if (typeStr.includes('restriction') || typeStr.includes('permit')) return IncidentType.HAZARD;
    if (typeStr.includes('hazard') || typeStr.includes('danger') || typeStr.includes('warning')) return IncidentType.HAZARD;
    
    return IncidentType.OTHER;
  }

  /**
   * Map severity levels based on NT API restriction types
   */
  private mapSeverity(severity?: string | number): SeverityLevel {
    if (!severity) return SeverityLevel.MODERATE;

    if (typeof severity === 'number') {
      return Math.min(Math.max(severity, 1), 5) as SeverityLevel;
    }

    const sevStr = severity.toLowerCase();
    
    // Map based on NT API restriction/obstruction types
    if (sevStr.includes('road closed') || sevStr.includes('closure')) return SeverityLevel.EXTREME;
    if (sevStr.includes('flood') || sevStr.includes('emergency')) return SeverityLevel.CRITICAL;
    if (sevStr.includes('permit') || sevStr.includes('4wd only')) return SeverityLevel.HIGH;
    if (sevStr.includes('restriction') || sevStr.includes('weight')) return SeverityLevel.MODERATE;
    if (sevStr.includes('caution') || sevStr.includes('advisory')) return SeverityLevel.LOW;
    
    // Generic severity keywords
    if (sevStr.includes('extreme') || sevStr.includes('critical')) return SeverityLevel.EXTREME;
    if (sevStr.includes('high') || sevStr.includes('major')) return SeverityLevel.HIGH;
    if (sevStr.includes('moderate') || sevStr.includes('medium')) return SeverityLevel.MODERATE;
    if (sevStr.includes('low') || sevStr.includes('minor')) return SeverityLevel.LOW;
    
    return SeverityLevel.MODERATE;
  }

  /**
   * Map NT API status strings
   */
  private mapStatus(status?: string): IncidentStatus {
    if (!status) return IncidentStatus.ACTIVE;

    const statusStr = status.toLowerCase();
    
    // NT API uses "CURRENT" for active incidents
    if (statusStr === 'current') return IncidentStatus.ACTIVE;
    if (statusStr.includes('resolved') || statusStr.includes('cleared') || statusStr.includes('completed')) return IncidentStatus.RESOLVED;
    if (statusStr.includes('monitor') || statusStr.includes('watch')) return IncidentStatus.MONITORING;
    if (statusStr.includes('unverified') || statusStr.includes('pending')) return IncidentStatus.UNVERIFIED;
    
    return IncidentStatus.ACTIVE;
  }
}
