-- Add link and mountain_name columns to articles table
ALTER TABLE articles ADD COLUMN IF NOT EXISTS link VARCHAR(500);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS mountain_name VARCHAR(100);



