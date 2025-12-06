# Railway Deployment Guide (Detailed Reference)

> **For a step-by-step tutorial, see [RAILWAY_SETUP_TUTORIAL.md](./RAILWAY_SETUP_TUTORIAL.md)**

This guide provides detailed reference information for Railway deployment.

## Overview

The application consists of two services:
1. **Backend API** - Node.js/Express server (`backend/`)
2. **Frontend** - React application (`Website/`)

## Prerequisites

1. A Railway account (sign up at [railway.app](https://railway.app))
2. Railway CLI installed (optional, but recommended)
3. Your Supabase credentials
4. All environment variables ready

## Deployment Steps

### Option 1: Deploy via Railway Dashboard (Recommended)

#### Step 1: Create a New Project

1. Go to [railway.app](https://railway.app) and create a new project
2. Name it "Poorito" or your preferred name

#### Step 2: Deploy Backend Service

1. Click "New" → "GitHub Repo" (or "GitHub" → "Deploy from GitHub repo")
2. Select your repository
3. Railway will detect the `backend/` directory
4. If not detected automatically:
   - Click on the service
   - Go to "Settings" → "Root Directory"
   - Set it to `backend`

#### Step 3: Configure Backend Environment Variables

In the backend service, go to "Variables" and add:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Server Configuration
PORT=5000
NODE_ENV=production

# JWT Secret (generate a strong random string)
JWT_SECRET=your_secure_jwt_secret_key_here

# CORS Configuration (will be set after frontend is deployed)
CORS_ORIGIN=https://your-frontend-domain.railway.app

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password_here

# Frontend URL (for email links)
FRONTEND_URL=https://your-frontend-domain.railway.app
```

**Important Notes:**
- Railway automatically sets `PORT` - you can use `process.env.PORT` (already configured)
- Railway provides `RAILWAY_PUBLIC_DOMAIN` automatically for the service
- Set `CORS_ORIGIN` after you get the frontend domain

#### Step 4: Deploy Frontend Service

1. In the same Railway project, click "New" → "GitHub Repo"
2. Select the same repository
3. Railway will detect the `Website/` directory
4. If not detected automatically:
   - Click on the service
   - Go to "Settings" → "Root Directory"
   - Set it to `Website`

#### Step 5: Configure Frontend Environment Variables

In the frontend service, go to "Variables" and add:

```env
REACT_APP_API_URL=https://your-backend-domain.railway.app/api
```

**To get your backend domain:**
1. Go to your backend service
2. Click "Settings" → "Generate Domain"
3. Copy the generated domain (e.g., `poorito-backend-production.up.railway.app`)
4. Use it in the frontend's `REACT_APP_API_URL`

#### Step 6: Update Backend CORS

1. Go to your frontend service
2. Click "Settings" → "Generate Domain"
3. Copy the frontend domain
4. Go to your backend service → "Variables"
5. Update `CORS_ORIGIN` to include the frontend domain:
   ```
   CORS_ORIGIN=https://your-frontend-domain.railway.app
   ```
6. Also update `FRONTEND_URL` with the same domain

#### Step 7: Redeploy Services

After setting environment variables:
1. Backend will auto-redeploy when you save variables
2. Frontend needs a manual redeploy:
   - Go to frontend service
   - Click "Deployments" → "Redeploy"

### Option 2: Deploy via Railway CLI

1. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Initialize and link project:
   ```bash
   railway init
   railway link
   ```

4. Deploy backend:
   ```bash
   cd backend
   railway up
   ```

5. Set backend environment variables:
   ```bash
   railway variables set SUPABASE_URL=your_url
   railway variables set SUPABASE_ANON_KEY=your_key
   # ... set all other variables
   ```

6. Deploy frontend:
   ```bash
   cd ../Website
   railway up
   ```

7. Set frontend environment variables:
   ```bash
   railway variables set REACT_APP_API_URL=https://your-backend-domain.railway.app/api
   ```

## Custom Domains (Optional)

Railway provides free `.railway.app` domains, but you can add custom domains:

1. Go to your service → "Settings" → "Networking"
2. Click "Custom Domain"
3. Add your domain and follow DNS configuration instructions

## Environment Variables Reference

### Backend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGc...` |
| `JWT_SECRET` | Secret for JWT tokens | Random secure string |
| `CORS_ORIGIN` | Frontend URL(s) for CORS | `https://your-app.railway.app` |
| `FRONTEND_URL` | Frontend URL for email links | `https://your-app.railway.app` |
| `SMTP_HOST` | SMTP server host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username/email | `your-email@gmail.com` |
| `SMTP_PASSWORD` | SMTP password/app password | `your-app-password` |

### Frontend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `https://backend.railway.app/api` |

## Troubleshooting

### Backend Issues

1. **Port already in use**: Railway sets `PORT` automatically - ensure your code uses `process.env.PORT`
2. **CORS errors**: Make sure `CORS_ORIGIN` includes your frontend domain
3. **Database connection**: Verify Supabase credentials are correct

### Frontend Issues

1. **API calls failing**: Check `REACT_APP_API_URL` is set correctly
2. **Build fails**: Ensure all dependencies are in `package.json`
3. **404 on refresh**: This is normal for SPAs - Railway handles it automatically with `serve`

### General Issues

1. **Environment variables not working**: 
   - Variables must be set before deployment
   - Frontend variables must start with `REACT_APP_`
   - Redeploy after changing variables

2. **Services can't communicate**:
   - Use Railway-generated domains (`.railway.app`)
   - Ensure CORS is configured correctly
   - Check that both services are in the same Railway project

## Monitoring

- View logs: Railway dashboard → Service → "Deployments" → Click on deployment → "View Logs"
- Monitor metrics: Railway dashboard → Service → "Metrics"
- Set up alerts: Railway dashboard → Service → "Settings" → "Alerts"

## Cost

Railway offers:
- **Free tier**: $5 credit per month
- **Hobby plan**: $5/month + usage
- **Pro plan**: $20/month + usage

Check [railway.app/pricing](https://railway.app/pricing) for current pricing.

## Support

- Railway Docs: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- Railway Support: [railway.app/support](https://railway.app/support)

