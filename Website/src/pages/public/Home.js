import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';

function Home() {
  const navigate = useNavigate();
  const [cityQuery, setCityQuery] = useState('');
  const [mountains, setMountains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [stats, setStats] = useState({
    mountains: 0,
    guides: 0,
    bookings: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch mountains from API
  useEffect(() => {
    fetchMountains();
    fetchStats();
  }, []);

  const fetchMountains = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMountains();
      // Keep full list and filter in UI for sections
      setMountains(response.mountains || []);
    } catch (err) {
      console.error('Error fetching mountains:', err);
      setMountains([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const data = await apiService.getPublicStats();
      setStats({
        mountains: data.mountains || 0,
        guides: data.guides || 0,
        bookings: data.bookings || 0
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // Keep default values (0) on error
    } finally {
      setStatsLoading(false);
    }
  };

  // Helper to determine if a location is within LUZON
  const isLuzon = (location = '') => {
    const provinces = ['Cavite', 'Laguna', 'Batangas', 'Rizal', 'Quezon', 'LUZON', 'Region IV-A', 'Region 4A'];
    return provinces.some(p => location.toLowerCase().includes(p.toLowerCase()));
  };

  // Derive lists for sections
  const luzonMountains = useMemo(() => (
    (mountains || []).filter(m => isLuzon(m.location))
  ), [mountains]);

  const beyondMountains = useMemo(() => (
    (mountains || []).filter(m => !isLuzon(m.location))
  ), [mountains]);

  // Apply search to all mountains
  const filteredMountains = useMemo(() => {
    if (!cityQuery.trim()) return mountains;
    
    const query = cityQuery.toLowerCase().trim();
    return mountains.filter(m => {
      const name = (m.name || '').toLowerCase();
      const location = (m.location || '').toLowerCase();
      const description = (m.description || '').toLowerCase();
      
      // Search in name, location, and description
      return name.includes(query) || 
             location.includes(query) || 
             description.includes(query) ||
             // Also search for partial matches in location parts
             location.split(',').some(part => part.trim().includes(query)) ||
             location.split(' ').some(part => part.trim().includes(query));
    });
  }, [mountains, cityQuery]);

  // Separate filtered results back into LUZON and beyond
  const filteredLuzon = useMemo(() => (
    filteredMountains.filter(m => isLuzon(m.location))
  ), [filteredMountains]);

  const filteredBeyond = useMemo(() => (
    filteredMountains.filter(m => !isLuzon(m.location))
  ), [filteredMountains]);

  // Generate search suggestions based on unique locations
  const searchSuggestions = useMemo(() => {
    if (!cityQuery.trim() || cityQuery.length < 2) return [];
    
    const query = cityQuery.toLowerCase().trim();
    const uniqueLocations = [...new Set(mountains.map(m => m.location))];
    
    return uniqueLocations
      .filter(location => location.toLowerCase().includes(query))
      .slice(0, 5) // Limit to 5 suggestions
      .sort((a, b) => {
        // Prioritize exact matches and matches at the beginning
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        if (aLower.startsWith(query) && !bLower.startsWith(query)) return -1;
        if (!aLower.startsWith(query) && bLower.startsWith(query)) return 1;
        return aLower.localeCompare(bLower);
      });
  }, [mountains, cityQuery]);

  const handleSearchChange = (e) => {
    setCityQuery(e.target.value);
    setShowSuggestions(true);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = cityQuery.trim();
      setShowSuggestions(false);
      if (query) {
        navigate('/explore', { state: { searchQuery: query } });
      }
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setCityQuery(suggestion);
    setShowSuggestions(false);
    // Navigate to explore page with the selected location as search query
    navigate('/explore', { state: { searchQuery: suggestion } });
  };

  const clearSearch = () => {
    setCityQuery('');
    setShowSuggestions(false);
  };

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="pt-8 pb-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F8F5F1' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-4">
              Find your next <span className="text-orange-600">adventure</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl">
              Discover amazing trails across LUZON and beyond. Start your journey today.
            </p>
            <div className="w-full max-w-2xl mb-8 relative">
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input 
                  value={cityQuery} 
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow clicks on suggestions
                  className="w-full border-2 border-gray-200 rounded-xl pl-12 pr-12 py-3 sm:py-4 text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-md hover:border-gray-300 touch-manipulation" 
                  placeholder="Search by city, mountain name, or location..." 
                />
                {cityQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label="Clear search"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Search Suggestions Dropdown */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto overscroll-contain">
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-6 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 touch-manipulation min-h-[44px] flex items-center"
                    >
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-3">📍</span>
                        <span className="text-gray-900">{suggestion}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="mt-8 h-64 md:h-96 rounded-3xl bg-orange-500 shadow-2xl overflow-hidden relative">
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url('/imgbg.jpg')`
              }}
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        </div>
      </section>

      {/* Explore trails */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <button 
              onClick={() => navigate('/explore')}
              className="text-left hover:opacity-80 transition-opacity group"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                Explore trails
              </h2>
              <p className="text-gray-600 text-lg">Popular destinations for your next adventure</p>
            </button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading trails...</p>
              </div>
            </div>
          ) : filteredMountains.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">⛰️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No trails found</h3>
              <p className="text-gray-600">
                {cityQuery ? 'Try adjusting your search or browse all trails.' : 'No mountains available yet.'}
              </p>
              {cityQuery && (
                <button
                  onClick={clearSearch}
                  className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Search Results Summary */}
              {cityQuery && (
                <div className="text-center">
                  <p className="text-gray-600">
                    Found <span className="font-semibold text-orange-600">{filteredMountains.length}</span> trail{filteredMountains.length !== 1 ? 's' : ''} 
                    {filteredLuzon.length > 0 && filteredBeyond.length > 0 && (
                      <span> ({filteredLuzon.length} in LUZON, {filteredBeyond.length} beyond)</span>
                    )}
                  </p>
                </div>
              )}
              
              {/* Combined Grid when no search, separate sections when searching */}
              {!cityQuery ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" style={{ gridAutoRows: '1fr' }}>
                  {filteredMountains.slice(0, 8).map((mountain) => (
                    <div key={mountain.id} className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col" style={{ height: '100%' }}>
                      <div className="relative bg-orange-500 overflow-hidden flex-shrink-0" style={{ height: '176px', minHeight: '176px', maxHeight: '176px' }}>
                        {mountain.image_url ? (
                          <img 
                            src={mountain.image_url} 
                            alt={mountain.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            decoding="async"
                            style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white text-6xl opacity-50">⛰️</span>
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border ${
                            mountain.difficulty === 'Easy' ? 'bg-green-500/90 text-white border-green-400' :
                            mountain.difficulty === 'Moderate' ? 'bg-yellow-500/90 text-white border-yellow-400' :
                            mountain.difficulty === 'Hard' ? 'bg-orange-500/90 text-white border-orange-400' :
                            'bg-red-500/90 text-white border-red-400'
                          }`}>
                            {mountain.difficulty}
                          </span>
                        </div>
                      </div>
                      <div className="p-5 flex flex-col flex-grow">
                        <h3 className="font-bold text-gray-900 text-lg mb-3 group-hover:text-orange-600 transition-colors">{mountain.name}</h3>
                        <div className="space-y-2 mb-4 flex-grow">
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="mr-2 text-base">📍</span>
                            <span className="truncate">Location: <span className="font-medium text-gray-900">{mountain.location}</span></span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="mr-2 text-base">📏</span>
                            <span>Distance: <span className="font-medium text-gray-900">{mountain.distance_km != null && mountain.distance_km !== '' ? `${parseFloat(mountain.distance_km).toFixed(2)} KM` : 'N/A'}</span></span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="mr-2 text-base">⚡</span>
                            <span>Difficulty: <span className={`font-semibold ${
                              mountain.difficulty === 'Easy' ? 'text-green-600' :
                              mountain.difficulty === 'Moderate' ? 'text-yellow-600' :
                              mountain.difficulty === 'Hard' ? 'text-orange-600' :
                              'text-red-600'
                            }`}>{mountain.difficulty}</span></span>
                          </div>
                        </div>
                        <button 
                          onClick={() => navigate(`/mountains/${mountain.id}`)}
                          className="mt-auto w-full px-4 py-3 sm:py-2.5 rounded-lg text-white text-sm font-semibold bg-orange-600 hover:bg-orange-700 shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 touch-manipulation min-h-[44px]"
                        >
                          Explore
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* LUZON Results */}
                  {filteredLuzon.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">LUZON Trails</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" style={{ gridAutoRows: '1fr' }}>
                        {filteredLuzon.map((mountain) => (
                      <div key={mountain.id} className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col" style={{ height: '100%' }}>
                        <div className="relative bg-orange-500 overflow-hidden flex-shrink-0" style={{ height: '176px', minHeight: '176px', maxHeight: '176px' }}>
                          {mountain.image_url ? (
                            <img 
                              src={mountain.image_url} 
                              alt={mountain.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                              decoding="async"
                              style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-white text-6xl opacity-50">⛰️</span>
                            </div>
                          )}
                          <div className="absolute top-3 right-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border ${
                              mountain.difficulty === 'Easy' ? 'bg-green-500/90 text-white border-green-400' :
                              mountain.difficulty === 'Moderate' ? 'bg-yellow-500/90 text-white border-yellow-400' :
                              mountain.difficulty === 'Hard' ? 'bg-orange-500/90 text-white border-orange-400' :
                              'bg-red-500/90 text-white border-red-400'
                            }`}>
                              {mountain.difficulty}
                            </span>
                          </div>
                        </div>
                        <div className="p-5 flex flex-col flex-grow">
                          <h3 className="font-bold text-gray-900 text-lg mb-3 group-hover:text-orange-600 transition-colors">{mountain.name}</h3>
                          <div className="space-y-2 mb-4 flex-grow">
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="mr-2 text-base">📍</span>
                              <span className="truncate">Location: <span className="font-medium text-gray-900">{mountain.location}</span></span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="mr-2 text-base">📏</span>
                              <span>Distance: <span className="font-medium text-gray-900">{mountain.distance_km != null && mountain.distance_km !== '' ? `${parseFloat(mountain.distance_km).toFixed(2)} KM` : 'N/A'}</span></span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="mr-2 text-base">⚡</span>
                              <span>Difficulty: <span className={`font-semibold ${
                                mountain.difficulty === 'Easy' ? 'text-green-600' :
                                mountain.difficulty === 'Moderate' ? 'text-yellow-600' :
                                mountain.difficulty === 'Hard' ? 'text-orange-600' :
                                'text-red-600'
                              }`}>{mountain.difficulty}</span></span>
                            </div>
                          </div>
                          <button 
                            onClick={() => navigate(`/mountains/${mountain.id}`)}
                            className="mt-auto w-full px-4 py-3 sm:py-2.5 rounded-lg text-white text-sm font-semibold bg-orange-600 hover:bg-orange-700 shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 touch-manipulation min-h-[44px]"
                          >
                            Explore
                          </button>
                        </div>
                      </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Beyond LUZON Results */}
                  {filteredBeyond.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Beyond LUZON</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" style={{ gridAutoRows: '1fr' }}>
                        {filteredBeyond.map((mountain) => (
                      <div key={mountain.id} className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col" style={{ height: '100%' }}>
                        <div className="relative bg-orange-500 overflow-hidden flex-shrink-0" style={{ height: '176px', minHeight: '176px', maxHeight: '176px' }}>
                          {mountain.image_url ? (
                            <img 
                              src={mountain.image_url} 
                              alt={mountain.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                              decoding="async"
                              style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-white text-6xl opacity-50">⛰️</span>
                            </div>
                          )}
                          <div className="absolute top-3 right-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border ${
                              mountain.difficulty === 'Easy' ? 'bg-green-500/90 text-white border-green-400' :
                              mountain.difficulty === 'Moderate' ? 'bg-yellow-500/90 text-white border-yellow-400' :
                              mountain.difficulty === 'Hard' ? 'bg-orange-500/90 text-white border-orange-400' :
                              'bg-red-500/90 text-white border-red-400'
                            }`}>
                              {mountain.difficulty}
                            </span>
                          </div>
                        </div>
                        <div className="p-5 flex flex-col flex-grow">
                          <h3 className="font-bold text-gray-900 text-lg mb-3 group-hover:text-orange-600 transition-colors">{mountain.name}</h3>
                          <div className="space-y-2 mb-4 flex-grow">
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="mr-2 text-base">📍</span>
                              <span className="truncate">Location: <span className="font-medium text-gray-900">{mountain.location}</span></span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="mr-2 text-base">📏</span>
                              <span>Distance: <span className="font-medium text-gray-900">{mountain.distance_km != null && mountain.distance_km !== '' ? `${parseFloat(mountain.distance_km).toFixed(2)} KM` : 'N/A'}</span></span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="mr-2 text-base">⚡</span>
                              <span>Difficulty: <span className={`font-semibold ${
                                mountain.difficulty === 'Easy' ? 'text-green-600' :
                                mountain.difficulty === 'Moderate' ? 'text-yellow-600' :
                                mountain.difficulty === 'Hard' ? 'text-orange-600' :
                                'text-red-600'
                              }`}>{mountain.difficulty}</span></span>
                            </div>
                          </div>
                          <button 
                            onClick={() => navigate(`/mountains/${mountain.id}`)}
                            className="mt-auto w-full px-4 py-3 sm:py-2.5 rounded-lg text-white text-sm font-semibold bg-orange-600 hover:bg-orange-700 shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 touch-manipulation min-h-[44px]"
                          >
                            Explore
                          </button>
                        </div>
                      </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          <div className="text-center mt-16">
            <a 
              href="/explore" 
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-base font-semibold bg-white border-2 border-gray-200 hover:border-orange-500 hover:text-orange-600 transition-all shadow-sm hover:shadow-lg hover:scale-105 group touch-manipulation min-h-[44px]"
            >
              <span>See more trails</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="bg-orange-600 rounded-3xl p-8 sm:p-12 text-white">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="text-4xl sm:text-5xl mb-3">⛰️</div>
                <div className="text-3xl sm:text-5xl font-extrabold mb-2">
                  {statsLoading ? '...' : `${stats.mountains}+`}
                </div>
                <div className="text-sm sm:text-base text-orange-100">Mountains Covered</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-4xl sm:text-5xl mb-3">🧭</div>
                <div className="text-3xl sm:text-5xl font-extrabold mb-2">
                  {statsLoading ? '...' : `${stats.guides}+`}
                </div>
                <div className="text-sm sm:text-base text-orange-100">Hiking Guides</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-4xl sm:text-5xl mb-3">🗓️</div>
                <div className="text-3xl sm:text-5xl font-extrabold mb-2">
                  {statsLoading ? '...' : `${stats.bookings}+`}
                </div>
                <div className="text-sm sm:text-base text-orange-100">Bookings Made</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-4xl sm:text-5xl mb-3">⏰</div>
                <div className="text-3xl sm:text-5xl font-extrabold mb-2">24/7</div>
                <div className="text-sm sm:text-base text-orange-100">Available Access</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Tips */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-8">
          {[
            {
              title: 'Safety Tips',
              text: 'Hydrate, pace yourself, and check weather before heading out. Always inform someone of your plans.',
              icon: '🛡️',
              tag: 'Trail safety basics',
            },
            {
              title: 'Leave No Trace',
              text: 'Pack out all trash, stay on marked trails, and respect wildlife and cultural sites.',
              icon: '🌿',
              tag: 'Responsible hiking',
            },
          ].map((b, index) => (
            <div
              key={b.title}
              className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all"
            >
              <div
                className={`grid md:grid-cols-2 gap-6 md:gap-10 items-stretch p-6 sm:p-8 ${
                  index % 2 === 1 ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Illustration panel */}
                <div className="h-44 sm:h-52 md:h-56 rounded-xl bg-emerald-500 relative flex items-center justify-center shadow-inner">
                  <div className="absolute inset-0 opacity-35 bg-white" />
                  <div className="relative flex flex-col items-center justify-center">
                    <div className="text-6xl sm:text-7xl">{b.icon}</div>
                    <span className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white border border-white/20 backdrop-blur">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-300" />
                      {b.tag}
                    </span>
                  </div>
                </div>

                {/* Content panel */}
                <div className="flex flex-col justify-center">
                  <p className="text-xs font-semibold tracking-[0.18em] uppercase text-orange-500 mb-2">
                    Guides
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
                    {b.title}
                  </h3>
                  <p className="text-gray-700 text-base leading-relaxed mb-6">
                    {b.text}
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => navigate('/guides')}
                      className="px-6 py-3 rounded-lg text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 shadow-md hover:shadow-lg transition-all touch-manipulation min-h-[44px]"
                    >
                      Read more
                    </button>
                    <span className="text-xs text-gray-500">
                      3–5 minute read in hiking guides
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

export default Home;


