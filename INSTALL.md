# Installation Instructions

## Prerequisites Checklist

Before installing Safe Map, ensure you have:

- [ ] **Node.js 18+** installed ([Download](https://nodejs.org/))
- [ ] **npm 9+** installed (comes with Node.js)
- [ ] **Git** installed (for cloning)
- [ ] **Terminal/Command Line** access
- [ ] **Code Editor** (VS Code recommended)

**Note:** No API keys required! We use free OpenStreetMap instead of Google Maps.

## Installation Steps

### Step 1: Verify Prerequisites

```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version (should be 9+)
npm --version
```

### Step 2: Navigate to Project

```bash
cd /Users/alvinho/Projects/nt-roadmap
```

### Step 3: Run Automated Setup

```bash
# Make setup script executable (if needed)
chmod +x setup.sh

# Run setup script
./setup.sh
```

The setup script will:
- ✅ Check Node.js and npm versions
- ✅ Install all dependencies
- ✅ Create .env files from templates

### Step 4: Configure Environment (Optional)

The default configuration works out of the box! But you can customize if needed:

**Backend (.env):**
```bash
# Edit packages/server/.env
nano packages/server/.env

# Available options:
PORT=3001
NODE_ENV=development
NT_ROAD_REPORT_API=https://roadreport.nt.gov.au/api/Obstruction/GetAll
```

**Frontend (.env):**
```bash
# Edit packages/web/.env
nano packages/web/.env

# Available options:
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...your_actual_key...
```

### Step 5: Start the Application

```bash
# Start both backend and frontend
npm run dev
```

This will start:
- 🔧 Backend API on http://localhost:3001
- 🌐 Frontend Web App on http://localhost:3000

Your browser should automatically open to http://localhost:3000

## Alternative: Manual Installation

If the setup script doesn't work:

```bash
# 1. Install root dependencies
npm install

# 2. Create backend .env
cp packages/server/.env.example packages/server/.env

# 3. Create frontend .env
cp packages/web/.env.example packages/web/.env

# 4. Start the application (no API keys needed!)
npm run dev
```

## Verification Steps

After installation, verify:

### 1. Backend is Running
```bash
# Test health endpoint
curl http://localhost:3001/health

# Should return:
# {"status":"ok","timestamp":"2025-11-11T..."}
```

### 2. Frontend is Accessible
- Open http://localhost:5173 in browser
- OpenStreetMap should load automatically (no API key required!)
- Sidebar should show "Safe Map"

### 3. API is Working
```bash
# Test incidents endpoint
curl http://localhost:3001/api/incidents

# Should return JSON with incidents
```

## Troubleshooting

### Issue: "npm: command not found"
**Solution:** Install Node.js from https://nodejs.org/

### Issue: "Port 3000 is already in use"
**Solution:** 
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in packages/web/vite.config.ts
```

### Issue: "Port 3001 is already in use"
**Solution:**
```bash
# Find and kill process using port 3001
lsof -ti:3001 | xargs kill -9

# Or change PORT in packages/server/.env
```

### Issue: Map not loading
**Solutions:**
1. Check internet connection (OpenStreetMap tiles require network access)
2. Check browser console for errors (F12)
3. Clear browser cache and reload
4. Verify Leaflet CSS is loading properly

### Issue: No incidents showing
**Solutions:**
1. Click "Refresh" button
2. Check server console for errors
3. Verify NT Road Report API is accessible
4. Check network tab in browser dev tools

### Issue: "Cannot find module"
**Solution:**
```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
rm -rf packages/*/node_modules
npm install
```

## Development Commands

Once installed, use these commands:

```bash
# Start everything
npm run dev

# Start only backend
npm run dev:server

# Start only frontend
npm run dev:web

# Build for production
npm run build

# Run linter
npm run lint
```

## File Structure After Installation

```
nt-roadmap/
├── node_modules/          ← Dependencies (created after install)
├── packages/
│   ├── server/
│   │   ├── node_modules/  ← Server dependencies
│   │   ├── src/
│   │   ├── .env           ← Server config (you create)
│   │   └── package.json
│   └── web/
│       ├── node_modules/  ← Web dependencies
│       ├── src/
│       ├── .env           ← Web config (you create)
│       └── package.json
├── README.md
├── package.json
└── setup.sh
```

## Next Steps After Installation

1. ✅ **Read the Documentation**
   - README.md - Full project overview
   - QUICKSTART.md - Quick start guide
   - API.md - API documentation

2. ✅ **Explore the Application**
   - Click on incident markers
   - Try the filter options
   - Submit a test report
   - Check different incident layers

3. ✅ **Review the Code**
   - Backend: `packages/server/src/`
   - Frontend: `packages/web/src/`
   - Types: Look for `types/index.ts` files

4. ✅ **Customize**
   - Add new incident types
   - Modify colors and icons
   - Adjust safety scoring weights
   - Add your own data sources

5. ✅ **Deploy** (Optional)
   - See DEPLOYMENT.md for guides
   - Multiple platform options available

## Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review the documentation files
3. Check browser console (F12) for errors
4. Check server terminal for error messages
5. Verify all prerequisites are met

## Success Indicators

You'll know installation was successful when:

- ✅ No errors in terminal
- ✅ Browser opens automatically
- ✅ Map loads on screen
- ✅ Sidebar shows "Safe Map"
- ✅ No red errors in browser console
- ✅ Backend responds to API calls

## Environment Variables Reference

### Backend (packages/server/.env)
```env
PORT=3001
NODE_ENV=development
GOOGLE_MAPS_API_KEY=your_key_here
NT_ROAD_REPORT_API=https://roadreport.nt.gov.au/road-map
CORS_ORIGIN=http://localhost:3000
CACHE_TTL_SECONDS=300
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (packages/web/.env)
```env
VITE_GOOGLE_MAPS_API_KEY=your_key_here
VITE_API_BASE_URL=http://localhost:3001
```

## Quick Command Reference

```bash
# Installation
npm install                 # Install dependencies
./setup.sh                 # Run setup script

# Development
npm run dev                # Start everything
npm run dev:server         # Backend only
npm run dev:web           # Frontend only

# Building
npm run build             # Build for production

# Utilities
npm run lint              # Check code style
npm test                  # Run tests (when available)

# Troubleshooting
rm -rf node_modules       # Clean dependencies
npm install               # Reinstall
```

## Installation Complete! 🎉

You're all set! Your Safe Map application should now be running.

Visit: **http://localhost:3000**

Happy mapping! 🗺️
