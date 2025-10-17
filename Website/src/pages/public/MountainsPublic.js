import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';

function MountainsPublic() {
  const navigate = useNavigate();
  const [mountains, setMountains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('All');
  const [difficulty, setDifficulty] = useState('All');

  // Fetch mountains from API
  useEffect(() => {
    fetchMountains();
  }, []);

  const fetchMountains = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMountains();
      setMountains(response.mountains || []);
    } catch (err) {
      console.error('Error fetching mountains:', err);
      // Fallback to empty array on error
      setMountains([]);
    } finally {
      setLoading(false);
    }
  };

  // Get unique regions from mountains data
  const regions = useMemo(() => {
    const uniqueRegions = [...new Set(mountains.map(m => m.location))];
    return uniqueRegions.sort();
  }, [mountains]);

  const items = useMemo(() => {
    return mountains.filter((m) => {
      const matchesQuery = m.name.toLowerCase().includes(query.toLowerCase());
      const matchesRegion = region === 'All' || m.location === region;
      const matchesDiff = difficulty === 'All' || m.difficulty === difficulty;
      return matchesQuery && matchesRegion && matchesDiff;
    });
  }, [mountains, query, region, difficulty]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading mountains...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">Mountains</h1>
          <p className="text-gray-600 mt-2">Discover peaks with key stats and quick filters.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input 
            value={query} 
            onChange={(e)=>setQuery(e.target.value)} 
            className="border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
            placeholder="Search mountains..." 
          />
          <select 
            value={region} 
            onChange={(e)=>setRegion(e.target.value)} 
            className="border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="All">All regions</option>
            {regions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <select 
            value={difficulty} 
            onChange={(e)=>setDifficulty(e.target.value)} 
            className="border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="All">All</option>
            <option value="Easy">Easy</option>
            <option value="Moderate">Moderate</option>
            <option value="Hard">Hard</option>
            <option value="Expert">Expert</option>
          </select>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⛰️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No mountains found</h3>
          <p className="text-gray-600">
            {mountains.length === 0 
              ? 'No mountains have been added yet.' 
              : 'Try adjusting your search or filters.'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((m) => (
            <div key={m.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="h-40 bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center overflow-hidden">
                {m.image_url ? (
                  <img src={m.image_url} alt={m.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-6xl opacity-50">⛰️</span>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{m.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    m.difficulty === 'Easy' ? 'bg-green-50 text-green-700' :
                    m.difficulty === 'Moderate' ? 'bg-yellow-50 text-yellow-700' :
                    m.difficulty === 'Hard' ? 'bg-orange-50 text-orange-700' :
                    'bg-red-50 text-red-700'
                  }`}>
                    {m.difficulty}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{m.location} • {m.elevation.toLocaleString()} m</p>
                {m.description && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{m.description}</p>
                )}
                <button 
                  onClick={() => navigate(`/mountains/${m.id}`)}
                  className="mt-4 w-full px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg transition-all"
                >
                  View details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hiking etiquette */}
      <div className="mt-12 bg-white border border-gray-100 rounded-xl p-6">
        <h2 className="text-lg font-extrabold text-gray-900">Hiking etiquette</h2>
        <ul className="mt-3 text-sm text-gray-700 list-disc pl-5 space-y-2">
          <li>Yield to uphill hikers; step aside on narrow paths.</li>
          <li>Keep noise low; let nature and other hikers enjoy the trail.</li>
          <li>Stay on marked trails to prevent erosion and protect flora.</li>
        </ul>
      </div>
    </div>
  );
}

export default MountainsPublic;


