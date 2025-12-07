import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

function MountainEditForm({ mountain, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    elevation: '',
    location: '',
    difficulty: 'Easy',
    status: 'backtrail'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mountain) {
      setFormData({
        name: mountain.name || '',
        description: mountain.description || '',
        elevation: mountain.elevation || '',
        location: mountain.location || '',
        difficulty: mountain.difficulty || 'Easy',
        status: mountain.status || 'backtrail'
      });
    }
  }, [mountain]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.name || !formData.location || !formData.elevation) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const updateData = {
        name: formData.name,
        description: formData.description,
        elevation: parseInt(formData.elevation),
        location: formData.location,
        difficulty: formData.difficulty,
        status: formData.status || 'backtrail'
      };

      await apiService.updateMountain(mountain.id, updateData);
      alert('Mountain updated successfully!');
      onSave();
    } catch (err) {
      console.error('Error updating mountain:', err);
      setError(err.message || 'Failed to update mountain');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Edit Mountain</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Elevation (meters) *</label>
            <input
              type="number"
              name="elevation"
              value={formData.elevation}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option>Easy</option>
              <option>Moderate</option>
              <option>Hard</option>
              <option>Expert</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            ></textarea>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg disabled:opacity-50 transition-colors"
            >
              {loading ? 'Updating...' : 'UPDATE MOUNTAIN'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MountainEditForm;
