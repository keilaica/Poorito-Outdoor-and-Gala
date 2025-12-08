import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useNavigationGuard } from '../contexts/NavigationGuard';
import apiService from '../services/api';

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const menuRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'admin') {
        navigate('/');
        return;
      }
      setUser(parsedUser);
    } else {
      navigate('/admin-login');
    }
  }, [navigate]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = () => {
    apiService.logout();
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8F5F1] flex flex-col">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo and Brand */}
          <Link to="/admin" className="flex items-center space-x-3">
            <img
              src="/poorito-logo-nogb.png"
              alt="Poorito"
              className="w-10 h-10 object-contain rounded-full shadow-sm"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'w-10 h-10 rounded-full bg-orange-600 shadow-sm flex items-center justify-center';
                fallback.innerHTML = '<span class="text-white font-bold text-sm">P</span>';
                e.currentTarget.parentElement?.prepend(fallback);
              }}
            />
            <div>
              <span className="font-bold text-xl text-gray-900">Poorito</span>
              <span className="text-sm text-gray-500 ml-2">Admin Panel</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/admin" 
              className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                isActive('/admin') ? 'text-orange-600 bg-orange-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              to="/admin/mountains" 
              className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                isActive('/admin/mountains') ? 'text-orange-600 bg-orange-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Mountains
            </Link>
            <Link 
              to="/admin/articles-guides" 
              className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                isActive('/admin/articles-guides') ? 'text-orange-600 bg-orange-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Articles & Guides
            </Link>
            <Link 
              to="/admin/bookings" 
              className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                isActive('/admin/bookings') ? 'text-orange-600 bg-orange-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Bookings
            </Link>
            <Link 
              to="/admin/analytics" 
              className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                isActive('/admin/analytics') ? 'text-orange-600 bg-orange-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Analytics
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              View Public Site
            </Link>
            
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white text-sm">
                  {user?.username?.charAt(0).toUpperCase() || 'A'}
                </div>
                <span className="hidden md:block">{user?.username || 'Admin'}</span>
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{user?.username || 'Admin'}</p>
                    <p className="text-xs text-gray-500">{user?.email || 'admin@poorito.com'}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-sm">
          <div className="px-6 py-4 space-y-2">
            <Link 
              to="/admin" 
              className={`block text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                isActive('/admin') ? 'text-orange-600 bg-orange-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
              onClick={() => setShowMobileMenu(false)}
            >
              Dashboard
            </Link>
            <Link 
              to="/admin/mountains" 
              className={`block text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                isActive('/admin/mountains') ? 'text-orange-600 bg-orange-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
              onClick={() => setShowMobileMenu(false)}
            >
              Mountains
            </Link>
            <Link 
              to="/admin/articles-guides" 
              className={`block text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                isActive('/admin/articles-guides') ? 'text-orange-600 bg-orange-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
              onClick={() => setShowMobileMenu(false)}
            >
              Articles & Guides
            </Link>
            <Link 
              to="/admin/bookings" 
              className={`block text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                isActive('/admin/bookings') ? 'text-orange-600 bg-orange-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
              onClick={() => setShowMobileMenu(false)}
            >
              Bookings
            </Link>
            <Link 
              to="/admin/analytics" 
              className={`block text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                isActive('/admin/analytics') ? 'text-orange-600 bg-orange-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
              onClick={() => setShowMobileMenu(false)}
            >
              Analytics
            </Link>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>

      {/* Admin Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-6">
              <div className="text-sm text-gray-500">
                © {new Date().getFullYear()} Poorito Admin Panel. All rights reserved.
              </div>
              <div className="hidden md:flex items-center space-x-4 text-sm text-gray-500">
                <Link to="/privacy" className="hover:text-gray-700 transition-colors">Privacy</Link>
                <Link to="/terms" className="hover:text-gray-700 transition-colors">Terms</Link>
                <Link to="/contact" className="hover:text-gray-700 transition-colors">Contact</Link>
                <Link to="/admin" className="hover:text-gray-700 transition-colors">Admin Portal</Link>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Version 1.0.0
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AdminLayout;
