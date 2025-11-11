# Quick Start Guide

## First Time Setup

### 1. Install Dependencies

```bash
# From the project root
npm install
```

This will install all dependencies for both the backend and frontend.

### 2. Configure Environment Variables

**No API keys required!** We use free OpenStreetMap instead of Google Maps.

**Backend Configuration:**

```bash
# Create backend .env file
cp packages/server/.env.example packages/server/.env
```

**Frontend Configuration:**

```bash
# Create frontend .env file
cp packages/web/.env.example packages/web/.env
```

The default configuration works out of the box!

### 3. Start the Application

```bash
npm run dev
```

This command will:
- Start the backend server on http://localhost:3001
- Start the frontend web app on http://localhost:5173
- Open your browser automatically

### 4. Using the App

1. **View Incidents**: The map will load with all current incidents
2. **Filter**: Click "Filters" to filter by type, severity, or status
3. **Report**: Click "Report Incident" to submit a new report
4. **Details**: Click any marker on the map to see incident details
5. **Layers**: Toggle incident types on/off using the sidebar

## Troubleshooting

### Map not loading?
- Check your internet connection (OpenStreetMap tiles require network access)
- Clear browser cache and reload
- Check browser console for errors (F12)

### No incidents showing?
- Click the "Refresh" button
- Check that the NT Road Report API is accessible
- Look at server console for error messages

### API errors?
- Ensure both servers are running
- Check that ports 3000 and 3001 are not in use
- Verify CORS settings in backend .env

## Development Commands

```bash
# Start both servers
npm run dev

# Start only backend
npm run dev:server

# Start only frontend
npm run dev:web

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

## Project Structure Overview

```
nt-roadmap/
├── packages/
│   ├── server/       # Backend API (Node.js + Express)
│   └── web/          # Frontend App (React + Vite)
├── package.json      # Root dependencies
└── README.md         # Full documentation
```

## Next Steps

- Read the full README.md for detailed documentation
- Explore the API endpoints in the backend
- Customize the incident types and colors
- Add your own data sources
- Deploy to production

## Need Help?

Check the main README.md for:
- Complete API documentation
- Architecture details
- Deployment guides
- Contributing guidelines
