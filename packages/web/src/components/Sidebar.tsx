import { useState } from 'react';
import { Filter, MapPin, AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { INCIDENT_LABELS, INCIDENT_COLORS } from '../utils/helpers';
import { RouteSearch } from './RouteSearch';

export function Sidebar() {
  const {
    incidents,
    filteredIncidents,
    isLoadingIncidents,
    refreshIncidents,
    toggleFilters,
    toggleReportForm,
    toggleIncidentType,
    isIncidentTypeVisible,
    focusOnIncident,
  } = useAppStore();

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (type: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  // Count all incidents by type (not just filtered)
  const allIncidentCounts = incidents.reduce((acc, incident) => {
    acc[incident.type] = (acc[incident.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Count visible incidents by type
  const visibleIncidentCounts = filteredIncidents.reduce((acc, incident) => {
    acc[incident.type] = (acc[incident.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="w-80 bg-white shadow-lg overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-blue-600" />
          Safe Map
        </h1>
        <p className="text-sm text-gray-600 mt-1">Real-time incident tracking</p>
      </div>

      {/* Actions */}
      <div className="p-4 space-y-2 border-b border-gray-200 bg-white">
        <button
          onClick={toggleReportForm}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 font-medium"
        >
          <AlertTriangle className="w-4 h-4" />
          Report Incident
        </button>

        <div className="flex gap-2">
          <button
            onClick={toggleFilters}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center justify-center gap-2 font-medium"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>

          <button
            onClick={refreshIncidents}
            disabled={isLoadingIncidents}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center justify-center gap-2 disabled:opacity-50 font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingIncidents ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Route Search */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <RouteSearch />
      </div>

      {/* Layer Selector */}
      <div className="flex-1 overflow-y-auto bg-white">
        {Object.entries(INCIDENT_LABELS).map(([type, label]) => {
          const totalCount = allIncidentCounts[type] || 0;
          const visibleCount = visibleIncidentCounts[type] || 0;
          const isTypeVisible = isIncidentTypeVisible(type);
          const color = INCIDENT_COLORS[type as keyof typeof INCIDENT_COLORS];
          
          const isExpanded = expandedCategories[type];
          
          return (
            <div key={type} className="border-b border-gray-200">
              {/* Category Header */}
              <div className="p-4 flex items-center justify-between hover:bg-gray-50">
                <button
                  onClick={() => toggleCategory(type)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  {/* Expand/Collapse Icon */}
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  )}
                  
                  {/* Icon */}
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: color + '20' }}
                  >
                    <div 
                      className="w-8 h-8 rounded-full border-4 border-white flex items-center justify-center"
                      style={{ backgroundColor: color }}
                    >
                      {type === 'road_closure' && <span className="text-white text-sm">⛔</span>}
                      {type === 'flood' && <span className="text-white text-sm">🌊</span>}
                      {type === 'accident' && <span className="text-white text-sm">🚗</span>}
                      {type === 'bushfire' && <span className="text-white text-sm">🔥</span>}
                      {type === 'construction' && <span className="text-white text-sm">🚧</span>}
                      {type === 'hazard' && <span className="text-white text-sm">⚠️</span>}
                      {type === 'weather' && <span className="text-white text-sm">🌤️</span>}
                      {type === 'traffic' && <span className="text-white text-sm">🚦</span>}
                      {type === 'other' && <span className="text-white text-sm">📍</span>}
                    </div>
                  </div>
                  
                  {/* Label and Count */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-gray-900">{label}</h3>
                    <p className="text-sm text-gray-600">
                      Displaying {isTypeVisible ? visibleCount : 0} of {totalCount}
                    </p>
                  </div>
                </button>
                
                {/* Toggle Switch */}
                <button
                  onClick={() => toggleIncidentType(type)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors flex-shrink-0 ml-2 ${
                    isTypeVisible ? 'bg-red-400' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                      isTypeVisible ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* Incidents List - Only show if expanded and has incidents */}
              {isExpanded && totalCount > 0 && (
                <div className="bg-gray-50 border-t border-gray-200">
                  {filteredIncidents
                    .filter(i => i.type === type)
                    .map((incident) => (
                      <button
                        key={incident.id}
                        onClick={() => focusOnIncident(incident)}
                        className="w-full px-4 py-3 text-left hover:bg-white border-b border-gray-200 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <ChevronDown className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 mb-1">
                              {incident.title || 'Untitled Incident'}
                            </h4>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {incident.description || 'No description available'}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="p-4 mt-auto bg-white">
        <div className="bg-gray-100 rounded-md p-3 border border-gray-200">
          <p className="text-sm font-medium text-gray-900">
            Showing {filteredIncidents.length} incident{filteredIncidents.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
