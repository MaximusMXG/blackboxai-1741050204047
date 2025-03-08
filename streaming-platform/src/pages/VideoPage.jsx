import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import SliceAllocation from '../components/common/SliceAllocation';
import { api } from '../services/api';
import './videoPage.css';

const VideoPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [relatedVideos, setRelatedVideos] = useState([]);

    useEffect(() => {
        const fetchVideoData = async () => {
            try {
                setLoading(true);
                const [videoResponse, relatedResponse] = await Promise.all([
                    api.get(`/videos/${id}`),
                    api.get(`/videos/related/${id}`)
                ]);
                setVideo(videoResponse.data);
                setRelatedVideos(relatedResponse.data);
            } catch (err) {
                setError('Failed to load video content');
                console.error('Error fetching video:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchVideoData();
    }, [id]);

    if (loading) {
        return (
            <div className="video-page-loading">
                <div className="loading-spinner"></div>
                <p>Loading video...</p>
            </div>
        );
    }

    if (error || !video) {
        return (
            <div className="video-page-error">
                <p>{error || 'Video not found'}</p>
            </div>
        );
    }

    return (
        <div className="video-page">
            <div className="video-main">
                <div className="video-player-container">
                    <div className="video-player">
                        <video 
                            src={video.video_url} 
                            controls 
                            poster={video.thumbnail_url}
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </div>

                <div className="video-details">
                    <h1 className="video-title">{video.title}</h1>
                    
                    <div className="video-meta">
                        <div className="creator-info">
                            <img 
                                src={video.creator_avatar} 
                                alt={video.creator_name}
                                className="creator-avatar"
                            />
                            <div className="creator-details">
                                <h3>{video.creator_name}</h3>
                                <p>{video.creator_subscribers} subscribers</p>
                            </div>
                        </div>

                        {user && (
                            <div className="video-actions">
                                <SliceAllocation 
                                    videoId={video.id}
                                    currentSlices={video.user_slices || 0}
                                />
                            </div>
                        )}
                    </div>

                    <div className="video-description">
                        <div className="stats">
                            <span>{video.views} views</span>
                            <span>•</span>
                            <span>{video.upload_date}</span>
                        </div>
                        <p>{video.description}</p>
                        
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
            </div>

            <div className="related-videos">
                <h2>Related Videos</h2>
                <div className="related-videos-grid">
                    {relatedVideos.map(relatedVideo => (
                        <div key={relatedVideo.id} className="related-video-card">
                            <img 
                                src={relatedVideo.thumbnail_url} 
                                alt={relatedVideo.title}
                                className="related-thumbnail"
                            />
                            <div className="related-info">
                                <h3>{relatedVideo.title}</h3>
                                <p>{relatedVideo.creator_name}</p>
                                <div className="related-stats">
                                    <span>{relatedVideo.views} views</span>
                                    <span>•</span>
                                    <span>{relatedVideo.duration}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default VideoPage;
