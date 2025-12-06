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

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    // Validate password requirements
    const passwordRequirements = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    if (!Object.values(passwordRequirements).every(req => req === true)) {
      return res.status(400).json({ 
        error: 'Password does not meet requirements. Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.' 
      });
    }

    // Check if user already exists - check email and username separately
    const { data: existingByEmail, error: emailError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .limit(1);

    if (emailError) {
      console.error('Check email error:', emailError);
      return res.status(500).json({ error: 'Registration failed: Database error' });
    }

    const { data: existingByUsername, error: usernameError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .limit(1);

    if (usernameError) {
      console.error('Check username error:', usernameError);
      return res.status(500).json({ error: 'Registration failed: Database error' });
    }

    if ((existingByEmail && existingByEmail.length > 0) || (existingByUsername && existingByUsername.length > 0)) {
      const message = existingByEmail && existingByEmail.length > 0 
        ? 'Email already exists' 
        : 'Username already exists';
      return res.status(400).json({ error: message });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user
    const insertResult = await supabase
      .from('users')
      .insert([
        {
          username,
          email,
          password: hashedPassword,
          role
        }
      ])
      .select('id, username, email, role, created_at')
      .single();

    const { data: newUser, error: insertError } = insertResult;

    if (insertError) {
      console.error('Insert user error:', insertError);
      console.error('Insert error code:', insertError.code);
      console.error('Insert error message:', insertError.message);
      console.error('Insert error details:', insertError.details);
      console.error('Insert error hint:', insertError.hint);
      
      // Check if it's an RLS policy error
      if (insertError.code === '42501' || insertError.message?.includes('permission denied') || insertError.message?.includes('policy')) {
        console.error('⚠️  RLS Policy Error: Make sure SUPABASE_SERVICE_ROLE_KEY is set in .env file');
        return res.status(500).json({ 
          error: 'Registration failed: Database permissions error',
          details: process.env.NODE_ENV === 'development' 
            ? 'This might be an RLS (Row Level Security) issue. Ensure SUPABASE_SERVICE_ROLE_KEY is configured.' 
            : undefined
        });
      }
      
      // Provide more specific error message
      const errorMessage = insertError.message || insertError.details || 'Failed to create user account';
      return res.status(500).json({ 
        error: 'Registration failed',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      });
    }

    // Handle case where data might be an array
    const userData = Array.isArray(newUser) ? newUser[0] : newUser;
    
    if (!userData || !userData.id) {
      console.error('User created but no data returned');
      console.error('newUser value:', newUser);
      console.error('userData value:', userData);
      return res.status(500).json({ error: 'Registration failed: User creation incomplete' });
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'poorito_secret_key_change_in_production_2024';
    const token = jwt.sign(
      { userId: userData.id, username, email, role },
      jwtSecret,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: userData.id, username, email, role }
    });
  } catch (error) {
    console.error('Registration error:', error);
    const errorMessage = error.message || 'An unexpected error occurred';
    res.status(500).json({ 
      error: 'Registration failed',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
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

// Forgot password - request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    const { data: users, error: findError } = await supabase
      .from('users')
      .select('id, email, username')
      .eq('email', email)
      .limit(1);

    if (findError) {
      console.error('Find user error:', findError);
      return res.status(500).json({ error: 'Failed to process request' });
    }

    // Always return success (security best practice - don't reveal if email exists)
    if (!users || users.length === 0) {
      return res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }

    const user = users[0];

    // Generate reset token (expires in 1 hour)
    const resetToken = jwt.sign(
      { userId: user.id, email: user.email, type: 'password-reset' },
      process.env.JWT_SECRET || 'poorito_secret_key_change_in_production_2024',
      { expiresIn: '1h' }
    );

    // Send password reset email
    const { sendPasswordResetEmail } = require('../services/emailService');
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    try {
      await sendPasswordResetEmail(user.email, user.username, resetLink);
      console.log('Password reset email sent to:', user.email);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({ 
      message: 'If an account with that email exists, a password reset link has been sent.' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Reset password - with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }

    // Validate password requirements
    const passwordRequirements = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    if (!Object.values(passwordRequirements).every(req => req === true)) {
      return res.status(400).json({ 
        error: 'Password does not meet requirements. Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.' 
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'poorito_secret_key_change_in_production_2024'
      );
    } catch (jwtError) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Check if token is for password reset
    if (decoded.type !== 'password-reset') {
      return res.status(400).json({ error: 'Invalid token type' });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update user password
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', decoded.userId)
      .select('id, email')
      .single();

    if (updateError) {
      console.error('Update password error:', updateError);
      return res.status(500).json({ error: 'Failed to reset password' });
    }

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

module.exports = router;
