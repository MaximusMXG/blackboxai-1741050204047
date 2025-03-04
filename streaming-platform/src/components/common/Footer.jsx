import { Link } from 'react-router-dom';
import { FaTwitter, FaDiscord, FaGithub } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-grid">
        {/* Company Info */}
        <div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Slice</h3>
          <p style={{ marginBottom: '1rem' }}>
            Your entertainment platform for mainstream hits, indie gems, and crowdfunding projects.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a href="#" className="footer-link">
              <FaTwitter size={20} />
            </a>
            <a href="#" className="footer-link">
              <FaDiscord size={20} />
            </a>
            <a href="#" className="footer-link">
              <FaGithub size={20} />
            </a>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Navigation</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link to="/" className="footer-link">Home</Link>
            <Link to="/mainstream" className="footer-link">Mainstream</Link>
            <Link to="/indie" className="footer-link">Indie</Link>
            <Link to="/crowdfunding" className="footer-link">Crowdfunding</Link>
          </div>
        </div>

        {/* Legal */}
        <div>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Legal</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Cookie Policy</a>
          </div>
        </div>

        {/* Support */}
        <div>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Support</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <a href="#" className="footer-link">Help Center</a>
            <a href="#" className="footer-link">Contact Us</a>
            <a href="#" className="footer-link">FAQ</a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div style={{ 
        marginTop: '2rem',
        paddingTop: '2rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center',
        fontSize: '0.875rem'
      }}>
        <p>© {new Date().getFullYear()} Slice. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
