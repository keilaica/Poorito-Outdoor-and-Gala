const express = require('express');
const supabase = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all articles (public)
router.get('/', async (req, res) => {
  try {
    const { data: articles, error } = await supabase
      .from('articles')
      .select('id, title, content, author, category, image_url, link, mountain_name, created_at, updated_at, status')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get articles error:', error);
      if (process.env.NODE_ENV !== 'production') {
        return res.json({ 
          articles: [
            { 
              id: 1, 
              title: 'Essential Hiking Gear for Beginners', 
              content: 'When starting your hiking journey, having the right gear is crucial for safety and comfort...', 
              author: 'Admin', 
              category: 'Gear', 
              image_url: null,
              status: 'published',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            { 
              id: 2, 
              title: 'Safety Tips for Mountain Climbing', 
              content: 'Mountain climbing can be dangerous if proper safety measures are not taken...', 
              author: 'Admin', 
              category: 'Safety', 
              image_url: null,
              status: 'published',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            { 
              id: 3, 
              title: 'Best Time to Hike in the Philippines', 
              content: 'The Philippines has a tropical climate that affects hiking conditions...', 
              author: 'Admin', 
              category: 'Planning', 
              image_url: null,
              status: 'published',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]
        });
      }
      return res.status(500).json({ error: 'Failed to fetch articles' });
    }

    res.json({ articles: articles || [] });
  } catch (error) {
    console.error('Get articles error:', error);
    if (process.env.NODE_ENV !== 'production') {
      return res.json({ 
        articles: [
          { 
            id: 1, 
            title: 'Essential Hiking Gear for Beginners', 
            content: 'When starting your hiking journey, having the right gear is crucial...', 
            author: 'Admin', 
            category: 'Gear', 
            image_url: null,
            status: 'published',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          { 
            id: 2, 
            title: 'Safety Tips for Mountain Climbing', 
            content: 'Mountain climbing can be dangerous if proper safety measures are not taken...', 
            author: 'Admin', 
            category: 'Safety', 
            image_url: null,
            status: 'published',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          { 
            id: 3, 
            title: 'Best Time to Hike in the Philippines', 
            content: 'The Philippines has a tropical climate that affects hiking conditions...', 
            author: 'Admin', 
            category: 'Planning', 
            image_url: null,
            status: 'published',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
      });
    }
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// Get all articles (admin - including drafts)
router.get('/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data: articles, error } = await supabase
      .from('articles')
      .select('id, title, content, author, category, image_url, link, mountain_name, created_at, updated_at, status')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get articles error:', error);
      return res.status(500).json({ error: 'Failed to fetch articles' });
    }

    res.json({ articles: articles || [] });
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// Get single article
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: article, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .eq('status', 'published')
      .single();

    if (error) {
      console.error('Get article error:', error);
      return res.status(500).json({ error: 'Failed to fetch article' });
    }

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json({ article });
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// Create article (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, content, author, category, image_url, link, mountain_name, status = 'draft' } = req.body;

    if (!title || !content || !author) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data: newArticle, error } = await supabase
      .from('articles')
      .insert([{
        title,
        content,
        author,
        category,
        image_url,
        link,
        mountain_name,
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Create article error:', error);
      return res.status(500).json({ error: 'Failed to create article' });
    }

    res.status(201).json({
      message: 'Article created successfully',
      article: newArticle
    });
  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({ error: 'Failed to create article' });
  }
});

// Update article (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, author, category, image_url, link, mountain_name, status } = req.body;

    const { data: updatedArticle, error } = await supabase
      .from('articles')
      .update({
        title,
        content,
        author,
        category,
        image_url,
        link,
        mountain_name,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update article error:', error);
      return res.status(500).json({ error: 'Failed to update article' });
    }

    if (!updatedArticle) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json({ message: 'Article updated successfully' });
  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({ error: 'Failed to update article' });
  }
});

// Delete article (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: deletedArticle, error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Delete article error:', error);
      return res.status(500).json({ error: 'Failed to delete article' });
    }

    if (!deletedArticle) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

// Get articles by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .eq('category', category)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get articles by category error:', error);
      return res.status(500).json({ error: 'Failed to fetch articles' });
    }

    res.json({ articles: articles || [] });
  } catch (error) {
    console.error('Get articles by category error:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

module.exports = router;
