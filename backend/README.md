# Poorito Backend API

A Node.js + Express + Supabase backend API for the Poorito mountain exploration platform.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Mountain Management**: CRUD operations for mountain data
- **Article System**: Content management for guides and articles
- **Analytics Dashboard**: Statistics and insights for admins
- **Security**: Helmet, CORS, rate limiting, and input validation
- **Database**: Supabase (PostgreSQL) with real-time capabilities

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- Supabase account (free)
- npm or yarn

### Installation

1. **Clone and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Supabase:**
   - Create a project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `database/supabase-schema.sql` in Supabase SQL Editor
   - Get your project URL and API keys

4. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   PORT=5000
   JWT_SECRET=your_jwt_secret_key_here
   CORS_ORIGIN=http://localhost:3000
   ```

5. **Start the server:**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Mountains
- `GET /api/mountains` - Get all mountains
- `GET /api/mountains/:id` - Get single mountain
- `POST /api/mountains` - Create mountain (admin)
- `PUT /api/mountains/:id` - Update mountain (admin)
- `DELETE /api/mountains/:id` - Delete mountain (admin)
- `GET /api/mountains/difficulty/:level` - Get mountains by difficulty

### Articles
- `GET /api/articles` - Get published articles
- `GET /api/articles/admin` - Get all articles (admin)
- `GET /api/articles/:id` - Get single article
- `POST /api/articles` - Create article (admin)
- `PUT /api/articles/:id` - Update article (admin)
- `DELETE /api/articles/:id` - Delete article (admin)
- `GET /api/articles/category/:category` - Get articles by category

### Analytics
- `GET /api/analytics/dashboard` - Dashboard overview (admin)
- `GET /api/analytics/mountains` - Mountain statistics (admin)
- `GET /api/analytics/articles` - Article statistics (admin)
- `GET /api/analytics/users` - User statistics (admin)

## Database Schema

The database includes the following tables:
- `users` - User accounts and authentication
- `mountains` - Mountain information and details
- `articles` - Articles and guides
- `mountain_guides` - Detailed mountain guides
- `user_activities` - User interaction tracking

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet security headers
- Input validation and sanitization

## Development

### Project Structure
```
backend/
├── config/
│   └── database.js          # Database configuration
├── database/
│   └── schema.sql           # Database schema
├── middleware/
│   └── auth.js              # Authentication middleware
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── mountains.js         # Mountain routes
│   ├── articles.js          # Article routes
│   └── analytics.js         # Analytics routes
├── server.js                # Main server file
├── package.json
└── README.md
```

### Environment Variables
- `DB_HOST` - MySQL host
- `DB_USER` - MySQL username
- `DB_PASSWORD` - MySQL password
- `DB_NAME` - Database name
- `PORT` - Server port
- `JWT_SECRET` - JWT signing secret
- `CORS_ORIGIN` - Allowed CORS origin
- `NODE_ENV` - Environment (development/production)

## Testing

Test the API using tools like Postman or curl:

```bash
# Health check
curl http://localhost:5000/api/health

# Get mountains
curl http://localhost:5000/api/mountains

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License
