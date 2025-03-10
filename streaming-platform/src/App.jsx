import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import TestPanel from './components/dev/TestPanel';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import IndieSection from './pages/IndieSection';
import MainstreamSection from './pages/MainstreamSection';
import CrowdfundingSection from './pages/CrowdfundingSection';
import Partnership from './pages/Partnership';
import VideoPage from './pages/VideoPage';
import PartnerDashboard from './pages/PartnerDashboard';
import BrandsPage from './pages/BrandsPage';
import BrandPage from './pages/BrandPage';
import BrandDashboard from './pages/BrandDashboard';
import AdminDashboard from './pages/AdminDashboard';

import './styles/main.css';

// Protected route component that requires admin privileges
// In development mode, allow access without admin rights
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  
  // In development, allow access without authentication
  if (import.meta.env.DEV) {
    return children;
  }
  
  if (!user || !user.isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// External redirect component
const ExternalRedirect = ({ to }) => {
  React.useEffect(() => {
    window.location.href = to;
  }, [to]);
  
  return <div className="loading-container">Redirecting to external resource...</div>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/indie" element={<IndieSection />} />
              <Route path="/mainstream" element={<MainstreamSection />} />
              <Route path="/crowdfunding" element={<CrowdfundingSection />} />
              <Route path="/partnership" element={<Partnership />} />
              <Route path="/partner-dashboard" element={<PartnerDashboard />} />
              <Route path="/brands" element={<BrandsPage />} />
              <Route path="/brands/:slug" element={<BrandPage />} />
              <Route path="/brand-dashboard" element={<BrandDashboard />} />
              <Route path="/video/:id" element={<VideoPage />} />
              
              {/* Schema Management Route */}
              <Route path="/schema" element={
                <ExternalRedirect to="http://localhost:3002/api/schema/status" />
              } />
              
              {/* Admin Routes - No authentication required in development */}
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              <Route path="/admin/:tab" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
            </Routes>
          </main>
          <Footer />
          {/* Test Panel for development mode */}
          {import.meta.env.DEV && <TestPanel />}
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
