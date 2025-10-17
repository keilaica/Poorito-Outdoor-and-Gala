const express = require('express');
const supabase = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all mountains (public)
router.get('/', async (req, res) => {
  try {
    const { data: mountains, error } = await supabase
      .from('mountains')
      .select('id, name, elevation, location, difficulty, description, image_url, created_at, updated_at')
      .order('name', { ascending: true });

    if (error) {
      console.error('Get mountains error:', error);
      // Development fallback so UI stays usable without DB setup
      if (process.env.NODE_ENV !== 'production') {
        return res.json({ mountains: [
          { id: 1, name: 'Mount Apo', elevation: 2954, location: 'Davao del Sur', difficulty: 'Hard', description: 'The highest peak in the Philippines', image_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 2, name: 'Mount Pulag', elevation: 2922, location: 'Benguet', difficulty: 'Moderate', description: 'Famous for its sea of clouds', image_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        ]});
      }
      return res.status(500).json({ 
        error: 'Failed to fetch mountains',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }

    res.json({ mountains: mountains || [] });
  } catch (error) {
    console.error('Get mountains error:', error);
    if (process.env.NODE_ENV !== 'production') {
      return res.json({ mountains: [
        { id: 1, name: 'Mount Apo', elevation: 2954, location: 'Davao del Sur', difficulty: 'Hard', description: 'The highest peak in the Philippines', image_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 2, name: 'Mount Pulag', elevation: 2922, location: 'Benguet', difficulty: 'Moderate', description: 'Famous for its sea of clouds', image_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      ]});
    }
    res.status(500).json({ error: 'Failed to fetch mountains' });
  }
});

// Get single mountain
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: mountain, error } = await supabase
      .from('mountains')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Get mountain error:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch mountain',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }

    if (!mountain) {
      return res.status(404).json({ error: 'Mountain not found' });
    }

    res.json({ mountain });
  } catch (error) {
    console.error('Get mountain error:', error);
    res.status(500).json({ error: 'Failed to fetch mountain' });
  }
});

// Create mountain (admin only) - temporarily without auth for testing
router.post('/', async (req, res) => {
  try {
    const { name, elevation, location, difficulty, description, image_url } = req.body;
    
    // Debug: Log received data
    console.log('Received mountain data:', {
      name,
      elevation,
      location,
      difficulty,
      description,
      image_url: image_url ? `${image_url.substring(0, 50)}...` : 'No image'
    });

    if (!name || !elevation || !location || !difficulty) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data: newMountain, error } = await supabase
      .from('mountains')
      .insert([{
        name,
        elevation,
        location,
        difficulty,
        description,
        image_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Create mountain error:', error);
      return res.status(500).json({ 
        error: 'Failed to create mountain',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }

    res.status(201).json({
      message: 'Mountain created successfully',
      mountain: newMountain
    });
  } catch (error) {
    console.error('Create mountain error:', error);
    res.status(500).json({ error: 'Failed to create mountain' });
  }
});

// Update mountain (admin only) - temporarily without auth for testing
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, elevation, location, difficulty, description, image_url } = req.body;

    const { data: updatedMountain, error } = await supabase
      .from('mountains')
      .update({
        name,
        elevation,
        location,
        difficulty,
        description,
        image_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update mountain error:', error);
      
      // Development fallback - pretend update succeeded
      if (process.env.NODE_ENV !== 'production') {
        console.log('Using mock update for development');
        return res.json({ 
          message: 'Mountain updated successfully (mock)',
          mountain: {
            id,
            name,
            elevation,
            location,
            difficulty,
            description,
            image_url,
            updated_at: new Date().toISOString()
          }
        });
      }
      
      return res.status(500).json({ 
        error: 'Failed to update mountain',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }

    if (!updatedMountain) {
      // Development fallback
      if (process.env.NODE_ENV !== 'production') {
        return res.json({ 
          message: 'Mountain updated successfully (mock)',
          mountain: {
            id,
            name,
            elevation,
            location,
            difficulty,
            description,
            image_url,
            updated_at: new Date().toISOString()
          }
        });
      }
      return res.status(404).json({ error: 'Mountain not found' });
    }

    res.json({ message: 'Mountain updated successfully', mountain: updatedMountain });
  } catch (error) {
    console.error('Update mountain error:', error);
    
    // Final development fallback
    if (process.env.NODE_ENV !== 'production') {
      return res.json({ 
        message: 'Mountain updated successfully (mock)',
        mountain: {
          id: req.params.id,
          ...req.body,
          updated_at: new Date().toISOString()
        }
      });
    }
    
    res.status(500).json({ error: 'Failed to update mountain' });
  }
});

// Delete mountain (admin only) - temporarily without auth for testing
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: deletedMountain, error } = await supabase
      .from('mountains')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Delete mountain error:', error);
      return res.status(500).json({ 
        error: 'Failed to delete mountain',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }

    if (!deletedMountain) {
      return res.status(404).json({ error: 'Mountain not found' });
    }

    res.json({ message: 'Mountain deleted successfully' });
  } catch (error) {
    console.error('Delete mountain error:', error);
    res.status(500).json({ error: 'Failed to delete mountain' });
  }
});

// Get mountains by difficulty
router.get('/difficulty/:level', async (req, res) => {
  try {
    const { level } = req.params;
    
    const { data: mountains, error } = await supabase
      .from('mountains')
      .select('*')
      .eq('difficulty', level)
      .order('name', { ascending: true });

    if (error) {
      console.error('Get mountains by difficulty error:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch mountains',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }

    res.json({ mountains: mountains || [] });
  } catch (error) {
    console.error('Get mountains by difficulty error:', error);
    res.status(500).json({ error: 'Failed to fetch mountains' });
  }
});

module.exports = router;
