import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { videoService } from '../services/api';
import './videoPage.css'; // Assuming a separate CSS file for video page styles

const VideoPage = () => {
    const { id } = useParams();
    const [video, setVideo] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const response = await videoService.getById(id);
                setVideo(response);
            } catch (err) {
                setError('Error fetching video details');
            }
        };

        fetchVideo();
    }, [id]);

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (!video) {
        return <div>Loading...</div>;
    }

    return (
        <div className="video-page">
            <h1>{video.title}</h1>
            <h2>Created by: {video.creator}</h2>
            <img src={video.thumbnail_url} alt={video.title} />
            <p>{video.description}</p> {/* Assuming a description field exists */}
        </div>
    );
};

export default VideoPage;
