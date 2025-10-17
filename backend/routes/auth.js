const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role = 'user' } = req.body;

    // Check if user already exists
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`);

    if (checkError) {
      console.error('Check user error:', checkError);
      return res.status(500).json({ error: 'Registration failed' });
    }

    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          username,
          email,
          password: hashedPassword,
          role,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Insert user error:', insertError);
      return res.status(500).json({ error: 'Registration failed' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, username, email, role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: newUser.id, username, email, role }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Development fallback - allow demo login without database
    if (process.env.NODE_ENV !== 'production' && email === 'admin@poorito.com' && password === 'password') {
      const token = jwt.sign(
        { userId: 1, username: 'admin', email: 'admin@poorito.com', role: 'admin' },
        process.env.JWT_SECRET || 'poorito_secret_key_change_in_production_2024',
        { expiresIn: '24h' }
      );
      
      return res.json({
        message: 'Login successful',
        token,
        user: { id: 1, username: 'admin', email: 'admin@poorito.com', role: 'admin' }
      });
    }

    // Find user
    const { data: users, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);

    if (findError) {
      console.error('Find user error:', findError);
      
      // Fallback in development
      if (process.env.NODE_ENV !== 'production' && email === 'admin@poorito.com' && password === 'password') {
        const token = jwt.sign(
          { userId: 1, username: 'admin', email: 'admin@poorito.com', role: 'admin' },
          process.env.JWT_SECRET || 'poorito_secret_key_change_in_production_2024',
          { expiresIn: '24h' }
        );
        
        return res.json({
          message: 'Login successful',
          token,
          user: { id: 1, username: 'admin', email: 'admin@poorito.com', role: 'admin' }
        });
      }
      
      return res.status(500).json({ error: 'Login failed' });
    }

    if (!users || users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'poorito_secret_key_change_in_production_2024',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    
    // Final fallback for development
    if (process.env.NODE_ENV !== 'production' && req.body.email === 'admin@poorito.com' && req.body.password === 'password') {
      const token = jwt.sign(
        { userId: 1, username: 'admin', email: 'admin@poorito.com', role: 'admin' },
        process.env.JWT_SECRET || 'poorito_secret_key_change_in_production_2024',
        { expiresIn: '24h' }
      );
      
      return res.json({
        message: 'Login successful',
        token,
        user: { id: 1, username: 'admin', email: 'admin@poorito.com', role: 'admin' }
      });
    }
    
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, email, role, created_at')
      .eq('id', req.user.userId);

    if (error) {
      console.error('Get user error:', error);
      return res.status(500).json({ error: 'Failed to get user data' });
    }

    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

module.exports = router;
