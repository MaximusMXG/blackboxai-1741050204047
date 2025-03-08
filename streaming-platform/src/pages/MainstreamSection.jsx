import React, { useState, useEffect } from 'react';
import VideoCard from '../components/common/VideoCard';
import { api } from '../services/api';
import '../styles/sections.css';

const MainstreamSection = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchMainstreamVideos = async () => {
            try {
                const response = await api.get('/videos/mainstream');
                setVideos(response.data);
            } catch (error) {
                console.error('Error fetching mainstream videos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMainstreamVideos();
    }, []);

    const filterOptions = [
        { value: 'all', label: 'All' },
        { value: 'movies', label: 'Movies' },
        { value: 'series', label: 'TV Series' },
        { value: 'popular', label: 'Most Popular' }
    ];

    const filteredVideos = videos.filter(video => {
        if (filter === 'all') return true;
        return video.category === filter;
    });

    if (loading) {
        return (
            <div className="section-loading">
                <div className="loading-spinner"></div>
                <p>Loading mainstream content...</p>
            </div>
        );
    }

    return (
        <div className="section-container">
            <div className="section-header">
                <h1>Mainstream <span className="gradient-text">Hits</span></h1>
                <p>Watch the latest blockbusters and trending shows</p>
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
                        className="mainstream-card"
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

export default MainstreamSection;
