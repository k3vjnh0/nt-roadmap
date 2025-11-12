import { useState } from 'react';
import { Filter } from 'lucide-react';
import { MapFilterPopup } from './MapFilterPopup';
import { useAppStore } from '../store/appStore';

export function MapFilterButton() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const { visibleIncidentTypes } = useAppStore();

  const activeCount = visibleIncidentTypes.size;
  const totalCount = 9; // Total incident types

  return (
    <>
      {/* Floating Filter Button */}
      <button
        onClick={() => setIsPopupOpen(true)}
        className="fixed bg-white hover:bg-gray-50 text-gray-800 font-medium py-2 px-3 rounded-lg shadow-lg border border-gray-200 transition-all duration-200 hover:shadow-xl flex items-center gap-1.5 z-[9998] top-4 right-4"
        aria-label="Open filter popup"
        title="Filter incidents"
      >
        <Filter className="w-4 h-4" />
        <span className="text-sm">Filters</span>
        {activeCount < totalCount && (
          <span className="bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[32px] text-center">
            {activeCount}/{totalCount}
          </span>
        )}
      </button>

      {/* Filter Popup */}
      <MapFilterPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />
    </>
  );
}
