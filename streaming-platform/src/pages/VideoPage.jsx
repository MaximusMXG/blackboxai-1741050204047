import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import SliceAllocation from '../components/common/SliceAllocation';
import CustomVideoPlayer from '../components/video/CustomVideoPlayer';
import { api, videoService } from '../services/api';
import './videoPage.css';

const VideoPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [relatedVideos, setRelatedVideos] = useState([]);
    const [watchProgress, setWatchProgress] = useState(null);

    // Fetch video data and related videos
    const fetchVideoData = useCallback(async () => {
        try {
            setLoading(true);
            
            // Array of promises to wait for
            const promises = [
                api.get(`/videos/${id}`),
                api.get(`/videos/related/${id}`)
            ];
            
            // If user is logged in, also fetch watch history for this video
            if (user) {
                promises.push(videoService.getWatchProgress(id));
            }
            
            // Wait for all requests to complete
            const responses = await Promise.all(promises);
            
            const videoData = responses[0].data;
            const relatedVideosData = responses[1].data;
            
            // If we have watch progress data, add it to the video object
            if (user && responses.length > 2 && responses[2].data) {
                const progressData = responses[2].data;
                videoData.watchProgress = progressData.progress;
                setWatchProgress(progressData);
            }
            
            setVideo(videoData);
            setRelatedVideos(relatedVideosData);
        } catch (err) {
            setError('Failed to load video content');
            console.error('Error fetching video:', err);
        } finally {
            setLoading(false);
        }
    }, [id, user]);

    useEffect(() => {
        fetchVideoData();
    }, [fetchVideoData]);

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
                <CustomVideoPlayer
                    video={video}
                    onProgressUpdate={(progressData) => {
                        console.log('Video progress updated:', progressData);
                        // We don't need to do anything here as the component handles progress tracking
                    }}
                />

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
                        <Link
                            to={`/video/${relatedVideo._id}`}
                            key={relatedVideo.id}
                            className="related-video-card"
                        >
                            <img
                                src={relatedVideo.thumbnail_url}
                                alt={relatedVideo.title}
                                className="related-thumbnail"
                            />
                            <div className="related-info">
                                <h3>{relatedVideo.title}</h3>
                                <p>{relatedVideo.creator || relatedVideo.creator_name}</p>
                                <div className="related-stats">
                                    <span>{relatedVideo.views} views</span>
                                    <span>•</span>
                                    <span>{relatedVideo.duration}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default VideoPage;
