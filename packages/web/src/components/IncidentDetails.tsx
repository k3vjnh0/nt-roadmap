import React from 'react';
import { useAppStore } from '../store/appStore';
import { INCIDENT_LABELS, SEVERITY_LABELS, INCIDENT_COLORS, SEVERITY_COLORS } from '../utils/helpers';
import { format } from 'date-fns';
import { X, MapPin, AlertCircle, Clock } from 'lucide-react';

export function IncidentDetails() {
  const { selectedIncident, setSelectedIncident } = useAppStore();

  if (!selectedIncident) return null;

  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg w-96 max-h-[80vh] overflow-y-auto z-10">
      <div className="p-4 border-b border-gray-200 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{selectedIncident.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="px-2 py-1 rounded text-xs font-medium text-white"
              style={{ backgroundColor: INCIDENT_COLORS[selectedIncident.type] }}
            >
              {INCIDENT_LABELS[selectedIncident.type]}
            </span>
            <span
              className="px-2 py-1 rounded text-xs font-medium text-white"
              style={{ backgroundColor: SEVERITY_COLORS[selectedIncident.severity] }}
            >
              {SEVERITY_LABELS[selectedIncident.severity]}
            </span>
          </div>
        </div>
        <button
          onClick={() => setSelectedIncident(null)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-700">Description</p>
            <p className="text-sm text-gray-600 mt-1">{selectedIncident.description}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-700">Location</p>
            <p className="text-sm text-gray-600 mt-1">
              {selectedIncident.location.latitude.toFixed(4)}, {selectedIncident.location.longitude.toFixed(4)}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Clock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-700">Reported</p>
            <p className="text-sm text-gray-600 mt-1">
              {format(new Date(selectedIncident.reportedAt), 'PPpp')}
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Status</span>
            <span className={`font-medium ${
              selectedIncident.status === 'active' ? 'text-red-600' :
              selectedIncident.status === 'monitoring' ? 'text-yellow-600' :
              selectedIncident.status === 'resolved' ? 'text-green-600' :
              'text-gray-600'
            }`}>
              {selectedIncident.status.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-600">Source</span>
            <span className="font-medium text-gray-900 capitalize">{selectedIncident.source}</span>
          </div>

          {selectedIncident.verifiedBy && (
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-600">Verified by</span>
              <span className="font-medium text-gray-900">{selectedIncident.verifiedBy}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
