import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import PizzaSliceAllocator from './PizzaSliceAllocator';
import '../../styles/videoCard.css';

const VideoCard = ({ video, className = '', progress }) => {
    const { user } = useAuth();
    
    // Calculate percent watched if progress is provided
    const getWatchProgress = () => {
        if (!progress || !video.durationSeconds) return 0;
        
        const percent = Math.min((progress / video.durationSeconds) * 100, 100);
        return percent;
    };

    // Format view count with K, M suffixes
    const formatViewCount = (views) => {
        if (!views) return '0 views';
        
        if (views >= 1000000) {
            return `${(views / 1000000).toFixed(1)}M views`;
        } else if (views >= 1000) {
            return `${(views / 1000).toFixed(1)}K views`;
        } else {
            return `${views} views`;
        }
    };

    // Get a genre badge class
    const getGenreBadgeClass = () => {
        if (!video.genre) return '';
        
        switch(video.genre.toLowerCase()) {
            case 'indie': return 'genre-badge-indie';
            case 'mainstream': return 'genre-badge-mainstream';
            case 'crowdfunding': return 'genre-badge-crowdfunding';
            default: return '';
        }
    };

    return (
        <div className={`video-card ${className} ${getGenreBadgeClass()}`}>
            <div className="video-card-inner">
                <Link to={`/video/${video._id}`} className="video-link">
                    <div className="thumbnail-container">
                        <img
                            src={video.thumbnail_url}
                            alt={video.title}
                            className="video-thumbnail"
                            loading="lazy"
                        />
                        <div className="video-overlay">
                            <span className="play-icon">▶</span>
                        </div>
                        <span className="video-duration">{video.duration || '0:00'}</span>
                        {progress > 0 && (
                            <div className="video-progress-container">
                                <div
                                    className="video-progress"
                                    style={{ width: `${getWatchProgress()}%` }}
                                ></div>
                            </div>
                        )}
                    </div>
                </Link>
                
                <div className="video-info">
                    <Link to={`/video/${video._id}`} className="video-title-link">
                        <h3 className="video-title">{video.title}</h3>
                    </Link>
                    <p className="video-creator">{video.creator}</p>
                    
                    <div className="video-stats">
                        <span className="view-count">{formatViewCount(video.views)}</span>
                        <span className="stat-divider">•</span>
                        <span className="genre-badge">{video.genre || 'Unknown'}</span>
                    </div>

                    {user && (
                        <div className="video-actions">
                            <PizzaSliceAllocator
                                videoId={video._id}
                                currentSlices={video.user_slices || 0}
                            />
                        </div>
                    )}

                    {video.tags && video.tags.length > 0 && (
                        <div className="video-tags">
                            {video.tags.slice(0, 3).map((tag, index) => (
                                <span key={index} className="tag">
                                    #{tag}
                                </span>
                            ))}
                            {video.tags.length > 3 && (
                                <span className="tag more-tags">+{video.tags.length - 3}</span>
                            )}
                        </div>
                    )}
                    
                    {video.featured && (
                        <div className="featured-badge">
                            <span>⭐ Featured</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoCard;
