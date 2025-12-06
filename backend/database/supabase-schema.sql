-- Poorito Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- Note: JWT secret is managed by Supabase automatically

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role TEXT CHECK (role IN ('admin', 'user')) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mountains table (with integrated details)
CREATE TABLE IF NOT EXISTS mountains (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    elevation INTEGER NOT NULL,
    location VARCHAR(100) NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('Easy', 'Moderate', 'Hard', 'Expert')) NOT NULL,
    description TEXT,
    image_url TEXT,
    additional_images JSONB DEFAULT '[]'::jsonb,
    
    -- What to bring section (stored as JSON array)
    what_to_bring JSONB DEFAULT '[]'::jsonb,
    
    -- Budgeting section (stored as JSON array)
    budgeting JSONB DEFAULT '[]'::jsonb,
    
    -- Itinerary section (stored as JSON array)
    itinerary JSONB DEFAULT '[]'::jsonb,
    
    -- How to get there section (stored as JSON array)
    how_to_get_there JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    image_url VARCHAR(500),
    status TEXT CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mountain guides table (optional - for detailed guides)
CREATE TABLE IF NOT EXISTS mountain_guides (
    id BIGSERIAL PRIMARY KEY,
    mountain_id BIGINT REFERENCES mountains(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(100) NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('Easy', 'Moderate', 'Hard', 'Expert')) NOT NULL,
    estimated_time VARCHAR(50),
    distance DECIMAL(5,2),
    elevation_gain INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User activities table (for tracking user interactions)
CREATE TABLE IF NOT EXISTS user_activities (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    activity_type TEXT CHECK (activity_type IN ('mountain_view', 'article_view', 'guide_view')) NOT NULL,
    resource_id BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table (for trail bookings)
CREATE TABLE IF NOT EXISTS bookings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    mountain_id BIGINT REFERENCES mountains(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    number_of_participants INTEGER DEFAULT 1 CHECK (number_of_participants >= 1 AND number_of_participants <= 20),
    status TEXT CHECK (status IN ('confirmed', 'cancelled', 'completed')) DEFAULT 'confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cancelled_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, mountain_id, booking_date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_mountains_difficulty ON mountains(difficulty);
CREATE INDEX IF NOT EXISTS idx_mountains_location ON mountains(location);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_mountain_id ON bookings(mountain_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mountains ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mountain_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
DROP POLICY IF EXISTS "Users can view their own data" ON users;
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Users can update their own data" ON users;
CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Allow public user registration (INSERT)
-- This is safe because the backend validates all input and hashes passwords
DROP POLICY IF EXISTS "Allow public user registration" ON users;
CREATE POLICY "Allow public user registration" ON users
    FOR INSERT WITH CHECK (true);

-- RLS Policies for mountains table (public read, admin write)
DROP POLICY IF EXISTS "Mountains are viewable by everyone" ON mountains;
CREATE POLICY "Mountains are viewable by everyone" ON mountains
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can insert mountains" ON mountains;
CREATE POLICY "Only admins can insert mountains" ON mountains
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Only admins can update mountains" ON mountains;
CREATE POLICY "Only admins can update mountains" ON mountains
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Only admins can delete mountains" ON mountains;
CREATE POLICY "Only admins can delete mountains" ON mountains
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role = 'admin'
        )
    );

-- RLS Policies for articles table
DROP POLICY IF EXISTS "Published articles are viewable by everyone" ON articles;
CREATE POLICY "Published articles are viewable by everyone" ON articles
    FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Admins can view all articles" ON articles;
CREATE POLICY "Admins can view all articles" ON articles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Only admins can insert articles" ON articles;
CREATE POLICY "Only admins can insert articles" ON articles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Only admins can update articles" ON articles;
CREATE POLICY "Only admins can update articles" ON articles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Only admins can delete articles" ON articles;
CREATE POLICY "Only admins can delete articles" ON articles
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role = 'admin'
        )
    );

-- RLS Policies for mountain_guides table
DROP POLICY IF EXISTS "Mountain guides are viewable by everyone" ON mountain_guides;
CREATE POLICY "Mountain guides are viewable by everyone" ON mountain_guides
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can manage mountain guides" ON mountain_guides;
CREATE POLICY "Only admins can manage mountain guides" ON mountain_guides
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role = 'admin'
        )
    );

-- RLS Policies for user_activities table
DROP POLICY IF EXISTS "Users can view their own activities" ON user_activities;
CREATE POLICY "Users can view their own activities" ON user_activities
    FOR SELECT USING (user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Users can insert their own activities" ON user_activities;
CREATE POLICY "Users can insert their own activities" ON user_activities
    FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

-- RLS Policies for bookings table
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
CREATE POLICY "Users can view their own bookings" ON bookings
    FOR SELECT USING (user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Users can create their own bookings" ON bookings;
CREATE POLICY "Users can create their own bookings" ON bookings
    FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;
CREATE POLICY "Users can update their own bookings" ON bookings
    FOR UPDATE USING (user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
CREATE POLICY "Admins can view all bookings" ON bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role = 'admin'
        )
    );

-- Insert sample data
INSERT INTO users (username, email, password, role) VALUES 
('admin', 'admin@poorito.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('user1', 'user1@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user')
ON CONFLICT (email) DO NOTHING;

INSERT INTO mountains (name, elevation, location, difficulty, description) VALUES 
('Mount Apo', 2954, 'Davao del Sur', 'Hard', 'The highest peak in the Philippines'),
('Mount Pulag', 2922, 'Benguet', 'Moderate', 'Famous for its sea of clouds'),
('Mount Mayon', 2463, 'Albay', 'Hard', 'Perfect cone-shaped volcano'),
('Mount Pinatubo', 1486, 'Zambales', 'Easy', 'Famous for its crater lake'),
('Mount Batulao', 811, 'Batangas', 'Easy', 'Popular day hike destination')
ON CONFLICT DO NOTHING;

INSERT INTO articles (title, content, author, category, status) VALUES 
('Essential Hiking Gear for Beginners', 'When starting your hiking journey, having the right gear is crucial for safety and comfort. Here are the essential items every beginner should have...', 'Admin', 'Gear', 'published'),
('Safety Tips for Mountain Climbing', 'Mountain climbing can be dangerous if proper safety measures are not taken. Always inform someone of your plans, check weather conditions, and never climb alone...', 'Admin', 'Safety', 'published'),
('Best Time to Hike in the Philippines', 'The Philippines has a tropical climate that affects hiking conditions throughout the year. The best time is typically during the dry season from November to April...', 'Admin', 'Planning', 'published'),
('Mountain Photography Tips', 'Capturing the beauty of mountains requires specific techniques and equipment. Learn about composition, lighting, and camera settings for stunning mountain photos...', 'Admin', 'Photography', 'draft')
ON CONFLICT DO NOTHING;
