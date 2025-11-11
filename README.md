# Safe Map 🗺️🛡️

**Safe Map** is a real-time incident tracking and safe route planning application that helps users find the safest route for travel. The app connects to live incident and hazard data sources, displays interactive markers with details and severity levels, and calculates optimal safe routes using AI-powered safety scoring.

![Safe Map Demo](https://via.placeholder.com/800x400?text=Safe+Map+Demo)

## 🌟 Features

### Core Features
- **Real-time Incident Tracking**: Live data from NT Road Report API and other sources
- **Interactive Map**: OpenStreetMap integration with interactive incident markers
- **AI Safety Scoring**: Intelligent route safety analysis based on multiple factors
- **Safe Route Planning**: Calculate the safest path avoiding high-risk areas
- **User Reports**: Community-driven incident reporting system
- **Authority Verification**: Verified alerts from authorities
- **Location-Aware**: Automatic user location detection
- **Advanced Filtering**: Filter incidents by type, severity, status, and date
- **Layer Management**: Toggle incident categories on/off
- **Real-time Updates**: Auto-refresh incident data every 5 minutes

### Incident Types Supported
- 🚧 Road Closures
- 🌊 Floods
- 🚗 Accidents
- 🔥 Bushfires
- 👷 Construction
- ⚠️ Hazards
- 🌤️ Weather Events
- 🚦 Traffic Congestion

### Severity Levels
- 🟢 Low
- 🟡 Moderate
- 🟠 High
- 🔴 Critical
- ⛔ Extreme

## 🏗️ Tech Stack

### Backend
- **Node.js** with **Express** - REST API server
- **TypeScript** - Type-safe development
- **Axios** - HTTP client for external APIs
- **Node Cache** - In-memory caching
- **Helmet** - Security middleware
- **Express Rate Limit** - API rate limiting

### Frontend (Web)
- **React 18** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **Zustand** - State management
- **Leaflet** with **OpenStreetMap** - Map rendering and geolocation (free, no API key required!)
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library
- **date-fns** - Date formatting

## 📁 Project Structure

```
nt-roadmap/
├── packages/
│   ├── server/              # Backend API
│   │   ├── src/
│   │   │   ├── index.ts     # Main server file
│   │   │   ├── types/       # TypeScript interfaces
│   │   │   └── services/    # Business logic
│   │   │       ├── ntRoadReport.service.ts
│   │   │       ├── incident.service.ts
│   │   │       └── safetyScore.service.ts
│   │   └── package.json
│   │
│   └── web/                 # React web app
│       ├── src/
│       │   ├── main.tsx     # Entry point
│       │   ├── App.tsx      # Main app component
│       │   ├── components/  # React components
│       │   ├── services/    # API services
│       │   ├── store/       # State management
│       │   ├── types/       # TypeScript types
│       │   └── utils/       # Helper functions
│       └── package.json
│
├── package.json             # Root package.json
├── tsconfig.json            # Root TypeScript config
└── README.md                # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and **npm** 9+
- Internet connection (for OpenStreetMap tiles and external APIs)

**Note:** No API keys required! We use free OpenStreetMap instead of Google Maps.

### Installation

1. **Clone the repository**
   ```bash
   cd /Users/alvinho/Projects/nt-roadmap
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   **Backend** (`packages/server/.env`):
   ```bash
   cp packages/server/.env.example packages/server/.env
   ```
   
   Edit `packages/server/.env`:
   ```env
   PORT=3001
   NODE_ENV=development
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   # NT Road Report API
NT_ROAD_REPORT_API=https://roadreport.nt.gov.au/api/Obstruction/GetAll
   CORS_ORIGIN=http://localhost:3000
   CACHE_TTL_SECONDS=300
   ```

   **Frontend** (`packages/web/.env`):
   ```bash
   cp packages/web/.env.example packages/web/.env
   ```
   
   Edit `packages/web/.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:3001
   ```

   **Note:** No Google Maps API key needed! We use OpenStreetMap which is free and open-source.

### Running the Application

**Development mode (runs both server and web):**
```bash
npm run dev
```

This will start:
- Backend server: http://localhost:3001
- Frontend web app: http://localhost:3000

**Or run separately:**

**Backend only:**
```bash
npm run dev:server
```

**Frontend only:**
```bash
npm run dev:web
```

### Building for Production

```bash
npm run build
```

This builds both backend and frontend for production deployment.

## 📡 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Endpoints

#### Get All Incidents
```http
GET /api/incidents
```

**Query Parameters:**
- `types` (optional): Comma-separated incident types
- `severity` (optional): Comma-separated severity levels (1-5)
- `status` (optional): Comma-separated statuses
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "incident-123",
      "type": "road_closure",
      "severity": 4,
      "status": "active",
      "location": {
        "latitude": -12.4634,
        "longitude": 130.8456
      },
      "title": "Road Closure on Stuart Highway",
      "description": "Complete closure due to flooding",
      "reportedAt": "2025-11-11T10:00:00Z",
      "updatedAt": "2025-11-11T10:00:00Z",
      "source": "api"
    }
  ],
  "timestamp": "2025-11-11T12:00:00Z"
}
```

#### Get Incident by ID
```http
GET /api/incidents/:id
```

#### Calculate Safe Route
```http
POST /api/routes/safe
```

**Body:**
```json
{
  "origin": {
    "latitude": -12.4634,
    "longitude": 130.8456
  },
  "destination": {
    "latitude": -12.8010,
    "longitude": 131.1318
  },
  "waypoints": []
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "origin": { ... },
    "destination": { ... },
    "distance": 75000,
    "safetyScore": 85,
    "safetyDetails": {
      "overall": 85,
      "factors": {
        "incidentDensity": 90,
        "severityWeight": 85,
        "routeLength": 88,
        "weatherConditions": 85
      },
      "recommendation": "safe"
    },
    "incidents": [...],
    "recommendation": "safe"
  }
}
```

#### Submit User Report
```http
POST /api/reports
```

**Body:**
```json
{
  "type": "accident",
  "location": {
    "latitude": -12.4634,
    "longitude": 130.8456
  },
  "description": "Vehicle accident blocking left lane",
  "photos": [],
  "userId": "user-123"
}
```

#### Get All Reports
```http
GET /api/reports
```

#### Verify Report (Authority)
```http
POST /api/reports/:id/verify
```

**Body:**
```json
{
  "verifiedBy": "authority-name"
}
```

#### Get Statistics
```http
GET /api/stats
```

#### Refresh Incidents
```http
POST /api/incidents/refresh
```

## 🎨 UI Components

### Map Component
- Interactive OpenStreetMap integration (free, no API key required)
- Custom colored markers for each incident type
- Click markers to view details in popup or sidebar
- User location indicator (blue circle)

### Sidebar
- Incident layer selector
- Filter controls
- Report button
- Refresh button
- Live statistics

### Incident Details Panel
- Detailed incident information
- Severity and status badges
- Location coordinates
- Timestamp information

### Report Form
- User-friendly incident reporting
- Type selection
- Description field
- Auto-location capture

## 🤖 AI Safety Scoring

The safety score algorithm considers multiple factors:

1. **Incident Density** (35% weight)
   - Number of incidents per 100km
   - Active/monitoring incidents only

2. **Severity Weight** (45% weight)
   - Weighted by severity levels
   - Critical and extreme incidents heavily weighted

3. **Route Length** (10% weight)
   - Preference for shorter routes under 500km

4. **Weather Conditions** (10% weight)
   - Placeholder for weather API integration

**Score Interpretation:**
- 70-100: ✅ Safe (green)
- 40-69: ⚠️ Caution (yellow)
- 0-39: 🚫 Avoid (red)

## 🔄 Data Flow

1. **Initial Load**: App fetches incidents from NT Road Report API
2. **Auto-refresh**: Data refreshes every 5 minutes
3. **User Reports**: Community reports added to incident list
4. **Route Calculation**: Real-time safety analysis on route requests
5. **State Management**: Zustand manages all app state
6. **Caching**: Server caches external API responses

## 🛠️ Development

### Adding New Incident Types

1. Add to `IncidentType` enum in `types/index.ts`
2. Add color in `utils/helpers.ts`
3. Add label in `utils/helpers.ts`

### Extending Safety Score

Modify `SafetyScoreService` in `packages/server/src/services/safetyScore.service.ts`

### Adding New API Endpoints

Add routes in `packages/server/src/index.ts`

## 📱 Future Enhancements

- [ ] React Native mobile app
- [ ] OpenStreetMap integration as fallback
- [ ] Weather API integration
- [ ] Traffic data integration
- [ ] Push notifications for nearby incidents
- [ ] Offline map support
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Route history
- [ ] Favorite locations
- [ ] Social sharing
- [ ] Advanced analytics dashboard

## 🔒 Security

- **Helmet.js** for security headers
- **CORS** configuration
- **Rate limiting** on API endpoints
- **Input validation** with Joi
- **Environment variables** for sensitive data

## 🧪 Testing

```bash
npm test
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 👥 Support

For support, please contact the development team or open an issue in the repository.

## 🙏 Acknowledgments

- NT Road Report API for incident data
- OpenStreetMap contributors for free mapping data
- Leaflet for the excellent mapping library
- Open source community

---

**Built with ❤️ for safer travel**
