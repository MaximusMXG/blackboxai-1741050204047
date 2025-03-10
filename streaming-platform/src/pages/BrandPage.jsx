import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { brandService, videoService } from '../services/api';
import VideoCard from '../components/common/VideoCard';
import '../styles/BrandPage.css';

const UserFollowerCard = ({ follower }) => {
    return (
        <Link to={`/profile/${follower._id}`} className="follower-card">
            <img 
                src={follower.profilePicture || '/default-avatar.png'} 
                alt={follower.username}
                className="follower-avatar"
            />
            <div className="follower-info">
                <h4>{follower.username}</h4>
                <p>{follower.slices} slices available</p>
            </div>
        </Link>
    );
};

const BrandPage = () => {
    const { slug } = useParams();
    const { user } = useAuth();
    const [brand, setBrand] = useState(null);
    const [brandVideos, setBrandVideos] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [activeTab, setActiveTab] = useState('videos');
    const [followersCount, setFollowersCount] = useState(0);
    
    useEffect(() => {
        const fetchBrandData = async () => {
            try {
                setLoading(true);
                
                // Fetch brand details
                const brandResponse = await brandService.getBySlug(slug);
                setBrand(brandResponse.data);
                setFollowersCount(brandResponse.data.followersCount);
                
                // Check if user is following this brand
                if (user && brandResponse.data.followers) {
                    setIsFollowing(brandResponse.data.followers.includes(user.id));
                }
                
                // Fetch brand videos
                const videosResponse = await brandService.getVideos(brandResponse.data._id);
                setBrandVideos(videosResponse.data.videos);
                
                // Fetch first page of followers
                const followersResponse = await brandService.getFollowers(brandResponse.data._id);
                setFollowers(followersResponse.data.followers);
                
                setLoading(false);
            } catch (err) {
                console.error('Error fetching brand data:', err);
                setError('Failed to load brand information. Please try again later.');
                setLoading(false);
            }
        };
        
        fetchBrandData();
    }, [slug, user]);
    
    const handleFollow = async () => {
        if (!user) {
            // Redirect to login or show login modal
            return;
        }
        
        try {
            if (isFollowing) {
                const response = await brandService.unfollow(brand._id);
                setIsFollowing(false);
                setFollowersCount(response.data.followersCount);
            } else {
                const response = await brandService.follow(brand._id);
                setIsFollowing(true);
                setFollowersCount(response.data.followersCount);
            }
        } catch (err) {
            console.error('Error following/unfollowing brand:', err);
            setError('Failed to update follow status. Please try again.');
        }
    };
    
    // Format social media links
    const formatSocialMediaLinks = (socialMedia) => {
        if (!socialMedia || !Array.isArray(socialMedia) || socialMedia.length === 0) {
            return [];
        }
        
        return socialMedia.map(social => {
            let icon;
            switch (social.platform) {
                case 'instagram':
                    icon = '📸';
                    break;
                case 'twitter':
                    icon = '🐦';
                    break;
                case 'facebook':
                    icon = '👥';
                    break;
                case 'youtube':
                    icon = '🎥';
                    break;
                case 'tiktok':
                    icon = '🎵';
                    break;
                case 'linkedin':
                    icon = '💼';
                    break;
                case 'website':
                    icon = '🌐';
                    break;
                default:
                    icon = '🔗';
            }
            
            return {
                ...social,
                icon
            };
        });
    };
    
    if (loading) {
        return (
            <div className="brand-page loading">
                <div className="loading-spinner"></div>
                <p>Loading brand information...</p>
            </div>
        );
    }
    
    if (error || !brand) {
        return (
            <div className="brand-page error">
                <h2>Error</h2>
                <p className="error-message">{error || 'Brand not found'}</p>
                <Link to="/brands" className="back-button">
                    Back to Brands
                </Link>
            </div>
        );
    }
    
    const formattedSocialLinks = formatSocialMediaLinks(brand.socialMedia);
    
    return (
        <div className="brand-page">
            <div className="brand-header" style={{ backgroundImage: `url(${brand.coverImage})` }}>
                <div className="brand-header-overlay">
                    <div className="brand-info-container">
                        <div className="brand-logo-container">
                            <img
                                src={brand.logo || 'https://picsum.photos/200'}
                                alt={brand.name}
                                className="brand-profile-logo"
                            />
                            {brand.isVerified && (
                                <span className="verified-badge-large" title="Verified Brand">✓</span>
                            )}
                        </div>
                        
                        <div className="brand-header-info">
                            <div className="brand-title-container">
                                <h1>{brand.name}</h1>
                                {user && (
                                    <button
                                        className={`follow-button ${isFollowing ? 'following' : ''}`}
                                        onClick={handleFollow}
                                    >
                                        {isFollowing ? 'Following' : 'Follow'}
                                    </button>
                                )}
                            </div>
                            
                            <div className="brand-meta">
                                <span className="brand-category">{brand.category}</span>
                                <div className="brand-stats">
                                    <div className="stat">
                                        <span className="stat-value">{followersCount.toLocaleString()}</span>
                                        <span className="stat-label">Followers</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-value">{brandVideos.length.toLocaleString()}</span>
                                        <span className="stat-label">Videos</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-value">{brand.totalSlicesReceived?.toLocaleString() || '0'}</span>
                                        <span className="stat-label">Slices Received</span>
                                    </div>
                                </div>
                            </div>
                            
                            <p className="brand-description">{brand.description}</p>
                            
                            {formattedSocialLinks.length > 0 && (
                                <div className="social-links">
                                    {formattedSocialLinks.map((social, index) => (
                                        <a
                                            key={index}
                                            href={social.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="social-link"
                                            title={social.platform}
                                        >
                                            <span className="social-icon">{social.icon}</span>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="brand-content">
                <div className="brand-tabs">
                    <button
                        className={`tab-button ${activeTab === 'videos' ? 'active' : ''}`}
                        onClick={() => setActiveTab('videos')}
                    >
                        Videos
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'followers' ? 'active' : ''}`}
                        onClick={() => setActiveTab('followers')}
                    >
                        Followers
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'about' ? 'active' : ''}`}
                        onClick={() => setActiveTab('about')}
                    >
                        About
                    </button>
                </div>
                
                <div className="brand-tab-content">
                    {activeTab === 'videos' && (
                        <div className="videos-tab">
                            <h2>Videos</h2>
                            {brandVideos.length === 0 ? (
                                <div className="no-content">
                                    <p>This brand hasn't uploaded any videos yet.</p>
                                </div>
                            ) : (
                                <div className="videos-grid">
                                    {brandVideos.map(video => (
                                        <VideoCard key={video._id} video={video} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    
                    {activeTab === 'followers' && (
                        <div className="followers-tab">
                            <h2>Followers</h2>
                            {followers.length === 0 ? (
                                <div className="no-content">
                                    <p>This brand doesn't have any followers yet.</p>
                                    {user && !isFollowing && (
                                        <button
                                            className="primary-button"
                                            onClick={handleFollow}
                                        >
                                            Be the first to follow
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="followers-grid">
                                    {followers.map(follower => (
                                        <UserFollowerCard key={follower._id} follower={follower} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    
                    {activeTab === 'about' && (
                        <div className="about-tab">
                            <h2>About {brand.name}</h2>
                            <div className="about-content">
                                <div className="about-section">
                                    <h3>Description</h3>
                                    <p>{brand.description || 'No description available.'}</p>
                                </div>
                                
                                <div className="about-section">
                                    <h3>Category</h3>
                                    <p>{brand.category}</p>
                                </div>
                                
                                {brand.tags && brand.tags.length > 0 && (
                                    <div className="about-section">
                                        <h3>Tags</h3>
                                        <div className="tags-container">
                                            {brand.tags.map((tag, index) => (
                                                <span key={index} className="tag">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {formattedSocialLinks.length > 0 && (
                                    <div className="about-section">
                                        <h3>Social Links</h3>
                                        <ul className="social-links-list">
                                            {formattedSocialLinks.map((social, index) => (
                                                <li key={index}>
                                                    <a
                                                        href={social.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <span className="social-icon">{social.icon}</span>
                                                        <span>{social.platform.charAt(0).toUpperCase() + social.platform.slice(1)}</span>
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                
                                <div className="about-section">
                                    <h3>Joined</h3>
                                    <p>{new Date(brand.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BrandPage;
