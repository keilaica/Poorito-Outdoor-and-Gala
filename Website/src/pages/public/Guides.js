import React from 'react';

function Guides() {
  const sections = [
    {
      title: 'Trip planning',
      items: ['Pick a route that matches your ability', 'Check weather and advisories', 'Arrange transport and permits'],
    },
    {
      title: 'Gear essentials',
      items: ['Footwear with grip', 'First-aid + blister care', 'Layers, rain shell, thermal'],
    },
    {
      title: 'Emergency readiness',
      items: ['Share itinerary & ETA', 'Carry whistle and headlamp', 'Know local emergency numbers'],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">Guides</h1>
      <p className="text-gray-600 mt-2">Step-by-step references to help you plan safe and memorable hikes.</p>

      <div className="mt-8 grid md:grid-cols-3 gap-6">
        {sections.map((s) => (
          <div key={s.title} className="bg-white border border-gray-100 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900">{s.title}</h3>
            <ul className="mt-3 text-sm text-gray-700 list-disc pl-5 space-y-1">
              {s.items.map((i) => <li key={i}>{i}</li>)}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 grid lg:grid-cols-2 gap-8">
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="font-extrabold text-gray-900">Leave No Trace (LNT)</h2>
          <ol className="mt-3 list-decimal pl-5 text-sm text-gray-700 space-y-1">
            <li>Plan ahead and prepare</li>
            <li>Travel and camp on durable surfaces</li>
            <li>Dispose of waste properly</li>
            <li>Leave what you find</li>
            <li>Minimize campfire impacts</li>
            <li>Respect wildlife</li>
            <li>Be considerate of others</li>
          </ol>
        </div>
        <aside className="rounded-2xl border border-gray-100 bg-gradient-to-br from-primary to-primary-dark text-white p-6">
          <h3 className="font-bold">Weather & alerts</h3>
          <p className="text-sm mt-2 opacity-90">Connect a weather API to show live conditions by trail.</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white/10 rounded-lg p-3"><div className="opacity-80">Temp</div><div className="font-semibold">—°C</div></div>
            <div className="bg-white/10 rounded-lg p-3"><div className="opacity-80">Wind</div><div className="font-semibold">— km/h</div></div>
            <div className="bg-white/10 rounded-lg p-3"><div className="opacity-80">Rain</div><div className="font-semibold">—%</div></div>
            <div className="bg-white/10 rounded-lg p-3"><div className="opacity-80">Advisory</div><div className="font-semibold">None</div></div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Guides;


