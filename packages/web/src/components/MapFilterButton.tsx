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
        className="fixed bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-4 rounded-lg shadow-lg border border-gray-200 transition-all duration-200 hover:shadow-xl flex items-center gap-2 z-[9998] md:top-4 md:right-4 bottom-20 left-1/2 md:left-auto transform -translate-x-1/2 md:translate-x-0"
        aria-label="Open filter popup"
        title="Filter incidents"
      >
        <Filter className="w-5 h-5" />
        <span className="font-medium">Filters</span>
        {activeCount < totalCount && (
          <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
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
