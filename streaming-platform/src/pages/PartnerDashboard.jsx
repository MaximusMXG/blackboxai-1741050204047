import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { partnershipService, videoService } from '../services/api';
import VideoCard from '../components/common/VideoCard';
import VideoUpload from '../components/video/VideoUpload';
import '../styles/PartnerDashboard.css';
const PartnerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [partnerStatus, setPartnerStatus] = useState(null);
    const [partnerVideos, setPartnerVideos] = useState([]);
    const [stats, setStats] = useState({
        totalViews: 0,
        totalSlices: 0,
        subscribers: 0
    });
    const [activeTab, setActiveTab] = useState('overview');
    const [showUploadModal, setShowUploadModal] = useState(false);
    
    useEffect(() => {
        // Check if user is logged in
        if (!user) {
            navigate('/auth');
            return;
        }
        
        const fetchPartnerStatus = async () => {
            try {
                setLoading(true);
                const response = await partnershipService.getUserApplications();
                
                // Check if any application is approved
                const approvedApplication = response.data.find(app => app.status === 'approved');
                
                if (approvedApplication) {
                    setPartnerStatus(approvedApplication);
                    await fetchPartnerContent(user.id);
                } else {
                    // No approved applications, redirect to partnership page
                    navigate('/partnership');
                }
            } catch (err) {
                console.error('Error fetching partner status:', err);
                setError('Failed to load partner information');
                setLoading(false);
            }
        };
        
        fetchPartnerStatus();
    }, [user, navigate]);
    
    const fetchPartnerContent = async (userId) => {
        try {
            // In a real app, this would fetch only videos by this partner
            // For this example, we'll use the existing endpoints
            const videosResponse = await videoService.getAll();
            
            // Filter to only show this user's videos (using creatorId)
            // This filtering would normally happen on the server side
            const creatorVideos = videosResponse.data.filter(video =>
                video.creatorId === userId
            );
            
            setPartnerVideos(creatorVideos);
            
            // Calculate stats
            const totalViews = creatorVideos.reduce((sum, video) => sum + video.views, 0);
            const totalSlices = creatorVideos.reduce((sum, video) => sum + (video.sliceCount || 0), 0);
            
            setStats({
                totalViews,
                totalSlices,
                subscribers: Math.floor(Math.random() * 1000) // Mock data
            });
            
            setLoading(false);
        } catch (err) {
            console.error('Error fetching partner content:', err);
            setError('Failed to load your content');
            setLoading(false);
        }
    };
    
    const handleUploadSuccess = (newVideo) => {
        // Add the new video to the partner's videos list
        setPartnerVideos(prevVideos => [newVideo, ...prevVideos]);
        
        // Update stats
        setStats(prevStats => ({
            ...prevStats,
            totalViews: prevStats.totalViews + (newVideo.views || 0),
            totalSlices: prevStats.totalSlices + (newVideo.sliceCount || 0)
        }));
        
        // Close the upload modal
        setShowUploadModal(false);
        
        // Show the videos tab to see the new upload
        setActiveTab('videos');
    };
    
    const renderTab = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="dashboard-overview">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <h3>Total Views</h3>
                                <p className="stat-value">{stats.totalViews.toLocaleString()}</p>
                                <div className="stat-trend positive">
                                    <span>↑ 12%</span> from last month
                                </div>
                            </div>
                            
                            <div className="stat-card">
                                <h3>Slice Allocations</h3>
                                <p className="stat-value">{stats.totalSlices.toLocaleString()}</p>
                                <div className="stat-trend positive">
                                    <span>↑ 8%</span> from last month
                                </div>
                            </div>
                            
                            <div className="stat-card">
                                <h3>Subscribers</h3>
                                <p className="stat-value">{stats.subscribers.toLocaleString()}</p>
                                <div className="stat-trend positive">
                                    <span>↑ 5%</span> from last month
                                </div>
                            </div>
                        </div>
                        
                        <div className="recent-videos">
                            <div className="section-header">
                                <h2>Recent Content</h2>
                                <button onClick={() => setActiveTab('videos')} className="view-all-btn">
                                    View All
                                </button>
                            </div>
                            
                            <div className="videos-grid">
                                {partnerVideos.slice(0, 4).map(video => (
                                    <VideoCard key={video._id} video={video} />
                                ))}
                                
                                {partnerVideos.length === 0 && (
                                    <div className="no-content-message">
                                        <p>You haven't uploaded any content yet.</p>
                                        <button
                                            className="primary-button"
                                            onClick={() => setShowUploadModal(true)}
                                        >
                                            Upload Your First Video
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
                
            case 'videos':
                return (
                    <div className="dashboard-videos">
                        <div className="section-header">
                            <h2>Your Content</h2>
                            <button
                                className="primary-button"
                                onClick={() => setShowUploadModal(true)}
                            >
                                Upload New Video
                            </button>
                        </div>
                        
                        <div className="videos-grid all-videos">
                            {partnerVideos.map(video => (
                                <VideoCard key={video._id} video={video} />
                            ))}
                            
                            {partnerVideos.length === 0 && (
                                <div className="no-content-message">
                                    <p>You haven't uploaded any content yet.</p>
                                    <button
                                        className="primary-button"
                                        onClick={() => setShowUploadModal(true)}
                                    >
                                        Upload Your First Video
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                );
                
            case 'analytics':
                return (
                    <div className="dashboard-analytics">
                        <h2>Analytics</h2>
                        <div className="analytics-placeholder">
                            <p>Detailed analytics would be displayed here, including:</p>
                            <ul>
                                <li>View trends over time</li>
                                <li>Audience demographics</li>
                                <li>Performance by content type</li>
                                <li>Slice allocation by video</li>
                                <li>Engagement metrics</li>
                            </ul>
                        </div>
                    </div>
                );
                
            case 'settings':
                return (
                    <div className="dashboard-settings">
                        <h2>Partner Settings</h2>
                        <form className="settings-form">
                            <div className="form-group">
                                <label>Channel Name</label>
                                <input 
                                    type="text" 
                                    value={partnerStatus?.channelName || ''}
                                    disabled
                                />
                                <button className="edit-button">Edit</button>
                            </div>
                            
                            <div className="form-group">
                                <label>Channel Description</label>
                                <textarea 
                                    rows="4"
                                    value={partnerStatus?.description || ''}
                                    disabled
                                ></textarea>
                                <button className="edit-button">Edit</button>
                            </div>
                            
                            <div className="form-group">
                                <label>Social Media Links</label>
                                <input 
                                    type="text" 
                                    value={partnerStatus?.socialLinks || ''}
                                    disabled
                                />
                                <button className="edit-button">Edit</button>
                            </div>
                            
                            <button type="button" className="save-button">
                                Save Changes
                            </button>
                        </form>
                    </div>
                );
                
            default:
                return null;
        }
    };
    
    if (loading) {
        return (
            <div className="partner-dashboard loading">
                <div className="loading-spinner"></div>
                <p>Loading your partner dashboard...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="partner-dashboard error">
                <p className="error-message">{error}</p>
                <button onClick={() => window.location.reload()} className="retry-button">
                    Retry
                </button>
            </div>
        );
    }
    
    return (
        <div className="partner-dashboard">
            <div className="dashboard-header">
                <div className="welcome-section">
                    <h1>Partner <span className="gradient-text">Dashboard</span></h1>
                    <p>Manage your content, track performance, and grow your audience</p>
                </div>
                
                <div className="channel-info">
                    <h2>{partnerStatus?.channelName}</h2>
                    <p className="partner-type">{partnerStatus?.contentType} Partner</p>
                </div>
            </div>
            
            <div className="dashboard-tabs">
                <button 
                    className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button 
                    className={`tab-button ${activeTab === 'videos' ? 'active' : ''}`}
                    onClick={() => setActiveTab('videos')}
                >
                    Videos
                </button>
                <button 
                    className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => setActiveTab('analytics')}
                >
                    Analytics
                </button>
                <button 
                    className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    Settings
                </button>
            </div>
            
            <div className="dashboard-content">
                {renderTab()}
            </div>
            
            {/* Video Upload Modal */}
            {showUploadModal && (
                <div className="modal-overlay">
                    <VideoUpload
                        onUploadSuccess={handleUploadSuccess}
                        onCancel={() => setShowUploadModal(false)}
                    />
                </div>
            )}
        </div>
    );
};

export default PartnerDashboard;