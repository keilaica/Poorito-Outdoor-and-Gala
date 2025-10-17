import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 lg:p-12 max-w-[1800px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;

