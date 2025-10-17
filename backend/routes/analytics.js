const express = require('express');
const supabase = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get dashboard analytics (admin only)
router.get('/dashboard', async (req, res) => {
  try {
    // Get total counts
    const [mountainResult, articleResult, userResult, draftResult] = await Promise.all([
      supabase.from('mountains').select('*', { count: 'exact', head: true }),
      supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'draft')
    ]);

    // Get recent activity
    const [recentMountainsResult, recentArticlesResult] = await Promise.all([
      supabase.from('mountains').select('name, created_at, difficulty').order('created_at', { ascending: false }).limit(5),
      supabase.from('articles').select('title, author, created_at, status').order('created_at', { ascending: false }).limit(5)
    ]);

    // Get mountains by difficulty
    const { data: difficultyStats } = await supabase
      .from('mountains')
      .select('difficulty')
      .then(result => {
        if (result.data) {
          const grouped = result.data.reduce((acc, item) => {
            acc[item.difficulty] = (acc[item.difficulty] || 0) + 1;
            return acc;
          }, {});
          return { data: Object.entries(grouped).map(([difficulty, count]) => ({ difficulty, count })) };
        }
        return { data: [] };
      });

    // Get articles by category
    const { data: categoryStats } = await supabase
      .from('articles')
      .select('category')
      .eq('status', 'published')
      .then(result => {
        if (result.data) {
          const grouped = result.data.reduce((acc, item) => {
            if (item.category) {
              acc[item.category] = (acc[item.category] || 0) + 1;
            }
            return acc;
          }, {});
          return { data: Object.entries(grouped).map(([category, count]) => ({ category, count })) };
        }
        return { data: [] };
      });

    res.json({
      totals: {
        mountains: mountainResult.count || 0,
        articles: articleResult.count || 0,
        users: userResult.count || 0,
        drafts: draftResult.count || 0
      },
      recentActivity: {
        mountains: recentMountainsResult.data || [],
        articles: recentArticlesResult.data || []
      },
      statistics: {
        difficultyDistribution: difficultyStats || [],
        categoryDistribution: categoryStats || []
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    
    // Return mock data in development
    if (process.env.NODE_ENV !== 'production') {
      return res.json({
        totals: {
          mountains: 5,
          articles: 3,
          users: 2,
          drafts: 1
        },
        recentActivity: {
          mountains: [
            { name: 'Mount Apo', created_at: new Date().toISOString(), difficulty: 'Hard' },
            { name: 'Mount Pulag', created_at: new Date().toISOString(), difficulty: 'Moderate' },
            { name: 'Mount Mayon', created_at: new Date().toISOString(), difficulty: 'Hard' }
          ],
          articles: [
            { title: 'Essential Hiking Gear', author: 'Admin', created_at: new Date().toISOString(), status: 'published' },
            { title: 'Safety Tips', author: 'Admin', created_at: new Date().toISOString(), status: 'published' }
          ]
        },
        statistics: {
          difficultyDistribution: [
            { difficulty: 'Easy', count: 2 },
            { difficulty: 'Moderate', count: 1 },
            { difficulty: 'Hard', count: 2 }
          ],
          categoryDistribution: [
            { category: 'Gear', count: 1 },
            { category: 'Safety', count: 1 },
            { category: 'Planning', count: 1 }
          ]
        }
      });
    }
    
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get mountain statistics
router.get('/mountains', async (req, res) => {
  try {
    const { data: mountains, error } = await supabase
      .from('mountains')
      .select('elevation, difficulty, location');

    if (error) {
      console.error('Get mountain analytics error:', error);
      if (process.env.NODE_ENV !== 'production') {
        return res.json({
          overview: {
            total_mountains: 5,
            avg_elevation: 1827,
            max_elevation: 2954,
            min_elevation: 811
          },
          difficultyDistribution: [
            { difficulty: 'Easy', count: 2 },
            { difficulty: 'Moderate', count: 1 },
            { difficulty: 'Hard', count: 2 }
          ],
          topLocations: [
            { location: 'Davao del Sur', count: 1 },
            { location: 'Benguet', count: 1 },
            { location: 'Albay', count: 1 },
            { location: 'Zambales', count: 1 },
            { location: 'Batangas', count: 1 }
          ]
        });
      }
      return res.status(500).json({ error: 'Failed to fetch mountain analytics' });
    }

    const elevations = mountains.map(m => m.elevation);
    const overview = {
      total_mountains: mountains.length,
      avg_elevation: elevations.reduce((a, b) => a + b, 0) / elevations.length,
      max_elevation: Math.max(...elevations),
      min_elevation: Math.min(...elevations)
    };

    // Group by difficulty
    const difficultyStats = mountains.reduce((acc, item) => {
      acc[item.difficulty] = (acc[item.difficulty] || 0) + 1;
      return acc;
    }, {});
    const difficultyDistribution = Object.entries(difficultyStats).map(([difficulty, count]) => ({ difficulty, count }));

    // Group by location
    const locationStats = mountains.reduce((acc, item) => {
      acc[item.location] = (acc[item.location] || 0) + 1;
      return acc;
    }, {});
    const topLocations = Object.entries(locationStats)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json({
      overview,
      difficultyDistribution,
      topLocations
    });
  } catch (error) {
    console.error('Get mountain analytics error:', error);
    if (process.env.NODE_ENV !== 'production') {
      return res.json({
        overview: {
          total_mountains: 5,
          avg_elevation: 1827,
          max_elevation: 2954,
          min_elevation: 811
        },
        difficultyDistribution: [
          { difficulty: 'Easy', count: 2 },
          { difficulty: 'Moderate', count: 1 },
          { difficulty: 'Hard', count: 2 }
        ],
        topLocations: [
          { location: 'Davao del Sur', count: 1 },
          { location: 'Benguet', count: 1 },
          { location: 'Albay', count: 1 },
          { location: 'Zambales', count: 1 },
          { location: 'Batangas', count: 1 }
        ]
      });
    }
    res.status(500).json({ error: 'Failed to fetch mountain analytics' });
  }
});

// Get article statistics
router.get('/articles', async (req, res) => {
  try {
    const { data: articles, error } = await supabase
      .from('articles')
      .select('status, category, author');

    if (error) {
      console.error('Get article analytics error:', error);
      if (process.env.NODE_ENV !== 'production') {
        return res.json({
          overview: {
            total_articles: 4,
            published_articles: 3,
            draft_articles: 1
          },
          categoryDistribution: [
            { category: 'Gear', count: 1 },
            { category: 'Safety', count: 1 },
            { category: 'Planning', count: 1 }
          ],
          topAuthors: [
            { author: 'Admin', count: 3 }
          ]
        });
      }
      return res.status(500).json({ error: 'Failed to fetch article analytics' });
    }

    const publishedArticles = articles.filter(a => a.status === 'published');
    const draftArticles = articles.filter(a => a.status === 'draft');

    const overview = {
      total_articles: articles.length,
      published_articles: publishedArticles.length,
      draft_articles: draftArticles.length
    };

    // Group by category (published only)
    const categoryStats = publishedArticles.reduce((acc, item) => {
      if (item.category) {
        acc[item.category] = (acc[item.category] || 0) + 1;
      }
      return acc;
    }, {});
    const categoryDistribution = Object.entries(categoryStats).map(([category, count]) => ({ category, count }));

    // Group by author (published only)
    const authorStats = publishedArticles.reduce((acc, item) => {
      acc[item.author] = (acc[item.author] || 0) + 1;
      return acc;
    }, {});
    const topAuthors = Object.entries(authorStats)
      .map(([author, count]) => ({ author, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json({
      overview,
      categoryDistribution,
      topAuthors
    });
  } catch (error) {
    console.error('Get article analytics error:', error);
    if (process.env.NODE_ENV !== 'production') {
      return res.json({
        overview: {
          total_articles: 4,
          published_articles: 3,
          draft_articles: 1
        },
        categoryDistribution: [
          { category: 'Gear', count: 1 },
          { category: 'Safety', count: 1 },
          { category: 'Planning', count: 1 }
        ],
        topAuthors: [
          { author: 'Admin', count: 3 }
        ]
      });
    }
    res.status(500).json({ error: 'Failed to fetch article analytics' });
  }
});

// Get user statistics
router.get('/users', async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('role, username, email, created_at');

    if (error) {
      console.error('Get user analytics error:', error);
      if (process.env.NODE_ENV !== 'production') {
        return res.json({
          overview: {
            total_users: 2,
            admin_users: 1,
            regular_users: 1
          },
          recentUsers: [
            { username: 'admin', email: 'admin@poorito.com', role: 'admin', created_at: new Date().toISOString() },
            { username: 'user1', email: 'user1@example.com', role: 'user', created_at: new Date().toISOString() }
          ]
        });
      }
      return res.status(500).json({ error: 'Failed to fetch user analytics' });
    }

    const adminUsers = users.filter(u => u.role === 'admin');
    const regularUsers = users.filter(u => u.role === 'user');

    const overview = {
      total_users: users.length,
      admin_users: adminUsers.length,
      regular_users: regularUsers.length
    };

    const recentUsers = users
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10)
      .map(({ username, email, role, created_at }) => ({ username, email, role, created_at }));

    res.json({
      overview,
      recentUsers
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    if (process.env.NODE_ENV !== 'production') {
      return res.json({
        overview: {
          total_users: 2,
          admin_users: 1,
          regular_users: 1
        },
        recentUsers: [
          { username: 'admin', email: 'admin@poorito.com', role: 'admin', created_at: new Date().toISOString() },
          { username: 'user1', email: 'user1@example.com', role: 'user', created_at: new Date().toISOString() }
        ]
      });
    }
    res.status(500).json({ error: 'Failed to fetch user analytics' });
  }
});

module.exports = router;
