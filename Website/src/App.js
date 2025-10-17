import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import PublicLayout from './components/PublicLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/public/Home';
import Explore from './pages/public/Explore';
import MountainDetail from './pages/public/MountainDetail';
import Guides from './pages/public/Guides';
import About from './pages/public/About';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Mountains from './pages/Mountains';
import MountainForm from './pages/MountainForm';
import ArticlesGuides from './pages/ArticlesGuides';
import ArticleForm from './pages/ArticleForm';
import Analytics from './pages/Analytics';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public site */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          {/* Redirect old mountains page to explore */}
          <Route path="/mountains" element={<Navigate to="/explore" replace />} />
          {/* Keep mountain detail page */}
          <Route path="/mountains/:id" element={<MountainDetail />} />
          <Route path="/guides" element={<Guides />} />
          <Route path="/about" element={<About />} />
        </Route>

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Admin area - Protected */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="mountains" element={<Mountains />} />
          <Route path="mountains/new" element={<MountainForm />} />
          <Route path="mountains/edit/:id" element={<MountainForm />} />
          <Route path="articles-guides" element={<ArticlesGuides />} />
          <Route path="articles-guides/new" element={<ArticleForm />} />
          <Route path="articles-guides/edit/:id" element={<ArticleForm />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Admin />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

