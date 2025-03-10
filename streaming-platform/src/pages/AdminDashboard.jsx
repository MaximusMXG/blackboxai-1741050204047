import React, { useState, useEffect } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import adminService from '../services/adminApi';
import '../styles/AdminDashboard.css';

// Subcomponents
import AdminOverview from '../components/admin/AdminOverview';
import AdminUsers from '../components/admin/AdminUsers';
import AdminVideos from '../components/admin/AdminVideos';
import AdminPartnerships from '../components/admin/AdminPartnerships';
import AdminLogs from '../components/admin/AdminLogs';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const isDevelopment = import.meta.env.MODE === 'development';

    // Determine active tab from URL path or query parameter
    useEffect(() => {
        const tabFromPath = location.pathname.split('/').pop();
        const tabFromQuery = new URLSearchParams(location.search).get('tab');
        
        if (tabFromPath && ['users', 'videos', 'partnerships', 'logs'].includes(tabFromPath)) {
            setActiveTab(tabFromPath);
        } else if (tabFromQuery) {
            setActiveTab(tabFromQuery);
        }
    }, [location]);

    // Fetch dashboard stats
    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                setLoading(true);
                const response = await adminService.getDashboardStats();
                setStats(response.data);
            } catch (err) {
                console.error('Error fetching admin dashboard stats:', err);
                setError('Failed to load dashboard data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (activeTab === 'overview') {
            fetchDashboardStats();
        }
    }, [activeTab]);

    // Create a mock user for development mode
    const mockAdminUser = {
        username: 'Development Admin',
        profilePicture: 'https://picsum.photos/200',
        isAdmin: true
    };

    // Use the mock admin user or the actual user
    const currentUser = isDevelopment ? (user || mockAdminUser) : user;

    // Redirect if not admin and not in development mode
    if (!isDevelopment && (!user || !user.isAdmin)) {
        return <Navigate to="/" replace />;
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return <AdminOverview stats={stats} loading={loading} error={error} />;
            case 'users':
                return <AdminUsers />;
            case 'videos':
                return <AdminVideos />;
            case 'partnerships':
                return <AdminPartnerships />;
            case 'logs':
                return <AdminLogs />;
            default:
                return <AdminOverview stats={stats} loading={loading} error={error} />;
        }
    };

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <h1>Admin Dashboard</h1>
                <div className="admin-user-info">
                    <span>Logged in as <strong>{currentUser.username}</strong></span>
                    <img src={currentUser.profilePicture} alt={currentUser.username} className="admin-avatar" />
                </div>
            </header>

            <nav className="admin-nav">
                <ul>
                    <li className={activeTab === 'overview' ? 'active' : ''}>
                        <Link to="/admin?tab=overview" onClick={() => setActiveTab('overview')}>
                            <i className="icon-dashboard"></i>
                            Overview
                        </Link>
                    </li>
                    <li className={activeTab === 'users' ? 'active' : ''}>
                        <Link to="/admin?tab=users" onClick={() => setActiveTab('users')}>
                            <i className="icon-users"></i>
                            Users
                        </Link>
                    </li>
                    <li className={activeTab === 'videos' ? 'active' : ''}>
                        <Link to="/admin?tab=videos" onClick={() => setActiveTab('videos')}>
                            <i className="icon-videos"></i>
                            Videos
                        </Link>
                    </li>
                    <li className={activeTab === 'partnerships' ? 'active' : ''}>
                        <Link to="/admin?tab=partnerships" onClick={() => setActiveTab('partnerships')}>
                            <i className="icon-partnerships"></i>
                            Partnerships
                        </Link>
                    </li>
                    <li className={activeTab === 'logs' ? 'active' : ''}>
                        <Link to="/admin?tab=logs" onClick={() => setActiveTab('logs')}>
                            <i className="icon-logs"></i>
                            Activity Logs
                        </Link>
                    </li>
                </ul>
            </nav>

            <main className="admin-content">
                {renderTabContent()}
            </main>

            {isDevelopment && (
                <div className="development-banner">
                    <p>Running in Development Mode - Admin Authentication Bypassed</p>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;