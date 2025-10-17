import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';

function MountainDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mountain, setMountain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMountain();
  }, [id]);

  const fetchMountain = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMountain(id);
      setMountain(response.mountain);
    } catch (err) {
      console.error('Error fetching mountain:', err);
      setError('Mountain not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading mountain details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !mountain) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⛰️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Mountain Not Found</h3>
          <p className="text-gray-600 mb-4">{error || 'This mountain does not exist.'}</p>
          <button
            onClick={() => navigate('/mountains')}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Back to Mountains
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/explore')}
          className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors mb-6 text-sm font-medium"
        >
          ← Back to Explore Trails
        </button>

        {/* Hero Section */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Image Gallery */}
            <div className="lg:w-2/3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Main Image */}
                <div className="md:col-span-3">
                  <div className="aspect-video rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-orange-500 to-orange-700">
                    {mountain.image_url ? (
                      <img 
                        src={mountain.image_url} 
                        alt={mountain.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-8xl mb-4">⛰️</div>
                          <p className="text-white text-xl font-semibold">{mountain.name}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Thumbnail Images */}
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <span className="text-2xl text-gray-500">⛰️</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mountain Info */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-8">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{mountain.name}</h1>
                <p className="text-gray-600 mb-6">{mountain.location}</p>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg mx-auto mb-2 ${
                      mountain.difficulty === 'Easy' ? 'bg-green-500' :
                      mountain.difficulty === 'Moderate' ? 'bg-yellow-500' :
                      mountain.difficulty === 'Hard' ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}>
                      {mountain.difficulty === 'Easy' ? '🟢' :
                       mountain.difficulty === 'Moderate' ? '🟡' :
                       mountain.difficulty === 'Hard' ? '🟠' : '🔴'}
                    </div>
                    <div className="text-xs text-gray-500">Difficulty</div>
                    <div className="text-sm font-semibold text-gray-900">{mountain.difficulty}</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg mx-auto mb-2">⏱️</div>
                    <div className="text-xs text-gray-500">Duration</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {mountain.difficulty === 'Easy' ? '2-4 hrs' :
                       mountain.difficulty === 'Moderate' ? '4-6 hrs' :
                       mountain.difficulty === 'Hard' ? '6-8 hrs' : '8+ hrs'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white text-lg mx-auto mb-2">📏</div>
                    <div className="text-xs text-gray-500">Length</div>
                    <div className="text-sm font-semibold text-gray-900">{mountain.elevation.toLocaleString()}m</div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {mountain.description || `${mountain.name} is a beautiful mountain located in ${mountain.location}. This ${mountain.difficulty.toLowerCase()} difficulty trail offers stunning views and a great hiking experience for outdoor enthusiasts.`}
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="space-y-3">
                  <button className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                    Plan Your Hike
                  </button>
                  <button className="w-full px-4 py-3 border-2 border-orange-500 text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition-all">
                    Share Trail
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
            {['What to Bring', 'Budgeting', 'Itinerary', 'How to get there'].map((tab) => (
              <button
                key={tab}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg transition-colors"
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          {/* What to Bring Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What to Bring?</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { name: 'Valid ID', icon: '🆔' },
                { name: 'Backpack', icon: '🎒' },
                { name: 'Water Bottle', icon: '💧' },
                { name: 'First Aid Kit', icon: '🏥' },
                { name: 'Headlamp', icon: '🔦' },
                { name: 'Rain Jacket', icon: '🌧️' },
                { name: 'Trail Snacks', icon: '🍎' },
                { name: 'Hiking Shoes', icon: '🥾' },
                { name: 'Extra Clothes', icon: '👕' },
                { name: 'Power Bank', icon: '🔋' },
                { name: 'Camera', icon: '📷' },
                { name: 'Whistle', icon: '📯' }
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="text-sm font-medium text-gray-900 text-center">{item.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Budgeting Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Budgeting</h2>
            <p className="text-gray-600 mb-6">Fees and Regulations</p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <div className="text-2xl font-bold text-green-800 mb-2">₱100.00</div>
                <div className="text-sm text-green-700">per person</div>
                <div className="text-lg font-semibold text-green-900 mt-2">Environmental and Entrance Fee</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="text-2xl font-bold text-blue-800 mb-2">₱20.00</div>
                <div className="text-sm text-blue-700">per person</div>
                <div className="text-lg font-semibold text-blue-900 mt-2">Registration Fee</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                <div className="text-2xl font-bold text-purple-800 mb-2">₱750</div>
                <div className="text-sm text-purple-700">per group (up to 5 hikers)</div>
                <div className="text-lg font-semibold text-purple-900 mt-2">Guide Fee and Camping fee</div>
              </div>
            </div>
          </div>

          {/* Itinerary Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Day Hike Itinerary</h2>
            <p className="text-gray-600 mb-8">from Metro Manila</p>
            
            <div className="space-y-6">
              {/* Pre-Hike Travel */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pre-Hike Travel (Private or Carpool)</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                    <div>
                      <div className="font-semibold text-gray-900">02:30 AM - Departure from Metro Manila</div>
                      <div className="text-gray-600 text-sm">Travel time is around 2-3 hours depending on traffic. Route: Manila → Marcos Highway → Tanay, Rizal → Brgy. Daraitan.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                    <div>
                      <div className="font-semibold text-gray-900">05:30 AM - Arrive at Brgy. Daraitan jump-off point</div>
                      <div className="text-gray-600 text-sm">Register at the barangay hall. Pay environmental, registration, and guide fees.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hike Begins */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hike Begins</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                    <div>
                      <div className="font-semibold text-gray-900">06:00 AM - Start hike to {mountain.name} summit</div>
                      <div className="text-gray-600 text-sm">Begin the {mountain.difficulty.toLowerCase()} difficulty trail to the peak.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">4</div>
                    <div>
                      <div className="font-semibold text-gray-900">09:30 AM - Reach the summit ({mountain.elevation.toLocaleString()} MASL)</div>
                      <div className="text-gray-600 text-sm">Photo ops, rest, enjoy the view of the surrounding landscape.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Return Journey */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Return to Metro Manila</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">5</div>
                    <div>
                      <div className="font-semibold text-gray-900">12:30 PM - Start heading back to jump-off point</div>
                      <div className="text-gray-600 text-sm">Begin descent from the summit.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">6</div>
                    <div>
                      <div className="font-semibold text-gray-900">02:30 PM - Back at jump-off point, freshen up</div>
                      <div className="text-gray-600 text-sm">Clean up and prepare for the journey home.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">7</div>
                    <div>
                      <div className="font-semibold text-gray-900">06:30 PM - Estimated arrival back home</div>
                      <div className="text-gray-600 text-sm">Return to Metro Manila after a successful hike.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How to Get There Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">How to get there?</h2>
            <p className="text-gray-600 mb-8">How to Commute to {mountain.name} from Metro Manila (Public Transport)</p>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Private Vehicle */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Private Vehicle</h3>
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="text-sm text-gray-600 mb-4">
                    <strong>Estimated Travel Time:</strong> 2-3 hours (depending on traffic)
                  </div>
                  <div className="space-y-3 text-sm text-gray-700">
                    <div className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">•</span>
                      <span>Take Marcos Highway towards Tanay, Rizal</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">•</span>
                      <span>Navigate to Barangay Daraitan (mixed paved and rough sections)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">•</span>
                      <span>Good ground clearance advisable for the final approach</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">•</span>
                      <span>Arrive at Barangay Hall for registration and guide coordination</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Public Transportation */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Public Transportation</h3>
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="text-sm text-gray-600 mb-4">
                    <strong>Estimated Travel Time:</strong> 4-5 hours
                  </div>
                  <div className="space-y-3 text-sm text-gray-700">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Take LRT-2 to Santolan Station</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Ride UV Express/jeepney to Cogeo Gate 2</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Transfer to jeepney to Sampaloc, Tanay</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Take tricycle to Barangay Daraitan (infrequent public transport)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Arrive at Barangay Hall for registration and guide arrangement</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reminders Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Reminders</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="space-y-4">
                  {[
                    "Travel earlier if commuting (by van, bus, and tricycle, allow more buffer time)",
                    "Wear proper hiking shoes; some parts of the trail are steep and rocky",
                    "Bring enough water, trail snacks, and a packed lunch",
                    "Guide fee is usually ₱750 for a group of 5 (mandatory)",
                    "Environmental + registration fee is around ₱100-₱120 total per person",
                    "Optional: Bring swimwear and dry bag for river activities"
                  ].map((reminder, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">✓</span>
                      <span className="text-gray-700 text-sm">{reminder}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl p-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">⚠️</div>
                  <div className="text-lg font-semibold text-gray-900 mb-2">Safety First</div>
                  <div className="text-sm text-gray-700">
                    Mountain climbing can be dangerous. Always hike with experienced guides, especially for {mountain.difficulty.toLowerCase()} difficulty trails.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Explore {mountain.name}?</h2>
          <p className="text-xl mb-8 opacity-90">Plan your adventure and discover more amazing trails</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/explore')}
              className="px-8 py-4 bg-white text-orange-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Explore More Trails
            </button>
            <button
              onClick={() => navigate('/guides')}
              className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-orange-600 transition-colors"
            >
              Browse Hiking Guides
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MountainDetail;

