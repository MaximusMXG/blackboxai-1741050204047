import { useState } from 'react';
import { FaPlay, FaInfoCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import SliceAllocation from './SliceAllocation';

const VideoCard = ({ video, userId }) => {
    const [showDetails, setShowDetails] = useState(false);

    const handleAllocationChange = (newSlices) => {
        console.log(`Updated allocation for video ${video._id}: ${newSlices} slices`);
    };

    return (
        <div className="video-card card">
            <div style={{ 
                aspectRatio: '16/9',
                backgroundColor: '#2a2a2a',
                position: 'relative',
                cursor: 'pointer'
            }} onClick={() => setShowDetails(!showDetails)}>
                {video.thumbnail_url && (
                    <img 
                        src={video.thumbnail_url} 
                        alt={video.title}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />
                )}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '4rem 1rem 1rem',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)'
                }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>
                        <Link to={`/videos/${video._id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                            {video.title}
                        </Link>
                    </h3>
                    <div style={{ 
                        display: 'flex', 
                        gap: '0.5rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.875rem'
                    }}>
                        <span>{video.genre}</span>
                        <span>•</span>
                        <span>{video.creator}</span>
                    </div>
                </div>
            </div>

            {showDetails && (
                <div className="video-details">
                    <div className="video-actions">
                        <button className="btn-primary btn-sm">
                            <FaPlay style={{ marginRight: '0.5rem' }} />
                            Play
                        </button>
                        <button className="btn-secondary btn-sm">
                            <FaInfoCircle style={{ marginRight: '0.5rem' }} />
                            Info
                        </button>
                    </div>
                    
                    {userId && (
                        <SliceAllocation 
                            userId={userId}
                            videoId={video._id}
                            onAllocationChange={handleAllocationChange}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default VideoCard;
