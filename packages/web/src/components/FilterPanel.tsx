import { X, Calendar, AlertCircle } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { SeverityLevel, IncidentStatus } from '../types';

export function FilterPanel() {
  const { showFilters, toggleFilters, filters, setFilters } = useAppStore();

  if (!showFilters) return null;

  const handleSeverityToggle = (severity: SeverityLevel) => {
    const currentSeverities = filters.severity || [];
    const newSeverities = currentSeverities.includes(severity)
      ? currentSeverities.filter(s => s !== severity)
      : [...currentSeverities, severity];
    setFilters({ severity: newSeverities });
  };

  const handleStatusToggle = (status: IncidentStatus) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    setFilters({ status: newStatuses });
  };

  const clearFilters = () => {
    setFilters({
      types: [],
      severity: [],
      status: [],
      startDate: undefined,
      endDate: undefined,
    });
  };

  const selectedSeverities = filters.severity || [];
  const selectedStatuses = filters.status || [];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
      onClick={toggleFilters}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            Filter Incidents
          </h2>
          <button
            onClick={toggleFilters}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Severity Filter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Severity Level</h3>
            <div className="space-y-2">
              {[
                { level: SeverityLevel.LOW, label: 'Low', icon: '🟢' },
                { level: SeverityLevel.MODERATE, label: 'Moderate', icon: '🟡' },
                { level: SeverityLevel.HIGH, label: 'High', icon: '🟠' },
                { level: SeverityLevel.CRITICAL, label: 'Critical', icon: '🔴' },
                { level: SeverityLevel.EXTREME, label: 'Extreme', icon: '🔴' },
              ].map(({ level, label, icon }) => (
                <label
                  key={level}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedSeverities.includes(level)}
                    onChange={() => handleSeverityToggle(level)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 flex items-center gap-2">
                    {icon} {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Status</h3>
            <div className="space-y-2">
              {[
                { status: IncidentStatus.ACTIVE, label: 'Active' },
                { status: IncidentStatus.MONITORING, label: 'Monitoring' },
                { status: IncidentStatus.RESOLVED, label: 'Resolved' },
                { status: IncidentStatus.UNVERIFIED, label: 'Unverified' },
              ].map(({ status, label }) => (
                <label
                  key={status}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(status)}
                    onChange={() => handleStatusToggle(status)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date Range
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">From</label>
                <input
                  type="date"
                  value={filters.startDate ? filters.startDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setFilters({ startDate: e.target.value ? new Date(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">To</label>
                <input
                  type="date"
                  value={filters.endDate ? filters.endDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setFilters({ endDate: e.target.value ? new Date(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-2 sticky bottom-0">
          <button
            onClick={clearFilters}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 font-medium"
          >
            Clear All
          </button>
          <button
            onClick={toggleFilters}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
