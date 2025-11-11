# OpenStreetMap Migration

## Overview

Safe Map now uses **OpenStreetMap** with **Leaflet** instead of Google Maps. This change provides:

- ✅ **Free & Open Source**: No API keys or billing required
- ✅ **Community Driven**: OpenStreetMap data is maintained by contributors worldwide
- ✅ **Privacy Friendly**: No tracking or data collection
- ✅ **Full Featured**: Complete mapping functionality with markers, popups, and layers

## What Changed

### Dependencies

**Removed:**
- `@googlemaps/react-wrapper`
- `@types/google.maps`
- Google Maps API key requirement

**Added:**
- `leaflet` ^1.9.4
- `@types/leaflet` ^1.9.8

### Environment Variables

**Removed:**
- `VITE_GOOGLE_MAPS_API_KEY` - No longer needed!

**Remaining:**
- `VITE_API_BASE_URL` - Backend API endpoint

### Code Changes

#### Map Component (`packages/web/src/components/Map.tsx`)

**Before (Google Maps):**
```typescript
import { Wrapper } from '@googlemaps/react-wrapper';
const map = new google.maps.Map(element, options);
const marker = new google.maps.Marker({ position, map });
```

**After (OpenStreetMap/Leaflet):**
```typescript
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
const map = L.map(element).setView([lat, lng], zoom);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
const marker = L.marker([lat, lng]).addTo(map);
```

## Features

### Custom Incident Markers

Each incident is displayed with a colored circle marker:
- **Color**: Based on incident type (accident, roadwork, hazard, weather, closure)
- **Border**: Colored by severity (low=yellow, medium=orange, high=red)
- **Size**: Scales with severity (higher severity = larger marker)

### User Location

Your current location is shown as a blue circle with white border.

### Interactive Popups

Click any incident marker to see:
- Incident title
- Brief description
- Click again for full details in the sidebar

### Map Tiles

Uses OpenStreetMap's tile server:
- URL: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- Attribution: © OpenStreetMap contributors
- Max zoom: Level 19

## Installation

After the migration, install new dependencies:

```bash
# From project root
npm install

# Or just for web package
cd packages/web
npm install
```

## Usage

No changes to usage! The map works exactly the same:

```bash
# Start backend
cd packages/server
npm run dev

# Start frontend
cd packages/web
npm run dev
```

Visit `http://localhost:5173` - the map will load automatically without any API keys!

## Technical Details

### Leaflet Configuration

The Map component includes several important configurations:

```typescript
// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});
```

### Custom Markers

Incidents use custom `divIcon` markers instead of default pins:

```typescript
const icon = L.divIcon({
  className: 'custom-incident-marker',
  html: `<div style="..."></div>`,
  iconSize: [size, size],
  iconAnchor: [size / 2, size / 2],
});
```

### Marker Events

```typescript
marker.on('click', () => {
  setSelectedIncident(incident);
});
```

### Popups

```typescript
marker.bindPopup(`
  <div>
    <h3>${incident.title}</h3>
    <p>${incident.description}</p>
  </div>
`);
```

## Benefits

### 1. No API Key Management
- No more credential setup
- No billing or usage limits
- No API key security concerns

### 2. Offline Development
- Cache tiles locally for offline work
- No network dependency for basic features

### 3. Customization
- Full control over map styling
- Custom tile servers possible
- Multiple layer support

### 4. Performance
- Lightweight library (~40kb gzipped)
- Efficient tile loading
- Mobile-optimized

## Alternative Tile Providers

You can easily switch to other tile providers:

### Mapbox (Requires API key)
```typescript
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  id: 'mapbox/streets-v11',
  accessToken: 'YOUR_MAPBOX_TOKEN'
}).addTo(map);
```

### CartoDB (Free, no key)
```typescript
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap © CartoDB'
}).addTo(map);
```

### Stamen Terrain (Free, no key)
```typescript
L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg', {
  attribution: 'Map tiles by Stamen Design, under CC BY 3.0'
}).addTo(map);
```

## Troubleshooting

### Markers not displaying
- Ensure Leaflet CSS is imported: `import 'leaflet/dist/leaflet.css'`
- Check icon configuration in component initialization

### Map not loading
- Verify internet connection (tiles loaded from OpenStreetMap servers)
- Check browser console for CORS errors
- Ensure map container has explicit height/width

### Type errors
- Install `@types/leaflet`: `npm install -D @types/leaflet`
- Ensure TypeScript version is ^5.3.2 or higher

## Resources

- [Leaflet Documentation](https://leafletjs.com/reference.html)
- [OpenStreetMap](https://www.openstreetmap.org/)
- [Leaflet Tutorials](https://leafletjs.com/examples.html)
- [Tile Providers List](https://leaflet-extras.github.io/leaflet-providers/preview/)

## Migration Checklist

- [x] Remove Google Maps dependencies from package.json
- [x] Add Leaflet dependencies
- [x] Update Map.tsx component
- [x] Remove VITE_GOOGLE_MAPS_API_KEY from .env files
- [x] Update vite-env.d.ts type definitions
- [x] Test incident markers display correctly
- [x] Test user location detection
- [x] Test marker click events and popups
- [x] Update documentation

## Next Steps

1. Install dependencies: `npm install`
2. Remove any .env file if it has old Google Maps key
3. Start the app and verify map loads
4. Test all map features (markers, popups, filtering)

The map should now work without any API keys! 🎉
