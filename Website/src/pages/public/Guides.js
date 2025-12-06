import React from 'react';
import LandscapeView from '../../components/LandscapeView';

function Guides() {
  const sections = [
    {
      title: 'Trip planning',
      icon: '🗺️',
      tone: 'from-sky-500 to-sky-600',
      items: [
        'Pick a route that matches your ability',
        'Check weather and advisories',
        'Arrange transport and permits',
      ],
    },
    {
      title: 'Gear essentials',
      icon: '🎒',
      tone: 'from-emerald-500 to-emerald-600',
      items: [
        'Footwear with grip',
        'First-aid + blister care',
        'Layers, rain shell, thermal',
      ],
    },
    {
      title: 'Emergency readiness',
      icon: '🚨',
      tone: 'from-rose-500 to-rose-600',
      items: [
        'Share itinerary & ETA',
        'Carry whistle and headlamp',
        'Know local emergency numbers',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        {/* Hero */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-12">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.22em] text-orange-500 uppercase mb-3">
              Hiking knowledge base
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              Guides for safer, smarter adventures
            </h1>
            <p className="text-gray-600 text-base md:text-lg leading-relaxed">
              Step-by-step references for planning, packing, and staying safe on every trail.
              Learn from curated best practices tailored for mountains around LUZON and beyond.
            </p>
          </div>
          <div className="w-full lg:w-auto">
            <div className="rounded-2xl bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600 px-7 py-6 shadow-lg text-white flex items-center gap-4">
              <div className="text-4xl">🛡️</div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-orange-100 mb-1">
                  Safety first
                </p>
                <p className="text-sm md:text-base font-medium">
                  Start with these guides before exploring any new trail for a safer hike.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key sections */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-14">
          {sections.map((s) => (
            <div
              key={s.title}
              className="bg-white border border-gray-100 rounded-2xl p-6 md:p-7 shadow-sm hover:shadow-xl hover:border-orange-300 transition-all duration-300 group"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.tone} flex items-center justify-center text-2xl text-white mb-4 group-hover:scale-110 transition-transform shadow-md`}
              >
                {s.icon}
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">{s.title}</h3>
              <ul className="mt-2 text-sm text-gray-700 space-y-2">
                {s.items.map((i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 text-xs text-orange-500">●</span>
                    <span className="leading-relaxed">{i}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Illustration / hero visual */}
        <div className="mb-14 rounded-3xl overflow-hidden shadow-xl border border-gray-100 bg-white">
          <LandscapeView className="h-full min-h-[420px] w-full" />
        </div>

        {/* Leave No Trace section */}
        <div className="mb-14">
          <div className="bg-white border border-gray-100 rounded-3xl p-8 md:p-10 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <p className="text-xs font-semibold tracking-[0.22em] text-emerald-500 uppercase mb-2">
                  Outdoor ethics
                </p>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                  Leave No Trace (LNT)
                </h2>
              </div>
              <p className="text-sm md:text-base text-gray-600 max-w-xl">
                Protect the places you love to hike. Follow these principles to minimize your impact
                and keep trails wild for the next generation of adventurers.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Plan Ahead &amp; Prepare</h3>
                <p className="text-sm text-gray-600">
                  Research your route, check weather conditions, and pack appropriately for your
                  adventure.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Travel &amp; Camp on Durable Surfaces
                </h3>
                <p className="text-sm text-gray-600">
                  Stay on established trails and camp in designated areas to minimize environmental
                  impact.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Dispose of Waste Properly</h3>
                <p className="text-sm text-gray-600">
                  Pack out all trash, including food scraps and hygiene products. Leave no trace
                  behind.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Leave What You Find</h3>
                <p className="text-sm text-gray-600">
                  Preserve the natural environment by not taking rocks, plants, or other natural
                  objects.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Minimize Campfire Impacts</h3>
                <p className="text-sm text-gray-600">
                  Use a camp stove for cooking and only build fires in designated fire rings when
                  permitted.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Respect Wildlife</h3>
                <p className="text-sm text-gray-600">
                  Observe wildlife from a distance and never feed animals. Store food securely.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-8 md:p-10 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-lg">
          <div>
            <h3 className="text-2xl md:text-3xl font-extrabold mb-2">
              Ready to put these guides into practice?
            </h3>
            <p className="text-sm md:text-base text-orange-100 max-w-xl">
              Explore trails that match your experience level and apply what you&apos;ve learned on
              your next hike.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="/explore"
              className="px-6 py-3 rounded-xl bg-white text-orange-600 font-semibold shadow-md hover:shadow-lg hover:bg-orange-50 transition-all"
            >
              Browse Trails
            </a>
            <a
              href="/about"
              className="px-6 py-3 rounded-xl border border-orange-200 text-white font-semibold hover:bg-orange-600/20 transition-all"
            >
              Learn about Poorito
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Guides;


