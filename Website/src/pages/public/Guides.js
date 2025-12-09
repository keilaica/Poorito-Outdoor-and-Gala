import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';

function Guides() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Fetch articles from API
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getArticles();
      setArticles(response.articles || []);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Failed to load articles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Group articles by category
  const articlesByCategory = articles.reduce((acc, article) => {
    const category = article.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(article);
    return acc;
  }, {});

  // Get category color and icon mapping
  const getCategoryStyle = (category) => {
    switch (category) {
      case 'Planning':
        return {
          color: 'from-sky-500 to-sky-600',
          icon: '🗺️',
          bgColor: 'bg-sky-50',
          borderColor: 'border-sky-200',
        };
      case 'Gear':
        return {
          color: 'from-emerald-500 to-emerald-600',
          icon: '🎒',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
        };
      case 'Safety':
        return {
          color: 'from-rose-500 to-rose-600',
          icon: '🚨',
          bgColor: 'bg-rose-50',
          borderColor: 'border-rose-200',
        };
      default:
        return {
          color: 'from-gray-500 to-gray-600',
          icon: '📄',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };
    }
  };

  // Truncate content for preview
  const truncateContent = (content, maxLength = 150) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  const sections = [
    {
      title: 'Trip planning',
      icon: '🗺️',
      tone: 'from-sky-500 to-sky-600',
      items: [
        'Pick a route that matches your ability',
        'Check weather and advisories',
        'Arrange transport and permits',
      ],
    },
    {
      title: 'Gear essentials',
      icon: '🎒',
      tone: 'from-emerald-500 to-emerald-600',
      items: [
        'Footwear with grip',
        'First-aid + blister care',
        'Layers, rain shell, thermal',
      ],
    },
    {
      title: 'Emergency readiness',
      icon: '🚨',
      tone: 'from-rose-500 to-rose-600',
      items: [
        'Share itinerary & ETA',
        'Carry whistle and headlamp',
        'Know local emergency numbers',
      ],
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F5F1' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        {/* Hero */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-12">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.22em] text-orange-500 uppercase mb-3">
              Hiking knowledge base
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              Guides for safer, smarter adventures
            </h1>
            <p className="text-gray-600 text-base md:text-lg leading-relaxed">
              Step-by-step references for planning, packing, and staying safe on every trail.
              Learn from curated best practices tailored for mountains around LUZON and beyond.
            </p>
          </div>
          <div className="w-full lg:w-auto">
            <div className="rounded-2xl bg-orange-600 px-7 py-6 shadow-lg text-white flex items-center gap-4">
              <div className="text-4xl">🛡️</div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-orange-100 mb-1">
                  Safety first
                </p>
                <p className="text-sm md:text-base font-medium">
                  Start with these guides before exploring any new trail for a safer hike.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key sections */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-14">
          {sections.map((s) => (
            <div
              key={s.title}
              className="bg-white border border-gray-100 rounded-2xl p-6 md:p-7 shadow-sm hover:shadow-xl hover:border-orange-300 transition-all duration-300 group"
            >
              <div
                className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-2xl text-white mb-4 group-hover:scale-110 transition-transform shadow-md"
              >
                {s.icon}
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">{s.title}</h3>
              <ul className="mt-2 text-sm text-gray-700 space-y-2">
                {s.items.map((i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 text-xs text-orange-500">●</span>
                    <span className="leading-relaxed">{i}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Articles Section */}
        {articles.length > 0 && (
          <div className="mb-14">
            <div className="mb-8">
              <p className="text-xs font-semibold tracking-[0.22em] text-orange-500 uppercase mb-2">
                Featured articles
              </p>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">
                Expert Guides &amp; Tips
              </h2>
              <p className="text-gray-600 text-base md:text-lg">
                In-depth articles from experienced hikers and guides to help you prepare for your next adventure.
              </p>
            </div>

            {/* Articles by Category */}
            {Object.entries(articlesByCategory).map(([category, categoryArticles]) => {
              if (categoryArticles.length === 0) return null;
              const style = getCategoryStyle(category);
              
              return (
                <div key={category} className="mb-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-xl text-white shadow-md">
                      {style.icon}
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900">{category} Articles</h3>
                    <span className="text-sm text-gray-500">({categoryArticles.length})</span>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryArticles.map((article) => (
                      <div
                        key={article.id}
                        className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-orange-300 transition-all duration-300 group cursor-pointer"
                        onClick={() => setSelectedArticle(article)}
                      >
                        {article.image_url ? (
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={article.image_url}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-3 right-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border ${style.bgColor} ${style.borderColor} text-gray-800`}>
                                {article.category}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className={`relative h-48 ${style.bgColor} flex items-center justify-center`}>
                            <div className="w-16 h-16 rounded-xl bg-orange-500 flex items-center justify-center text-3xl text-white shadow-md">
                              {style.icon}
                            </div>
                            <div className="absolute top-3 right-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border ${style.bgColor} ${style.borderColor} text-gray-800`}>
                                {article.category}
                              </span>
                            </div>
                          </div>
                        )}
                        <div className="p-6">
                          <h4 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                            {article.title}
                          </h4>
                          {article.mountain_name && article.mountain_name !== 'General' && (
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm">⛰️</span>
                              <span className="text-sm font-medium text-orange-600">{article.mountain_name}</span>
                            </div>
                          )}
                          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                            {truncateContent(article.content)}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>👤</span>
                              <span>{article.author}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {article.link && (
                                <span className="text-xs text-blue-600" title="Has external link">
                                  🔗
                                </span>
                              )}
                              <span className="text-xs text-orange-600 font-semibold group-hover:underline">
                                Read more →
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mb-14 text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading articles...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="mb-14 bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchArticles}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Leave No Trace section */}
        <div className="mb-14">
          <div className="bg-white border border-gray-100 rounded-3xl p-8 md:p-10 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <p className="text-xs font-semibold tracking-[0.22em] text-emerald-500 uppercase mb-2">
                  Outdoor ethics
                </p>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                  Leave No Trace (LNT)
                </h2>
              </div>
              <p className="text-sm md:text-base text-gray-600 max-w-xl">
                Protect the places you love to hike. Follow these principles to minimize your impact
                and keep trails wild for the next generation of adventurers.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Plan Ahead &amp; Prepare</h3>
                <p className="text-sm text-gray-600">
                  Research your route, check weather conditions, and pack appropriately for your
                  adventure.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Travel &amp; Camp on Durable Surfaces
                </h3>
                <p className="text-sm text-gray-600">
                  Stay on established trails and camp in designated areas to minimize environmental
                  impact.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Dispose of Waste Properly</h3>
                <p className="text-sm text-gray-600">
                  Pack out all trash, including food scraps and hygiene products. Leave no trace
                  behind.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Leave What You Find</h3>
                <p className="text-sm text-gray-600">
                  Preserve the natural environment by not taking rocks, plants, or other natural
                  objects.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Minimize Campfire Impacts</h3>
                <p className="text-sm text-gray-600">
                  Use a camp stove for cooking and only build fires in designated fire rings when
                  permitted.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Respect Wildlife</h3>
                <p className="text-sm text-gray-600">
                  Observe wildlife from a distance and never feed animals. Store food securely.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-orange-600 rounded-3xl p-8 md:p-10 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-lg">
          <div>
            <h3 className="text-2xl md:text-3xl font-extrabold mb-2">
              Ready to put these guides into practice?
            </h3>
            <p className="text-sm md:text-base text-orange-100 max-w-xl">
              Explore trails that match your experience level and apply what you&apos;ve learned on
              your next hike.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="/explore"
              className="px-6 py-3 rounded-xl bg-white text-orange-600 font-semibold shadow-md hover:shadow-lg hover:bg-orange-50 transition-all"
            >
              Browse Trails
            </a>
            <a
              href="/about"
              className="px-6 py-3 rounded-xl border border-orange-200 text-white font-semibold hover:bg-orange-500/20 transition-all"
            >
              Learn about Poorito
            </a>
          </div>
        </div>
      </div>

      {/* Article Modal */}
      {selectedArticle && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                {selectedArticle.category && (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryStyle(selectedArticle.category).bgColor} ${getCategoryStyle(selectedArticle.category).borderColor} border text-gray-800`}>
                    {selectedArticle.category}
                  </span>
                )}
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">{selectedArticle.title}</h2>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 md:p-8">
              {selectedArticle.image_url && (
                <div className="mb-6 rounded-xl overflow-hidden">
                  <img
                    src={selectedArticle.image_url}
                    alt={selectedArticle.title}
                    className="w-full h-64 md:h-80 object-cover"
                  />
                </div>
              )}
              
              <div className="flex items-center gap-4 mb-6 text-sm text-gray-600 flex-wrap">
                <div className="flex items-center gap-2">
                  <span>👤</span>
                  <span className="font-medium">{selectedArticle.author}</span>
                </div>
                {selectedArticle.mountain_name && selectedArticle.mountain_name !== 'General' && (
                  <div className="flex items-center gap-2">
                    <span>⛰️</span>
                    <span className="font-medium text-orange-600">{selectedArticle.mountain_name}</span>
                  </div>
                )}
                {selectedArticle.created_at && (
                  <div className="flex items-center gap-2">
                    <span>📅</span>
                    <span>{new Date(selectedArticle.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                )}
              </div>

              <div className="prose prose-lg max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedArticle.content}
                </div>
              </div>

              {/* External Link */}
              {selectedArticle.link && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <a
                    href={selectedArticle.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 shadow-md hover:shadow-lg transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span>Visit External Link</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Guides;


