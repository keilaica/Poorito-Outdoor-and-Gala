-- Poorito Database Schema
-- Create database
CREATE DATABASE IF NOT EXISTS poorito_db;
USE poorito_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Mountains table
CREATE TABLE IF NOT EXISTS mountains (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    elevation INT NOT NULL,
    location VARCHAR(100) NOT NULL,
    difficulty ENUM('Easy', 'Moderate', 'Hard', 'Expert') NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content LONGTEXT NOT NULL,
    author VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    image_url VARCHAR(500),
    status ENUM('draft', 'published') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Mountain guides table (optional - for detailed guides)
CREATE TABLE IF NOT EXISTS mountain_guides (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mountain_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content LONGTEXT NOT NULL,
    author VARCHAR(100) NOT NULL,
    difficulty ENUM('Easy', 'Moderate', 'Hard', 'Expert') NOT NULL,
    estimated_time VARCHAR(50),
    distance DECIMAL(5,2),
    elevation_gain INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mountain_id) REFERENCES mountains(id) ON DELETE CASCADE
);

-- User activities table (for tracking user interactions)
CREATE TABLE IF NOT EXISTS user_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    activity_type ENUM('mountain_view', 'article_view', 'guide_view') NOT NULL,
    resource_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert sample data
INSERT INTO users (username, email, password, role) VALUES 
('admin', 'admin@poorito.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('user1', 'user1@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');

INSERT INTO mountains (name, elevation, location, difficulty, description) VALUES 
('Mount Apo', 2954, 'Davao del Sur', 'Hard', 'The highest peak in the Philippines'),
('Mount Pulag', 2922, 'Benguet', 'Moderate', 'Famous for its sea of clouds'),
('Mount Mayon', 2463, 'Albay', 'Hard', 'Perfect cone-shaped volcano'),
('Mount Pinatubo', 1486, 'Zambales', 'Easy', 'Famous for its crater lake'),
('Mount Batulao', 811, 'Batangas', 'Easy', 'Popular day hike destination');

INSERT INTO articles (title, content, author, category, status) VALUES 
('Essential Hiking Gear for Beginners', 'When starting your hiking journey, having the right gear is crucial...', 'Admin', 'Gear', 'published'),
('Safety Tips for Mountain Climbing', 'Mountain climbing can be dangerous if proper safety measures are not taken...', 'Admin', 'Safety', 'published'),
('Best Time to Hike in the Philippines', 'The Philippines has a tropical climate that affects hiking conditions...', 'Admin', 'Planning', 'published'),
('Mountain Photography Tips', 'Capturing the beauty of mountains requires specific techniques...', 'Admin', 'Photography', 'draft');
