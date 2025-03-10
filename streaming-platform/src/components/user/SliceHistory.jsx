import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { subscriptionService } from '../../services/api';
import PizzaAvatar from '../common/PizzaAvatar';
import '../../styles/SliceHistory.css';

const SliceHistory = ({ userId }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalSlices: 0,
        totalVideos: 0,
        topCategory: '',
        favoriteCreator: '',
        impact: 0
    });
    
    useEffect(() => {
        const fetchSliceHistory = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await subscriptionService.getUserSubscriptions(userId);
                
                if (response && response.data) {
                    // Sort by date, most recent first
                    const sortedHistory = [...response.data].sort((a, b) => 
                        new Date(b.createdAt) - new Date(a.createdAt)
                    );
                    
                    setHistory(sortedHistory);
                    
                    // Calculate stats
                    calculateStats(sortedHistory);
                }
                
                setLoading(false);
            } catch (err) {
                console.error('Error fetching slice history:', err);
                setError('Failed to load slice allocation history. Please try again later.');
                setLoading(false);
            }
        };
        
        if (userId) {
            fetchSliceHistory();
        }
    }, [userId]);
    
    // Calculate statistics from history
    const calculateStats = (historyData) => {
        if (!historyData.length) return;
        
        // Calculate total slices allocated
        const totalSlices = historyData.reduce((sum, item) => sum + item.slices, 0);
        
        // Count unique videos
        const uniqueVideos = new Set(historyData.map(item => item.video_id)).size;
        
        // Find most common category
        const categoryCount = {};
        historyData.forEach(item => {
            if (item.video && item.video.genre) {
                categoryCount[item.video.genre] = (categoryCount[item.video.genre] || 0) + item.slices;
            }
        });
        
        let topCategory = '';
        let maxCount = 0;
        
        Object.entries(categoryCount).forEach(([category, count]) => {
            if (count > maxCount) {
                maxCount = count;
                topCategory = category;
            }
        });
        
        // Find favorite creator (most slices allocated to)
        const creatorCount = {};
        historyData.forEach(item => {
            if (item.video && item.video.creator) {
                creatorCount[item.video.creator] = (creatorCount[item.video.creator] || 0) + item.slices;
            }
        });
        
        let favoriteCreator = '';
        maxCount = 0;
        
        Object.entries(creatorCount).forEach(([creator, count]) => {
            if (count > maxCount) {
                maxCount = count;
                favoriteCreator = creator;
            }
        });
        
        // Estimate impact (simplified calculation)
        // This could be a more complex calculation in a real application
        const impact = totalSlices * 0.05; // Assuming each slice contributes $0.05
        
        setStats({
            totalSlices,
            totalVideos: uniqueVideos,
            topCategory: topCategory || 'None',
            favoriteCreator: favoriteCreator || 'None',
            impact: parseFloat(impact.toFixed(2))
        });
    };
    
    // Format date to be more readable
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };
    
    // Render loading state
    if (loading) {
        return (
            <div className="slice-history-container loading">
                <div className="loading-spinner"></div>
                <p>Loading slice history...</p>
            </div>
        );
    }
    
    // Render error state
    if (error) {
        return (
            <div className="slice-history-container error">
                <p className="error-message">{error}</p>
                <button 
                    className="retry-button"
                    onClick={() => window.location.reload()}
                >
                    Retry
                </button>
            </div>
        );
    }
    
    // Render empty state
    if (!history.length) {
        return (
            <div className="slice-history-container empty">
                <div className="empty-state">
                    <h3>No Slice Allocations Yet</h3>
                    <p>
                        You haven't allocated any slices yet. Watch videos and allocate
                        slices to support your favorite creators!
                    </p>
                    <Link to="/" className="browse-button">
                        Browse Videos
                    </Link>
                </div>
            </div>
        );
    }
    
    return (
        <div className="slice-history-container">
            {/* Stats Overview */}
            <div className="slice-stats-overview">
                <div className="stat-card">
                    <h3>{stats.totalSlices}</h3>
                    <p>Slices Allocated</p>
                </div>
                <div className="stat-card">
                    <h3>{stats.totalVideos}</h3>
                    <p>Videos Supported</p>
                </div>
                <div className="stat-card">
                    <h3>{stats.topCategory}</h3>
                    <p>Favorite Category</p>
                </div>
                <div className="stat-card">
                    <h3>${stats.impact}</h3>
                    <p>Estimated Impact</p>
                </div>
            </div>
            
            {/* History Timeline */}
            <div className="history-timeline">
                <h3>Slice Allocation History</h3>
                
                <div className="timeline-list">
                    {history.map((allocation, index) => (
                        <div className="timeline-item" key={allocation._id || index}>
                            <div className="timeline-date">
                                <span>{formatDate(allocation.createdAt)}</span>
                            </div>
                            
                            <div className="timeline-content">
                                <div className="allocation-details">
                                    <div className="slice-count">
                                        <span className="count">{allocation.slices}</span>
                                        <span className="label">slices</span>
                                    </div>
                                    
                                    <div className="video-details">
                                        <Link to={`/video/${allocation.video_id}`} className="video-title">
                                            {allocation.video ? allocation.video.title : 'Unknown Video'}
                                        </Link>
                                        
                                        <div className="video-creator">
                                            {allocation.video && allocation.video.creator ? (
                                                <>by <span>{allocation.video.creator}</span></>
                                            ) : 'Unknown Creator'}
                                        </div>
                                    </div>
                                    
                                    {allocation.video && allocation.video.thumbnail && (
                                        <div className="video-thumbnail">
                                            <img 
                                                src={allocation.video.thumbnail} 
                                                alt={allocation.video ? allocation.video.title : 'Video thumbnail'} 
                                            />
                                        </div>
                                    )}
                                </div>
                                
                                {index === 0 && (
                                    <div className="latest-badge">Latest</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SliceHistory;