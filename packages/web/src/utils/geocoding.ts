import { Location } from '../types';

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  type: string;
  importance: number;
}

/**
 * Geocode a location name/address to coordinates using OpenStreetMap's Nominatim API
 */
export async function geocodeLocation(query: string): Promise<{
  location: Location;
  displayName: string;
} | null> {
  try {
    // Prioritize Northern Territory, Australia in search
    const searchQuery = encodeURIComponent(query);
    const url = `https://nominatim.openstreetmap.org/search?q=${searchQuery}&format=json&limit=5&countrycodes=au`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SafeMap/1.0', // Nominatim requires a User-Agent
      },
    });

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const results: NominatimResult[] = await response.json();

    if (results.length === 0) {
      return null;
    }

    // Prefer results in Northern Territory
    const ntResult = results.find(r => 
      r.display_name.toLowerCase().includes('northern territory') ||
      r.display_name.toLowerCase().includes(', nt,')
    );

    const bestResult = ntResult || results[0];

    return {
      location: {
        latitude: parseFloat(bestResult.lat),
        longitude: parseFloat(bestResult.lon),
      },
      displayName: bestResult.display_name,
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Get suggestions for autocomplete
 */
export async function searchLocations(query: string): Promise<Array<{
  displayName: string;
  location: Location;
}>> {
  if (query.length < 3) return [];

  try {
    const searchQuery = encodeURIComponent(query);
    const url = `https://nominatim.openstreetmap.org/search?q=${searchQuery}&format=json&limit=5&countrycodes=au`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SafeMap/1.0',
      },
    });

    if (!response.ok) return [];

    const results: NominatimResult[] = await response.json();

    return results.map(r => ({
      displayName: r.display_name,
      location: {
        latitude: parseFloat(r.lat),
        longitude: parseFloat(r.lon),
      },
    }));
  } catch (error) {
    console.error('Location search error:', error);
    return [];
  }
}

/**
 * Parse user input - detect if it's coordinates or location name
 */
export function parseLocationInput(input: string): { latitude: number; longitude: number } | null {
  // Try to parse as coordinates (e.g., "-12.4634, 130.8456" or "-12.4634 130.8456")
  const coordPattern = /^(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)$/;
  const match = input.trim().match(coordPattern);
  
  if (match) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { latitude: lat, longitude: lng };
    }
  }
  
  return null;
}
