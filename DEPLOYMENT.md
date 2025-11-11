# Deployment Guide

This guide covers deploying Safe Map to various platforms.

## Table of Contents
- [Environment Variables](#environment-variables)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Full Stack Deployment](#full-stack-deployment)
- [Docker Deployment](#docker-deployment)

## Environment Variables

### Backend Environment Variables

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# API Keys
GOOGLE_MAPS_API_KEY=your_production_google_maps_key
OPENSTREETMAP_API_KEY=optional

# External APIs
NT_ROAD_REPORT_API=https://roadreport.nt.gov.au/road-map

# Cache Configuration
CACHE_TTL_SECONDS=300

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=https://your-frontend-domain.com

# Database (optional for future)
DATABASE_URL=postgresql://user:password@host:5432/safemap
```

### Frontend Environment Variables

```env
VITE_GOOGLE_MAPS_API_KEY=your_production_google_maps_key
VITE_API_BASE_URL=https://your-backend-api.com
```

## Backend Deployment

### Option 1: Heroku

1. **Install Heroku CLI**
   ```bash
   brew install heroku/brew/heroku  # macOS
   ```

2. **Login and Create App**
   ```bash
   heroku login
   heroku create safe-map-api
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set GOOGLE_MAPS_API_KEY=your_key
   heroku config:set CORS_ORIGIN=https://your-frontend.com
   ```

4. **Deploy**
   ```bash
   cd packages/server
   git init
   heroku git:remote -a safe-map-api
   git add .
   git commit -m "Deploy backend"
   git push heroku main
   ```

### Option 2: Render

1. **Create account at [render.com](https://render.com)**

2. **Create New Web Service**
   - Connect your GitHub repository
   - Root Directory: `packages/server`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

3. **Add Environment Variables** in Render dashboard

### Option 3: Railway

1. **Create account at [railway.app](https://railway.app)**

2. **New Project → Deploy from GitHub**
   - Select your repository
   - Root Path: `packages/server`

3. **Add Environment Variables** in Railway dashboard

### Option 4: AWS (EC2)

1. **Launch EC2 Instance**
   - Ubuntu 22.04 LTS
   - t2.micro or larger

2. **SSH and Setup**
   ```bash
   ssh -i your-key.pem ubuntu@your-instance-ip
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Clone repository
   git clone your-repo.git
   cd your-repo/packages/server
   
   # Install dependencies
   npm install
   
   # Build
   npm run build
   
   # Install PM2
   sudo npm install -g pm2
   
   # Start with PM2
   pm2 start dist/index.js --name safe-map-api
   pm2 startup
   pm2 save
   ```

3. **Configure Nginx as Reverse Proxy**
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/safe-map
   ```

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   sudo ln -s /etc/nginx/sites-available/safe-map /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd packages/web
   vercel
   ```

3. **Add Environment Variables**
   - Go to Vercel dashboard
   - Project Settings → Environment Variables
   - Add `VITE_GOOGLE_MAPS_API_KEY` and `VITE_API_BASE_URL`

4. **Production Deploy**
   ```bash
   vercel --prod
   ```

### Option 2: Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build**
   ```bash
   cd packages/web
   npm run build
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod --dir=dist
   ```

4. **Add Environment Variables**
   - Netlify dashboard → Site Settings → Environment Variables

### Option 3: AWS S3 + CloudFront

1. **Build**
   ```bash
   cd packages/web
   npm run build
   ```

2. **Upload to S3**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

3. **Configure CloudFront**
   - Create CloudFront distribution
   - Point to S3 bucket
   - Enable HTTPS

### Option 4: GitHub Pages

1. **Update `vite.config.ts`**
   ```typescript
   export default defineConfig({
     base: '/your-repo-name/',
     // ... rest of config
   });
   ```

2. **Build and Deploy**
   ```bash
   cd packages/web
   npm run build
   
   # Deploy to gh-pages branch
   npx gh-pages -d dist
   ```

## Full Stack Deployment

### Docker Deployment

1. **Create Backend Dockerfile**

   `packages/server/Dockerfile`:
   ```dockerfile
   FROM node:18-alpine

   WORKDIR /app

   COPY package*.json ./
   RUN npm ci --only=production

   COPY . .
   RUN npm run build

   EXPOSE 3001

   CMD ["npm", "start"]
   ```

2. **Create Frontend Dockerfile**

   `packages/web/Dockerfile`:
   ```dockerfile
   FROM node:18-alpine as build

   WORKDIR /app

   COPY package*.json ./
   RUN npm ci

   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=build /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/conf.d/default.conf

   EXPOSE 80

   CMD ["nginx", "-g", "daemon off;"]
   ```

3. **Create `docker-compose.yml`**

   ```yaml
   version: '3.8'

   services:
     backend:
       build:
         context: ./packages/server
       ports:
         - "3001:3001"
       environment:
         - NODE_ENV=production
         - GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}
         - CORS_ORIGIN=http://localhost:3000
       restart: unless-stopped

     frontend:
       build:
         context: ./packages/web
       ports:
         - "3000:80"
       depends_on:
         - backend
       restart: unless-stopped
   ```

4. **Deploy**
   ```bash
   docker-compose up -d
   ```

### Kubernetes Deployment

1. **Create Kubernetes Manifests**

   `k8s/backend-deployment.yaml`:
   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: safe-map-backend
   spec:
     replicas: 3
     selector:
       matchLabels:
         app: safe-map-backend
     template:
       metadata:
         labels:
           app: safe-map-backend
       spec:
         containers:
         - name: backend
           image: your-registry/safe-map-backend:latest
           ports:
           - containerPort: 3001
           env:
           - name: GOOGLE_MAPS_API_KEY
             valueFrom:
               secretKeyRef:
                 name: safe-map-secrets
                 key: google-maps-api-key
   ---
   apiVersion: v1
   kind: Service
   metadata:
     name: safe-map-backend-service
   spec:
     selector:
       app: safe-map-backend
     ports:
     - protocol: TCP
       port: 80
       targetPort: 3001
   ```

2. **Deploy to Kubernetes**
   ```bash
   kubectl apply -f k8s/
   ```

## Post-Deployment Checklist

- [ ] Test all API endpoints
- [ ] Verify Google Maps loads correctly
- [ ] Test user report submission
- [ ] Check incident data refresh
- [ ] Verify CORS configuration
- [ ] Test rate limiting
- [ ] Monitor error logs
- [ ] Set up SSL/HTTPS
- [ ] Configure DNS
- [ ] Set up monitoring (e.g., Sentry, DataDog)
- [ ] Configure backups (if using database)
- [ ] Test mobile responsiveness
- [ ] Performance testing
- [ ] Security audit

## Monitoring

### Application Monitoring

**Option 1: Sentry**
```bash
npm install @sentry/node @sentry/react
```

**Option 2: New Relic**
```bash
npm install newrelic
```

### Server Monitoring

**Option 1: PM2 Monitor**
```bash
pm2 monit
```

**Option 2: DataDog**
- Install DataDog agent
- Configure APM

## Backup Strategy

1. **Code**: Git repository with regular commits
2. **Environment Variables**: Secure storage (e.g., AWS Secrets Manager)
3. **User Data**: Database backups (when implemented)
4. **Logs**: Centralized logging (e.g., CloudWatch, Papertrail)

## Scaling Considerations

1. **Horizontal Scaling**: Use load balancer (e.g., AWS ALB)
2. **Caching**: Redis for API caching
3. **Database**: PostgreSQL with read replicas
4. **CDN**: CloudFront or Cloudflare for static assets
5. **Auto-scaling**: Configure based on CPU/memory metrics

## Troubleshooting

### API Not Responding
- Check server logs
- Verify environment variables
- Test network connectivity
- Check firewall rules

### Map Not Loading
- Verify Google Maps API key
- Check browser console errors
- Ensure HTTPS is configured
- Verify API key restrictions

### CORS Errors
- Update CORS_ORIGIN in backend
- Check request headers
- Verify domain configuration

## Support

For deployment issues:
1. Check application logs
2. Review configuration
3. Consult documentation
4. Contact support team
