import { MapPin, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { RouteSearch } from './RouteSearch';

export function Sidebar() {
  const {
    filteredIncidents,
    isLoadingIncidents,
    refreshIncidents,
    toggleFilters,
    toggleReportForm,
    lastRefreshTime,
  } = useAppStore();

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
            title="Filter incidents by severity, status, and date"
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center justify-center gap-2 font-medium transition-colors"
          >
            Advanced Filters
          </button>

          <button
            onClick={async () => {
              await refreshIncidents();
            }}
            disabled={isLoadingIncidents}
            title={isLoadingIncidents ? "Refreshing..." : "Refresh incident data from NT Road Report"}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center justify-center gap-2 disabled:opacity-50 font-medium transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingIncidents ? 'animate-spin' : ''}`} />
            {isLoadingIncidents ? 'Syncing...' : 'Refresh'}
          </button>
        </div>
        
        {/* Last Updated Info */}
        <div className="mt-2 text-xs text-gray-500 text-center">
          {lastRefreshTime ? (
            <span>Last updated: {new Date(lastRefreshTime).toLocaleTimeString()}</span>
          ) : (
            <span>Auto-refreshes every 5 minutes</span>
          )}
        </div>
      </div>

      {/* Route Search */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <RouteSearch />
      </div>

      {/* Info */}
      <div className="p-4 mt-auto bg-white border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900 mb-1">
            {filteredIncidents.length} Active Incident{filteredIncidents.length !== 1 ? 's' : ''}
          </p>
          <p className="text-xs text-gray-600">
            Use the map filter button to view and browse incidents
          </p>
        </div>
      </div>
    </div>
  );
}
