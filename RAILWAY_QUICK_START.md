# Railway Quick Start Checklist

## Pre-Deployment Checklist

- [ ] Railway account created
- [ ] GitHub repository connected to Railway
- [ ] Supabase credentials ready
- [ ] SMTP email credentials ready
- [ ] JWT secret generated (use a strong random string)

## Deployment Steps

### 1. Backend Service

- [ ] Create new Railway project
- [ ] Add GitHub repo as backend service
- [ ] Set root directory to `backend/`
- [ ] Add all environment variables (see `backend/env.example`)
- [ ] Generate domain for backend
- [ ] Copy backend domain URL

### 2. Frontend Service

- [ ] Add same GitHub repo as frontend service
- [ ] Set root directory to `Website/`
- [ ] Set `REACT_APP_API_URL` to `https://[backend-domain]/api`
- [ ] Generate domain for frontend
- [ ] Copy frontend domain URL

### 3. Update Backend CORS

- [ ] Go to backend service → Variables
- [ ] Update `CORS_ORIGIN` to frontend domain
- [ ] Update `FRONTEND_URL` to frontend domain
- [ ] Backend will auto-redeploy

### 4. Test Deployment

- [ ] Visit frontend URL
- [ ] Test login/registration
- [ ] Test API calls
- [ ] Check backend logs for errors
- [ ] Check frontend console for errors

## Required Environment Variables

### Backend (`backend/` service)

```
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
JWT_SECRET=...
CORS_ORIGIN=https://[frontend-domain]
FRONTEND_URL=https://[frontend-domain]
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASSWORD=...
NODE_ENV=production
```

### Frontend (`Website/` service)

```
REACT_APP_API_URL=https://[backend-domain]/api
```

## Common Issues

**CORS Errors:**
- Ensure `CORS_ORIGIN` includes your frontend domain
- Check that domain starts with `https://`

**API Not Found:**
- Verify `REACT_APP_API_URL` is set correctly
- Ensure it ends with `/api`
- Redeploy frontend after setting variable

**Build Fails:**
- Check Railway logs for specific errors
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

## Support

See `RAILWAY_DEPLOYMENT.md` for detailed instructions.

