import React, { useState, useEffect } from 'react';
import VideoCard from '../components/common/VideoCard';
import { api } from '../services/api';
import '../styles/sections.css';

const CrowdfundingSection = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchCrowdfundingProjects = async () => {
            try {
                const response = await api.get('/videos/crowdfunding');
                setProjects(response.data);
            } catch (error) {
                console.error('Error fetching crowdfunding projects:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCrowdfundingProjects();
    }, []);

    const filterOptions = [
        { value: 'all', label: 'All Projects' },
        { value: 'trending', label: 'Trending' },
        { value: 'new', label: 'Just Launched' },
        { value: 'ending', label: 'Ending Soon' }
    ];

    const filteredProjects = projects.filter(project => {
        if (filter === 'all') return true;
        return project.category === filter;
    });

    const calculateProgress = (project) => {
        const progress = (project.current_amount / project.goal_amount) * 100;
        return Math.min(progress, 100);
    };

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
                {filteredProjects.map(project => (
                    <div key={project.id} className="crowdfunding-card">
                        <img 
                            src={project.thumbnail_url} 
                            alt={project.title}
                            className="video-thumbnail"
                        />
                        <div className="video-info">
                            <h3 className="video-title">{project.title}</h3>
                            <p className="video-creator">by {project.creator_name}</p>
                            <p className="project-description">{project.description}</p>
                            
                            <div className="funding-progress">
                                <div className="progress-bar">
                                    <div 
                                        className="progress-fill"
                                        style={{ width: `${calculateProgress(project)}%` }}
                                    ></div>
                                </div>
                                <div className="funding-stats">
                                    <span>${project.current_amount} raised</span>
                                    <span>{calculateProgress(project)}%</span>
                                    <span>{project.days_left} days left</span>
                                </div>
                            </div>

                            <button className="support-button">
                                <span>Support Project</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredProjects.length === 0 && (
                <div className="no-content">
                    <p>No projects found in this category</p>
                </div>
            )}
        </div>
    );
};

export default CrowdfundingSection;
