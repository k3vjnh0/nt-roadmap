import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Filter, Check } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { INCIDENT_LABELS, INCIDENT_COLORS } from '../utils/helpers';

interface MapFilterPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MapFilterPopup({ isOpen, onClose }: MapFilterPopupProps) {
  const {
    toggleIncidentType,
    isIncidentTypeVisible,
    visibleIncidentTypes,
  } = useAppStore();

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
          x: window.innerWidth / 2 - 175, // Center (350px width / 2)
          y: window.innerHeight - 420, // 20px from bottom + height
        });
      } else {
        setPosition({
          x: window.innerWidth - 370, // 20px from right + width
          y: 80, // Below top controls
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
      const newX = Math.max(0, Math.min(window.innerWidth - 350, e.clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 400, e.clientY - dragOffset.y));
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
        width: '350px',
        maxHeight: 'min(90vh, 600px)',
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
        className={`flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <h2
          id="filter-popup-title"
          className="text-lg font-bold text-gray-900 flex items-center gap-2"
        >
          <Filter className="w-5 h-5 text-blue-600" />
          Filter Incidents
        </h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white rounded-md transition-colors"
          aria-label="Close filter popup"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-b border-gray-100 bg-gray-50 flex gap-2">
        <button
          onClick={handleSelectAll}
          disabled={allSelected}
          className="flex-1 px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Check className="w-4 h-4 inline mr-1" />
          Select All
        </button>
        <button
          onClick={handleClearAll}
          disabled={noneSelected}
          className="flex-1 px-3 py-2 text-sm font-medium border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Content - Scrollable */}
      <div className="p-4 overflow-y-auto" style={{ maxHeight: 'min(60vh, 400px)' }}>
        <div className="space-y-2">
          {Object.entries(INCIDENT_LABELS).map(([type, label]) => {
            const isVisible = isIncidentTypeVisible(type);
            const color = INCIDENT_COLORS[type as keyof typeof INCIDENT_COLORS];

            return (
              <label
                key={type}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  isVisible
                    ? 'border-blue-400 bg-blue-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={() => handleToggle(type)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                />
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: color }}
                >
                  <span className="text-white text-lg">
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
                <span className="text-sm font-medium text-gray-900 flex-1">
                  {label}
                </span>
                {isVisible && (
                  <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                )}
              </label>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-lg">
        <p className="text-xs text-gray-600 text-center">
          {visibleIncidentTypes.size} of {Object.keys(INCIDENT_LABELS).length} types visible
        </p>
      </div>
    </div>
  );
}
