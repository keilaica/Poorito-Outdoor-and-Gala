import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

function Mountains() {
  const navigate = useNavigate();
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  const [mountains, setMountains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch mountains from API
  useEffect(() => {
    fetchMountains();
  }, []);

  const fetchMountains = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getMountains();
      // Backend returns { mountains: [...] }
      setMountains(response.mountains || []);
    } catch (err) {
      console.error('Error fetching mountains:', err);
      setError('Failed to load mountains. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/mountains/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this mountain?')) {
      try {
        await apiService.deleteMountain(id);
        setMountains(mountains.filter(mountain => mountain.id !== id));
        alert('Mountain deleted successfully!');
      } catch (err) {
        console.error('Error deleting mountain:', err);
        alert('Failed to delete mountain. Please try again.');
      }
    }
  };

  const handleAddMountain = () => {
    navigate('/admin/mountains/new');
  };

  // Filter mountains based on search term
  const filteredMountains = mountains.filter(mountain =>
    mountain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mountain.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get difficulty badge color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'expert':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'single':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'traverse':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">Mountains</h1>
          <p className="text-orange-600 font-semibold text-lg flex items-center gap-2">
            <span>📅</span>
            {currentDate}
          </p>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center p-6 border-b border-gray-200 gap-4">
          <h2 className="text-xl font-semibold text-gray-900">Manage Mountains</h2>
          <div className="flex flex-wrap gap-3">
            <input 
              type="text" 
              placeholder="Search mountain..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all w-full lg:w-64" 
            />
            <button 
              className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium text-sm transition-all"
              onClick={handleAddMountain}
            >
              + Add Mountain
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mountain Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Difficulty</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mr-2"></div>
                      Loading mountains...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-red-500">
                    <div className="flex flex-col items-center">
                      <p className="mb-2">{error}</p>
                      <button 
                        onClick={fetchMountains}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredMountains.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? 'No mountains found matching your search.' : 'No mountains found.'}
                  </td>
                </tr>
              ) : (
                filteredMountains.map((mountain) => (
                  <tr key={mountain.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">⛰️</div>
                        <span className="text-sm text-gray-900 font-medium">{mountain.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <span>📍</span>
                        <span>{mountain.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(mountain.difficulty)}`}>
                        {mountain.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(mountain.status)}`}>
                        {mountain.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          className="px-4 py-2 text-orange-600 hover:bg-orange-50 border border-orange-300 hover:border-orange-400 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                          onClick={() => handleEdit(mountain.id)}
                          title="Edit mountain"
                        >
                          <span>✏️</span>
                          Edit
                        </button>
                        <button 
                          className="px-4 py-2 text-red-600 hover:bg-red-50 border border-red-300 hover:border-red-400 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                          onClick={() => handleDelete(mountain.id)}
                          title="Delete mountain"
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

export default Mountains;

