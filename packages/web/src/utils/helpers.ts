import { IncidentType, SeverityLevel } from '../types';

export const INCIDENT_COLORS: Record<IncidentType, string> = {
  [IncidentType.ROAD_CLOSURE]: '#ef4444',
  [IncidentType.FLOOD]: '#3b82f6',
  [IncidentType.ACCIDENT]: '#f59e0b',
  [IncidentType.BUSHFIRE]: '#dc2626',
  [IncidentType.CONSTRUCTION]: '#eab308',
  [IncidentType.HAZARD]: '#f97316',
  [IncidentType.WEATHER]: '#6366f1',
  [IncidentType.TRAFFIC]: '#8b5cf6',
  [IncidentType.OTHER]: '#6b7280',
};

export const INCIDENT_LABELS: Record<IncidentType, string> = {
  [IncidentType.ROAD_CLOSURE]: 'Road Closure',
  [IncidentType.FLOOD]: 'Flood',
  [IncidentType.ACCIDENT]: 'Accident',
  [IncidentType.BUSHFIRE]: 'Bushfire',
  [IncidentType.CONSTRUCTION]: 'Construction',
  [IncidentType.HAZARD]: 'Hazard',
  [IncidentType.WEATHER]: 'Weather',
  [IncidentType.TRAFFIC]: 'Traffic',
  [IncidentType.OTHER]: 'Other',
};

export const SEVERITY_LABELS: Record<SeverityLevel, string> = {
  [SeverityLevel.LOW]: 'Low',
  [SeverityLevel.MODERATE]: 'Moderate',
  [SeverityLevel.HIGH]: 'High',
  [SeverityLevel.CRITICAL]: 'Critical',
  [SeverityLevel.EXTREME]: 'Extreme',
};

export const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  [SeverityLevel.LOW]: '#10b981',
  [SeverityLevel.MODERATE]: '#f59e0b',
  [SeverityLevel.HIGH]: '#f97316',
  [SeverityLevel.CRITICAL]: '#ef4444',
  [SeverityLevel.EXTREME]: '#991b1b',
};

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function getSafetyScoreColor(score: number): string {
  if (score >= 70) return '#10b981';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
}

export function getSafetyScoreLabel(score: number): string {
  if (score >= 70) return 'Safe';
  if (score >= 40) return 'Caution';
  return 'Avoid';
}
