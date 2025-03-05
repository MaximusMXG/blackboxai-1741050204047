import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { FaFilm, FaGamepad, FaHandHoldingUsd, FaHome, FaCrown, FaUser } from 'react-icons/fa';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import MainstreamSection from './pages/MainstreamSection';
import IndieSection from './pages/IndieSection';
import CrowdfundingSection from './pages/CrowdfundingSection';
import Auth from './pages/Auth';
import VideoPage from './pages/VideoPage'; // Import the VideoPage component
import { AuthProvider } from './context/auth-context.jsx';
import { useAuth } from './hooks/useAuth.jsx';
import './styles/main.css';
import './styles/auth.css';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/auth" />;
};

const AppContent = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <NavLink to="/" style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaFilm style={{ color: 'var(--primary-green)' }} size={24} />
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Slice</span>
            </div>
          </NavLink>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" className="sidebar-link" end>
            <FaHome size={20} />
            <span>Home</span>
          </NavLink>
          <NavLink to="/mainstream" className="sidebar-link">
            <FaCrown size={20} />
            <span>Mainstream</span>
          </NavLink>
          <NavLink to="/indie" className="sidebar-link">
            <FaGamepad size={20} />
            <span>Indie</span>
          </NavLink>
          <NavLink to="/crowdfunding" className="sidebar-link">
            <FaHandHoldingUsd size={20} />
            <span>Crowdfunding</span>
          </NavLink>
        </nav>

        <div style={{ padding: '2rem' }}>
          {user ? (
            <>
              <div className="user-info">
                <FaUser size={20} />
                <span>{user.username}</span>
              </div>
              <button 
                className="btn-secondary" 
                style={{ width: '100%' }}
                onClick={logout}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/auth" style={{ width: '100%', marginBottom: '1rem', display: 'block' }}>
                <button className="btn-primary" style={{ width: '100%' }}>
                  Sign Up
                </button>
              </NavLink>
              <NavLink to="/auth" style={{ width: '100%', display: 'block' }}>
                <button className="btn-secondary" style={{ width: '100%' }}>
                  Sign In
                </button>
              </NavLink>
            </>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/mainstream" element={<MainstreamSection />} />
          <Route 
            path="/indie" 
            element={
              <PrivateRoute>
                <IndieSection />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/crowdfunding" 
            element={
              <PrivateRoute>
                <CrowdfundingSection />
              </PrivateRoute>
            } 
          />
          <Route path="/videos/:id" element={<VideoPage />} /> {/* New route for VideoPage */}
        </Routes>
        <Footer />
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
