import React from 'react';

function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">About Poorito</h1>
            <p className="text-xl md:text-2xl text-orange-100 max-w-3xl mx-auto">
              Your trusted companion for mountain adventures in CALABARZON and beyond
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Our Story */}
        <div className="mb-20">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl p-8 flex items-center justify-center h-80">
                <div className="text-center">
                  <div className="text-8xl mb-4">⛰️</div>
                  <img
                    src="/poorito-logo.jpg"
                    alt="Poorito"
                    className="h-24 w-24 mx-auto object-contain rounded-full shadow-lg"
                  />
                </div>
              </div>
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Poorito was born from a passion for exploring the beautiful mountains of the Philippines. 
                We started as a small group of hiking enthusiasts who wanted to make mountain information 
                more accessible to everyone.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Today, we're proud to be a comprehensive platform that helps adventurers discover, plan, 
                and experience the best trails across CALABARZON and beyond. Whether you're a beginner 
                or an experienced mountaineer, we're here to guide your journey.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our mission is to inspire more people to explore the great outdoors while promoting 
                responsible and sustainable hiking practices.
              </p>
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all">
              <div className="text-5xl mb-4">🌿</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sustainability</h3>
              <p className="text-gray-600">
                We promote Leave No Trace principles and encourage responsible hiking to preserve 
                our natural environment for future generations.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Community</h3>
              <p className="text-gray-600">
                We believe in building a supportive community of hikers who share knowledge, 
                experiences, and respect for local cultures and traditions.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all">
              <div className="text-5xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Safety First</h3>
              <p className="text-gray-600">
                Your safety is our priority. We provide accurate trail information and safety 
                guidelines to ensure every adventure is both exciting and secure.
              </p>
            </div>
          </div>
        </div>

        {/* What We Offer */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">What We Offer</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-8 border border-orange-100">
              <div className="flex items-start gap-4">
                <div className="text-4xl">📍</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Trail Information</h3>
                  <p className="text-gray-600">
                    Comprehensive details about mountains, including elevation, difficulty levels, 
                    and location information to help you plan your hike.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-8 border border-orange-100">
              <div className="flex items-start gap-4">
                <div className="text-4xl">📖</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Hiking Guides</h3>
                  <p className="text-gray-600">
                    Expert guides and tips for beginners and experienced hikers, covering everything 
                    from gear to navigation and safety.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-8 border border-orange-100">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🔍</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Search & Explore</h3>
                  <p className="text-gray-600">
                    Easy-to-use search and filter tools to help you discover trails that match 
                    your skill level and interests.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-8 border border-orange-100">
              <div className="flex items-start gap-4">
                <div className="text-4xl">📸</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Visual Content</h3>
                  <p className="text-gray-600">
                    Beautiful images and detailed descriptions to give you a preview of what 
                    to expect on each trail.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-20">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-12 text-white">
            <h2 className="text-3xl font-bold text-center mb-12">Poorito by the Numbers</h2>
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-5xl font-extrabold mb-2">50+</div>
                <div className="text-orange-100">Mountains Covered</div>
              </div>
              <div>
                <div className="text-5xl font-extrabold mb-2">100+</div>
                <div className="text-orange-100">Hiking Guides</div>
              </div>
              <div>
                <div className="text-5xl font-extrabold mb-2">1000+</div>
                <div className="text-orange-100">Happy Hikers</div>
              </div>
              <div>
                <div className="text-5xl font-extrabold mb-2">24/7</div>
                <div className="text-orange-100">Available Access</div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gray-50 rounded-3xl p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Your Adventure?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of hikers who trust Poorito for their mountain adventures. 
            Explore our trails and start planning your next journey today!
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a 
              href="/explore" 
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              Explore Trails
            </a>
            <a 
              href="/guides" 
              className="px-8 py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-semibold hover:border-orange-500 hover:text-orange-600 transition-all"
            >
              Read Our Guides
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;

