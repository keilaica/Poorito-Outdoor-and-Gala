# 🚀 Poorito Quick Start Guide

## Quick Start (Easy Way!)

### Option 1: Using Batch Files (Recommended)

1. **Double-click `start-backend.bat`** to start the backend server
2. **Double-click `start-frontend.bat`** to start the React app
3. **Browser will open automatically** to http://localhost:3000/login

### Option 2: Manual Start

1. **Start Backend** (in one terminal):
   ```bash
   cd backend
   node server.js
   ```

2. **Start Frontend** (in another terminal):
   ```bash
   cd Website
   npm start
   ```

3. **Open your browser** to:
   - Frontend: http://localhost:3000
   - Login Page: http://localhost:3000/login

## 🔐 Admin Login Credentials

Use these credentials to log in to the admin panel:

- **Email:** `admin@poorito.com`
- **Password:** `password`

## 📁 Project Structure

```
Poorito/
├── backend/              # Express API Server (Running on port 5000)
│   ├── routes/          # API endpoints
│   ├── config/          # Database configuration
│   └── .env             # Environment variables (created)
│
└── Website/             # React Frontend (Port 3000)
    ├── src/
    │   ├── pages/       # Page components
    │   ├── components/  # Reusable components
    │   └── services/    # API service layer
    └── public/          # Static assets
```

## 🎯 Features

### Public Pages
- **Home** (`/`) - Landing page
- **Explore** (`/explore`) - Browse content
- **Mountains** (`/mountains`) - Public mountain directory
- **Guides** (`/guides`) - Hiking guides and articles

### Admin Panel (Protected)
- **Dashboard** (`/admin`) - Overview with statistics
- **Mountains** (`/admin/mountains`) - Manage mountain data
- **Articles & Guides** (`/admin/articles-guides`) - Content management
- **Analytics** (`/admin/analytics`) - Detailed analytics and charts
- **Admin Settings** (`/admin/settings`) - User management

## 🔧 Mock Data Enabled

The backend has mock data fallbacks for development:
- ✅ **5 Sample Mountains** (Mount Apo, Mount Pulag, etc.)
- ✅ **3 Sample Articles** (Hiking gear, Safety tips, etc.)
- ✅ **Analytics Data** (Statistics, charts, distributions)
- ✅ **User Data** (Admin and demo users)

All pages will work even without a Supabase database configured!

## 🗄️ Database Setup (Optional)

To use real Supabase data instead of mock data:

1. Update `backend/.env` with your Supabase credentials:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. Run the schema in your Supabase SQL Editor:
   - File: `backend/database/supabase-schema.sql`

3. Restart the backend server

See `SUPABASE_SETUP.md` for detailed instructions.

## 🎨 Customization

### Change Theme Colors
Edit `Website/tailwind.config.js` to customize the color scheme.

### Add New Routes
1. Create component in `Website/src/pages/`
2. Add route in `Website/src/App.js`
3. Update sidebar in `Website/src/components/Sidebar.js`

## 📝 Available Scripts

### Backend
```bash
cd backend
npm run dev    # Start with nodemon (auto-reload)
npm start      # Start production server
```

### Frontend
```bash
cd Website
npm start      # Start development server
npm build      # Build for production
npm test       # Run tests
```

## 🐛 Troubleshooting

### Backend not starting?
- Make sure you're in the `backend` folder
- Check if port 5000 is available
- Verify `.env` file exists

### Frontend can't connect to API?
- Ensure backend is running on port 5000
- Check `Website/src/services/api.js` for correct API URL

### Login not working?
- Make sure backend is running
- Try demo credentials: `admin@poorito.com` / `password`
- Check browser console for errors

## 🎉 You're All Set!

Your Poorito application is ready to use with:
- ✅ Backend API running with mock data
- ✅ Protected admin routes with authentication
- ✅ Beautiful UI with Tailwind CSS
- ✅ Full CRUD operations for mountains and articles
- ✅ Analytics dashboard with charts

Happy hiking! ⛰️
