import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { INCIDENT_LABELS, INCIDENT_COLORS } from '../utils/helpers';

interface MapFilterPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MapFilterPopup({ isOpen, onClose }: MapFilterPopupProps) {
  const {
    incidents,
    filteredIncidents,
    toggleIncidentType,
    isIncidentTypeVisible,
    visibleIncidentTypes,
    focusOnIncident,
  } = useAppStore();

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (type: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  // Count incidents by type
  const allIncidentCounts = incidents.reduce((acc, incident) => {
    acc[incident.type] = (acc[incident.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const visibleIncidentCounts = filteredIncidents.reduce((acc, incident) => {
    acc[incident.type] = (acc[incident.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const popupRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragHandleRef = useRef<HTMLDivElement>(null);

  // Load persisted selections from localStorage
  useEffect(() => {
    const savedFilters = localStorage.getItem('mapFilters');
    if (savedFilters) {
      try {
        const filters = JSON.parse(savedFilters) as string[];
        // Apply saved filters
        Object.keys(INCIDENT_LABELS).forEach((type) => {
          const shouldBeVisible = filters.includes(type);
          const isCurrentlyVisible = isIncidentTypeVisible(type);
          if (shouldBeVisible !== isCurrentlyVisible) {
            toggleIncidentType(type);
          }
        });
      } catch (e) {
        console.error('Failed to load saved filters:', e);
      }
    }
  }, []);

  // Save selections to localStorage whenever they change
  useEffect(() => {
    if (isOpen) {
      const activeFilters = Array.from(visibleIncidentTypes);
      localStorage.setItem('mapFilters', JSON.stringify(activeFilters));
    }
  }, [visibleIncidentTypes, isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }

      // Focus trap
      if (e.key === 'Tab') {
        const focusableElements = popupRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Initialize position on open
  useEffect(() => {
    if (isOpen && position.x === 0 && position.y === 0) {
      // Position in top-right on desktop, bottom-center on mobile
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        setPosition({
          x: 10,
          y: window.innerHeight - 450,
        });
      } else {
        setPosition({
          x: window.innerWidth - 260,
          y: 20,
        });
      }
    }
  }, [isOpen, position]);

  // Drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (dragHandleRef.current && dragHandleRef.current.contains(e.target as Node)) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  }, [position]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = Math.max(0, Math.min(window.innerWidth - 240, e.clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 300, e.clientY - dragOffset.y));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // Delay to prevent immediate close on button click
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const handleSelectAll = () => {
    Object.keys(INCIDENT_LABELS).forEach((type) => {
      if (!isIncidentTypeVisible(type)) {
        toggleIncidentType(type);
      }
    });
  };

  const handleClearAll = () => {
    Object.keys(INCIDENT_LABELS).forEach((type) => {
      if (isIncidentTypeVisible(type)) {
        toggleIncidentType(type);
      }
    });
  };

  const handleToggle = (type: string) => {
    toggleIncidentType(type);
  };

  if (!isOpen) return null;

  const allSelected = Object.keys(INCIDENT_LABELS).every((type) => isIncidentTypeVisible(type));
  const noneSelected = Object.keys(INCIDENT_LABELS).every((type) => !isIncidentTypeVisible(type));

  return (
    <div
      ref={popupRef}
      className={`fixed bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-200 ${
        isDragging ? 'cursor-grabbing' : ''
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '240px',
        maxHeight: 'min(80vh, 420px)',
        zIndex: 10000,
        transform: isOpen ? 'scale(1)' : 'scale(0.95)',
        opacity: isOpen ? 1 : 0,
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="filter-popup-title"
      onMouseDown={handleMouseDown}
    >
      {/* Header - Draggable */}
      <div
        ref={dragHandleRef}
        className={`flex items-center justify-between px-2 py-2 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <h2
          id="filter-popup-title"
          className="text-sm font-bold text-gray-900 flex items-center gap-1.5"
        >
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          Filters
        </h2>
        <button
          onClick={onClose}
          className="p-0.5 hover:bg-white rounded transition-colors"
          aria-label="Close filter popup"
        >
          <X className="w-3.5 h-3.5 text-gray-500" />
        </button>
      </div>

      {/* Quick Actions */}
      <div className="px-2 py-1.5 border-b border-gray-100 bg-gray-50 flex gap-1">
        <button
          onClick={handleSelectAll}
          disabled={allSelected}
          className="flex-1 px-1.5 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          All
        </button>
        <button
          onClick={handleClearAll}
          disabled={noneSelected}
          className="flex-1 px-1.5 py-1 text-xs font-medium border border-gray-300 text-gray-700 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Content - Scrollable with compact incident list */}
      <div className="overflow-y-auto" style={{ maxHeight: 'min(65vh, 320px)' }}>
        {Object.entries(INCIDENT_LABELS).map(([type, label]) => {
          const totalCount = allIncidentCounts[type] || 0;
          const visibleCount = visibleIncidentCounts[type] || 0;
          const isTypeVisible = isIncidentTypeVisible(type);
          const color = INCIDENT_COLORS[type as keyof typeof INCIDENT_COLORS];
          const isExpanded = expandedCategories[type];

          return (
            <div key={type} className="border-b border-gray-100 last:border-b-0">
              {/* Category Header */}
              <div className="flex items-center hover:bg-gray-50">
                <button
                  onClick={() => toggleCategory(type)}
                  className="flex items-center gap-1.5 flex-1 p-1.5 text-left"
                  disabled={totalCount === 0}
                >
                  {totalCount > 0 && (
                    isExpanded ? (
                      <ChevronUp className="w-3 h-3 text-gray-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-gray-600 flex-shrink-0" />
                    )
                  )}
                  {totalCount === 0 && <div className="w-3 h-3 flex-shrink-0" />}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: color }}
                  >
                    <span className="text-white text-xs">
                      {type === 'road_closure' && '⛔'}
                      {type === 'flood' && '🌊'}
                      {type === 'accident' && '🚗'}
                      {type === 'bushfire' && '🔥'}
                      {type === 'construction' && '🚧'}
                      {type === 'hazard' && '⚠️'}
                      {type === 'weather' && '🌤️'}
                      {type === 'traffic' && '🚦'}
                      {type === 'other' && '📍'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-semibold text-gray-900 truncate">{label}</h3>
                    <p className="text-[10px] text-gray-600">{visibleCount} visible</p>
                  </div>
                </button>
                {/* Toggle Switch */}
                <button
                  onClick={() => handleToggle(type)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 mr-1.5 ${
                    isTypeVisible ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                  title={isTypeVisible ? 'Hide on map' : 'Show on map'}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                      isTypeVisible ? 'translate-x-4.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Incidents List */}
              {isExpanded && totalCount > 0 && (
                <div className="bg-gray-50">
                  {filteredIncidents
                    .filter(i => i.type === type)
                    .map((incident) => (
                      <button
                        key={incident.id}
                        onClick={() => {
                          focusOnIncident(incident);
                          onClose();
                        }}
                        className="w-full px-2 py-1.5 text-left hover:bg-white border-b border-gray-200 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-start gap-1.5">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[11px] font-semibold text-gray-900 truncate leading-tight">
                              {incident.title || 'Untitled'}
                            </h4>
                            <p className="text-[10px] text-gray-600 line-clamp-1 leading-tight">
                              {incident.description || 'No description'}
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

      {/* Footer */}
      <div className="px-2 py-1.5 border-t border-gray-100 bg-gray-50 rounded-b-lg">
        <p className="text-[10px] text-gray-500 text-center">
          {visibleIncidentTypes.size}/{Object.keys(INCIDENT_LABELS).length} types • {filteredIncidents.length} incidents
        </p>
      </div>
    </div>
  );
}
