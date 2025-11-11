import { useState, useRef } from 'react';
import { Navigation, X, MapPin, Loader2, Route as RouteIcon } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { geocodeLocation, searchLocations, parseLocationInput } from '../utils/geocoding';

interface LocationSuggestion {
  displayName: string;
  location: { latitude: number; longitude: number };
}

export function RouteSearch() {
  const {
    origin,
    destination,
    currentRoute,
    selectedAlternativeId,
    isCalculatingRoute,
    userLocation,
    setOrigin,
    setDestination,
    calculateRoute,
    selectAlternativeRoute,
    clearRoute,
  } = useAppStore();

  const [originInput, setOriginInput] = useState('');
  const [destinationInput, setDestinationInput] = useState('');
  const [originDisplay, setOriginDisplay] = useState('');
  const [destinationDisplay, setDestinationDisplay] = useState('');
  const [showRoutePanel, setShowRoutePanel] = useState(false);
  
  // Geocoding states
  const [isGeocodingOrigin, setIsGeocodingOrigin] = useState(false);
  const [isGeocodingDestination, setIsGeocodingDestination] = useState(false);
  const [originSuggestions, setOriginSuggestions] = useState<LocationSuggestion[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  
  const originInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Debounced search for location suggestions
  const handleOriginInputChange = (value: string) => {
    setOriginInput(value);
    setShowOriginSuggestions(true);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.length >= 3) {
      searchTimeoutRef.current = setTimeout(async () => {
        const suggestions = await searchLocations(value);
        setOriginSuggestions(suggestions);
      }, 500);
    } else {
      setOriginSuggestions([]);
    }
  };

  const handleDestinationInputChange = (value: string) => {
    setDestinationInput(value);
    setShowDestinationSuggestions(true);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.length >= 3) {
      searchTimeoutRef.current = setTimeout(async () => {
        const suggestions = await searchLocations(value);
        setDestinationSuggestions(suggestions);
      }, 500);
    } else {
      setDestinationSuggestions([]);
    }
  };

  const handleOriginSelect = (suggestion: LocationSuggestion) => {
    setOrigin(suggestion.location);
    setOriginInput(suggestion.displayName);
    setOriginDisplay(suggestion.displayName);
    setShowOriginSuggestions(false);
    setOriginSuggestions([]);
  };

  const handleDestinationSelect = (suggestion: LocationSuggestion) => {
    setDestination(suggestion.location);
    setDestinationInput(suggestion.displayName);
    setDestinationDisplay(suggestion.displayName);
    setShowDestinationSuggestions(false);
    setDestinationSuggestions([]);
  };

  const handleUseCurrentLocation = () => {
    if (userLocation) {
      setOrigin(userLocation);
      setOriginInput('My Current Location');
      setOriginDisplay('My Current Location');
      setShowOriginSuggestions(false);
    }
  };

  const handleOriginSubmit = async (e?: React.KeyboardEvent) => {
    if (e && e.key !== 'Enter') return;
    
    setIsGeocodingOrigin(true);
    setShowOriginSuggestions(false);

    // Try to parse as coordinates first
    const coords = parseLocationInput(originInput);
    if (coords) {
      setOrigin(coords);
      setOriginDisplay(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
      setIsGeocodingOrigin(false);
      return;
    }

    // Otherwise, geocode the address/place name
    const result = await geocodeLocation(originInput);
    if (result) {
      setOrigin(result.location);
      setOriginDisplay(result.displayName);
      setOriginInput(result.displayName);
    } else {
      alert('Location not found. Please try a different search term or enter coordinates.');
    }
    setIsGeocodingOrigin(false);
  };

  const handleDestinationSubmit = async (e?: React.KeyboardEvent) => {
    if (e && e.key !== 'Enter') return;
    
    setIsGeocodingDestination(true);
    setShowDestinationSuggestions(false);

    // Try to parse as coordinates first
    const coords = parseLocationInput(destinationInput);
    if (coords) {
      setDestination(coords);
      setDestinationDisplay(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
      setIsGeocodingDestination(false);
      return;
    }

    // Otherwise, geocode the address/place name
    const result = await geocodeLocation(destinationInput);
    if (result) {
      setDestination(result.location);
      setDestinationDisplay(result.displayName);
      setDestinationInput(result.displayName);
    } else {
      alert('Location not found. Please try a different search term or enter coordinates.');
    }
    setIsGeocodingDestination(false);
  };

  const handleCalculateRoute = async () => {
    if (!origin || !destination) {
      alert('Please set both start point and destination before calculating route.');
      return;
    }
    
    try {
      await calculateRoute();
      if (!currentRoute) {
        console.error('Route calculation returned null');
      }
    } catch (error) {
      console.error('Error in route calculation:', error);
      alert('Failed to calculate route. Please try again.');
    }
  };

  const handleClearRoute = () => {
    clearRoute();
    setOriginInput('');
    setDestinationInput('');
    setOriginDisplay('');
    setDestinationDisplay('');
    setShowRoutePanel(false);
    setOriginSuggestions([]);
    setDestinationSuggestions([]);
  };

  if (!showRoutePanel) {
    return (
      <button
        onClick={() => setShowRoutePanel(true)}
        className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center justify-center gap-2 font-medium"
      >
        <Navigation className="w-4 h-4" />
        Get Directions
      </button>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <RouteIcon className="w-5 h-5 text-blue-600" />
            Get Directions
          </h3>
          <button
            onClick={handleClearRoute}
            className="text-gray-400 hover:text-gray-600 p-1"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Origin Input */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                ref={originInputRef}
                type="text"
                value={originInput}
                onChange={(e) => handleOriginInputChange(e.target.value)}
                onKeyDown={(e) => handleOriginSubmit(e)}
                onFocus={() => setShowOriginSuggestions(true)}
                onBlur={() => setTimeout(() => setShowOriginSuggestions(false), 200)}
                placeholder="Enter city, address, or place..."
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              {isGeocodingOrigin && (
                <Loader2 className="absolute right-3 top-3 w-4 h-4 text-blue-600 animate-spin" />
              )}
            </div>
            <button
              onClick={handleUseCurrentLocation}
              className="px-3 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1.5"
              title="Use my location"
            >
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">Me</span>
            </button>
          </div>
          
          {/* Origin Suggestions */}
          {showOriginSuggestions && originSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {originSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleOriginSelect(suggestion)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 flex items-start gap-2 border-b border-gray-100 last:border-0"
                >
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{suggestion.displayName}</span>
                </button>
              ))}
            </div>
          )}
          
          {origin && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs text-green-700 flex items-center gap-1">
                <span className="font-semibold">✓ From:</span>
                <span className="truncate">{originDisplay || `${origin.latitude.toFixed(4)}, ${origin.longitude.toFixed(4)}`}</span>
              </p>
            </div>
          )}
        </div>

        {/* Destination Input */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To
          </label>
          <div className="relative">
            <input
              ref={destinationInputRef}
              type="text"
              value={destinationInput}
              onChange={(e) => handleDestinationInputChange(e.target.value)}
              onKeyDown={(e) => handleDestinationSubmit(e)}
              onFocus={() => setShowDestinationSuggestions(true)}
              onBlur={() => setTimeout(() => setShowDestinationSuggestions(false), 200)}
              placeholder="Enter city, address, or place..."
              className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-red-500" />
            {isGeocodingDestination && (
              <Loader2 className="absolute right-3 top-3 w-4 h-4 text-blue-600 animate-spin" />
            )}
          </div>
          
          {/* Destination Suggestions */}
          {showDestinationSuggestions && destinationSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {destinationSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleDestinationSelect(suggestion)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 flex items-start gap-2 border-b border-gray-100 last:border-0"
                >
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{suggestion.displayName}</span>
                </button>
              ))}
            </div>
          )}
          
          {destination && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700 flex items-center gap-1">
                <span className="font-semibold">✓ To:</span>
                <span className="truncate">{destinationDisplay || `${destination.latitude.toFixed(4)}, ${destination.longitude.toFixed(4)}`}</span>
              </p>
            </div>
          )}
        </div>

        {/* Calculate Button */}
        <button
          onClick={handleCalculateRoute}
          disabled={!origin || !destination || isCalculatingRoute}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
        >
          {isCalculatingRoute ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" />
              Calculate Safe Route
            </>
          )}
        </button>

        {/* Route Info */}
        {currentRoute && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
            <h4 className="text-xs font-semibold text-green-900 mb-2">Route Found!</h4>
            <div className="space-y-1 text-xs text-green-800">
              <p>
                <span className="font-medium">Distance:</span>{' '}
                {currentRoute.distance.toFixed(2)} km
              </p>
              <p>
                <span className="font-medium">Est. Time:</span>{' '}
                {currentRoute.duration.toFixed(0)} min
              </p>
              <p>
                <span className="font-medium">Safety Score:</span>{' '}
                <span className={`font-bold ${
                  currentRoute.safetyScore >= 80 ? 'text-green-600' :
                  currentRoute.safetyScore >= 60 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {currentRoute.safetyScore.toFixed(0)}/100
                </span>
              </p>
              <p>
                <span className="font-medium">Recommendation:</span>{' '}
                <span className={`font-bold uppercase ${
                  currentRoute.recommendation === 'safe' ? 'text-green-700' :
                  currentRoute.recommendation === 'caution' ? 'text-yellow-700' :
                  'text-red-700'
                }`}>
                  {currentRoute.recommendation}
                </span>
              </p>
              <p>
                <span className="font-medium">Incidents on route:</span>{' '}
                {currentRoute.incidents.length}
              </p>
            </div>

            {/* Hazard Warning */}
            {currentRoute.hasHazards && (
              <div className="mt-3 p-2.5 bg-red-100 border-2 border-red-400 rounded-lg animate-pulse">
                <p className="text-xs font-bold text-red-900 flex items-center gap-1">
                  ⚠️ WARNING: Route crosses hazard zones!
                </p>
                <p className="text-[11px] text-red-800 mt-1.5 font-medium">
                  {currentRoute.alternatives && currentRoute.alternatives.length > 1 ? (
                    <>
                      {currentRoute.alternatives.filter(a => !a.hasHazards).length} safer alternative{currentRoute.alternatives.filter(a => !a.hasHazards).length !== 1 ? 's' : ''} available below. 
                      <span className="block mt-1">👇 Click to view on map</span>
                    </>
                  ) : (
                    'No safer alternatives found. Proceed with caution.'
                  )}
                </p>
              </div>
            )}

            {/* Incidents List */}
            {currentRoute.incidents.length > 0 && (
              <div className="mt-3 space-y-2">
                <h5 className="text-xs font-semibold text-gray-900">Incidents on route:</h5>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {currentRoute.incidents.map((incident) => (
                    <div
                      key={incident.id}
                      className="text-xs p-2 bg-white border border-gray-200 rounded"
                    >
                      <p className="font-medium text-gray-900">{incident.title}</p>
                      <p className="text-gray-600 text-[10px] mt-0.5">
                        {incident.type.replace('_', ' ').toUpperCase()} • Severity: {incident.severity}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Route Alternatives */}
            {currentRoute.alternatives && currentRoute.alternatives.length > 0 && (
              <div className="mt-4 space-y-2">
                <h5 className="text-xs font-semibold text-gray-900">📍 Available Routes:</h5>
                <div className="space-y-2">
                  {/* Primary Route */}
                  <button
                    onClick={() => selectAlternativeRoute(0)}
                    className={`w-full text-left p-2 border rounded transition-all ${
                      selectedAlternativeId === null || selectedAlternativeId === 0
                        ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-300'
                        : currentRoute.hasHazards 
                          ? 'bg-red-50 border-red-200 hover:bg-red-100' 
                          : 'bg-green-50 border-green-200 hover:bg-green-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-gray-900">Route 1</span>
                        {(selectedAlternativeId === null || selectedAlternativeId === 0) && (
                          <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded">SELECTED</span>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        currentRoute.recommendation === 'safe' ? 'bg-green-600 text-white' :
                        currentRoute.recommendation === 'caution' ? 'bg-yellow-600 text-white' :
                        'bg-red-600 text-white'
                      }`}>
                        {currentRoute.recommendation.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-700 space-y-0.5">
                      <p>{currentRoute.distance.toFixed(2)} km • {currentRoute.duration.toFixed(0)} min • Safety: {currentRoute.safetyScore}/100</p>
                      <p>Incidents: {currentRoute.incidents.length} on route</p>
                      {currentRoute.hasHazards && (
                        <p className="text-red-700 font-bold">⚠️ Crosses hazard zones</p>
                      )}
                    </div>
                  </button>

                  {/* Alternative Routes */}
                  {currentRoute.alternatives.slice(1).map((alt, index) => (
                    <button
                      key={alt.routeId}
                      onClick={() => selectAlternativeRoute(alt.routeId)}
                      className={`w-full text-left p-2 border rounded transition-all ${
                        selectedAlternativeId === alt.routeId
                          ? 'bg-purple-100 border-purple-500 ring-2 ring-purple-300'
                          : alt.hasHazards 
                            ? 'bg-red-50 border-red-200 hover:bg-red-100' 
                            : 'bg-green-50 border-green-200 hover:bg-green-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-gray-900">Route {index + 2}</span>
                          {selectedAlternativeId === alt.routeId && (
                            <span className="text-[10px] bg-purple-600 text-white px-1.5 py-0.5 rounded">SELECTED</span>
                          )}
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          alt.recommendation === 'safe' ? 'bg-green-600 text-white' :
                          alt.recommendation === 'caution' ? 'bg-yellow-600 text-white' :
                          'bg-red-600 text-white'
                        }`}>
                          {alt.recommendation.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-700 space-y-0.5">
                        <p>{alt.distance.toFixed(2)} km • {alt.duration.toFixed(0)} min • Safety: {alt.safetyScore}/100</p>
                        <p>Incidents: {alt.nearbyIncidents} nearby • {alt.avoidedIncidents} avoided</p>
                        {alt.hasHazards && (
                          <p className="text-red-700 font-bold">⚠️ Crosses hazard zones</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Help Text */}
        {!currentRoute && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-600 font-medium mb-1">💡 How to use:</p>
            <ul className="text-xs text-gray-600 space-y-1 ml-4 list-disc">
              <li>Type a city, suburb, or landmark name</li>
              <li>Select from suggestions or press Enter</li>
              <li>Click "Me" to use your current location</li>
              <li>Or enter coordinates: -12.4634, 130.8456</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
