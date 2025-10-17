import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

function ArticlesGuides() {
  const navigate = useNavigate();
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch articles from API
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getArticles();
      // Backend returns { articles: [...] }
      setArticles(response.articles || []);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Failed to load articles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/articles-guides/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await apiService.deleteArticle(id);
        setArticles(articles.filter(article => article.id !== id));
        alert('Article deleted successfully!');
      } catch (err) {
        console.error('Error deleting article:', err);
        alert('Failed to delete article. Please try again.');
      }
    }
  };

  const handleAddArticle = () => {
    navigate('/admin/articles-guides/new');
  };

  // Filter articles based on search term
  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.mountain_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.author?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">Articles and Guides</h1>
          <p className="text-orange-600 font-semibold text-lg flex items-center gap-2">
            <span>📅</span>
            {currentDate}
          </p>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center p-6 border-b border-gray-200 gap-4">
          <h2 className="text-xl font-semibold text-gray-900">Manage Articles and Guides</h2>
          <div className="flex flex-wrap gap-3">
            <input 
              type="text" 
              placeholder="Search article or guide..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all w-full lg:w-64" 
            />
            <button 
              className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium text-sm transition-all"
              onClick={handleAddArticle}
            >
              + Add New
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-20 px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Image</th>
                <th className="w-32 px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mountain Name</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                <th className="w-24 px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Author</th>
                <th className="w-24 px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Link</th>
                <th className="w-24 px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                <th className="w-32 px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mr-2"></div>
                      Loading articles...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-red-500">
                    <div className="flex flex-col items-center">
                      <p className="mb-2">{error}</p>
                      <button 
                        onClick={fetchArticles}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? 'No articles found matching your search.' : 'No articles found.'}
                  </td>
                </tr>
              ) : (
                filteredArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg flex items-center justify-center text-2xl shadow-sm">
                        {article.image_url ? (
                          <img src={article.image_url} alt={article.title} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          '📖'
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">⛰️</span>
                        <span className="text-sm text-gray-900 font-medium truncate">{article.mountain_name || 'General'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="min-w-0">
                        <p className="text-sm text-gray-900 font-medium break-words">{article.title}</p>
                        {article.content && (
                          <p className="text-xs text-gray-500 break-words mt-1 line-clamp-2">{article.content.substring(0, 100)}...</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">✍️</span>
                        <span className="text-sm text-gray-600 truncate">{article.author || 'Admin'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {article.link ? (
                        <a 
                          href={article.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1"
                        >
                          🔗 View
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">No link</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                        article.category === 'Guide' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        article.category === 'Safety' ? 'bg-red-100 text-red-800 border-red-200' :
                        article.category === 'Gear' ? 'bg-green-100 text-green-800 border-green-200' :
                        article.category === 'Planning' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                        'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        {article.category || 'Article'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1">
                        <button 
                          className="px-3 py-1.5 text-orange-600 hover:bg-orange-50 border border-orange-300 hover:border-orange-400 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                          onClick={() => handleEdit(article.id)}
                          title="Edit article"
                        >
                          <span>✏️</span>
                          Edit
                        </button>
                        <button 
                          className="px-3 py-1.5 text-red-600 hover:bg-red-50 border border-red-300 hover:border-red-400 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                          onClick={() => handleDelete(article.id)}
                          title="Delete article"
                        >
                          <span>🗑️</span>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ArticlesGuides;
