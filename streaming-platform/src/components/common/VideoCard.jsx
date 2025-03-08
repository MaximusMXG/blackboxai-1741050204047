import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import SliceAllocation from './SliceAllocation';
import '../../styles/videoCard.css';

const VideoCard = ({ video, className = '' }) => {
    const { user } = useAuth();

    return (
        <div className={`video-card ${className}`}>
            <Link to={`/video/${video.id}`} className="video-link">
                <img 
                    src={video.thumbnail_url} 
                    alt={video.title} 
                    className="video-thumbnail"
                />
                <div className="video-overlay">
                    <span className="play-icon">▶</span>
                </div>
            </Link>
            
            <div className="video-info">
                <Link to={`/video/${video.id}`} className="video-title-link">
                    <h3 className="video-title">{video.title}</h3>
                </Link>
                <p className="video-creator">{video.creator_name}</p>
                
                <div className="video-stats">
                    <span>{video.views} views</span>
                    <span>•</span>
                    <span>{video.duration}</span>
                </div>

                {user && (
                    <div className="video-actions">
                        <SliceAllocation 
                            videoId={video.id} 
                            currentSlices={video.user_slices || 0}
                        />
                    </div>
                )}

                {video.tags && video.tags.length > 0 && (
                    <div className="video-tags">
                        {video.tags.map((tag, index) => (
                            <span key={index} className="tag">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoCard;
