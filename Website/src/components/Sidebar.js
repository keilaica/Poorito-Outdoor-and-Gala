import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import apiService from '../services/api';

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/mountains', label: 'Mountains', icon: '⛰️' },
    { path: '/admin/articles-guides', label: 'Articles and Guides', icon: '📖' },
    { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
    { path: '/admin/settings', label: 'Admin', icon: '👤' },
  ];

  const handleLogout = () => {
    apiService.clearToken();
    localStorage.removeItem('user');
    navigate('/login');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 shadow-lg z-50 flex flex-col">
      <div className="p-6 text-center border-b border-gray-100">
        <img 
          src="/poorito-logo-nogb.png" 
          alt="Poorito" 
          className="w-28 h-28 mx-auto object-contain" 
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="hidden flex-col items-center justify-center">
          <div className="w-28 h-28 bg-primary rounded-full flex items-center justify-center shadow-xl">
            <span className="text-white font-bold text-base text-center">POORITO</span>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 flex flex-col py-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-6 py-3 transition-all duration-200 border-l-4 ${
              location.pathname === item.path 
                ? 'bg-primary text-white border-primary-dark shadow-md' 
                : 'text-gray-700 hover:bg-gray-50 hover:text-primary border-transparent'
            }`}
          >
            <span className="text-xl mr-3">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="border-t border-gray-200 p-4">
        <div className="mb-3 px-2">
          <p className="text-xs text-gray-500 mb-1">Logged in as</p>
          <p className="text-sm font-semibold text-gray-900">{user.username || 'Admin'}</p>
          <p className="text-xs text-gray-600">{user.email || ''}</p>
        </div>
        <div className="space-y-2">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
          >
            <span className="mr-2">🌐</span>
            View Public Site
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
          >
            <span className="mr-2">🚪</span>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;

