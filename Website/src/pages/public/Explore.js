import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';

// Mountain Card Component
const MountainCard = ({ mountain, viewMode, onExplore }) => {
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

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return '🟢';
      case 'moderate':
        return '🟡';
      case 'hard':
        return '🟠';
      case 'expert':
        return '🔴';
      default:
        return '⚪';
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="md:w-80 h-48 md:h-auto bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 overflow-hidden">
            {mountain.image_url ? (
              <img 
                src={mountain.image_url} 
                alt={mountain.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white text-6xl opacity-50">⛰️</span>
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{mountain.name}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{mountain.description || 'No description available.'}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2 text-lg">📍</span>
                    <div>
                      <div className="font-medium text-gray-900">{mountain.location}</div>
                      <div className="text-xs text-gray-500">Location</div>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2 text-lg">📏</span>
                    <div>
                      <div className="font-medium text-gray-900">{mountain.elevation.toLocaleString()}m</div>
                      <div className="text-xs text-gray-500">Elevation</div>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2 text-lg">{getDifficultyIcon(mountain.difficulty)}</span>
                    <div>
                      <div className={`font-semibold ${getDifficultyColor(mountain.difficulty).split(' ')[1]}`}>
                        {mountain.difficulty}
                      </div>
                      <div className="text-xs text-gray-500">Difficulty</div>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2 text-lg">🏔️</span>
                    <div>
                      <div className="font-medium text-gray-900">{mountain.status || 'Single'}</div>
                      <div className="text-xs text-gray-500">Type</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <button 
                  onClick={onExplore}
                  className="px-6 py-3 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  View Details
                </button>
                <div className="text-xs text-gray-500 text-center">
                  Added {new Date(mountain.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
      <div className="relative h-48 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 overflow-hidden">
        {mountain.image_url ? (
          <img 
            src={mountain.image_url} 
            alt={mountain.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-6xl opacity-50">⛰️</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(mountain.difficulty)}`}>
            {getDifficultyIcon(mountain.difficulty)} {mountain.difficulty}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />
      </div>
      
      <div className="p-5">
        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">{mountain.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{mountain.description || 'No description available.'}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">📍</span>
            <span className="truncate">{mountain.location}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">📏</span>
            <span>{mountain.elevation.toLocaleString()}m elevation</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">🏔️</span>
            <span>{mountain.status || 'Single'} trail</span>
          </div>
        </div>
        
        <button 
          onClick={onExplore}
          className="w-full px-4 py-2.5 rounded-lg text-white text-sm font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
        >
          Explore Trail
        </button>
      </div>
    </div>
  );
};

function Explore() {
  const navigate = useNavigate();
  const [cityQuery, setCityQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [mountains, setMountains] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const filtered = useMemo(() => {
    let filtered = mountains.filter(m => 
      m.location.toLowerCase().includes(cityQuery.toLowerCase()) ||
      m.name.toLowerCase().includes(cityQuery.toLowerCase()) ||
      m.description?.toLowerCase().includes(cityQuery.toLowerCase())
    );

    // Filter by difficulty
    if (difficultyFilter !== 'All') {
      filtered = filtered.filter(m => m.difficulty === difficultyFilter);
    }

    // Sort mountains
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'elevation':
          return b.elevation - a.elevation; // Highest first
        case 'difficulty':
          const difficultyOrder = { 'Easy': 1, 'Moderate': 2, 'Hard': 3, 'Expert': 4 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case 'location':
          return a.location.localeCompare(b.location);
        default:
          return 0;
      }
    });

    return filtered;
  }, [mountains, cityQuery, difficultyFilter, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Search header */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">Explore trails</h1>
              <p className="text-lg text-gray-600 mt-3">Discover amazing mountains and plan your next adventure with detailed information.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-semibold">{filtered.length}</span> of <span className="font-semibold">{mountains.length}</span> trails
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  title="Grid view"
                >
                  ⚏
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  title="List view"
                >
                  ☰
                </button>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search trails</label>
                <div className="relative">
                  <input 
                    value={cityQuery} 
                    onChange={(e)=>setCityQuery(e.target.value)} 
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm hover:border-gray-300" 
                    placeholder="Search by name, location, or description..." 
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                </div>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm hover:border-gray-300"
                >
                  <option value="All">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Hard">Hard</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm hover:border-gray-300"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="elevation">Elevation (High to Low)</option>
                  <option value="difficulty">Difficulty (Easy to Hard)</option>
                  <option value="location">Location (A-Z)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Mountains Display */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading trails...</p>
            </div>
          </div>
        ) : mountains.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⛰️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No trails available</h3>
            <p className="text-gray-600">No mountains found in the database.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⛰️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No trails found</h3>
            <p className="text-gray-600">
              {cityQuery || difficultyFilter !== 'All' ? 'Try adjusting your search or filters.' : 'No mountains available yet.'}
            </p>
          </div>
        ) : (
          <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'} mb-12`}>
            {filtered.map((mountain) => (
              <MountainCard 
                key={mountain.id} 
                mountain={mountain} 
                viewMode={viewMode}
                onExplore={() => navigate(`/mountains/${mountain.id}`)}
              />
            ))}
          </div>
        )}

        {/* No "See more" button needed - all trails are shown here */}

        {/* Planning resources */}
        <div className="space-y-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Plan Your Adventure</h2>
            <p className="text-gray-600">Everything you need to know before hitting the trails</p>
          </div>
          
          {/* Essential Tips */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[{
              title: 'Essential Gear',
              points: ['Layers & rain jacket', '2L water minimum', 'Headlamp + spare batteries', 'First aid kit', 'Emergency whistle'],
              icon: '🎒',
              color: 'from-blue-500 to-blue-600'
            },{
              title: 'Navigation & Safety',
              points: ['Download offline maps', 'Carry power bank', 'Know bailout points', 'Share your itinerary', 'Check weather conditions'],
              icon: '🧭',
              color: 'from-green-500 to-green-600'
            },{
              title: 'Responsible Hiking',
              points: ['Support local guides', 'Respect cultural sites', 'Minimize waste', 'Stay on marked trails', 'Leave no trace'],
              icon: '🌱',
              color: 'from-purple-500 to-purple-600'
            }].map(card => (
              <div key={card.title} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all hover:border-orange-200 group">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${card.color} flex items-center justify-center text-2xl text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {card.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-3">{card.title}</h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  {card.points.map(p => (
                    <li key={p} className="flex items-start">
                      <span className="text-orange-500 mr-2 mt-0.5">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Difficulty Guide */}
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Trail Difficulty Guide</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { level: 'Easy', icon: '🟢', description: 'Well-marked trails, minimal elevation gain', time: '1-3 hours' },
                { level: 'Moderate', icon: '🟡', description: 'Some steep sections, moderate fitness required', time: '3-6 hours' },
                { level: 'Hard', icon: '🟠', description: 'Challenging terrain, good fitness essential', time: '6-10 hours' },
                { level: 'Expert', icon: '🔴', description: 'Technical sections, experienced hikers only', time: '10+ hours' }
              ].map(difficulty => (
                <div key={difficulty.level} className="bg-white rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">{difficulty.icon}</div>
                  <h4 className="font-bold text-gray-900 mb-2">{difficulty.level}</h4>
                  <p className="text-sm text-gray-600 mb-2">{difficulty.description}</p>
                  <p className="text-xs text-orange-600 font-semibold">{difficulty.time}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
              <div className="text-3xl mb-2">⛰️</div>
              <div className="text-2xl font-bold text-gray-900">{mountains.length}</div>
              <div className="text-sm text-gray-600">Total Trails</div>
            </div>
            <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
              <div className="text-3xl mb-2">📍</div>
              <div className="text-2xl font-bold text-gray-900">
                {[...new Set(mountains.map(m => m.location))].length}
              </div>
              <div className="text-sm text-gray-600">Locations</div>
            </div>
            <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
              <div className="text-3xl mb-2">📏</div>
              <div className="text-2xl font-bold text-gray-900">
                {mountains.length > 0 ? Math.max(...mountains.map(m => m.elevation)).toLocaleString() : 0}m
              </div>
              <div className="text-sm text-gray-600">Highest Peak</div>
            </div>
            <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
              <div className="text-3xl mb-2">🟢</div>
              <div className="text-2xl font-bold text-gray-900">
                {mountains.filter(m => m.difficulty === 'Easy').length}
              </div>
              <div className="text-sm text-gray-600">Easy Trails</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Explore;


