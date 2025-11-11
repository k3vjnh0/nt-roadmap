import { Incident, IncidentType, SeverityLevel, IncidentStatus, UserReport } from '../types';

export class IncidentService {
  private incidents: Incident[] = [];
  private userReports: UserReport[] = [];

  /**
   * Get all incidents with optional filtering
   */
  getIncidents(filters?: {
    types?: IncidentType[];
    severity?: SeverityLevel[];
    status?: IncidentStatus[];
    startDate?: string;
    endDate?: string;
  }): Incident[] {
    let filtered = [...this.incidents];

    if (filters) {
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
        filtered = filtered.filter((i) => new Date(i.reportedAt) >= new Date(filters.startDate!));
      }

      if (filters.endDate) {
        filtered = filtered.filter((i) => new Date(i.reportedAt) <= new Date(filters.endDate!));
      }
    }

    return filtered;
  }

  /**
   * Get incident by ID
   */
  getIncidentById(id: string): Incident | undefined {
    return this.incidents.find((i) => i.id === id);
  }

  /**
   * Add or update incidents
   */
  setIncidents(incidents: Incident[]): void {
    this.incidents = incidents;
  }

  /**
   * Add incidents to existing list
   */
  addIncidents(incidents: Incident[]): void {
    incidents.forEach((newIncident) => {
      const existingIndex = this.incidents.findIndex((i) => i.id === newIncident.id);
      if (existingIndex >= 0) {
        this.incidents[existingIndex] = newIncident;
      } else {
        this.incidents.push(newIncident);
      }
    });
  }

  /**
   * Create user report
   */
  createUserReport(report: Omit<UserReport, 'id' | 'reportedAt' | 'verified'>): UserReport {
    const newReport: UserReport = {
      ...report,
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      reportedAt: new Date().toISOString(),
      verified: false,
    };

    this.userReports.push(newReport);

    // Convert to incident (unverified)
    const incident: Incident = {
      id: newReport.id,
      type: newReport.type,
      severity: SeverityLevel.MODERATE, // Default for user reports
      status: IncidentStatus.UNVERIFIED,
      location: newReport.location,
      title: `User Reported ${newReport.type}`,
      description: newReport.description,
      reportedAt: newReport.reportedAt,
      updatedAt: newReport.reportedAt,
      source: 'user',
    };

    this.addIncidents([incident]);

    return newReport;
  }

  /**
   * Get all user reports
   */
  getUserReports(): UserReport[] {
    return this.userReports;
  }

  /**
   * Verify a user report
   */
  verifyReport(reportId: string, verifiedBy: string): UserReport | undefined {
    const report = this.userReports.find((r) => r.id === reportId);
    if (!report) return undefined;

    report.verified = true;
    report.verifiedBy = verifiedBy;
    report.verifiedAt = new Date().toISOString();

    // Update corresponding incident
    const incident = this.incidents.find((i) => i.id === reportId);
    if (incident) {
      incident.status = IncidentStatus.ACTIVE;
      incident.verifiedBy = verifiedBy;
      incident.updatedAt = report.verifiedAt;
    }

    return report;
  }

  /**
   * Get statistics about incidents
   */
  getStatistics() {
    const total = this.incidents.length;
    const byType = this.incidents.reduce((acc, incident) => {
      acc[incident.type] = (acc[incident.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bySeverity = this.incidents.reduce((acc, incident) => {
      acc[incident.severity] = (acc[incident.severity] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const byStatus = this.incidents.reduce((acc, incident) => {
      acc[incident.status] = (acc[incident.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      byType,
      bySeverity,
      byStatus,
      totalUserReports: this.userReports.length,
      verifiedReports: this.userReports.filter((r) => r.verified).length,
    };
  }
}
