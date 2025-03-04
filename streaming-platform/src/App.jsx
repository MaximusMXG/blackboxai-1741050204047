import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { FaFilm, FaGamepad, FaHandHoldingUsd, FaHome, FaCrown } from 'react-icons/fa';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import MainstreamSection from './pages/MainstreamSection';
import IndieSection from './pages/IndieSection';
import CrowdfundingSection from './pages/CrowdfundingSection';
import './styles/main.css';

function App() {
  return (
    <Router>
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
            <button className="btn-primary" style={{ width: '100%', marginBottom: '1rem' }}>
              Sign Up
            </button>
            <button className="btn-secondary" style={{ width: '100%' }}>
              Sign In
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/mainstream" element={<MainstreamSection />} />
            <Route path="/indie" element={<IndieSection />} />
            <Route path="/crowdfunding" element={<CrowdfundingSection />} />
          </Routes>
          <Footer />
        </main>
      </div>
    </Router>
  );
}

export default App;
