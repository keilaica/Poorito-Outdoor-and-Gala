#!/bin/bash

echo "Setting up Poorito Backend..."
echo

echo "Installing backend dependencies..."
cd backend
npm install

echo
echo "Backend setup complete!"
echo
echo "Next steps:"
echo "1. Copy env.example to .env and configure your database settings"
echo "2. Set up MySQL database using database/schema.sql"
echo "3. Run: npm run dev"
echo
