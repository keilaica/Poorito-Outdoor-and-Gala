import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [dashboardRes, mountainRes, articleRes, userRes] = await Promise.allSettled([
        apiService.getDashboardAnalytics(),
        apiService.getMountainAnalytics(),
        apiService.getArticleAnalytics(),
        apiService.getUserAnalytics()
      ]);

      const safeValue = (res, fallback = null) => (res.status === 'fulfilled' ? res.value : fallback);

      setAnalytics({
        dashboard: safeValue(dashboardRes, { totals: {}, recentActivity: {}, statistics: {} }),
        mountains: safeValue(mountainRes, { overview: {}, difficultyDistribution: [], topLocations: [] }),
        articles: safeValue(articleRes, { overview: {}, categoryDistribution: [], topAuthors: [] }),
        users: safeValue(userRes, { overview: {}, recentUsers: [] })
      });
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="text-red-400 mr-3">⚠️</div>
            <div>
              <h3 className="text-red-800 font-semibold">Error Loading Analytics</h3>
              <p className="text-red-600 mt-1">{error}</p>
              <button 
                onClick={fetchAnalytics}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">Analytics</h1>
          <p className="text-orange-600 font-semibold text-lg">Data insights and statistics</p>
        </div>
        <button 
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'mountains', label: 'Mountains', icon: '⛰️' },
            { id: 'articles', label: 'Articles', icon: '📖' },
            { id: 'users', label: 'Users', icon: '👥' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && analytics?.dashboard && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Mountains</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.dashboard.totals?.mountains || 0}</p>
                </div>
                <div className="text-3xl opacity-40">⛰️</div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Published Articles</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.dashboard.totals?.articles || 0}</p>
                </div>
                <div className="text-3xl opacity-40">📖</div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Draft Articles</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.dashboard.totals?.drafts || 0}</p>
                </div>
                <div className="text-3xl opacity-40">📝</div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.dashboard.totals?.users || 0}</p>
                </div>
                <div className="text-3xl opacity-40">👥</div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Difficulty Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mountain Difficulty Distribution</h3>
              <div className="space-y-3">
                {analytics.dashboard.statistics?.difficultyDistribution?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{item.difficulty}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{ width: `${(item.count / Math.max(...analytics.dashboard.statistics.difficultyDistribution.map(d => d.count))) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Article Category Distribution</h3>
              <div className="space-y-3">
                {analytics.dashboard.statistics?.categoryDistribution?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{item.category}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(item.count / Math.max(...analytics.dashboard.statistics.categoryDistribution.map(c => c.count))) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mountains Tab */}
      {activeTab === 'mountains' && analytics?.mountains && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Mountains</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.mountains.overview?.total_mountains || 0}</p>
                </div>
                <div className="text-3xl opacity-40">⛰️</div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Elevation</p>
                  <p className="text-3xl font-bold text-gray-900">{Math.round(analytics.mountains.overview?.avg_elevation || 0).toLocaleString()} MASL</p>
                </div>
                <div className="text-3xl opacity-40">📏</div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Highest Peak</p>
                  <p className="text-3xl font-bold text-gray-900">{(analytics.mountains.overview?.max_elevation || 0).toLocaleString()} MASL</p>
                </div>
                <div className="text-3xl opacity-40">🔝</div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Lowest Peak</p>
                  <p className="text-3xl font-bold text-gray-900">{(analytics.mountains.overview?.min_elevation || 0).toLocaleString()} MASL</p>
                </div>
                <div className="text-3xl opacity-40">🔻</div>
              </div>
            </div>
          </div>

          {/* Top Locations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Locations</h3>
            <div className="space-y-3">
              {analytics.mountains.topLocations?.slice(0, 10).map((location, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <span className="text-sm font-medium text-gray-700">{location.location}</span>
                  <span className="text-sm font-medium text-gray-900">{location.count} mountains</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Articles Tab */}
      {activeTab === 'articles' && analytics?.articles && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Articles</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.articles.overview?.total_articles || 0}</p>
                </div>
                <div className="text-3xl opacity-40">📖</div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.articles.overview?.published_articles || 0}</p>
                </div>
                <div className="text-3xl opacity-40">✅</div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Drafts</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.articles.overview?.draft_articles || 0}</p>
                </div>
                <div className="text-3xl opacity-40">📝</div>
              </div>
            </div>
          </div>

          {/* Top Authors */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Authors</h3>
            <div className="space-y-3">
              {analytics.articles.topAuthors?.slice(0, 10).map((author, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <span className="text-sm font-medium text-gray-700">{author.author}</span>
                  <span className="text-sm font-medium text-gray-900">{author.count} articles</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && analytics?.users && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.users.overview?.total_users || 0}</p>
                </div>
                <div className="text-3xl opacity-40">👥</div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Admin Users</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.users.overview?.admin_users || 0}</p>
                </div>
                <div className="text-3xl opacity-40">👑</div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Regular Users</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.users.overview?.regular_users || 0}</p>
                </div>
                <div className="text-3xl opacity-40">👤</div>
              </div>
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
            <div className="space-y-3">
              {analytics.users.recentUsers?.slice(0, 10).map((user, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <span className="text-sm font-medium text-gray-700">{user.username}</span>
                    <span className="text-xs text-gray-500 ml-2">({user.email})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                    <span className="text-xs text-gray-500">{new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Analytics;
