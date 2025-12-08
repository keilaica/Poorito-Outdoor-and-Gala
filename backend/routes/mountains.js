const express = require('express');
const supabase = require('../config/database');
const { withTimeout, withRetry } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all mountains (public)
router.get('/', async (req, res) => {
  try {
    // Try to select with distance_km first, wrapped with timeout and retry
    let result = await withRetry(() => {
      return supabase
        .from('mountains')
        .select('id, name, elevation, location, difficulty, description, image_url, additional_images, trip_duration, meters_above_sea_level, duration, distance_km, base_price_per_head, joiner_capacity, exclusive_price, is_joiner_available, is_exclusive_available, created_at, updated_at')
        .order('name', { ascending: true });
    }, 2, 1000); // 2 retries with 1s initial delay
    
    let { data: mountains, error } = result;

    // If error is due to missing distance_km column, retry without it
    if (error && error.message && error.message.includes('distance_km') && error.message.includes('does not exist')) {
      console.warn('distance_km column does not exist, retrying without it. Please run migration: backend/database/migrations/add_distance_km_to_mountains.sql');
      const retryResult = await withRetry(() => {
        return supabase
          .from('mountains')
          .select('id, name, elevation, location, difficulty, description, image_url, additional_images, trip_duration, meters_above_sea_level, duration, base_price_per_head, joiner_capacity, exclusive_price, is_joiner_available, is_exclusive_available, created_at, updated_at')
          .order('name', { ascending: true });
      }, 2, 1000);
      
      mountains = retryResult.data;
      error = retryResult.error;
      
      // Add null distance_km to each mountain for consistency
      if (mountains) {
        mountains = mountains.map(m => ({ ...m, distance_km: null }));
      }
    }

    // Handle timeout errors specifically
    if (error && (error.message && error.message.includes('timeout') || error.code === '57014')) {
      console.error('Get mountains timeout error:', error);
      // Return cached/fallback data or empty array instead of failing
      return res.status(503).json({ 
        error: 'Query timeout - database is slow',
        mountains: [],
        message: 'The database query timed out. Please try again later.'
      });
    }

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
    
    // Handle timeout errors
    if (error.message && error.message.includes('timeout')) {
      return res.status(503).json({ 
        error: 'Query timeout',
        mountains: [],
        message: 'The database query timed out. Please try again later.'
      });
    }
    
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
    const { name, elevation, location, difficulty, description, status, image_url, additional_images, trip_duration, meters_above_sea_level, duration, distance_km, base_price_per_head, joiner_capacity, exclusive_price, is_joiner_available, is_exclusive_available, what_to_bring, budgeting, itinerary, how_to_get_there } = req.body;
    
    // Debug: Log received data
    console.log('Received mountain data:', {
      name,
      elevation,
      location,
      difficulty,
      description,
      trip_duration,
      distance_km,
      image_url: image_url ? `${image_url.substring(0, 50)}...` : 'No image',
      additional_images_count: additional_images ? additional_images.length : 0,
      what_to_bring_count: Array.isArray(what_to_bring) ? what_to_bring.length : 0,
      budgeting_count: Array.isArray(budgeting) ? budgeting.length : 0,
      itinerary_count: Array.isArray(itinerary) ? itinerary.length : 0
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
        status: status || 'backtrail',
        trip_duration: trip_duration || 1, // Default to 1 day if not provided
        meters_above_sea_level: (meters_above_sea_level === null || meters_above_sea_level === '' || meters_above_sea_level === undefined) 
          ? null 
          : (isNaN(parseInt(meters_above_sea_level)) ? null : parseInt(meters_above_sea_level)),
        duration: (duration === null || duration === '' || duration === undefined) ? null : duration,
        distance_km: (distance_km === null || distance_km === '' || distance_km === undefined) 
          ? null 
          : (isNaN(parseFloat(distance_km)) ? null : parseFloat(distance_km)),
        image_url,
        additional_images: Array.isArray(additional_images) ? additional_images : [],
        base_price_per_head: base_price_per_head || 1599.00,
        joiner_capacity: joiner_capacity || 14,
        exclusive_price: (() => {
          if (exclusive_price === undefined || exclusive_price === null || exclusive_price === '') {
            return null;
          }
          const parsedPrice = parseFloat(exclusive_price);
          if (isNaN(parsedPrice) || parsedPrice < 0) {
            return null; // Invalid price, set to null (will be caught by validation if needed)
          }
          return parsedPrice;
        })(),
        is_joiner_available: is_joiner_available !== undefined ? is_joiner_available : true,
        is_exclusive_available: is_exclusive_available !== undefined ? is_exclusive_available : true,
        what_to_bring: Array.isArray(what_to_bring) ? what_to_bring : [],
        budgeting: Array.isArray(budgeting) ? budgeting : [],
        itinerary: Array.isArray(itinerary) ? itinerary : [],
        how_to_get_there: Array.isArray(how_to_get_there) ? how_to_get_there : [],
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
    const { 
      name, 
      elevation, 
      location, 
      difficulty, 
      description,
      status,
      image_url,
      additional_images,
      trip_duration,
      meters_above_sea_level,
      duration,
      distance_km,
      base_price_per_head,
      joiner_capacity,
      exclusive_price,
      is_joiner_available,
      is_exclusive_available,
      what_to_bring,
      budgeting,
      itinerary,
      how_to_get_there
    } = req.body;

    console.log('Attempting to update mountain:', id, { name, elevation, location, distance_km });
    console.log('Received pricing data:', {
      base_price_per_head,
      joiner_capacity,
      exclusive_price,
      is_joiner_available,
      is_exclusive_available
    });
    console.log('Received additional_images:', {
      isArray: Array.isArray(additional_images),
      length: additional_images ? additional_images.length : 0,
      firstImagePreview: additional_images && additional_images.length > 0 
        ? additional_images[0].substring(0, 50) + '...' 
        : 'none'
    });

    // Build update object with only provided fields (don't include undefined values)
    const updateData = {
      updated_at: new Date().toISOString()
    };

    // Only add fields if they are provided (not undefined)
    if (name !== undefined) updateData.name = name;
    if (elevation !== undefined) updateData.elevation = elevation;
    if (location !== undefined) updateData.location = location;
    if (difficulty !== undefined) updateData.difficulty = difficulty;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (trip_duration !== undefined) updateData.trip_duration = parseInt(trip_duration) || 1;
    if (meters_above_sea_level !== undefined) {
      // Handle empty strings, null, or undefined - convert to null
      if (meters_above_sea_level === null || meters_above_sea_level === '' || meters_above_sea_level === undefined) {
        updateData.meters_above_sea_level = null;
      } else {
        const parsed = parseInt(meters_above_sea_level);
        updateData.meters_above_sea_level = isNaN(parsed) ? null : parsed;
      }
    }
    if (duration !== undefined) {
      // Handle empty strings - convert to null
      updateData.duration = (duration === null || duration === '' || duration === undefined) ? null : duration;
    }
    if (distance_km !== undefined) {
      // Handle empty strings, null, or undefined - convert to null
      if (distance_km === null || distance_km === '' || distance_km === undefined) {
        updateData.distance_km = null;
      } else {
        const parsed = parseFloat(distance_km);
        updateData.distance_km = isNaN(parsed) ? null : parsed;
      }
      console.log('Processing distance_km update:', {
        received: distance_km,
        type: typeof distance_km,
        parsed: updateData.distance_km
      });
    } else {
      console.log('⚠️ distance_km is undefined in request body - will not be updated');
    }
    if (image_url !== undefined) updateData.image_url = image_url;
    if (base_price_per_head !== undefined) updateData.base_price_per_head = parseFloat(base_price_per_head) || 0;
    if (joiner_capacity !== undefined) updateData.joiner_capacity = parseInt(joiner_capacity) || 14;
    // Handle exclusive_price: allow null, 0, or any positive number
    // Always process exclusive_price if it's provided (including 0 and null)
    if (exclusive_price !== undefined) {
      try {
        if (exclusive_price === null || exclusive_price === '' || exclusive_price === 'null' || exclusive_price === 'undefined') {
          updateData.exclusive_price = null;
        } else {
          // Handle both string and number inputs
          let parsedPrice;
          if (typeof exclusive_price === 'number') {
            parsedPrice = exclusive_price;
          } else if (typeof exclusive_price === 'string') {
            // Remove any whitespace
            const trimmed = exclusive_price.trim();
            if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') {
              updateData.exclusive_price = null;
            } else {
              parsedPrice = parseFloat(trimmed);
            }
          } else {
            parsedPrice = parseFloat(exclusive_price);
          }
          
          // Only validate if we have a parsed price (not null)
          if (updateData.exclusive_price === undefined && parsedPrice !== undefined) {
            if (isNaN(parsedPrice)) {
              return res.status(400).json({ 
                error: 'Invalid exclusive price',
                details: `Exclusive price must be a valid number. Received: ${exclusive_price} (type: ${typeof exclusive_price})`
              });
            }
            if (parsedPrice < 0) {
              return res.status(400).json({ 
                error: 'Invalid exclusive price',
                details: 'Exclusive price must be greater than or equal to 0'
              });
            }
            updateData.exclusive_price = parsedPrice;
          }
        }
        console.log('Setting exclusive_price:', {
          received: exclusive_price,
          receivedType: typeof exclusive_price,
          setting: updateData.exclusive_price,
          settingType: typeof updateData.exclusive_price
        });
      } catch (parseError) {
        console.error('Error parsing exclusive_price:', parseError);
        return res.status(400).json({ 
          error: 'Invalid exclusive price',
          details: `Failed to parse exclusive price: ${parseError.message}`
        });
      }
    } else {
      console.log('exclusive_price not provided in request (undefined)');
    }
    if (is_joiner_available !== undefined) updateData.is_joiner_available = is_joiner_available;
    if (is_exclusive_available !== undefined) updateData.is_exclusive_available = is_exclusive_available;
    
    // ALWAYS include additional_images - frontend always sends it
    // Ensure it's always an array format for JSONB column
    updateData.additional_images = Array.isArray(additional_images) 
      ? additional_images 
      : (additional_images === null || additional_images === undefined ? [] : []);
    
    console.log('Setting additional_images in update:', {
      received: {
        isArray: Array.isArray(additional_images),
        type: typeof additional_images,
        value: additional_images === null ? 'null' : (additional_images === undefined ? 'undefined' : 'has value'),
        length: Array.isArray(additional_images) ? additional_images.length : 'N/A'
      },
      setting: {
        count: updateData.additional_images.length,
        isArray: Array.isArray(updateData.additional_images),
        firstImagePreview: updateData.additional_images.length > 0 
          ? updateData.additional_images[0].substring(0, 50) + '...'
          : 'empty array'
      }
    });
    
    console.log('Update data being sent to database:', {
      ...updateData,
      image_url: updateData.image_url ? updateData.image_url.substring(0, 50) + '...' : 'none',
      additional_images_count: updateData.additional_images ? updateData.additional_images.length : 0
    });

    // Add JSONB columns if provided
    if (what_to_bring !== undefined) {
      updateData.what_to_bring = Array.isArray(what_to_bring) ? what_to_bring : [];
      console.log('Saving what_to_bring:', {
        isArray: Array.isArray(what_to_bring),
        count: Array.isArray(what_to_bring) ? what_to_bring.length : 0,
        items: Array.isArray(what_to_bring) ? what_to_bring.map(item => item.item_name || item) : []
      });
    }
    if (budgeting !== undefined) {
      updateData.budgeting = Array.isArray(budgeting) ? budgeting : [];
      console.log('Saving budgeting:', {
        isArray: Array.isArray(budgeting),
        count: Array.isArray(budgeting) ? budgeting.length : 0,
        items: Array.isArray(budgeting) ? budgeting.map(item => ({ name: item.item_name, amount: item.item_amount })) : []
      });
    }
    if (itinerary !== undefined) {
      updateData.itinerary = Array.isArray(itinerary) ? itinerary : [];
      console.log('Saving itinerary:', {
        isArray: Array.isArray(itinerary),
        count: Array.isArray(itinerary) ? itinerary.length : 0,
        items: Array.isArray(itinerary) ? itinerary.map(item => ({ title: item.item_name, description: item.item_description, location: item.item_location, time: item.item_time })) : []
      });
    }
    if (how_to_get_there !== undefined) {
      updateData.how_to_get_there = Array.isArray(how_to_get_there) ? how_to_get_there : [];
      console.log('Saving how_to_get_there:', {
        isArray: Array.isArray(how_to_get_there),
        count: Array.isArray(how_to_get_there) ? how_to_get_there.length : 0
      });
    }

    const { data: updatedMountain, error } = await supabase
      .from('mountains')
      .update(updateData)
      .eq('id', parseInt(id))
      .select();

    if (error) {
      console.error('Update mountain error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error('Update data that caused error:', JSON.stringify(updateData, null, 2));
      
      // Check if error is about missing column
      if (error.message && (error.message.includes('additional_images') || error.message.includes('column') && error.message.includes('does not exist'))) {
        const missingColumn = error.message.includes('additional_images') ? 'additional_images' : 
                             error.message.includes('exclusive_price') ? 'exclusive_price' : 'unknown';
        console.error(`⚠️ CRITICAL: ${missingColumn} column does not exist!`);
        console.error('⚠️ Please run the migration SQL in Supabase:');
        let migrationSQL = '';
        if (missingColumn === 'additional_images') {
          migrationSQL = 'ALTER TABLE mountains ADD COLUMN IF NOT EXISTS additional_images JSONB DEFAULT \'[]\'::jsonb;';
        } else if (missingColumn === 'exclusive_price') {
          migrationSQL = 'ALTER TABLE mountains ADD COLUMN IF NOT EXISTS exclusive_price DECIMAL(10, 2) DEFAULT NULL CHECK (exclusive_price >= 0);';
        }
        return res.status(500).json({ 
          error: 'Database column missing',
          message: `The ${missingColumn} column does not exist. Please run the migration SQL first.`,
          details: error.message,
          migration_sql: migrationSQL
        });
      }
      
      // Check for constraint violations
      if (error.message && error.message.includes('violates check constraint')) {
        console.error('⚠️ Constraint violation detected');
        return res.status(400).json({ 
          error: 'Validation error',
          message: 'One or more values violate database constraints',
          details: error.message,
          hint: error.hint
        });
      }
      
      // Check for type mismatches
      if (error.message && (error.message.includes('invalid input syntax') || error.message.includes('type'))) {
        console.error('⚠️ Type mismatch detected');
        return res.status(400).json({ 
          error: 'Type error',
          message: 'Invalid data type for one or more fields',
          details: error.message,
          hint: error.hint
        });
      }
      
      return res.status(500).json({ 
        error: 'Failed to update mountain',
        details: error.message || 'Unknown database error',
        code: error.code,
        hint: error.hint,
        fullError: process.env.NODE_ENV !== 'production' ? JSON.stringify(error, null, 2) : undefined
      });
    }

    const savedMountain = updatedMountain && updatedMountain.length > 0 ? updatedMountain[0] : null;
    
    console.log('Mountain updated successfully:', {
      id: savedMountain ? savedMountain.id : 'unknown',
      name: savedMountain ? savedMountain.name : 'unknown',
      exclusive_price: savedMountain ? savedMountain.exclusive_price : 'not found',
      has_image_url: !!(savedMountain && savedMountain.image_url),
      additional_images_sent: updateData.additional_images.length,
      additional_images_saved: savedMountain && savedMountain.additional_images
        ? savedMountain.additional_images.length 
        : 0,
      additional_images_type: savedMountain && savedMountain.additional_images
        ? Array.isArray(savedMountain.additional_images) ? 'array' : typeof savedMountain.additional_images
        : 'not found'
    });
    
    // Verify images were saved correctly
    if (updateData.additional_images.length > 0) {
      const savedCount = savedMountain && savedMountain.additional_images && Array.isArray(savedMountain.additional_images)
        ? savedMountain.additional_images.length
        : 0;
      
      if (savedCount !== updateData.additional_images.length) {
        console.error('⚠️ WARNING: Image count mismatch!', {
          sent: updateData.additional_images.length,
          saved: savedCount,
          savedData: savedMountain ? savedMountain.additional_images : 'no mountain data'
        });
      } else {
        console.log('✅ Additional images saved correctly:', savedCount);
      }
    }

    // Return the updated mountain data
    res.json({ 
      message: 'Mountain updated successfully', 
      mountain: updatedMountain && updatedMountain.length > 0 ? updatedMountain[0] : { id, name, elevation, location, difficulty, description, image_url }
    });
  } catch (error) {
    console.error('Update mountain catch error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    // Check if it's a database connection error
    if (error.message && (error.message.includes('connect') || error.message.includes('ECONNREFUSED'))) {
      return res.status(503).json({ 
        error: 'Database connection failed',
        details: 'Unable to connect to the database. Please check your database configuration.',
        message: error.message
      });
    }
    
    // Check if it's a validation error
    if (error.name === 'ValidationError' || error.message.includes('validation')) {
      return res.status(400).json({ 
        error: 'Validation error',
        details: error.message
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to update mountain',
      details: error.message || 'An unexpected error occurred',
      errorType: error.name,
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    });
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

// Get mountain details (what_to_bring, budgeting, itinerary, how_to_get_there)
router.get('/:mountainId/details', async (req, res) => {
  try {
    const { mountainId } = req.params;
    
    // First check if mountain exists
    const { data: mountainExists, error: checkError } = await supabase
      .from('mountains')
      .select('id')
      .eq('id', mountainId)
      .single();

    if (checkError || !mountainExists) {
      console.error('Mountain not found:', checkError);
      return res.status(404).json({ error: 'Mountain not found' });
    }

    // Try to select the detail columns, but handle case where they might not exist
    const { data: mountain, error } = await supabase
      .from('mountains')
      .select('what_to_bring, budgeting, itinerary, how_to_get_there')
      .eq('id', mountainId)
      .single();

    if (error) {
      console.error('Get mountain details error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // If columns don't exist, return empty arrays
      if (error.message && (error.message.includes('column') || error.message.includes('does not exist'))) {
        console.warn('Detail columns may not exist, returning empty arrays');
        return res.json({
          success: true,
          data: {
            what_to_bring: [],
            budgeting: [],
            itinerary: [],
            how_to_get_there: []
          }
        });
      }
      
      return res.status(500).json({ 
        error: 'Failed to fetch mountain details',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }

    if (!mountain) {
      return res.status(404).json({ error: 'Mountain not found' });
    }

    res.json({
      success: true,
      data: {
        what_to_bring: Array.isArray(mountain.what_to_bring) ? mountain.what_to_bring : (mountain.what_to_bring || []),
        budgeting: Array.isArray(mountain.budgeting) ? mountain.budgeting : (mountain.budgeting || []),
        itinerary: Array.isArray(mountain.itinerary) ? mountain.itinerary : (mountain.itinerary || []),
        how_to_get_there: Array.isArray(mountain.how_to_get_there) ? mountain.how_to_get_there : (mountain.how_to_get_there || [])
      }
    });
  } catch (error) {
    console.error('Get mountain details error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch mountain details',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Add or update a detail item to a mountain section (admin only)
router.post('/:mountainId/details/:sectionType', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('POST mountain detail:', { mountainId: req.params.mountainId, sectionType: req.params.sectionType });
    console.log('Request body:', req.body);

    const { mountainId, sectionType } = req.params;
    const { item_name, item_description, item_icon, item_amount, item_unit, item_time, item_duration, item_transport_type, sort_order } = req.body;

    // Validate section type
    if (!['what_to_bring', 'budgeting', 'itinerary', 'how_to_get_there'].includes(sectionType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid section type'
      });
    }

    // Validate required fields
    if (!item_name) {
      return res.status(400).json({
        success: false,
        error: 'item_name is required'
      });
    }

    // Get current mountain
    const { data: mountain, error: fetchError } = await supabase
      .from('mountains')
      .select(sectionType)
      .eq('id', mountainId)
      .single();

    if (fetchError || !mountain) {
      console.error('Error fetching mountain:', fetchError);
      return res.status(404).json({
        success: false,
        error: 'Mountain not found'
      });
    }

    // Get current items array
    let items = mountain[sectionType] || [];
    if (!Array.isArray(items)) {
      items = [];
    }

    // Create new item
    const newItem = {
      id: Date.now(),
      item_name,
      item_description,
      item_icon: sectionType === 'what_to_bring' ? item_icon : undefined,
      item_amount: sectionType === 'budgeting' ? item_amount : undefined,
      item_unit: sectionType === 'budgeting' ? item_unit : undefined,
      item_time: sectionType === 'itinerary' ? item_time : undefined,
      item_duration: sectionType === 'itinerary' ? item_duration : undefined,
      item_transport_type: sectionType === 'how_to_get_there' ? item_transport_type : undefined,
      sort_order: sort_order || items.length
    };

    // Add to items array
    items.push(newItem);

    // Update mountain
    const updateData = {};
    updateData[sectionType] = items;

    const { data: updatedMountain, error: updateError } = await supabase
      .from('mountains')
      .update(updateData)
      .eq('id', mountainId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating mountain:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to add mountain detail',
        details: updateError.message
      });
    }

    console.log('Mountain detail added successfully');
    res.status(201).json({
      success: true,
      data: newItem
    });
  } catch (error) {
    console.error('Error adding mountain detail:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add mountain detail',
      details: error.message
    });
  }
});

// Update a detail item in a mountain section (admin only)
router.put('/:mountainId/details/:sectionType/:itemId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { mountainId, sectionType, itemId } = req.params;
    const { item_name, item_description, item_icon, item_amount, item_unit, item_time, item_duration, item_transport_type } = req.body;

    // Validate section type
    if (!['what_to_bring', 'budgeting', 'itinerary', 'how_to_get_there'].includes(sectionType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid section type'
      });
    }

    // Get current mountain
    const { data: mountain, error: fetchError } = await supabase
      .from('mountains')
      .select(sectionType)
      .eq('id', mountainId)
      .single();

    if (fetchError || !mountain) {
      return res.status(404).json({
        success: false,
        error: 'Mountain not found'
      });
    }

    // Get current items array
    let items = mountain[sectionType] || [];
    if (!Array.isArray(items)) {
      items = [];
    }

    // Find and update item
    const itemIndex = items.findIndex(item => item.id === parseInt(itemId));
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    // Update item
    items[itemIndex] = {
      ...items[itemIndex],
      item_name: item_name || items[itemIndex].item_name,
      item_description: item_description || items[itemIndex].item_description,
      item_icon: sectionType === 'what_to_bring' ? (item_icon || items[itemIndex].item_icon) : undefined,
      item_amount: sectionType === 'budgeting' ? (item_amount || items[itemIndex].item_amount) : undefined,
      item_unit: sectionType === 'budgeting' ? (item_unit || items[itemIndex].item_unit) : undefined,
      item_time: sectionType === 'itinerary' ? (item_time || items[itemIndex].item_time) : undefined,
      item_duration: sectionType === 'itinerary' ? (item_duration || items[itemIndex].item_duration) : undefined,
      item_transport_type: sectionType === 'how_to_get_there' ? (item_transport_type || items[itemIndex].item_transport_type) : undefined
    };

    // Update mountain
    const updateData = {};
    updateData[sectionType] = items;

    const { data: updatedMountain, error: updateError } = await supabase
      .from('mountains')
      .update(updateData)
      .eq('id', mountainId)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update mountain detail',
        details: updateError.message
      });
    }

    res.json({
      success: true,
      data: items[itemIndex]
    });
  } catch (error) {
    console.error('Error updating mountain detail:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update mountain detail',
      details: error.message
    });
  }
});

// Delete a detail item from a mountain section (admin only)
router.delete('/:mountainId/details/:sectionType/:itemId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { mountainId, sectionType, itemId } = req.params;

    // Validate section type
    if (!['what_to_bring', 'budgeting', 'itinerary', 'how_to_get_there'].includes(sectionType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid section type'
      });
    }

    // Get current mountain
    const { data: mountain, error: fetchError } = await supabase
      .from('mountains')
      .select(sectionType)
      .eq('id', mountainId)
      .single();

    if (fetchError || !mountain) {
      return res.status(404).json({
        success: false,
        error: 'Mountain not found'
      });
    }

    // Get current items array
    let items = mountain[sectionType] || [];
    if (!Array.isArray(items)) {
      items = [];
    }

    // Find and remove item
    const itemIndex = items.findIndex(item => item.id === parseInt(itemId));
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    items.splice(itemIndex, 1);

    // Update mountain
    const updateData = {};
    updateData[sectionType] = items;

    const { data: updatedMountain, error: updateError } = await supabase
      .from('mountains')
      .update(updateData)
      .eq('id', mountainId)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete mountain detail',
        details: updateError.message
      });
    }

    res.json({
      success: true,
      message: 'Mountain detail deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting mountain detail:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete mountain detail',
      details: error.message
    });
  }
});

module.exports = router;
