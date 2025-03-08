import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/auth.css';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let success;
            if (isLogin) {
                success = await login(email, password);
            } else {
                success = await register({username, email, password});
            }
            
            if (success) {
                // The login/register functions in the context will handle the page refresh
                // Just ensure the user knows something is happening
                setLoading(true);
            } else {
                setError('Authentication failed. Please check your credentials.');
                setLoading(false);
            }
        } catch (err) {
            setError(err.message || 'An error occurred');
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Welcome to <span className="gradient-text">Slice</span></h2>
                    <p className="auth-subtitle">Your entertainment, perfectly portioned</p>
                </div>

                <div className="auth-tabs">
                    <div 
                        className={`auth-tab ${isLogin ? 'active' : ''}`}
                        onClick={() => setIsLogin(true)}
                    >
                        <span>Login</span>
                    </div>
                    <div 
                        className={`auth-tab ${!isLogin ? 'active' : ''}`}
                        onClick={() => setIsLogin(false)}
                    >
                        <span>Register</span>
                    </div>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required={!isLogin}
                                minLength={3}
                                autoComplete="username"
                                placeholder="Choose a username"
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            autoComplete={isLogin ? "current-password" : "new-password"}
                            placeholder={isLogin ? "Enter your password" : "Create a password"}
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button 
                        type="submit" 
                        className="auth-button"
                        disabled={loading}
                    >
                        <span>
                            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
                        </span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Auth;
