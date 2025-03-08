import React, { useState, useEffect } from 'react';
import VideoCard from '../components/common/VideoCard';
import { api } from '../services/api';
import '../styles/sections.css';

const IndieSection = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchIndieVideos = async () => {
            try {
                const response = await api.get('/videos/indie');
                setVideos(response.data);
            } catch (error) {
                console.error('Error fetching indie videos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchIndieVideos();
    }, []);

    const filterOptions = [
        { value: 'all', label: 'All' },
        { value: 'trending', label: 'Trending' },
        { value: 'new', label: 'New Releases' },
        { value: 'top', label: 'Top Rated' }
    ];

    const filteredVideos = videos.filter(video => {
        if (filter === 'all') return true;
        return video.category === filter;
    });

    if (loading) {
        return (
            <div className="section-loading">
                <div className="loading-spinner"></div>
                <p>Loading indie content...</p>
            </div>
        );
    }

    return (
        <div className="section-container">
            <div className="section-header">
                <h1>Indie <span className="gradient-text">Gems</span></h1>
                <p>Discover and support independent creators</p>
            </div>

            <div className="filter-bar">
                {filterOptions.map(option => (
                    <button
                        key={option.value}
                        className={`filter-button ${filter === option.value ? 'active' : ''}`}
                        onClick={() => setFilter(option.value)}
                    >
                        <span>{option.label}</span>
                    </button>
                ))}
            </div>

            <div className="video-grid">
                {filteredVideos.map(video => (
                    <VideoCard
                        key={video.id}
                        video={video}
                        className="indie-card"
                    />
                ))}
            </div>

            {filteredVideos.length === 0 && (
                <div className="no-content">
                    <p>No videos found in this category</p>
                </div>
            )}
        </div>
    );
};

export default IndieSection;
