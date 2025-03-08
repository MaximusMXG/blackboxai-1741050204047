import React, { useState, useEffect } from 'react';
import VideoCard from '../components/common/VideoCard';
import { videoService } from '../services/api';
import '../styles/sections.css';

const CrowdfundingSection = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchCrowdfundingVideos = async () => {
            try {
                const response = await videoService.getByGenre('crowdfunding');
                setVideos(response.data);
            } catch (error) {
                console.error('Error fetching crowdfunding videos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCrowdfundingVideos();
    }, []);

    const filterOptions = [
        { value: 'all', label: 'All Projects' },
        { value: 'trending', label: 'Trending' },
        { value: 'new', label: 'Just Launched' },
        { value: 'ending', label: 'Ending Soon' }
    ];

    const filteredVideos = videos.filter(video => {
        if (filter === 'all') return true;
        return video.category === filter;
    });

    if (loading) {
        return (
            <div className="section-loading">
                <div className="loading-spinner"></div>
                <p>Loading crowdfunding projects...</p>
            </div>
        );
    }

    return (
        <div className="section-container">
            <div className="section-header">
                <h1>Support <span className="gradient-text">Creators</span></h1>
                <p>Help bring new projects to life through crowdfunding</p>
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
                {filteredVideos.length > 0 ? (
                    filteredVideos.map(video => (
                        <VideoCard
                            key={video._id}
                            video={video}
                            className="crowdfunding-card"
                        />
                    ))
                ) : (
                    <div className="no-content">
                        <p>No projects found in this category</p>
                    </div>
                )}
            </div>

            {filteredVideos.length === 0 && (
                <div className="no-content">
                    <p>No projects found in this category</p>
                </div>
            )}
        </div>
    );
};

export default CrowdfundingSection;
