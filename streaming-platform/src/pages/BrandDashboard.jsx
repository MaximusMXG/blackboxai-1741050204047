import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { brandService, partnershipService, videoService } from '../services/api';
import '../styles/BrandDashboard.css';

const BrandDashboard = () => {
    const { user } = useAuth();
    const [isPartner, setIsPartner] = useState(false);
    const [loading, setLoading] = useState(true);
    const [brands, setBrands] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [brandStats, setBrandStats] = useState({
        views: 0,
        slices: 0,
        followers: 0,
        engagement: 0
    });
    const [recentVideos, setRecentVideos] = useState([]);
    const [error, setError] = useState(null);

    // Check if user is a partner and fetch their brands
    useEffect(() => {
        const checkPartnerStatus = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Check if user is a partner
                const isUserPartner = await partnershipService.checkPartnerStatus();
                setIsPartner(isUserPartner);
                
                if (isUserPartner) {
                    // Get user's brands
                    const brandsResponse = await brandService.getAll();
                    const userBrands = brandsResponse.data.brands.filter(brand => 
                        brand.members && brand.members.some(member => 
                            member.userId === user?.id && 
                            (member.role === 'owner' || member.role === 'admin')
                        )
                    );
                    
                    setBrands(userBrands);
                    
                    // Set first brand as selected if available
                    if (userBrands.length > 0) {
                        setSelectedBrand(userBrands[0]);
                        fetchBrandData(userBrands[0]._id);
                    }
                }
                
                setLoading(false);
            } catch (err) {
                console.error('Error checking partner status:', err);
                setError('Failed to load partner information. Please try again.');
                setLoading(false);
            }
        };
        
        if (user) {
            checkPartnerStatus();
        }
    }, [user]);
    
    // Fetch selected brand data
    const fetchBrandData = async (brandId) => {
        try {
            setLoading(true);
            
            // Get brand analytics
            const analyticsResponse = await brandService.getAnalytics(brandId);
            if (analyticsResponse.data && analyticsResponse.data.summary) {
                const summary = analyticsResponse.data.summary;
                setBrandStats({
                    views: summary.totalViews || 0,
                    slices: summary.totalSlices || 0,
                    followers: selectedBrand?.followersCount || 0,
                    engagement: summary.totalEngagement || 0
                });
            }
            
            // Get recent videos
            const videosResponse = await brandService.getVideos(brandId);
            if (videosResponse.data && videosResponse.data.videos) {
                setRecentVideos(videosResponse.data.videos.slice(0, 5));
            }
            
            setLoading(false);
        } catch (err) {
            console.error('Error fetching brand data:', err);
            setError('Failed to load brand data. Please try again.');
            setLoading(false);
        }
    };
    
    // Handle brand change
    const handleBrandChange = (brand) => {
        setSelectedBrand(brand);
        fetchBrandData(brand._id);
    };
    
    // Redirect if not a partner
    if (!loading && !isPartner) {
        return <Navigate to="/partnership" replace />;
    }
    
    // Render loading state
    if (loading) {
        return (
            <div className="brand-dashboard loading">
                <div className="loading-spinner"></div>
                <p>Loading your brand dashboard...</p>
            </div>
        );
    }
    
    // Render error state
    if (error) {
        return (
            <div className="brand-dashboard error">
                <div className="error-message">{error}</div>
                <button 
                    className="retry-button"
                    onClick={() => window.location.reload()}
                >
                    Retry
                </button>
            </div>
        );
    }
    
    // Render empty state (no brands)
    if (!selectedBrand) {
        return (
            <div className="brand-dashboard">
                <div className="dashboard-header">
                    <h1>Brand Dashboard</h1>
                    <p>Manage your brand, analytics, and content</p>
                </div>
                
                <div className="no-brands">
                    <h2>No Brands Found</h2>
                    <p>You don't have any brands set up yet. Create your first brand to get started.</p>
                    <Link to="/brand/create" className="create-brand-button">
                        Create a Brand
                    </Link>
                </div>
            </div>
        );
    }
    
    return (
        <div className="brand-dashboard">
            <div className="dashboard-header">
                <h1>Brand Dashboard</h1>
                <div className="brand-selector">
                    <select 
                        value={selectedBrand._id}
                        onChange={(e) => {
                            const selectedId = e.target.value;
                            const brand = brands.find(b => b._id === selectedId);
                            if (brand) handleBrandChange(brand);
                        }}
                    >
                        {brands.map(brand => (
                            <option key={brand._id} value={brand._id}>
                                {brand.name}
                            </option>
                        ))}
                    </select>
                    <Link to="/brand/create" className="new-brand-button">
                        + New Brand
                    </Link>
                </div>
            </div>
            
            {/* Brand Profile Summary */}
            <div className="brand-summary">
                <div className="brand-profile">
                    <img 
                        src={selectedBrand.logo || 'https://picsum.photos/200'} 
                        alt={selectedBrand.name} 
                        className="brand-logo" 
                    />
                    <div className="brand-info">
                        <h2>{selectedBrand.name}</h2>
                        <p className="brand-category">{selectedBrand.category}</p>
                        <p className="brand-description">
                            {selectedBrand.description || 'No description available'}
                        </p>
                    </div>
                </div>
                
                <div className="brand-stats">
                    <div className="stat-card">
                        <div className="stat-value">{brandStats.views.toLocaleString()}</div>
                        <div className="stat-label">Views This Month</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{brandStats.slices.toLocaleString()}</div>
                        <div className="stat-label">Slices Earned</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{brandStats.followers.toLocaleString()}</div>
                        <div className="stat-label">Followers</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">${(brandStats.slices * 0.05).toFixed(2)}</div>
                        <div className="stat-label">Estimated Earnings</div>
                    </div>
                </div>
            </div>
            
            {/* Dashboard Tabs */}
            <div className="dashboard-tabs">
                <button 
                    className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button 
                    className={`tab-button ${activeTab === 'content' ? 'active' : ''}`}
                    onClick={() => setActiveTab('content')}
                >
                    Content
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
            
            {/* Tab Content */}
            <div className="dashboard-content">
                {activeTab === 'overview' && (
                    <div className="overview-tab">
                        <div className="dashboard-row">
                            <div className="quick-actions">
                                <h3>Quick Actions</h3>
                                <div className="action-buttons">
                                    <Link to="/video/upload" className="action-button">
                                        <span className="icon">📤</span>
                                        <span>Upload Video</span>
                                    </Link>
                                    <Link to={`/brand/${selectedBrand.slug}/edit`} className="action-button">
                                        <span className="icon">✏️</span>
                                        <span>Edit Brand</span>
                                    </Link>
                                    <Link to="/analytics" className="action-button">
                                        <span className="icon">📊</span>
                                        <span>View Analytics</span>
                                    </Link>
                                    <Link to="/brand/promote" className="action-button">
                                        <span className="icon">🚀</span>
                                        <span>Promote Content</span>
                                    </Link>
                                </div>
                            </div>
                            
                            <div className="recent-videos">
                                <h3>Recent Videos</h3>
                                {recentVideos.length === 0 ? (
                                    <div className="no-videos">
                                        <p>No videos found for this brand</p>
                                        <Link to="/video/upload" className="upload-button">
                                            Upload Video
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="video-list">
                                        {recentVideos.map(video => (
                                            <div key={video._id} className="video-item">
                                                <div className="video-thumbnail">
                                                    <img 
                                                        src={video.thumbnail} 
                                                        alt={video.title} 
                                                    />
                                                </div>
                                                <div className="video-details">
                                                    <Link to={`/video/${video._id}`} className="video-title">
                                                        {video.title}
                                                    </Link>
                                                    <div className="video-stats">
                                                        <span>{video.views} views</span>
                                                        <span>{video.slices} slices</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="performance-snapshot">
                            <h3>Performance Snapshot</h3>
                            <div className="performance-cards">
                                <div className="performance-card">
                                    <h4>Top Performing Video</h4>
                                    {recentVideos.length > 0 ? (
                                        <div className="top-video">
                                            <Link to={`/video/${recentVideos[0]._id}`} className="video-link">
                                                {recentVideos[0].title}
                                            </Link>
                                            <div className="video-metrics">
                                                <span>{recentVideos[0].views} views</span>
                                                <span>{recentVideos[0].slices} slices</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p>No videos available</p>
                                    )}
                                </div>
                                
                                <div className="performance-card">
                                    <h4>Growth This Month</h4>
                                    <div className="growth-stats">
                                        <div className="growth-stat">
                                            <span className="value">+{Math.floor(Math.random() * 100)}%</span>
                                            <span className="label">Views</span>
                                        </div>
                                        <div className="growth-stat">
                                            <span className="value">+{Math.floor(Math.random() * 50)}%</span>
                                            <span className="label">Followers</span>
                                        </div>
                                        <div className="growth-stat">
                                            <span className="value">+{Math.floor(Math.random() * 75)}%</span>
                                            <span className="label">Slices</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="performance-card">
                                    <h4>Audience Insights</h4>
                                    <div className="audience-categories">
                                        <div className="category">
                                            <span className="name">Entertainment</span>
                                            <div className="progress-bar">
                                                <div className="progress" style={{ width: '65%' }}></div>
                                            </div>
                                            <span className="percentage">65%</span>
                                        </div>
                                        <div className="category">
                                            <span className="name">Gaming</span>
                                            <div className="progress-bar">
                                                <div className="progress" style={{ width: '20%' }}></div>
                                            </div>
                                            <span className="percentage">20%</span>
                                        </div>
                                        <div className="category">
                                            <span className="name">Music</span>
                                            <div className="progress-bar">
                                                <div className="progress" style={{ width: '15%' }}></div>
                                            </div>
                                            <span className="percentage">15%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'content' && (
                    <div className="content-tab">
                        <div className="content-header">
                            <h3>Manage Content</h3>
                            <Link to="/video/upload" className="upload-video-button">
                                Upload Video
                            </Link>
                        </div>
                        
                        <div className="video-filters">
                            <div className="search-container">
                                <input 
                                    type="text" 
                                    placeholder="Search videos..." 
                                    className="search-input"
                                />
                                <button className="search-button">Search</button>
                            </div>
                            
                            <div className="filter-container">
                                <select className="filter-select">
                                    <option value="all">All Videos</option>
                                    <option value="published">Published</option>
                                    <option value="drafts">Drafts</option>
                                    <option value="archived">Archived</option>
                                </select>
                                <select className="sort-select">
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="popular">Most Popular</option>
                                    <option value="slices">Most Slices</option>
                                </select>
                            </div>
                        </div>
                        
                        {recentVideos.length === 0 ? (
                            <div className="no-content">
                                <p>You haven't uploaded any videos yet.</p>
                                <Link to="/video/upload" className="upload-button">
                                    Upload Your First Video
                                </Link>
                            </div>
                        ) : (
                            <div className="content-table">
                                <div className="table-header">
                                    <div className="header-thumbnail">Thumbnail</div>
                                    <div className="header-title">Title</div>
                                    <div className="header-date">Date</div>
                                    <div className="header-views">Views</div>
                                    <div className="header-slices">Slices</div>
                                    <div className="header-actions">Actions</div>
                                </div>
                                
                                <div className="table-body">
                                    {recentVideos.map(video => (
                                        <div key={video._id} className="table-row">
                                            <div className="cell-thumbnail">
                                                <img src={video.thumbnail} alt={video.title} />
                                            </div>
                                            <div className="cell-title">
                                                <Link to={`/video/${video._id}`}>{video.title}</Link>
                                            </div>
                                            <div className="cell-date">
                                                {new Date(video.createdAt).toLocaleDateString()}
                                            </div>
                                            <div className="cell-views">{video.views}</div>
                                            <div className="cell-slices">{video.slices || 0}</div>
                                            <div className="cell-actions">
                                                <button className="action-btn edit">Edit</button>
                                                <button className="action-btn delete">Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                
                {activeTab === 'analytics' && (
                    <div className="analytics-tab">
                        <h3>Analytics</h3>
                        <div className="time-filter">
                            <button className="time-button active">30 Days</button>
                            <button className="time-button">90 Days</button>
                            <button className="time-button">1 Year</button>
                            <button className="time-button">All Time</button>
                        </div>
                        
                        <div className="analytics-cards">
                            <div className="analytics-card views">
                                <div className="card-icon">👁️</div>
                                <div className="card-content">
                                    <div className="card-title">Total Views</div>
                                    <div className="card-value">{brandStats.views.toLocaleString()}</div>
                                    <div className="card-change positive">+12.5% vs last period</div>
                                </div>
                            </div>
                            
                            <div className="analytics-card slices">
                                <div className="card-icon">🍕</div>
                                <div className="card-content">
                                    <div className="card-title">Slices Earned</div>
                                    <div className="card-value">{brandStats.slices.toLocaleString()}</div>
                                    <div className="card-change positive">+8.3% vs last period</div>
                                </div>
                            </div>
                            
                            <div className="analytics-card followers">
                                <div className="card-icon">👥</div>
                                <div className="card-content">
                                    <div className="card-title">New Followers</div>
                                    <div className="card-value">{Math.floor(brandStats.followers * 0.15).toLocaleString()}</div>
                                    <div className="card-change positive">+5.7% vs last period</div>
                                </div>
                            </div>
                            
                            <div className="analytics-card earnings">
                                <div className="card-icon">💰</div>
                                <div className="card-content">
                                    <div className="card-title">Est. Earnings</div>
                                    <div className="card-value">${(brandStats.slices * 0.05).toFixed(2)}</div>
                                    <div className="card-change positive">+10.2% vs last period</div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="analytics-charts">
                            <div className="chart-container">
                                <h4>Views Over Time</h4>
                                <div className="chart-placeholder">
                                    <p>Chart visualization would go here in a real application</p>
                                </div>
                            </div>
                            
                            <div className="chart-container">
                                <h4>Slices Earned Over Time</h4>
                                <div className="chart-placeholder">
                                    <p>Chart visualization would go here in a real application</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="top-performing">
                            <h4>Top Performing Content</h4>
                            <div className="performance-table">
                                <div className="performance-header">
                                    <div className="ph-title">Video</div>
                                    <div className="ph-views">Views</div>
                                    <div className="ph-watch-time">Avg. Watch Time</div>
                                    <div className="ph-slices">Slices</div>
                                    <div className="ph-ctr">Click-Through Rate</div>
                                </div>
                                
                                {recentVideos.slice(0, 3).map((video, index) => (
                                    <div key={video._id} className="performance-row">
                                        <div className="pr-title">
                                            <span className="rank">{index + 1}</span>
                                            <Link to={`/video/${video._id}`}>{video.title}</Link>
                                        </div>
                                        <div className="pr-views">{video.views}</div>
                                        <div className="pr-watch-time">{Math.floor(Math.random() * 10) + 2}:${Math.floor(Math.random() * 60)}</div>
                                        <div className="pr-slices">{video.slices || 0}</div>
                                        <div className="pr-ctr">{(Math.random() * 10 + 10).toFixed(1)}%</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'settings' && (
                    <div className="settings-tab">
                        <h3>Brand Settings</h3>
                        
                        <div className="settings-form">
                            <div className="settings-section">
                                <h4>Brand Information</h4>
                                
                                <div className="form-group">
                                    <label>Brand Name</label>
                                    <input type="text" defaultValue={selectedBrand.name} />
                                </div>
                                
                                <div className="form-group">
                                    <label>Category</label>
                                    <select defaultValue={selectedBrand.category}>
                                        <option value="entertainment">Entertainment</option>
                                        <option value="music">Music</option>
                                        <option value="gaming">Gaming</option>
                                        <option value="education">Education</option>
                                        <option value="sports">Sports</option>
                                        <option value="news">News</option>
                                        <option value="technology">Technology</option>
                                        <option value="lifestyle">Lifestyle</option>
                                    </select>
                                </div>
                                
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea 
                                        rows="4" 
                                        defaultValue={selectedBrand.description || ''}
                                    ></textarea>
                                </div>
                                
                                <div className="form-group">
                                    <label>Tags (comma separated)</label>
                                    <input 
                                        type="text" 
                                        defaultValue={selectedBrand.tags?.join(', ') || ''}
                                    />
                                </div>
                            </div>
                            
                            <div className="settings-section">
                                <h4>Brand Visuals</h4>
                                
                                <div className="form-group">
                                    <label>Logo</label>
                                    <div className="image-upload">
                                        <img 
                                            src={selectedBrand.logo || 'https://picsum.photos/200'} 
                                            alt="Brand Logo" 
                                            className="preview-image"
                                        />
                                        <button className="upload-button">Change Logo</button>
                                    </div>
                                </div>
                                
                                <div className="form-group">
                                    <label>Cover Image</label>
                                    <div className="image-upload">
                                        <img 
                                            src={selectedBrand.coverImage || 'https://picsum.photos/1200/300'} 
                                            alt="Cover Image" 
                                            className="preview-image cover"
                                        />
                                        <button className="upload-button">Change Cover</button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="settings-section">
                                <h4>Social Media Links</h4>
                                
                                <div className="social-links">
                                    {['instagram', 'twitter', 'facebook', 'youtube', 'tiktok'].map(platform => (
                                        <div key={platform} className="form-group">
                                            <label>{platform.charAt(0).toUpperCase() + platform.slice(1)}</label>
                                            <input 
                                                type="text" 
                                                placeholder={`https://${platform}.com/yourbrand`}
                                                defaultValue={
                                                    selectedBrand.socialMedia?.find(
                                                        sm => sm.platform === platform
                                                    )?.url || ''
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="form-actions">
                                <button className="save-button">Save Changes</button>
                                <button className="cancel-button">Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrandDashboard;