import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppStore } from '../store/appStore';
import { Incident, IncidentType } from '../types';
import { INCIDENT_COLORS, INCIDENT_LABELS } from '../utils/helpers';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Helper function to get icon emoji for incident type
function getIconEmoji(type: IncidentType): string {
  const icons: Record<IncidentType, string> = {
    [IncidentType.ROAD_CLOSURE]: '🚧',
    [IncidentType.FLOOD]: '🌊',
    [IncidentType.ACCIDENT]: '⚠️',
    [IncidentType.BUSHFIRE]: '🔥',
    [IncidentType.CONSTRUCTION]: '🚧',
    [IncidentType.HAZARD]: '⚠️',
    [IncidentType.WEATHER]: '🌤️',
    [IncidentType.TRAFFIC]: '🚗',
    [IncidentType.OTHER]: 'ℹ️',
  };
  return icons[type] || 'ℹ️';
}

function MapComponent() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersMapRef = useRef<Record<string, L.Marker>>({});
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const routeBorderRef = useRef<L.Polyline | null>(null);
  const routeMarkersRef = useRef<L.Marker[]>([]);

  const {
    mapCenter,
    mapZoom,
    filteredIncidents,
    currentRoute,
    selectedAlternativeId,
    origin,
    destination,
    selectedIncident,
    setMapCenter,
    setUserLocation,
  } = useAppStore();

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create Leaflet map with OpenStreetMap tiles
    mapInstanceRef.current = L.map(mapRef.current).setView(
      [mapCenter.latitude, mapCenter.longitude],
      mapZoom
    );

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);

    // Try to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setUserLocation(userPos);
          setMapCenter(userPos);

          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([userPos.latitude, userPos.longitude], mapZoom);

            // Add user location marker
            const userIcon = L.divIcon({
              className: 'user-location-marker',
              html: '<div style="width: 16px; height: 16px; background: #4285F4; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>',
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            });

            userMarkerRef.current = L.marker([userPos.latitude, userPos.longitude], {
              icon: userIcon,
              title: 'Your Location',
            }).addTo(mapInstanceRef.current);
          }
        },
        (error) => {
          console.warn('Error getting location:', error);
        }
      );
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map center and zoom
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([mapCenter.latitude, mapCenter.longitude], mapZoom);
    }
  }, [mapCenter, mapZoom]);

  // Update incident markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    Object.values(markersMapRef.current).forEach((marker) => marker.remove());
    markersMapRef.current = {};

    // Add new markers
    filteredIncidents.forEach((incident) => {
      const marker = createIncidentMarker(incident, mapInstanceRef.current!);
      markersMapRef.current[incident.id] = marker;
    });
  }, [filteredIncidents]);

  // Focus on selected incident and open popup
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedIncident) return;

    const marker = markersMapRef.current[selectedIncident.id];
    if (marker) {
      // Open the popup
      marker.openPopup();
      
      // Pan to the marker (the zoom is already set by focusOnIncident in the store)
      mapInstanceRef.current.panTo(marker.getLatLng());
    }
  }, [selectedIncident]);

  // Update route display
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    try {
      // Clear existing route
      if (routeLayerRef.current) {
        routeLayerRef.current.remove();
        routeLayerRef.current = null;
      }
      if (routeBorderRef.current) {
        routeBorderRef.current.remove();
        routeBorderRef.current = null;
      }
      routeMarkersRef.current.forEach((marker) => marker.remove());
      routeMarkersRef.current = [];

      // Draw route if exists
      if (currentRoute) {
        console.log('Rendering route on map:', currentRoute);
        
        // Validate route data
        if (!currentRoute.origin || !currentRoute.destination) {
          console.error('Invalid route data - missing origin or destination');
          return;
        }

        // Determine which route to display (primary or selected alternative)
        let routeToDisplay = currentRoute;
        let isAlternative = false;

        if (selectedAlternativeId !== null && currentRoute.alternatives) {
          const alternative = currentRoute.alternatives.find(alt => alt.routeId === selectedAlternativeId);
          if (alternative) {
            // Use the alternative route data
            routeToDisplay = {
              ...currentRoute,
              geometry: alternative.geometry,
              distance: alternative.distance,
              duration: alternative.duration,
              safetyScore: alternative.safetyScore,
              hasHazards: alternative.hasHazards,
              recommendation: alternative.recommendation,
            };
            isAlternative = true;
            console.log(`Displaying alternative route ${selectedAlternativeId}`);
          }
        }

        // Use geometry if available (real road path from OSRM), otherwise fall back to straight line
        let points: [number, number][];
        
        if (routeToDisplay.geometry && routeToDisplay.geometry.length > 0) {
          // Use the actual road geometry from OSRM
          points = routeToDisplay.geometry.map(point => 
            [point.latitude, point.longitude] as [number, number]
          );
          console.log(`Using OSRM geometry with ${points.length} points`);
        } else {
          // Fallback to straight line
          points = [
            [routeToDisplay.origin.latitude, routeToDisplay.origin.longitude] as [number, number],
            ...(routeToDisplay.waypoints || []).map(wp => [wp.latitude, wp.longitude] as [number, number]),
            [routeToDisplay.destination.latitude, routeToDisplay.destination.longitude] as [number, number],
          ];
          console.log('Using straight line fallback');
        }

        console.log('Route points:', points);

        // Use different colors for alternative routes
        const routeColor = isAlternative ? '#8b5cf6' : '#2563eb'; // Purple for alternatives, blue for primary
        const borderColor = '#ffffff';

        // Create route with white border for high visibility
        // First draw the white border (thicker line)
        routeBorderRef.current = L.polyline(points, {
          color: borderColor,
          weight: 10,
          opacity: 0.9,
        }).addTo(mapInstanceRef.current);

        // Then draw the colored route on top
        routeLayerRef.current = L.polyline(points, {
          color: routeColor,
          weight: 6,
          opacity: 1,
        }).addTo(mapInstanceRef.current);

        console.log('Route polyline added to map with blue color and white border');

      // Add start marker
      const startIcon = L.divIcon({
        className: 'route-marker',
        html: '<div style="width: 24px; height: 24px; background: #22c55e; border: 3px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">A</div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const startMarker = L.marker(
        [currentRoute.origin.latitude, currentRoute.origin.longitude],
        { icon: startIcon, title: 'Start' }
      ).addTo(mapInstanceRef.current);
      routeMarkersRef.current.push(startMarker);

      // Add end marker
      const endIcon = L.divIcon({
        className: 'route-marker',
        html: '<div style="width: 24px; height: 24px; background: #ef4444; border: 3px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">B</div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const endMarker = L.marker(
        [currentRoute.destination.latitude, currentRoute.destination.longitude],
        { icon: endIcon, title: 'Destination' }
      ).addTo(mapInstanceRef.current);
      routeMarkersRef.current.push(endMarker);

        // Fit map to route bounds
        mapInstanceRef.current.fitBounds(routeLayerRef.current.getBounds(), {
          padding: [50, 50],
        });
      } else if (origin || destination) {
        // Show origin/destination markers even without route
        if (origin) {
          const originIcon = L.divIcon({
            className: 'route-marker',
            html: '<div style="width: 20px; height: 20px; background: #22c55e; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });
          const marker = L.marker([origin.latitude, origin.longitude], {
            icon: originIcon,
            title: 'Origin',
          }).addTo(mapInstanceRef.current);
          routeMarkersRef.current.push(marker);
        }

        if (destination) {
          const destIcon = L.divIcon({
            className: 'route-marker',
            html: '<div style="width: 20px; height: 20px; background: #ef4444; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });
          const marker = L.marker([destination.latitude, destination.longitude], {
            icon: destIcon,
            title: 'Destination',
          }).addTo(mapInstanceRef.current);
          routeMarkersRef.current.push(marker);
        }
      }
    } catch (error) {
      console.error('Error rendering route on map:', error);
    }
  }, [currentRoute, origin, destination, selectedAlternativeId]);

  return <div ref={mapRef} className="w-full h-full" />;
}

function createIncidentMarker(incident: Incident, map: L.Map): L.Marker {
  const color = INCIDENT_COLORS[incident.type];
  const size = 40; // Fixed size for better visibility

  // Create custom icon with emoji
  const icon = L.divIcon({
    className: 'custom-incident-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        opacity: 0.95;
        box-shadow: 0 3px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        cursor: pointer;
      ">
        ${getIconEmoji(incident.type)}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });

  const marker = L.marker([incident.location.latitude, incident.location.longitude], {
    icon,
    title: incident.title,
  }).addTo(map);

  // Get data from metadata
  const roadName = incident.metadata?.roadName || 'Unknown Road';
  const restrictionType = incident.metadata?.restrictionType || '';
  const locationComment = incident.metadata?.locationComment || '';
  const comment = incident.metadata?.comment || incident.description;

  // Create popup content matching the NT Road Report design
  const popupContent = `
    <div style="min-width: 320px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;">
      <!-- Header with icon and category -->
      <div style="
        background-color: ${color};
        color: white;
        padding: 12px 16px;
        margin: -10px -10px 0 -10px;
        border-radius: 8px 8px 0 0;
        display: flex;
        align-items: center;
        gap: 12px;
      ">
        <div style="
          width: 48px;
          height: 48px;
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        ">
          ${getIconEmoji(incident.type)}
        </div>
        <div style="flex: 1;">
          <h3 style="
            font-size: 18px;
            font-weight: bold;
            margin: 0;
            padding: 0;
            line-height: 1.3;
          ">
            ${INCIDENT_LABELS[incident.type]}
          </h3>
          ${restrictionType ? `
            <p style="
              font-size: 13px;
              margin: 4px 0 0 0;
              padding: 0;
              opacity: 0.95;
              line-height: 1.2;
            ">
              ${restrictionType}
            </p>
          ` : ''}
        </div>
      </div>

      <!-- Content sections -->
      <div style="padding: 16px 0; margin: 0 16px;">
        <!-- Road Name -->
        <div style="margin-bottom: 16px;">
          <h4 style="
            font-size: 13px;
            font-weight: bold;
            color: #1f2937;
            margin: 0 0 6px 0;
            padding: 0;
          ">
            Road Name
          </h4>
          <p style="
            font-size: 15px;
            color: #374151;
            margin: 0;
            padding: 0;
            line-height: 1.4;
          ">
            ${roadName}
          </p>
        </div>

        <!-- Section Affected -->
        ${locationComment ? `
          <div style="margin-bottom: 16px;">
            <h4 style="
              font-size: 13px;
              font-weight: bold;
              color: #1f2937;
              margin: 0 0 6px 0;
              padding: 0;
            ">
              Section Affected
            </h4>
            <p style="
              font-size: 15px;
              color: #374151;
              margin: 0;
              padding: 0;
              line-height: 1.4;
            ">
              ${locationComment}
            </p>
          </div>
        ` : ''}

        <!-- Comments -->
        <div>
          <h4 style="
            font-size: 13px;
            font-weight: bold;
            color: #1f2937;
            margin: 0 0 6px 0;
            padding: 0;
          ">
            Comments
          </h4>
          <p style="
            font-size: 15px;
            color: #374151;
            margin: 0;
            padding: 0;
            line-height: 1.5;
          ">
            ${comment}
          </p>
        </div>
      </div>
    </div>
  `;

  marker.bindPopup(popupContent, {
    maxWidth: 400,
    className: 'incident-popup'
  });

  return marker;
}

export function Map() {
  return <MapComponent />;
}
