import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import NodeCache from 'node-cache';

import { NTRoadReportService } from './services/ntRoadReport.service';
import { routingService } from './services/routing.service';
import { IncidentService } from './services/incident.service';
import { SafetyScoreService } from './services/safetyScore.service';
import { ApiResponse, Incident, Location, UserReport } from './types';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Services
const ntService = new NTRoadReportService();
const incidentService = new IncidentService();
const safetyService = new SafetyScoreService();

// Cache for API responses
const cache = new NodeCache({ stdTTL: parseInt(process.env.CACHE_TTL_SECONDS || '300') });

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all incidents
app.get('/api/incidents', async (req, res) => {
  try {
    const { types, severity, status, startDate, endDate } = req.query;

    const filters: any = {};
    if (types) filters.types = (types as string).split(',');
    if (severity) filters.severity = (severity as string).split(',').map(Number);
    if (status) filters.status = (status as string).split(',');
    if (startDate) filters.startDate = startDate as string;
    if (endDate) filters.endDate = endDate as string;

    const incidents = incidentService.getIncidents(filters);

    const response: ApiResponse<Incident[]> = {
      success: true,
      data: incidents,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: any) {
    const response: ApiResponse<never> = {
      success: false,
      error: error.message || 'Failed to fetch incidents',
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(response);
  }
});

// Get incident by ID
app.get('/api/incidents/:id', (req, res) => {
  try {
    const incident = incidentService.getIncidentById(req.params.id);

    if (!incident) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Incident not found',
        timestamp: new Date().toISOString(),
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<Incident> = {
      success: true,
      data: incident,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: any) {
    const response: ApiResponse<never> = {
      success: false,
      error: error.message || 'Failed to fetch incident',
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(response);
  }
});

// Calculate safe route
app.post('/api/routes/safe', async (req, res) => {
  try {
    const { origin, destination, waypoints = [] } = req.body;

    if (!origin || !destination) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Origin and destination are required',
        timestamp: new Date().toISOString(),
      };
      return res.status(400).json(response);
    }

    // Get all active incidents
    const incidents = incidentService.getIncidents({
      status: ['active', 'monitoring'] as any,
    });

    console.log(`\n📍 Route request: ${incidents.length} active incidents in system`);

    // Calculate multiple safe route alternatives with incident avoidance
    const routeAlternatives = await routingService.calculateSafeRoutes(
      origin,
      destination,
      incidents,
      waypoints
    );

    if (!routeAlternatives || routeAlternatives.length === 0) {
      throw new Error('No routes could be calculated');
    }

    // Use the best (safest) route as primary
    const bestRoute = routeAlternatives[0];

    // Calculate detailed safety score for the best route
    const safetyScore = safetyService.calculateRouteSafety(
      bestRoute.geometry,
      incidents,
      bestRoute.distance
    );

    // Prepare route alternatives for response
    const alternatives = routeAlternatives.map((route, index) => ({
      routeId: index,
      geometry: route.geometry,
      distance: route.distance / 1000, // Convert to kilometers
      duration: route.duration / 60, // Convert to minutes
      safetyScore: route.safetyScore,
      hasHazards: route.hasHazards,
      nearbyIncidents: route.nearbyIncidents.length,
      avoidedIncidents: route.avoidedIncidents,
      recommendation: route.safetyScore >= 80 ? 'safe' : route.safetyScore >= 50 ? 'caution' : 'avoid',
    }));

    console.log(`✓ Returning ${alternatives.length} route alternatives`);
    console.log(`  Best route: ${(bestRoute.distance / 1000).toFixed(2)}km, Safety: ${bestRoute.safetyScore}/100`);

    const response: ApiResponse<any> = {
      success: true,
      data: {
        // Primary route (best/safest)
        origin,
        destination,
        waypoints,
        distance: bestRoute.distance / 1000,
        duration: bestRoute.duration / 60,
        safetyScore: bestRoute.safetyScore,
        safetyDetails: safetyScore,
        incidents: bestRoute.nearbyIncidents,
        recommendation: bestRoute.hasHazards ? 'avoid' : bestRoute.safetyScore >= 80 ? 'safe' : 'caution',
        geometry: bestRoute.geometry,
        hasHazards: bestRoute.hasHazards,
        
        // Alternative routes
        alternatives,
      },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: any) {
    const response: ApiResponse<never> = {
      success: false,
      error: error.message || 'Failed to calculate route',
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(response);
  }
});

// Submit user report
app.post('/api/reports', (req, res) => {
  try {
    const { type, location, description, photos, userId } = req.body;

    if (!type || !location || !description) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Type, location, and description are required',
        timestamp: new Date().toISOString(),
      };
      return res.status(400).json(response);
    }

    const report = incidentService.createUserReport({
      userId,
      type,
      location,
      description,
      photos,
    });

    const response: ApiResponse<UserReport> = {
      success: true,
      data: report,
      timestamp: new Date().toISOString(),
    };

    res.status(201).json(response);
  } catch (error: any) {
    const response: ApiResponse<never> = {
      success: false,
      error: error.message || 'Failed to create report',
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(response);
  }
});

// Get user reports
app.get('/api/reports', (req, res) => {
  try {
    const reports = incidentService.getUserReports();

    const response: ApiResponse<UserReport[]> = {
      success: true,
      data: reports,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: any) {
    const response: ApiResponse<never> = {
      success: false,
      error: error.message || 'Failed to fetch reports',
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(response);
  }
});

// Verify user report (authority endpoint)
app.post('/api/reports/:id/verify', (req, res) => {
  try {
    const { verifiedBy } = req.body;

    if (!verifiedBy) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'verifiedBy is required',
        timestamp: new Date().toISOString(),
      };
      return res.status(400).json(response);
    }

    const report = incidentService.verifyReport(req.params.id, verifiedBy);

    if (!report) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Report not found',
        timestamp: new Date().toISOString(),
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<UserReport> = {
      success: true,
      data: report,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: any) {
    const response: ApiResponse<never> = {
      success: false,
      error: error.message || 'Failed to verify report',
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(response);
  }
});

// Get incident statistics
app.get('/api/stats', (req, res) => {
  try {
    const stats = incidentService.getStatistics();

    const response: ApiResponse<any> = {
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: any) {
    const response: ApiResponse<never> = {
      success: false,
      error: error.message || 'Failed to fetch statistics',
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(response);
  }
});

// Refresh incidents from NT Road Report
app.post('/api/incidents/refresh', async (req, res) => {
  try {
    const incidents = await ntService.fetchIncidents();
    incidentService.setIncidents(incidents);

    const response: ApiResponse<{ count: number }> = {
      success: true,
      data: { count: incidents.length },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: any) {
    const response: ApiResponse<never> = {
      success: false,
      error: error.message || 'Failed to refresh incidents',
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(response);
  }
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);

  const response: ApiResponse<never> = {
    success: false,
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString(),
  };

  res.status(err.status || 500).json(response);
});

// Start server and initial data fetch
async function startServer() {
  try {
    // Initial fetch of incidents
    console.log('Fetching initial incident data...');
    const incidents = await ntService.fetchIncidents();
    incidentService.setIncidents(incidents);
    console.log(`Loaded ${incidents.length} incidents`);

    // Set up periodic refresh (every 5 minutes)
    setInterval(async () => {
      try {
        console.log('Refreshing incident data...');
        const freshIncidents = await ntService.fetchIncidents();
        incidentService.setIncidents(freshIncidents);
        console.log(`Refreshed ${freshIncidents.length} incidents`);
      } catch (error) {
        console.error('Error refreshing incidents:', error);
      }
    }, 5 * 60 * 1000);

    app.listen(PORT, () => {
      console.log(`Safe Map API Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
