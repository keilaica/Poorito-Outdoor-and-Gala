import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('authToken');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Check if user is authenticated and is admin
  if (!token || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;

