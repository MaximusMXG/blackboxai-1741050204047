import React from 'react';
import { Link } from 'react-router-dom';

const AdminOverview = ({ stats, loading, error }) => {
    if (loading) {
        return (
            <div className="admin-loading">
                <div className="admin-loading-spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-error">
                <p>{error}</p>
                <button 
                    className="admin-btn admin-btn-primary" 
                    onClick={() => window.location.reload()}
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!stats) {
        return null;
    }

    // Format numbers with commas
    const formatNumber = (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    return (
        <div className="admin-overview">
            <h2>Platform Overview</h2>
            
            <div className="admin-stats-grid">
                <div className="admin-stat-card">
                    <h3 className="stat-label">Total Users</h3>
                    <div className="stat-value">{formatNumber(stats.users.total)}</div>
                    <div className="stat-change stat-positive">
                        +{formatNumber(stats.users.newThisMonth)} this month
                    </div>
                </div>
                
                <div className="admin-stat-card">
                    <h3 className="stat-label">Total Videos</h3>
                    <div className="stat-value">{formatNumber(stats.videos.total)}</div>
                    <div className="stat-change stat-positive">
                        +{formatNumber(stats.videos.newThisMonth)} this month
                    </div>
                </div>
                
                <div className="admin-stat-card">
                    <h3 className="stat-label">Total Views</h3>
                    <div className="stat-value">{formatNumber(stats.videos.totalViews)}</div>
                </div>
                
                <div className="admin-stat-card">
                    <h3 className="stat-label">Pending Partnerships</h3>
                    <div className="stat-value">{formatNumber(stats.partnerships.pending)}</div>
                    <div>
                        <Link to="/admin?tab=partnerships" className="stat-change">
                            View applications
                        </Link>
                    </div>
                </div>
            </div>

            <div className="admin-charts">
                <div className="chart-container">
                    <h3 className="chart-title">View Trends (Last 30 Days)</h3>
                    {/* Chart would go here - a placeholder for now */}
                    <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {stats.viewTrends && stats.viewTrends.length > 0 ? (
                            <div className="chart-placeholder">
                                Chart visualization of {stats.viewTrends.length} data points
                            </div>
                        ) : (
                            <div className="chart-placeholder">
                                No view trend data available
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="chart-container">
                    <h3 className="chart-title">User Demographics</h3>
                    {/* Chart would go here - a placeholder for now */}
                    <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="chart-placeholder">
                            User demographics visualization
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="admin-section">
                <h3>Recent Videos</h3>
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Creator</th>
                                <th>Genre</th>
                                <th>Views</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentVideos && stats.recentVideos.map(video => (
                                <tr key={video._id}>
                                    <td>
                                        <Link to={`/admin/videos/${video._id}`}>
                                            {video.title}
                                        </Link>
                                    </td>
                                    <td>{video.creator}</td>
                                    <td>
                                        <span className={`admin-status admin-status-${video.genre}`}>
                                            {video.genre}
                                        </span>
                                    </td>
                                    <td>{formatNumber(video.views)}</td>
                                    <td>{new Date(video.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                            {(!stats.recentVideos || stats.recentVideos.length === 0) && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center' }}>
                                        No videos available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="admin-view-all">
                    <Link to="/admin?tab=videos" className="admin-btn admin-btn-secondary">
                        View All Videos
                    </Link>
                </div>
            </div>
            
            <div className="admin-section">
                <h3>Active Users</h3>
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Slices</th>
                                <th>Last Active</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.activeUsers && stats.activeUsers.map(user => (
                                <tr key={user._id}>
                                    <td>
                                        <Link to={`/admin/users/${user._id}`}>
                                            {user.username}
                                        </Link>
                                    </td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`admin-status admin-status-${user.role || 'viewer'}`}>
                                            {user.isAdmin ? 'Admin' : (user.isPartner ? 'Creator' : 'Viewer')}
                                        </span>
                                    </td>
                                    <td>{formatNumber(user.slices)}</td>
                                    <td>{new Date(user.lastActive).toLocaleString()}</td>
                                </tr>
                            ))}
                            {(!stats.activeUsers || stats.activeUsers.length === 0) && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center' }}>
                                        No active users available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="admin-view-all">
                    <Link to="/admin?tab=users" className="admin-btn admin-btn-secondary">
                        View All Users
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;