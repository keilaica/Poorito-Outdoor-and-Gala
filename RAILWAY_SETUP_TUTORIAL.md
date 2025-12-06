# Railway Setup Tutorial - Step by Step

A complete guide to deploy your Poorito application to Railway in under 15 minutes.

---

## 🤔 Why Two Services?

Your application has **two parts** that need to run separately:

1. **Backend** (`backend/` folder) - The API server that handles database, authentication, etc.
2. **Frontend** (`Website/` folder) - The React app that users see in their browser

Railway needs **two separate services** (one for each part) because:
- They run on different ports
- They have different dependencies
- They deploy independently
- They can scale separately

### Visual Overview

```
Your GitHub Repo
├── backend/          → Service 1: Backend API
└── Website/          → Service 2: Frontend App
```

**What you'll do:**
1. Connect your repo **first time** → Configure as **Backend** (root: `backend/`)
2. Connect your repo **second time** → Configure as **Frontend** (root: `Website/`)

**Think of it like:** You're deploying two apps from the same codebase - one is the server, one is the website.

**Good news:** Railway remembers your repo connection, so you just select it twice and configure different root directories!

---

## 📋 What You'll Need

Before starting, gather these:

1. **Railway Account** - Sign up at [railway.app](https://railway.app) (free)
2. **GitHub Account** - Your code must be on GitHub
3. **Supabase Credentials** - From your Supabase project:
   - Project URL
   - Anon Key
   - Service Role Key
4. **Email Credentials** (for password reset):
   - Gmail account with App Password (or other SMTP)
5. **JWT Secret** - Generate a random string (you can use: `openssl rand -base64 32`)

---

## 🚀 Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository
5. Railway will create a project with one service (we'll configure it as backend first)

**💡 Note:** Railway might auto-create a service. That's fine - we'll configure it in the next step.

**✅ Checkpoint:** You should see a project dashboard (might have one service already).

---

## 🔧 Step 2: Deploy Backend Service

### 2.1 Add/Configure Backend Service

**If Railway already created a service:**
- Click on that service and skip to Step 2.2

**If no service exists yet:**
1. In your Railway project, click **"New"** → **"GitHub Repo"**
2. Select your repository
3. Railway will create a service (we'll configure it next)

### 2.2 Configure Root Directory

1. Click on the newly created service
2. Go to **"Settings"** tab
3. Scroll to **"Root Directory"**
4. Enter: `backend`
5. Click **"Save"**

### 2.3 Generate Backend Domain

1. Still in **"Settings"** tab
2. Scroll to **"Networking"** section
3. Click **"Generate Domain"**
4. Copy the domain (e.g., `poorito-backend-production.up.railway.app`)
5. **Save this domain** - you'll need it later!

**✅ Checkpoint:** Backend service is configured and has a domain.

---

## 🔐 Step 3: Configure Backend Environment Variables

1. In your backend service, go to **"Variables"** tab
2. Click **"New Variable"** for each variable below
3. Add these variables one by one:

### Required Variables

| Variable Name | Value | Where to Find |
|--------------|-------|---------------|
| `SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase Dashboard → Settings → API |
| `SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase Dashboard → Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` | Supabase Dashboard → Settings → API → service_role |
| `JWT_SECRET` | Random string | Generate with: `openssl rand -base64 32` |
| `NODE_ENV` | `production` | Type exactly: `production` |
| `SMTP_HOST` | `smtp.gmail.com` | For Gmail (or your SMTP host) |
| `SMTP_PORT` | `587` | Standard SMTP port |
| `SMTP_SECURE` | `false` | For port 587 |
| `SMTP_USER` | `your-email@gmail.com` | Your email address |
| `SMTP_PASSWORD` | `your-app-password` | Gmail App Password (see note below) |
| `CORS_ORIGIN` | `https://placeholder.railway.app` | **Temporary** - update after frontend deploy |
| `FRONTEND_URL` | `https://placeholder.railway.app` | **Temporary** - update after frontend deploy |

### 📧 Gmail App Password Setup

If using Gmail:
1. Enable 2-Factor Authentication on your Google account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate an app password for "Mail"
4. Use that password (not your regular Gmail password)

**✅ Checkpoint:** All backend variables are set. Backend will auto-deploy.

---

## 🎨 Step 4: Deploy Frontend Service

### 4.1 Add Frontend Service

**Important:** You're adding the **same GitHub repo** again, but as a **second service** with a different root directory.

1. In your Railway project, click **"New"** → **"GitHub Repo"**
2. Select the **same repository** (yes, the same one!)
3. This creates a **second service** in your project
4. You'll now have 2 services in your project: one for backend, one for frontend

### 4.2 Configure Root Directory

1. Click on the new service
2. Go to **"Settings"** tab
3. Scroll to **"Root Directory"**
4. Enter: `Website`
5. Click **"Save"**

### 4.3 Generate Frontend Domain

1. In **"Settings"** → **"Networking"**
2. Click **"Generate Domain"**
3. Copy the domain (e.g., `poorito-frontend-production.up.railway.app`)
4. **Save this domain** - you'll need it!

**✅ Checkpoint:** Frontend service is configured and has a domain.

---

## 🔗 Step 5: Connect Frontend to Backend

### 5.1 Set Frontend API URL

1. In your **frontend service**, go to **"Variables"** tab
2. Click **"New Variable"**
3. Variable name: `REACT_APP_API_URL`
4. Variable value: `https://[YOUR-BACKEND-DOMAIN]/api`
   - Replace `[YOUR-BACKEND-DOMAIN]` with the backend domain you saved in Step 2.3
   - Example: `https://poorito-backend-production.up.railway.app/api`
5. Click **"Save"**

### 5.2 Redeploy Frontend

1. Go to **"Deployments"** tab in frontend service
2. Click **"Redeploy"** (this rebuilds with the new environment variable)

**✅ Checkpoint:** Frontend knows where to find the backend API.

---

## 🔄 Step 6: Update Backend CORS Settings

Now that both services have domains, update backend to allow frontend requests:

1. Go to your **backend service** → **"Variables"** tab
2. Find `CORS_ORIGIN` variable
3. Click the **pencil icon** to edit
4. Change value to your **frontend domain**:
   - Example: `https://poorito-frontend-production.up.railway.app`
5. Click **"Save"**
6. Find `FRONTEND_URL` variable
7. Edit it to the same **frontend domain**
8. Click **"Save"**

**✅ Checkpoint:** Backend will auto-redeploy and allow requests from frontend.

---

## ✅ Step 7: Test Your Deployment

### 7.1 Check Backend Health

1. Open your backend domain in a browser
2. Add `/api/health` to the URL
   - Example: `https://poorito-backend-production.up.railway.app/api/health`
3. You should see: `{"status":"OK","message":"Poorito API is running",...}`

### 7.2 Test Frontend

1. Open your frontend domain in a browser
2. You should see your application
3. Try logging in or registering
4. Open browser console (F12) to check for errors

### 7.3 Check Logs

If something doesn't work:
1. Go to backend service → **"Deployments"** tab
2. Click on the latest deployment
3. Click **"View Logs"** to see any errors
4. Do the same for frontend service

**✅ Checkpoint:** Application is live and working!

---

## 🐛 Troubleshooting

### Problem: CORS Errors in Browser Console

**Solution:**
- Verify `CORS_ORIGIN` in backend variables matches your frontend domain exactly
- Make sure it starts with `https://`
- Redeploy backend after changing CORS_ORIGIN

### Problem: API Calls Return 404

**Solution:**
- Check `REACT_APP_API_URL` in frontend variables
- Make sure it ends with `/api`
- Verify backend domain is correct
- Redeploy frontend after changing the variable

### Problem: Backend Won't Start

**Solution:**
- Check backend logs in Railway dashboard
- Verify all required environment variables are set
- Check Supabase credentials are correct
- Ensure `NODE_ENV=production` is set

### Problem: Frontend Build Fails

**Solution:**
- Check frontend logs in Railway dashboard
- Verify `REACT_APP_API_URL` is set correctly
- Make sure all dependencies are in `package.json`
- Check for syntax errors in your code

### Problem: Database Connection Errors

**Solution:**
- Verify Supabase URL and keys are correct
- Check Supabase project is active
- Ensure service role key (not anon key) is used for `SUPABASE_SERVICE_ROLE_KEY`

---

## 📊 Monitoring Your App

### View Logs
- **Backend:** Service → Deployments → Click deployment → View Logs
- **Frontend:** Same process

### View Metrics
- Go to service → **"Metrics"** tab
- See CPU, Memory, Network usage

### Set Up Alerts
- Go to service → **"Settings"** → **"Alerts"**
- Get notified of deployment failures

---

## 🔄 Updating Your App

When you push code to GitHub:
1. Railway automatically detects changes
2. Services will auto-deploy
3. Check **"Deployments"** tab to see progress

**Note:** If you change environment variables, services will auto-redeploy.

---

## 💰 Railway Pricing

- **Free Tier:** $5 credit/month (great for testing)
- **Hobby Plan:** $5/month + usage
- **Pro Plan:** $20/month + usage

Your app will likely stay within free tier for development.

---

## 📝 Quick Reference

### Backend Environment Variables
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
JWT_SECRET=your-random-secret
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.railway.app
FRONTEND_URL=https://your-frontend.railway.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Frontend Environment Variables
```
REACT_APP_API_URL=https://your-backend.railway.app/api
```

---

## 🎉 You're Done!

Your Poorito application is now live on Railway! 

**Next Steps:**
- Share your frontend URL with users
- Monitor logs and metrics
- Set up custom domains (optional)
- Configure backups (if needed)

**Need Help?**
- Railway Docs: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)

---

## 📌 Important Notes

1. **Always use HTTPS** - Railway provides SSL certificates automatically
2. **Environment Variables** - Frontend variables must start with `REACT_APP_`
3. **Root Directories** - Make sure backend uses `backend/` and frontend uses `Website/`
4. **CORS** - Backend must allow your frontend domain
5. **Domains** - Railway domains are free and auto-renew

---

**Happy Deploying! 🚀**

