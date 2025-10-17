import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';

function Home() {
  const navigate = useNavigate();
  const [cityQuery, setCityQuery] = useState('');
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
      // Keep full list and filter in UI for sections
      setMountains(response.mountains || []);
    } catch (err) {
      console.error('Error fetching mountains:', err);
      setMountains([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine if a location is within CALABARZON (Region IV‑A)
  const isCalabarzon = (location = '') => {
    const provinces = ['Cavite', 'Laguna', 'Batangas', 'Rizal', 'Quezon', 'CALABARZON', 'Region IV-A', 'Region 4A'];
    return provinces.some(p => location.toLowerCase().includes(p.toLowerCase()));
  };

  // Derive lists for sections
  const calabarzonMountains = useMemo(() => (
    (mountains || []).filter(m => isCalabarzon(m.location))
  ), [mountains]);

  const beyondMountains = useMemo(() => (
    (mountains || []).filter(m => !isCalabarzon(m.location))
  ), [mountains]);

  // Apply search only to CALABARZON section
  const filteredCalabarzon = useMemo(() => (
    calabarzonMountains.filter(m =>
      (m.location || '').toLowerCase().includes(cityQuery.toLowerCase()) ||
      (m.name || '').toLowerCase().includes(cityQuery.toLowerCase())
    )
  ), [calabarzonMountains, cityQuery]);

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="bg-gradient-to-br from-orange-50 via-white to-gray-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-4">
              Find your next <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">adventure</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl">
              Discover amazing trails across CALABARZON and beyond. Start your journey today.
            </p>
            <div className="w-full max-w-2xl mb-8">
              <input 
                value={cityQuery} 
                onChange={(e)=>setCityQuery(e.target.value)} 
                className="w-full border-2 border-gray-200 rounded-xl px-6 py-4 text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-md hover:border-gray-300" 
                placeholder="Search by city..." 
              />
            </div>
          </div>
          <div className="mt-8 h-64 md:h-96 rounded-3xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-2xl overflow-hidden relative">
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
          ) : filteredCalabarzon.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">⛰️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No trails found</h3>
              <p className="text-gray-600">
                {cityQuery ? 'Try adjusting your search.' : 'No mountains available yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredCalabarzon.slice(0, 4).map((mountain) => (
                <div key={mountain.id} className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="relative h-44 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 overflow-hidden">
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
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 text-lg mb-3">{mountain.name}</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">📍</span>
                        <span>Location: <span className="font-medium text-gray-900">{mountain.location}</span></span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">📏</span>
                        <span>Elevation: <span className="font-medium text-gray-900">{mountain.elevation.toLocaleString()}m</span></span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">⚡</span>
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
                      className="w-full px-4 py-2.5 rounded-lg text-white text-sm font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                    >
                      Explore
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-12">
            <a href="/explore" className="inline-block px-8 py-3 rounded-full text-sm font-semibold bg-white border-2 border-gray-200 hover:border-orange-500 hover:text-orange-600 transition-all shadow-sm hover:shadow-md">
              See more trails
            </a>
          </div>
        </div>
      </section>

      {/* Safety Tips */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-8">
          {[
            {title:'Safety Tips',text:'Hydrate, pace yourself, and check weather before heading out. Always inform someone of your plans.',icon:'🛡️'},
            {title:'Leave No Trace',text:'Pack out all trash, stay on marked trails, and respect wildlife and cultural sites.',icon:'🌿'}
          ].map((b)=>(
            <div key={b.title} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all">
              <div className="grid md:grid-cols-2 gap-8 items-center p-8">
                <div className="h-48 md:h-64 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                  <div className="text-8xl opacity-20">{b.icon}</div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{b.title}</h3>
                  <p className="text-gray-700 text-base leading-relaxed mb-6">{b.text}</p>
                  <button 
                    onClick={() => navigate('/guides')}
                    className="px-6 py-3 rounded-lg text-white text-sm font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-lg transition-all"
                  >
                    Read more
                  </button>
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


