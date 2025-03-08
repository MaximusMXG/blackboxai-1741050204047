import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/auth-context.jsx';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import IndieSection from './pages/IndieSection';
import MainstreamSection from './pages/MainstreamSection';
import CrowdfundingSection from './pages/CrowdfundingSection';
import Partnership from './pages/Partnership';
import VideoPage from './pages/VideoPage';

import './styles/main.css';

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
              <Route path="/video/:id" element={<VideoPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
