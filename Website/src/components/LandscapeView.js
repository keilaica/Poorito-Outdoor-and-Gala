import React from 'react';

function LandscapeView({ className = '' }) {
  return (
    <div className={`bg-green-50 rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Mountain Landscape Background */}
      <div className="relative h-full min-h-[600px] flex items-end">
        {/* Sky Gradient */}
        <div className="absolute inset-0 bg-sky-200"></div>
        
        {/* Mountain Silhouettes */}
        <div className="absolute bottom-0 left-0 w-full h-3/4">
          {/* Far Mountains */}
          <div className="absolute bottom-0 left-0 w-full h-2/3">
            <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gray-400 rounded-t-full transform -skew-x-12"></div>
            <div className="absolute bottom-0 left-1/4 w-1/4 h-4/5 bg-gray-500 rounded-t-full transform -skew-x-6"></div>
            <div className="absolute bottom-0 right-1/3 w-1/3 h-3/4 bg-gray-400 rounded-t-full transform skew-x-12"></div>
            <div className="absolute bottom-0 right-0 w-1/4 h-5/6 bg-gray-500 rounded-t-full transform skew-x-6"></div>
          </div>
          
          {/* Mid Mountains */}
          <div className="absolute bottom-0 left-0 w-full h-4/5">
            <div className="absolute bottom-0 left-1/6 w-1/4 h-full bg-green-600 rounded-t-full transform -skew-x-8"></div>
            <div className="absolute bottom-0 left-2/5 w-1/3 h-5/6 bg-green-700 rounded-t-full transform -skew-x-4"></div>
            <div className="absolute bottom-0 right-1/4 w-1/4 h-4/5 bg-green-600 rounded-t-full transform skew-x-8"></div>
          </div>
          
          {/* Near Mountains */}
          <div className="absolute bottom-0 left-0 w-full h-full">
            <div className="absolute bottom-0 left-0 w-1/3 h-full bg-emerald-700 rounded-t-full transform -skew-x-6"></div>
            <div className="absolute bottom-0 left-1/3 w-1/3 h-5/6 bg-emerald-800 rounded-t-full transform -skew-x-2"></div>
            <div className="absolute bottom-0 right-0 w-1/3 h-4/5 bg-emerald-700 rounded-t-full transform skew-x-6"></div>
          </div>
        </div>
        
        {/* Trees and Vegetation */}
        <div className="absolute bottom-0 left-0 w-full h-1/3">
          {/* Tree silhouettes */}
          <div className="absolute bottom-0 left-1/12 w-2 h-1/2 bg-green-800 rounded-t-full"></div>
          <div className="absolute bottom-0 left-1/8 w-3 h-2/3 bg-green-800 rounded-t-full"></div>
          <div className="absolute bottom-0 left-1/6 w-2 h-1/2 bg-green-800 rounded-t-full"></div>
          <div className="absolute bottom-0 left-1/4 w-3 h-2/3 bg-green-800 rounded-t-full"></div>
          <div className="absolute bottom-0 left-1/3 w-2 h-1/2 bg-green-800 rounded-t-full"></div>
          <div className="absolute bottom-0 left-2/5 w-3 h-2/3 bg-green-800 rounded-t-full"></div>
          <div className="absolute bottom-0 left-1/2 w-2 h-1/2 bg-green-800 rounded-t-full"></div>
          <div className="absolute bottom-0 left-3/5 w-3 h-2/3 bg-green-800 rounded-t-full"></div>
          <div className="absolute bottom-0 left-2/3 w-2 h-1/2 bg-green-800 rounded-t-full"></div>
          <div className="absolute bottom-0 left-3/4 w-3 h-2/3 bg-green-800 rounded-t-full"></div>
          <div className="absolute bottom-0 left-5/6 w-2 h-1/2 bg-green-800 rounded-t-full"></div>
          <div className="absolute bottom-0 right-1/12 w-3 h-2/3 bg-green-800 rounded-t-full"></div>
        </div>
        
        {/* Clouds */}
        <div className="absolute top-1/4 left-1/4 w-16 h-8 bg-white/80 rounded-full transform -rotate-12"></div>
        <div className="absolute top-1/3 right-1/3 w-20 h-10 bg-white/70 rounded-full transform rotate-6"></div>
        <div className="absolute top-1/5 left-1/2 w-12 h-6 bg-white/90 rounded-full transform -rotate-6"></div>
        <div className="absolute top-1/6 right-1/4 w-14 h-7 bg-white/75 rounded-full transform rotate-3"></div>
        
        {/* Sun */}
        <div className="absolute top-1/6 right-1/6 w-12 h-12 bg-yellow-300 rounded-full shadow-lg"></div>
        <div className="absolute top-1/6 right-1/6 w-12 h-12 bg-orange-300 rounded-full"></div>
        
        {/* Overlay Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Dark overlay for better text visibility */}
          <div className="absolute inset-0 bg-black/20"></div>
          
          <div className="relative text-center z-10">
            {/* Text container with background for better visibility */}
            <div className="bg-black/40 backdrop-blur-md rounded-2xl px-8 py-6 md:px-12 md:py-8 mb-6 inline-block">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                Explore the Great Outdoors
              </h2>
              <p className="text-lg md:text-xl lg:text-2xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                Discover amazing trails and breathtaking views
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border-2 border-white/50">
                <span className="text-sm font-semibold text-gray-900">🏔️ Mountain Trails</span>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border-2 border-white/50">
                <span className="text-sm font-semibold text-gray-900">🌲 Nature Walks</span>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border-2 border-white/50">
                <span className="text-sm font-semibold text-gray-900">🌅 Scenic Views</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-1/2 left-1/6 w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
        <div className="absolute top-2/3 right-1/5 w-1 h-1 bg-white/40 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-2/3 w-1.5 h-1.5 bg-white/50 rounded-full animate-pulse delay-2000"></div>
      </div>
    </div>
  );
}

export default LandscapeView;
