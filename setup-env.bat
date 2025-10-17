@echo off
echo Creating backend .env file...

(
echo # Supabase Configuration
echo SUPABASE_URL=https://ednzkmajmerlvuwptnti.supabase.co
echo SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkbnprbWFqbWVybHZ1d3B0bnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NDcwNTUsImV4cCI6MjA3NTEyMzA1NX0.LPnXAC8K-dZcERJgmq2Fq42x4EtL_n8920FB0fbbES4
echo # SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
echo.
echo # JWT Secret ^(change this in production!^)
echo JWT_SECRET=poorito_secret_key_change_in_production_2024
echo.
echo # Server Configuration
echo PORT=5000
echo NODE_ENV=development
echo.
echo # CORS
echo CORS_ORIGIN=http://localhost:3000
) > backend\.env

echo .env file created successfully!
echo You can now start the backend server with: cd backend ^&^& npm run dev
pause

