import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/api';

function ArticleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    category: 'Gear',
    mountain_name: '',
    link: '',
    status: 'published'
  });
  
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState(null);

  // Load article data for editing
  useEffect(() => {
    const loadArticleData = async () => {
      if (!isEdit || !id) return;

      try {
        setLoadingData(true);
        const response = await apiService.getArticle(id);
        const article = response.article;

        if (article) {
          setFormData({
            title: article.title || '',
            content: article.content || '',
            author: article.author || '',
            category: article.category || 'Gear',
            mountain_name: article.mountain_name || '',
            link: article.link || '',
            status: article.status || 'published'
          });

          // Load existing image if available
          if (article.image_url) {
            setImage(article.image_url);
          }
        }
      } catch (err) {
        console.error('Error loading article:', err);
        setError('Failed to load article data');
      } finally {
        setLoadingData(false);
      }
    };

    loadArticleData();
  }, [isEdit, id]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!formData.title || !formData.content || !formData.author) {
        setError('Please fill in all required fields (Title, Content, Author)');
        setLoading(false);
        return;
      }

      const articleData = {
        title: formData.title,
        content: formData.content,
        author: formData.author,
        category: formData.category,
        mountain_name: formData.mountain_name,
        link: formData.link,
        status: formData.status,
        image_url: image
      };

      if (isEdit) {
        await apiService.updateArticle(id, articleData);
        alert('Article updated successfully!');
      } else {
        await apiService.createArticle(articleData);
        alert('Article created successfully!');
      }

      navigate('/admin/articles-guides');
    } catch (err) {
      console.error('Error saving article:', err);
      setError('Failed to save article. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="space-y-6 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading article data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">
            {isEdit ? 'Edit Article' : 'Add New Article'}
          </h1>
          <p className="text-orange-600 font-semibold text-lg flex items-center gap-2">
            <span>📝</span>
            {isEdit ? 'Update article information' : 'Create a new article or guide'}
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/articles-guides')}
          className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Back to Articles
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-500 text-2xl mr-3">⚠️</div>
            <div>
              <h3 className="text-red-800 font-semibold">Error</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="Enter article title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
                  placeholder="Write your article content here..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => handleInputChange('author', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    placeholder="Author name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  >
                    <option value="Gear">Gear</option>
                    <option value="Safety">Safety</option>
                    <option value="Planning">Planning</option>
                    <option value="Guide">Guide</option>
                    <option value="Photography">Photography</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mountain Name
                  </label>
                  <input
                    type="text"
                    value={formData.mountain_name}
                    onChange={(e) => handleInputChange('mountain_name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    placeholder="Related mountain (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  External Link
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => handleInputChange('link', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="https://example.com (optional)"
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Image Upload */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Article Image</h3>
              <div className="space-y-4">
                {image ? (
                  <div className="relative">
                    <img
                      src={image}
                      alt="Article preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="text-4xl text-gray-400 mb-2">📷</div>
                    <p className="text-gray-500 text-sm">No image selected</p>
                  </div>
                )}
                
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="w-full px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-center cursor-pointer transition-colors">
                    {image ? 'Change Image' : 'Upload Image'}
                  </div>
                </label>
              </div>
            </div>

            {/* Save Button */}
            <div className="space-y-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {isEdit ? 'UPDATING...' : 'CREATING...'}
                  </div>
                ) : (
                  isEdit ? 'UPDATE ARTICLE' : 'CREATE ARTICLE'
                )}
              </button>

              <button
                onClick={() => navigate('/admin/articles-guides')}
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Preview</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div><strong>Title:</strong> {formData.title || 'Untitled'}</div>
                <div><strong>Author:</strong> {formData.author || 'Unknown'}</div>
                <div><strong>Category:</strong> {formData.category}</div>
                <div><strong>Status:</strong> {formData.status}</div>
                {formData.mountain_name && (
                  <div><strong>Mountain:</strong> {formData.mountain_name}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArticleForm;
