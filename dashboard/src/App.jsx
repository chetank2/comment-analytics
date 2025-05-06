import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import VideoDetail from './pages/VideoDetail';
import Upgrade from './pages/Upgrade';
import Onboarding from './pages/Onboarding';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Context
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={<Onboarding />} />

            <Route path="/" element={
              <ProtectedRoute>
                <div className="flex">
                  <Sidebar />
                  <div className="flex-1">
                    <Navbar />
                    <Dashboard />
                  </div>
                </div>
              </ProtectedRoute>
            } />

            <Route path="/video/:videoId" element={
              <ProtectedRoute>
                <div className="flex">
                  <Sidebar />
                  <div className="flex-1">
                    <Navbar />
                    <VideoDetail />
                  </div>
                </div>
              </ProtectedRoute>
            } />

            <Route path="/upgrade" element={
              <ProtectedRoute>
                <div className="flex">
                  <Sidebar />
                  <div className="flex-1">
                    <Navbar />
                    <Upgrade />
                  </div>
                </div>
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
