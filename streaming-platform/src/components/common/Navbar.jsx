import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setDropdownOpen(false);
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-left">
                    <Link to="/" className="navbar-brand">
                        <span className="gradient-text">Slice</span>
                    </Link>
                    <div className="nav-links">
                        <Link to="/indie" className="nav-link">Indie</Link>
                        <Link to="/mainstream" className="nav-link">Mainstream</Link>
                        <Link to="/crowdfunding" className="nav-link">Crowdfunding</Link>
                    </div>
                </div>

                <div className="navbar-right">
                    {user ? (
                        <>
                            <Link to="/partnership" className="nav-link">Partnership</Link>
                            <div className="user-menu" ref={dropdownRef}>
                                <button 
                                    className="profile-button"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                >
                                    <img 
                                        src={user.avatar || '/default-avatar.png'} 
                                        alt={user.username}
                                        className="profile-avatar"
                                    />
                                    <span className="profile-name">{user.username}</span>
                                </button>
                                
                                {dropdownOpen && (
                                    <div className="dropdown-menu">
                                        <Link 
                                            to="/profile" 
                                            className="dropdown-item"
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            Profile
                                        </Link>
                                        <Link 
                                            to="/settings" 
                                            className="dropdown-item"
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            Settings
                                        </Link>
                                        <button 
                                            onClick={handleLogout}
                                            className="dropdown-item logout-button"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <Link to="/auth" className="auth-button">
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
