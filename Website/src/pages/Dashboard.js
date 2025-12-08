import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

function Dashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await apiService.getDashboardAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">Dashboard</h1>
            <p className="text-orange-600 font-semibold text-lg flex items-center gap-2">
              <span>📅</span>
              {currentDate}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">Dashboard</h1>
            <p className="text-orange-600 font-semibold text-lg flex items-center gap-2">
              <span>📅</span>
              {currentDate}
            </p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="text-red-400 mr-3">⚠️</div>
            <div>
              <h3 className="text-red-800 font-semibold">Error Loading Dashboard</h3>
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
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Dashboard</h1>
          <p className="text-orange-600 font-semibold text-lg flex items-center gap-2">
            <span>📅</span>
            {currentDate}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-lg transition-all flex items-center gap-2 text-sm font-medium"
          >
            <span>🌐</span>
            View Public Site
          </button>
          <button 
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Overview</h2>
          <p className="text-gray-500">Quick glance at your content statistics</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Mountains Card */}
          <div className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-200 hover:border-orange-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total Mountains</h3>
              <div className="text-2xl opacity-40">⛰️</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {analytics?.totals?.mountains || 0}
            </div>
            <p className="text-sm text-gray-500">Mountains listed</p>
          </div>

          {/* Articles Card */}
          <div className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-200 hover:border-orange-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Articles</h3>
              <div className="text-2xl opacity-40">📖</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {analytics?.totals?.articles || 0}
            </div>
            <p className="text-sm text-gray-500">Articles published</p>
          </div>

          {/* Drafts Card */}
          <div className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-200 hover:border-orange-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Drafts</h3>
              <div className="text-2xl opacity-40">📝</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {analytics?.totals?.drafts || 0}
            </div>
            <p className="text-sm text-gray-500">Draft articles</p>
          </div>

          {/* Users Card */}
          <div className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-200 hover:border-orange-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Users</h3>
              <div className="text-2xl opacity-40">👥</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {analytics?.totals?.users || 0}
            </div>
            <p className="text-sm text-gray-500">Registered users</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {analytics?.recentActivity && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Recent Activity</h2>
            <p className="text-gray-500">Latest updates and changes</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Mountains */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Mountains</h3>
              <div className="space-y-3">
                {analytics.recentActivity.mountains?.slice(0, 5).map((mountain, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">{mountain.name}</p>
                      <p className="text-sm text-gray-500">{new Date(mountain.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                      {mountain.difficulty}
                    </span>
                  </div>
                ))}
                {(!analytics.recentActivity.mountains || analytics.recentActivity.mountains.length === 0) && (
                  <p className="text-gray-500 text-center py-4">No recent mountains</p>
                )}
              </div>
            </div>

            {/* Recent Articles */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Articles</h3>
              <div className="space-y-3">
                {analytics.recentActivity.articles?.slice(0, 5).map((article, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">{article.title}</p>
                      <p className="text-sm text-gray-500">by {article.author} • {new Date(article.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      article.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {article.status}
                    </span>
                  </div>
                ))}
                {(!analytics.recentActivity.articles || analytics.recentActivity.articles.length === 0) && (
                  <p className="text-gray-500 text-center py-4">No recent articles</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

