# 🚀 Deploy Safe Map Online - Quick Guide

This guide will help you deploy the Safe Map application online for free so everyone can test it.

## 📋 Prerequisites

- GitHub account
- Git installed locally
- Node.js 18+ installed

## 🎯 Deployment Options

We'll use **FREE** hosting services:
- **Frontend**: Vercel or Netlify (Free tier)
- **Backend**: Render or Railway (Free tier)

## 🚦 Quick Deploy (5 Minutes)

### Step 1: Push to GitHub

```bash
# Initialize git if not already done
cd /Users/alvinho/Projects/nt-roadmap
git init
git add .
git commit -m "Initial commit - Safe Map Application"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/nt-roadmap.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy Backend (Render.com - FREE)

1. **Go to** [render.com](https://render.com) and sign up/login with GitHub
2. **Click** "New +" → "Web Service"
3. **Connect** your GitHub repository (nt-roadmap)
4. **Configure**:
   - Name: `nt-roadmap-api`
   - Environment: `Node`
   - Region: Choose closest to Australia (e.g., Singapore)
   - Branch: `main`
   - Build Command: `cd packages/server && npm install && npm run build`
   - Start Command: `cd packages/server && npm start`
5. **Add Environment Variables**:
   ```
   NODE_ENV=production
   PORT=3001
   NT_ROAD_REPORT_API=https://roadreport.nt.gov.au/api/Obstruction/GetAll
   OSRM_BASE_URL=https://router.project-osrm.org
   CACHE_TTL_SECONDS=300
   CORS_ORIGIN=*
   ```
6. **Click** "Create Web Service"
7. **Wait** 5-10 minutes for deployment
8. **Copy** your backend URL (e.g., `https://nt-roadmap-api.onrender.com`)

### Step 3: Deploy Frontend (Vercel - FREE)

1. **Go to** [vercel.com](https://vercel.com) and sign up/login with GitHub
2. **Click** "Add New Project"
3. **Import** your GitHub repository (nt-roadmap)
4. **Configure**:
   - Framework Preset: `Vite`
   - Root Directory: `packages/web`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Add Environment Variable**:
   ```
   VITE_API_BASE_URL=https://nt-roadmap-api.onrender.com
   ```
   (Use the URL from Step 2)
6. **Click** "Deploy"
7. **Wait** 2-3 minutes
8. **Your app is live!** 🎉

## 🔗 Alternative: Netlify (Frontend)

If you prefer Netlify:

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub repository
4. Configure:
   - Base directory: `packages/web`
   - Build command: `npm run build`
   - Publish directory: `packages/web/dist`
5. Add Environment Variables:
   ```
   VITE_API_BASE_URL=https://nt-roadmap-api.onrender.com
   ```
6. Deploy!

## 🔗 Alternative: Railway (Backend)

If you prefer Railway:

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Configure:
   - Root Directory: `packages/server`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Add Environment Variables (same as Render)
6. Deploy!

## ⚙️ Environment Variables Explained

### Backend Variables
- `NODE_ENV`: Set to `production` for deployment
- `PORT`: Server port (usually auto-assigned by hosting platform)
- `NT_ROAD_REPORT_API`: NT Government road report API endpoint
- `OSRM_BASE_URL`: OpenStreetMap routing service (free, public)
- `CACHE_TTL_SECONDS`: How long to cache incident data (300 = 5 minutes)
- `CORS_ORIGIN`: Allow requests from any origin (`*`) or specific domain

### Frontend Variables
- `VITE_API_BASE_URL`: Your deployed backend URL

## 🧪 Testing Your Deployment

1. **Open your Vercel URL** (e.g., `https://nt-roadmap-abc123.vercel.app`)
2. **Check the sidebar** - You should see incident counts
3. **Click on map** - Incident markers should appear
4. **Test route planning**:
   - Enter "Darwin" as origin
   - Enter "Kakadu" as destination
   - Click "Calculate Route"
5. **Verify**:
   - Blue route appears on map
   - Route follows real roads (not straight line)
   - Alternative routes shown if available
   - Incident warnings displayed

## 🐛 Troubleshooting

### Backend Issues

**"Cannot connect to API"**
- Check Render logs: Dashboard → Your Service → Logs
- Verify environment variables are set
- Check build/deploy completed successfully

**"No incidents showing"**
- Check NT API is accessible: `curl https://roadreport.nt.gov.au/api/Obstruction/GetAll`
- Check Render logs for errors

### Frontend Issues

**"API connection failed"**
- Verify `VITE_API_BASE_URL` matches your backend URL
- Check browser console (F12) for CORS errors
- Ensure backend CORS_ORIGIN is set to `*` or your frontend domain

**"Map not loading"**
- This app uses OpenStreetMap (no API key needed)
- Check browser console for errors
- Clear cache and reload

## 📱 Share Your Deployment

Once deployed, share your link:
```
https://your-app.vercel.app
```

**Features to highlight:**
- ✅ Real-time NT road incident tracking
- ✅ Interactive map with 105+ incidents
- ✅ Smart route planning that avoids hazards
- ✅ Multiple route alternatives with safety scores
- ✅ OSRM routing follows real roads
- ✅ No API keys required (100% free services)

## 💡 Pro Tips

1. **Custom Domain**: Both Vercel and Render support custom domains (free)
2. **Auto-Deploy**: Any git push to main branch auto-deploys
3. **Logs**: Check deployment logs if something breaks
4. **Free Tier Limits**:
   - Render: Sleeps after 15 min inactivity (first request takes ~30s to wake)
   - Vercel: Unlimited bandwidth on free tier
5. **Performance**: First load may be slow (free tier), but subsequent loads are fast

## 🔄 Updating Your Deployment

```bash
# Make changes locally
git add .
git commit -m "Update feature XYZ"
git push origin main

# Both services auto-deploy on push!
```

## 🎉 Success!

Your Safe Map app is now live and accessible worldwide! Share the URL with others to test the incident tracking and smart routing features.

**Need help?** Check the logs in your hosting platform dashboard.

---

**Estimated Total Setup Time**: 10-15 minutes  
**Cost**: $0 (100% FREE)  
**Scalability**: Can handle thousands of users on free tier
