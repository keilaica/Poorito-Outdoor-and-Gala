import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

function PublicLayout() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="/poorito-logo.jpg"
              alt="Poorito"
              className="h-12 w-12 object-contain rounded-full shadow-md"
              onError={(e)=>{
                e.currentTarget.style.display='none';
                const fallback=document.createElement('div');
                fallback.className='w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark shadow-md flex items-center justify-center';
                fallback.innerHTML='<span class="text-white font-bold text-sm">P</span>';
                e.currentTarget.parentElement?.prepend(fallback);
              }}
            />
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">Poorito</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className={`text-sm font-medium ${isActive('/') ? 'text-primary' : 'text-gray-700 hover:text-gray-900'}`}>Home</Link>
            <Link to="/explore" className={`text-sm font-medium ${isActive('/explore') ? 'text-primary' : 'text-gray-700 hover:text-gray-900'}`}>Explore</Link>
            <Link to="/guides" className={`text-sm font-medium ${isActive('/guides') ? 'text-primary' : 'text-gray-700 hover:text-gray-900'}`}>Guides</Link>
            <Link to="/about" className={`text-sm font-medium ${isActive('/about') ? 'text-primary' : 'text-gray-700 hover:text-gray-900'}`}>About</Link>
          </nav>

          <div className="flex items-center space-x-3">
            <Link to="/admin" className="text-xs md:text-sm font-semibold text-gray-600 hover:text-gray-900">Admin</Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-center md:justify-between mb-6">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <img
                src="/poorito-logo.jpg"
                alt="Poorito"
                className="h-10 w-10 object-contain rounded-full shadow-sm"
              />
              <span className="font-bold text-lg">Poorito</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <a href="#" className="hover:text-gray-900">Privacy</a>
              <a href="#" className="hover:text-gray-900">Terms</a>
              <a href="#" className="hover:text-gray-900">Contact</a>
            </div>
          </div>
          <div className="text-center md:text-left text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Poorito. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PublicLayout;


