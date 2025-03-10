import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { videoService, userService } from '../services/api';
import VideoCard from '../components/common/VideoCard';
import { useAuth } from '../hooks/useAuth';
import '../styles/home.css';

const Home = () => {
    const { user } = useAuth();
    const [featuredVideos, setFeaturedVideos] = useState([]);
    const [indieVideos, setIndieVideos] = useState([]);
    const [mainstreamVideos, setMainstreamVideos] = useState([]);
    const [crowdfundingVideos, setCrowdfundingVideos] = useState([]);
    const [recommendedVideos, setRecommendedVideos] = useState([]);
    const [watchHistory, setWatchHistory] = useState([]);
    const [trendingVideos, setTrendingVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastRefreshed, setLastRefreshed] = useState(null);

    // Create mock data for development and fallback
    const mockVideos = [
        {
            _id: 'mock1',
            title: 'Exploring Nature',
            creator: 'NatureChannel',
            thumbnail_url: 'https://picsum.photos/300/200?random=1',
            views: 15000,
            duration: '15:30',
            durationSeconds: 930,
            genre: 'indie',
            featured: true,
            tags: ['nature', 'exploration', 'documentary']
        },
        {
            _id: 'mock2',
            title: 'Urban Photography',
            creator: 'UrbanLens',
            thumbnail_url: 'https://picsum.photos/300/200?random=2',
            views: 8500,
            duration: '10:45',
            durationSeconds: 645,
            genre: 'indie',
            tags: ['photography', 'urban', 'art']
        },
        {
            _id: 'mock3',
            title: 'Modern Architecture',
            creator: 'DesignStudio',
            thumbnail_url: 'https://picsum.photos/300/200?random=3',
            views: 12000,
            duration: '18:20',
            durationSeconds: 1100,
            genre: 'mainstream',
            tags: ['architecture', 'design', 'modern']
        },
        {
            _id: 'mock4',
            title: 'Tech Startup Journey',
            creator: 'TechFounders',
            thumbnail_url: 'https://picsum.photos/300/200?random=4',
            views: 5200,
            duration: '22:10',
            durationSeconds: 1330,
            genre: 'crowdfunding',
            featured: true,
            tags: ['startup', 'technology', 'entrepreneurship']
        }
    ];

    const refreshData = async () => {
        setIsRefreshing(true);
        setError(null);
        await fetchVideos();
        setLastRefreshed(new Date());
        setIsRefreshing(false);
    };

    const fetchVideos = async () => {
        try {
            setLoading(true);
            // Array for successful responses
            const responses = [];
            let featuredResp, indieResp, mainstreamResp, crowdfundingResp, trendingResp, recommendedResp, historyResp;
            
            try {
                featuredResp = await videoService.getFeatured();
                responses.push(featuredResp);
                setFeaturedVideos(featuredResp.data.length ? featuredResp.data : mockVideos.filter(v => v.featured));
            } catch (e) {
                console.warn('Failed to fetch featured videos, using fallback data');
                setFeaturedVideos(mockVideos.filter(v => v.featured));
            }
            
            try {
                indieResp = await videoService.getByGenre('indie');
                responses.push(indieResp);
                setIndieVideos(indieResp.data.length ? indieResp.data : mockVideos.filter(v => v.genre === 'indie'));
            } catch (e) {
                console.warn('Failed to fetch indie videos, using fallback data');
                setIndieVideos(mockVideos.filter(v => v.genre === 'indie'));
            }
            
            try {
                mainstreamResp = await videoService.getByGenre('mainstream');
                responses.push(mainstreamResp);
                setMainstreamVideos(mainstreamResp.data.length ? mainstreamResp.data : mockVideos.filter(v => v.genre === 'mainstream'));
            } catch (e) {
                console.warn('Failed to fetch mainstream videos, using fallback data');
                setMainstreamVideos(mockVideos.filter(v => v.genre === 'mainstream'));
            }
            
            try {
                crowdfundingResp = await videoService.getByGenre('crowdfunding');
                responses.push(crowdfundingResp);
                setCrowdfundingVideos(crowdfundingResp.data.length ? crowdfundingResp.data : mockVideos.filter(v => v.genre === 'crowdfunding'));
            } catch (e) {
                console.warn('Failed to fetch crowdfunding videos, using fallback data');
                setCrowdfundingVideos(mockVideos.filter(v => v.genre === 'crowdfunding'));
            }
            
            try {
                trendingResp = await videoService.getTrending();
                responses.push(trendingResp);
                setTrendingVideos(trendingResp.data.length ? trendingResp.data : mockVideos);
            } catch (e) {
                console.warn('Failed to fetch trending videos, using fallback data');
                setTrendingVideos(mockVideos);
            }
            
            // If user is logged in, also fetch recommended videos and watch history
            if (user) {
                try {
                    recommendedResp = await userService.getRecommendedVideos();
                    responses.push(recommendedResp);
                    setRecommendedVideos(recommendedResp.data.length ? recommendedResp.data : mockVideos);
                } catch (e) {
                    console.warn('Failed to fetch recommended videos, using fallback data');
                    setRecommendedVideos(mockVideos);
                }
                
                try {
                    historyResp = await userService.getWatchHistory();
                    responses.push(historyResp);
                    if (historyResp.data.length) {
                        setWatchHistory(historyResp.data.slice(0, 4)); // Show only most recent 4
                    } else {
                        // Create mock watch history
                        setWatchHistory(mockVideos.map(video => ({
                            videoId: video._id,
                            title: video.title,
                            creator: video.creator,
                            thumbnail: video.thumbnail_url,
                            duration: video.duration,
                            durationSeconds: video.durationSeconds,
                            genre: video.genre,
                            progress: Math.floor(Math.random() * 100)
                        })).slice(0, 4));
                    }
                } catch (e) {
                    console.warn('Failed to fetch watch history, using fallback data');
                    // Create mock watch history
                    setWatchHistory(mockVideos.map(video => ({
                        videoId: video._id,
                        title: video.title,
                        creator: video.creator,
                        thumbnail: video.thumbnail_url,
                        duration: video.duration,
                        durationSeconds: video.durationSeconds,
                        genre: video.genre,
                        progress: Math.floor(Math.random() * 100)
                    })).slice(0, 4));
                }
            }
        } catch (error) {
            console.error('Error fetching videos:', error);
            setError('Failed to load content. Please try again later.');
            // Set fallback data
            setFeaturedVideos(mockVideos.filter(v => v.featured));
            setIndieVideos(mockVideos.filter(v => v.genre === 'indie'));
            setMainstreamVideos(mockVideos.filter(v => v.genre === 'mainstream'));
            setCrowdfundingVideos(mockVideos.filter(v => v.genre === 'crowdfunding'));
            setTrendingVideos(mockVideos);
            setRecommendedVideos(mockVideos);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, [user]);

    return (
        <div className="home-container">
            <div className="hero-section">
                <h1 className="home-title">Your Entertainment, Sliced Just Right</h1>
                <p className="home-description">
                    Stream mainstream hits, discover indie gems, and support upcoming projects. All in one perfectly curated slice.
                </p>
                <div className="hero-buttons">
                    <Link to="/browse" className="btn-primary">Start Watching</Link>
                    <Link to="/admin" className="btn-admin">Admin Panel</Link>
                </div>
                
                {/* Schema Management Link */}
                <div className="admin-tools">
                    <Link to="/api/schema/status" target="_blank" className="schema-link">
                        Database Schema
                    </Link>
                </div>
            </div>
            
            {/* Error message */}
            {error && (
                <div className="error-container">
                    <p className="error-message">{error}</p>
                    <button
                        className="btn-primary refresh-button"
                        onClick={refreshData}
                        disabled={isRefreshing}
                    >
                        {isRefreshing ? 'Refreshing...' : 'Try Again'}
                    </button>
                </div>
            )}
            
            {/* Last refreshed timestamp */}
            {lastRefreshed && !error && (
                <div className="refresh-info">
                    <p>Last updated: {lastRefreshed.toLocaleTimeString()}</p>
                    <button
                        className="btn-secondary refresh-button"
                        onClick={refreshData}
                        disabled={isRefreshing || loading}
                    >
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
            )}

            {loading ? (
                <div className="loading-container">
                    <div className="loader"></div>
                    <p>Loading content...</p>
                </div>
            ) : (
                <>
                    {/* User-specific sections only shown when logged in */}
                    {user && (
                        <>
                            {/* Watch History Section */}
                            {watchHistory.length > 0 && (
                                <section className="videos-section">
                                    <div className="section-header">
                                        <h2>Continue Watching</h2>
                                        <Link to="/profile" className="view-all-link">View All</Link>
                                    </div>
                                    <div className="videos-grid">
                                        {watchHistory.map(item => (
                                            <VideoCard
                                                key={item.videoId}
                                                video={{
                                                    _id: item.videoId,
                                                    title: item.title,
                                                    creator: item.creator,
                                                    thumbnail_url: item.thumbnail,
                                                    genre: item.genre,
                                                    duration: item.duration,
                                                    durationSeconds: item.durationSeconds
                                                }}
                                                progress={item.progress || 0}
                                            />
                                        ))}
                                    </div>
                                </section>
                            )}
                            
                            {/* Recommended Videos Section */}
                            {recommendedVideos.length > 0 && (
                                <section className="videos-section">
                                    <div className="section-header">
                                        <h2>Recommended For You</h2>
                                    </div>
                                    <div className="videos-grid">
                                        {recommendedVideos.slice(0, 4).map(video => (
                                            <VideoCard key={video._id} video={video} />
                                        ))}
                                    </div>
                                </section>
                            )}
                        </>
                    )}

                    {/* Trending Videos Section */}
                    {trendingVideos.length > 0 && (
                        <section className="videos-section">
                            <div className="section-header">
                                <h2>Trending Now</h2>
                            </div>
                            <div className="videos-grid">
                                {trendingVideos.slice(0, 4).map(video => (
                                    <VideoCard key={video._id} video={video} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Featured Videos Section */}
                    {featuredVideos.length > 0 && (
                        <section className="videos-section">
                            <div className="section-header">
                                <h2>Featured Content</h2>
                                <p>Specially curated for Slice viewers</p>
                            </div>
                            <div className="featured-videos-grid">
                                {featuredVideos.map(video => (
                                    <VideoCard key={video._id} video={video} className="featured-card" />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Indie Videos Section */}
                    {indieVideos.length > 0 && (
                        <section className="videos-section">
                            <div className="section-header">
                                <h2>Indie Picks</h2>
                                <Link to="/indie" className="view-all-link">View All</Link>
                            </div>
                            <div className="videos-grid">
                                {indieVideos.slice(0, 4).map(video => (
                                    <VideoCard key={video._id} video={video} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Mainstream Videos Section */}
                    {mainstreamVideos.length > 0 && (
                        <section className="videos-section">
                            <div className="section-header">
                                <h2>Mainstream Content</h2>
                                <Link to="/mainstream" className="view-all-link">View All</Link>
                            </div>
                            <div className="videos-grid">
                                {mainstreamVideos.slice(0, 4).map(video => (
                                    <VideoCard key={video._id} video={video} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Crowdfunding Section */}
                    {crowdfundingVideos.length > 0 && (
                        <section className="videos-section">
                            <div className="section-header">
                                <h2>Support New Projects</h2>
                                <Link to="/crowdfunding" className="view-all-link">View All</Link>
                            </div>
                            <div className="videos-grid">
                                {crowdfundingVideos.slice(0, 4).map(video => (
                                    <VideoCard key={video._id} video={video} />
                                ))}
                            </div>
                        </section>
                    )}
                </>
            )}
        </div>
    );
};

export default Home;
