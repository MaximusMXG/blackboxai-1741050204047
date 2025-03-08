import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Slice</h3>
          <p>Your entertainment, perfectly portioned.</p>
          <p>© {currentYear} Slice Entertainment. All rights reserved.</p>
        </div>
        
        <div className="footer-section">
          <h4>Explore</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/indie">Indie</Link></li>
            <li><Link to="/mainstream">Mainstream</Link></li>
            <li><Link to="/crowdfunding">Crowdfunding</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Account</h4>
          <ul>
            <li><Link to="/profile">Profile</Link></li>
            <li><Link to="/auth">Sign In / Register</Link></li>
            <li><Link to="/partnership">Partnership</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Help & Info</h4>
          <ul>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/help">Support</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>Slice — Democratizing content distribution one slice at a time</p>
        <div className="social-icons">
          <a href="#" title="Facebook"><i className="fab fa-facebook"></i></a>
          <a href="#" title="Twitter"><i className="fab fa-twitter"></i></a>
          <a href="#" title="Instagram"><i className="fab fa-instagram"></i></a>
          <a href="#" title="YouTube"><i className="fab fa-youtube"></i></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
