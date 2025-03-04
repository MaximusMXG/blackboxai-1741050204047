import { Link } from 'react-router-dom';
import { FaFilm, FaGamepad, FaCrown, FaHandHoldingUsd } from 'react-icons/fa';

const Navbar = () => {
  return (
    <nav className="nav">
      <div className="container nav-content">
        {/* Logo and Brand */}
        <Link to="/" className="nav-link">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaFilm style={{ color: 'var(--primary-red)' }} size={24} />
            <FaGamepad style={{ color: 'var(--primary-green)' }} size={24} />
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>StreamHub</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="nav-links">
          <Link to="/mainstream" className="nav-link">
            <FaCrown />
            <span>Mainstream</span>
          </Link>
          
          <Link to="/indie" className="nav-link">
            <FaGamepad />
            <span>Indie</span>
          </Link>
          
          <Link to="/crowdfunding" className="nav-link">
            <FaHandHoldingUsd />
            <span>Crowdfunding</span>
          </Link>

          {/* Auth Buttons */}
          <div style={{ display: 'flex', gap: '1rem', marginLeft: '2rem' }}>
            <button className="btn-secondary">Sign In</button>
            <button className="btn-primary">Sign Up</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
