import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminApi';

const AdminVideos = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        pages: 1,
        total: 0
    });
    const [search, setSearch] = useState('');
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [genreFilter, setGenreFilter] = useState('');
    const [flaggedFilter, setFlaggedFilter] = useState(false);
    
    // Form state for editing video
    const [formState, setFormState] = useState({
        title: '',
        description: '',
        genre: '',
        tags: [],
        featured: false,
        flagged: false
    });

    useEffect(() => {
        fetchVideos();
    }, [pagination.page, genreFilter, flaggedFilter]);

    const fetchVideos = async (searchQuery = search) => {
        try {
            setLoading(true);
            const response = await adminService.getVideos(
                pagination.page, 
                20, 
                searchQuery, 
                genreFilter, 
                flaggedFilter
            );
            setVideos(response.data.videos);
            setPagination(response.data.pagination);
        } catch (err) {
            console.error('Error fetching videos:', err);
            setError('Failed to load videos. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchVideos(search);
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > pagination.pages) return;
        setPagination(prev => ({ ...prev, page: newPage }));
    };
    
    const handleGenreChange = (e) => {
        setGenreFilter(e.target.value);
        setPagination(prev => ({ ...prev, page: 1 }));
    };
    
    const handleFlaggedChange = (e) => {
        setFlaggedFilter(e.target.checked);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const openVideoModal = async (video) => {
        try {
            const response = await adminService.getVideoDetails(video._id);
            setSelectedVideo(response.data);
            setFormState({
                title: response.data.title,
                description: response.data.description,
                genre: response.data.genre,
                tags: response.data.tags ? response.data.tags : [],
                featured: response.data.featured,
                flagged: response.data.flagged
            });
            setModalOpen(true);
        } catch (err) {
            console.error('Error fetching video details:', err);
            setError('Failed to load video details. Please try again.');
        }
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedVideo(null);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name === 'tags') {
            // Handle tags as array
            setFormState(prev => ({
                ...prev,
                [name]: value.split(',').map(tag => tag.trim())
            }));
        } else {
            setFormState(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleUpdateVideo = async () => {
        try {
            await adminService.updateVideo(selectedVideo._id, formState);
            
            // Update video in the local state
            setVideos(prevVideos => 
                prevVideos.map(video => 
                    video._id === selectedVideo._id 
                        ? { ...video, ...formState } 
                        : video
                )
            );
            
            closeModal();
        } catch (err) {
            console.error('Error updating video:', err);
            setError('Failed to update video. Please try again.');
        }
    };

    const handleDeleteVideo = async () => {
        if (!window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
            return;
        }
        
        try {
            await adminService.deleteVideo(selectedVideo._id);
            
            // Remove video from the local state
            setVideos(prevVideos => 
                prevVideos.filter(video => video._id !== selectedVideo._id)
            );
            
            closeModal();
        } catch (err) {
            console.error('Error deleting video:', err);
            setError('Failed to delete video. Please try again.');
        }
    };

    // Helper to format view count
    const formatViews = (views) => {
        if (views >= 1000000) {
            return (views / 1000000).toFixed(1) + 'M';
        } else if (views >= 1000) {
            return (views / 1000).toFixed(1) + 'K';
        }
        return views;
    };

    if (loading && videos.length === 0) {
        return (
            <div className="admin-loading">
                <div className="admin-loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="admin-videos">
            <h2>Video Management</h2>
            
            {error && (
                <div className="admin-error">
                    <p>{error}</p>
                </div>
            )}
            
            <div className="admin-filters">
                <form className="admin-search" onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="Search videos..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button type="submit" className="admin-btn admin-btn-primary">
                        Search
                    </button>
                </form>
                
                <div className="admin-filter">
                    <select 
                        className="admin-filter-select"
                        value={genreFilter}
                        onChange={handleGenreChange}
                    >
                        <option value="">All Genres</option>
                        <option value="indie">Indie</option>
                        <option value="mainstream">Mainstream</option>
                        <option value="crowdfunding">Crowdfunding</option>
                    </select>
                </div>
                
                <div className="admin-filter">
                    <label>
                        <input 
                            type="checkbox" 
                            checked={flaggedFilter}
                            onChange={handleFlaggedChange}
                        />
                        Flagged Content Only
                    </label>
                </div>
            </div>
            
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Creator</th>
                            <th>Genre</th>
                            <th>Views</th>
                            <th>Status</th>
                            <th>Published</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {videos.map(video => (
                            <tr key={video._id}>
                                <td>{video.title}</td>
                                <td>{video.creator}</td>
                                <td>
                                    <span className={`admin-status admin-status-${video.genre}`}>
                                        {video.genre}
                                    </span>
                                </td>
                                <td>{formatViews(video.views)}</td>
                                <td>
                                    {video.flagged ? (
                                        <span className="admin-status admin-status-flagged">
                                            Flagged
                                        </span>
                                    ) : video.featured ? (
                                        <span className="admin-status admin-status-featured">
                                            Featured
                                        </span>
                                    ) : (
                                        <span className="admin-status admin-status-active">
                                            Active
                                        </span>
                                    )}
                                </td>
                                <td>{new Date(video.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <div className="admin-actions">
                                        <button 
                                            className="admin-btn admin-btn-primary"
                                            onClick={() => openVideoModal(video)}
                                        >
                                            Edit
                                        </button>
                                        <a 
                                            href={`/video/${video._id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="admin-btn admin-btn-secondary"
                                        >
                                            View
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {videos.length === 0 && (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center' }}>
                                    No videos found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            <div className="admin-pagination">
                <button 
                    onClick={() => handlePageChange(1)}
                    disabled={pagination.page === 1}
                >
                    First
                </button>
                <button 
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                >
                    Previous
                </button>
                
                <span className="admin-pagination-info">
                    Page {pagination.page} of {pagination.pages} 
                    ({pagination.total} total videos)
                </span>
                
                <button 
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                >
                    Next
                </button>
                <button 
                    onClick={() => handlePageChange(pagination.pages)}
                    disabled={pagination.page === pagination.pages}
                >
                    Last
                </button>
            </div>
            
            {/* Video Edit Modal */}
            {modalOpen && selectedVideo && (
                <div className="admin-modal-backdrop" onClick={closeModal}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h2 className="admin-modal-title">
                                Edit Video
                            </h2>
                            <button className="admin-modal-close" onClick={closeModal}>×</button>
                        </div>
                        
                        <div className="admin-modal-body">
                            <div className="admin-video-preview">
                                <img 
                                    src={selectedVideo.thumbnail_url} 
                                    alt={selectedVideo.title}
                                    className="admin-video-thumbnail"
                                />
                                <div className="admin-video-stats">
                                    <div><strong>Views:</strong> {formatViews(selectedVideo.views)}</div>
                                    <div><strong>Creator:</strong> {selectedVideo.creator}</div>
                                    <div><strong>Duration:</strong> {selectedVideo.duration}</div>
                                </div>
                            </div>
                            
                            <form className="admin-form">
                                <div className="admin-form-group">
                                    <label className="admin-form-label">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        className="admin-form-input"
                                        value={formState.title}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                
                                <div className="admin-form-group">
                                    <label className="admin-form-label">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        className="admin-form-textarea"
                                        value={formState.description}
                                        onChange={handleInputChange}
                                        rows="4"
                                    />
                                </div>
                                
                                <div className="admin-form-group">
                                    <label className="admin-form-label">
                                        Genre
                                    </label>
                                    <select
                                        name="genre"
                                        className="admin-form-select"
                                        value={formState.genre}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select Genre</option>
                                        <option value="indie">Indie</option>
                                        <option value="mainstream">Mainstream</option>
                                        <option value="crowdfunding">Crowdfunding</option>
                                    </select>
                                </div>
                                
                                <div className="admin-form-group">
                                    <label className="admin-form-label">
                                        Tags (comma separated)
                                    </label>
                                    <input
                                        type="text"
                                        name="tags"
                                        className="admin-form-input"
                                        value={formState.tags.join(', ')}
                                        onChange={handleInputChange}
                                        placeholder="tag1, tag2, tag3"
                                    />
                                </div>
                                
                                <div className="admin-form-group">
                                    <label className="admin-form-label">
                                        <input
                                            type="checkbox"
                                            name="featured"
                                            checked={formState.featured}
                                            onChange={handleInputChange}
                                        />
                                        Featured Video
                                    </label>
                                </div>
                                
                                <div className="admin-form-group">
                                    <label className="admin-form-label">
                                        <input
                                            type="checkbox"
                                            name="flagged"
                                            checked={formState.flagged}
                                            onChange={handleInputChange}
                                        />
                                        Flag Content (for inappropriate or reported content)
                                    </label>
                                </div>
                            </form>
                        </div>
                        
                        <div className="admin-modal-footer">
                            <button 
                                className="admin-btn admin-btn-danger" 
                                onClick={handleDeleteVideo}
                            >
                                Delete Video
                            </button>
                            <button className="admin-btn admin-btn-secondary" onClick={closeModal}>
                                Cancel
                            </button>
                            <button className="admin-btn admin-btn-primary" onClick={handleUpdateVideo}>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVideos;