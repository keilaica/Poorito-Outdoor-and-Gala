# 🚀 Supabase Setup Guide for Poorito Backend

## Quick Start with Supabase

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name:** `poorito-backend`
   - **Database Password:** (create a strong password)
   - **Region:** Choose closest to your location
6. Click "Create new project"
7. Wait for project to be ready (2-3 minutes)

### 2. Get Your Supabase Credentials
1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)
   - **service_role** key (starts with `eyJ`)

### 3. Set Up Database Schema
1. Go to **SQL Editor** in your Supabase dashboard
2. Click "New Query"
3. Copy and paste the contents of `backend/database/supabase-schema.sql`
4. Click "Run" to execute the schema

### 4. Configure Environment Variables
1. Copy `backend/env.example` to `backend/.env`
2. Update with your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   JWT_SECRET=your_jwt_secret_key_here
   PORT=5000
   CORS_ORIGIN=http://localhost:3000
   ```

### 5. Install Dependencies and Start
```bash
cd backend
npm install
npm run dev
```

## 🎉 You're Ready!

Your API will be available at `http://localhost:5000`

### Test Your Setup
```bash
# Health check
curl http://localhost:5000/api/health

# Get mountains
curl http://localhost:5000/api/mountains

# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

## 🔧 Supabase Features You Get

✅ **PostgreSQL Database** - Full SQL database with advanced features  
✅ **Real-time Subscriptions** - Live data updates  
✅ **Row Level Security** - Built-in security policies  
✅ **Authentication** - User management (optional to use)  
✅ **Storage** - File uploads and management  
✅ **Edge Functions** - Serverless functions  
✅ **Dashboard** - Visual database management  

## 📊 Database Tables Created

- **users** - User accounts and authentication
- **mountains** - Mountain information and details  
- **articles** - Articles and guides
- **mountain_guides** - Detailed mountain guides
- **user_activities** - User interaction tracking

## 🔒 Security Features

- Row Level Security (RLS) enabled on all tables
- Public read access for mountains and published articles
- Admin-only write access for content management
- JWT authentication for API access
- CORS protection configured

## 🆘 Troubleshooting

**Connection Issues:**
- Verify your Supabase URL and keys are correct
- Check if your project is active in Supabase dashboard
- Ensure your `.env` file is in the `backend` directory

**Database Errors:**
- Make sure you ran the schema SQL in Supabase SQL Editor
- Check the Supabase logs in the dashboard
- Verify RLS policies are not blocking your requests

**API Errors:**
- Check server logs for detailed error messages
- Verify all environment variables are set
- Test with the health endpoint first

## 📚 Next Steps

1. **Connect Your React App** - Update your frontend to use the new API endpoints
2. **Add Authentication** - Implement login/register in your React app
3. **File Uploads** - Use Supabase Storage for mountain images
4. **Real-time Features** - Add live updates for your dashboard

## 🔗 Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
