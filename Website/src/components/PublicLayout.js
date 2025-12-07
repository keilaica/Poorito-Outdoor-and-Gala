import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import apiService from '../services/api';

function PublicLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const menuRef = useRef(null);
  const userMenuRef = useRef(null);
  
  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showMobileMenu || showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showMobileMenu, showUserMenu]);

  const handleLogout = () => {
    apiService.logout();
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 relative">
      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fadeIn"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          {/* Left side: Hamburger + Logo */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            {/* Mobile Menu Button - Left side */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              {showMobileMenu ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            <Link to="/" onClick={scrollToTop} className="flex items-center space-x-2 sm:space-x-3">
              <img
                src="/poorito-logo-nogb.png"
                alt="Poorito"
                className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-full shadow-md"
                loading="eager"
                decoding="async"
                onError={(e)=>{
                  e.currentTarget.style.display='none';
                  const fallback=document.createElement('div');
                  fallback.className='w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark shadow-md flex items-center justify-center';
                  fallback.innerHTML='<span class="text-white font-bold text-xs sm:text-sm">P</span>';
                  e.currentTarget.parentElement?.prepend(fallback);
                }}
              />
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">Poorito</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2 bg-gray-50/60 px-2 py-1 rounded-full shadow-sm border border-gray-100">
            <Link
              to="/"
              onClick={scrollToTop}
              className={`relative px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
                isActive('/')
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-700 hover:text-primary hover:bg-white'
              }`}
            >
              Home
            </Link>
            <Link
              to="/explore"
              onClick={scrollToTop}
              className={`relative px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
                isActive('/explore')
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-700 hover:text-primary hover:bg-white'
              }`}
            >
              Explore
            </Link>
            <Link
              to="/guides"
              onClick={scrollToTop}
              className={`relative px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
                isActive('/guides')
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-700 hover:text-primary hover:bg-white'
              }`}
            >
              Guides
            </Link>
            <Link
              to="/about"
              onClick={scrollToTop}
              className={`relative px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
                isActive('/about')
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-700 hover:text-primary hover:bg-white'
              }`}
            >
              About
            </Link>
          </nav>

          {/* Right side: User menu or Auth buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors touch-manipulation min-h-[44px] min-w-[44px]"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                    {user.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:block">{user.username}</span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user.username}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      state={{ from: location.pathname }}
                      className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors touch-manipulation min-h-[44px] flex items-center"
                      onClick={() => {
                        setShowUserMenu(false);
                        scrollToTop();
                        // Store current page as previous page
                        localStorage.setItem('previousPage', location.pathname);
                      }}
                    >
                      📊 Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 touch-manipulation min-h-[44px] flex items-center"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2 sm:space-x-3">
                <Link 
                  to="/login" 
                  onClick={scrollToTop}
                  className="text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors touch-manipulation min-h-[44px] flex items-center"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  onClick={scrollToTop}
                  className="text-xs sm:text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg transition-colors touch-manipulation min-h-[44px] flex items-center"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

      </header>

      {/* Mobile Sidebar Menu */}
      <div 
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          showMobileMenu ? 'translate-x-0' : '-translate-x-full'
        }`}
        ref={menuRef}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img
              src="/poorito-logo-nogb.png"
              alt="Poorito"
              className="h-10 w-10 object-contain rounded-full shadow-sm"
              loading="eager"
              decoding="async"
              onError={(e)=>{
                e.currentTarget.style.display='none';
                const fallback=document.createElement('div');
                fallback.className='w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-sm flex items-center justify-center';
                fallback.innerHTML='<span class="text-white font-bold text-sm">P</span>';
                e.currentTarget.parentElement?.prepend(fallback);
              }}
            />
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Poorito</span>
          </div>
          <button
            onClick={() => setShowMobileMenu(false)}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User Profile (if logged in) */}
        {user && (
          <div className="px-4 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.username}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto overscroll-contain py-4">
          <div className="px-2 space-y-1">
            <Link
              to="/"
              onClick={() => {
                setShowMobileMenu(false);
                scrollToTop();
              }}
              className={`flex items-center px-4 py-3 text-base font-semibold rounded-lg transition-colors touch-manipulation min-h-[44px] ${
                isActive('/')
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Home
            </Link>
            <Link
              to="/explore"
              onClick={() => {
                setShowMobileMenu(false);
                scrollToTop();
              }}
              className={`flex items-center px-4 py-3 text-base font-semibold rounded-lg transition-colors touch-manipulation min-h-[44px] ${
                isActive('/explore')
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Explore
            </Link>
            <Link
              to="/guides"
              onClick={() => {
                setShowMobileMenu(false);
                scrollToTop();
              }}
              className={`flex items-center px-4 py-3 text-base font-semibold rounded-lg transition-colors touch-manipulation min-h-[44px] ${
                isActive('/guides')
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Guides
            </Link>
            <Link
              to="/about"
              onClick={() => {
                setShowMobileMenu(false);
                scrollToTop();
              }}
              className={`flex items-center px-4 py-3 text-base font-semibold rounded-lg transition-colors touch-manipulation min-h-[44px] ${
                isActive('/about')
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              About
            </Link>
          </div>

          {/* Auth Links (if not logged in) */}
          {!user && (
            <div className="px-2 mt-4 space-y-2 border-t border-gray-200 pt-4">
              <Link
                to="/login"
                onClick={() => {
                  setShowMobileMenu(false);
                  scrollToTop();
                }}
                className="block px-4 py-3 text-base font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors touch-manipulation min-h-[44px] flex items-center"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => {
                  setShowMobileMenu(false);
                  scrollToTop();
                }}
                className="block px-4 py-3 text-base font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors touch-manipulation min-h-[44px] flex items-center justify-center"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* User Actions (if logged in) */}
          {user && (
            <div className="px-2 mt-4 space-y-2 border-t border-gray-200 pt-4">
              <Link
                to="/dashboard"
                onClick={() => {
                  setShowMobileMenu(false);
                  scrollToTop();
                }}
                className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors touch-manipulation min-h-[44px]"
              >
                <span className="mr-3">📊</span>
                Dashboard
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors touch-manipulation min-h-[44px] text-left"
              >
                <span className="mr-3">🚪</span>
                Logout
              </button>
            </div>
          )}
        </nav>
      </div>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row items-center md:justify-between mb-6 gap-4">
            <div className="flex items-center space-x-3">
            <img
              src="/poorito-logo-nogb.png"
              alt="Poorito"
              className="h-10 w-10 object-contain rounded-full shadow-sm"
              loading="lazy"
              decoding="async"
            />
              <span className="font-bold text-lg">Poorito</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-gray-900 touch-manipulation min-h-[44px] flex items-center">Privacy</a>
              <a href="#" className="hover:text-gray-900 touch-manipulation min-h-[44px] flex items-center">Terms</a>
              <a href="#" className="hover:text-gray-900 touch-manipulation min-h-[44px] flex items-center">Contact</a>
              <Link to="/admin-login" className="hover:text-gray-900 touch-manipulation min-h-[44px] flex items-center">Admin Portal</Link>
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


