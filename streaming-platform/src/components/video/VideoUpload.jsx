import React, { useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { videoService } from '../../services/api';
import './VideoUpload.css';

const VideoUpload = ({ onUploadSuccess, onCancel }) => {
    const { user } = useAuth();
    const [file, setFile] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState('');
    const [videoPreview, setVideoPreview] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [genre, setGenre] = useState('');
    const [tags, setTags] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState(0);
    const [step, setStep] = useState(1);
    const fileInputRef = useRef(null);
    const thumbnailInputRef = useRef(null);

    // Upload logic
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        if (!selectedFile.type.startsWith('video/')) {
            setError('Please select a valid video file');
            return;
        }

        setFile(selectedFile);
        setVideoPreview(URL.createObjectURL(selectedFile));
        setStep(2);
    };

    const handleThumbnailChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        if (!selectedFile.type.startsWith('image/')) {
            setError('Please select a valid image file for the thumbnail');
            return;
        }

        setThumbnail(selectedFile);
        setThumbnailPreview(URL.createObjectURL(selectedFile));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const droppedFile = files[0];
            
            if (droppedFile.type.startsWith('video/')) {
                setFile(droppedFile);
                setVideoPreview(URL.createObjectURL(droppedFile));
                setStep(2);
            } else {
                setError('Please drop a valid video file');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!file) {
            setError('Please select a video file');
            return;
        }
        
        if (!title || !genre) {
            setError('Title and genre are required');
            return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
            // In a real application, this would use a proper video upload API
            // with progress tracking and handling of large files
            
            // Create a FormData object for the API
            const formData = new FormData();
            formData.append('video', file);
            
            if (thumbnail) {
                formData.append('thumbnail', thumbnail);
            }
            
            // For demonstration purposes, simulate a video upload
            // Normally, you'd upload the file to a server or cloud storage
            
            let uploadedVideo = {
                title,
                description,
                genre,
                tags: tags.split(',').map(tag => tag.trim()),
                creator: user.username,
                creatorId: user.id,
                thumbnail_url: thumbnailPreview || 'https://picsum.photos/800/450',
                video_url: videoPreview,
                duration: '0:00', // This would be calculated from the actual video
                durationSeconds: 0,
                views: 0,
                featured: false
            };
            
            // Simulate progress updates
            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    const newProgress = prev + 5;
                    if (newProgress >= 100) {
                        clearInterval(progressInterval);
                        return 100;
                    }
                    return newProgress;
                });
            }, 300);
            
            // Simulate API request with delay
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // In a real app, you'd make an API call like this:
            const response = await videoService.create(uploadedVideo);
            
            // Clear interval just in case
            clearInterval(progressInterval);
            setProgress(100);
            
            // Call success callback with the uploaded video
            if (onUploadSuccess) {
                onUploadSuccess(response.data);
            }
            
        } catch (err) {
            console.error('Error uploading video:', err);
            setError('Failed to upload video. Please try again.');
            setProgress(0);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFile(null);
        setThumbnail(null);
        setThumbnailPreview('');
        setVideoPreview('');
        setTitle('');
        setDescription('');
        setGenre('');
        setTags('');
        setError(null);
        setProgress(0);
        setStep(1);
        
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
    };

    const handleCancel = () => {
        resetForm();
        if (onCancel) onCancel();
    };

    return (
        <div className="video-upload">
            <div className="upload-header">
                <h2>{step === 1 ? 'Upload New Video' : 'Video Details'}</h2>
                <button className="close-button" onClick={handleCancel}>×</button>
            </div>
            
            {error && (
                <div className="upload-error">
                    <p>{error}</p>
                    <button onClick={() => setError(null)}>Dismiss</button>
                </div>
            )}
            
            {step === 1 && (
                <div 
                    className="upload-drop-area" 
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current.click()}
                >
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange} 
                        accept="video/*" 
                        style={{ display: 'none' }}
                    />
                    <div className="upload-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                            <path d="M17 8l-5-5-5 5" />
                            <path d="M12 3v12" />
                        </svg>
                    </div>
                    <h3>Drag and drop your video here</h3>
                    <p>Or click to browse files</p>
                    <p className="upload-formats">Supported formats: MP4, MOV, AVI, WebM</p>
                </div>
            )}
            
            {step === 2 && (
                <form className="upload-form" onSubmit={handleSubmit}>
                    <div className="video-preview-container">
                        {videoPreview && (
                            <video 
                                src={videoPreview} 
                                className="video-preview" 
                                controls
                            />
                        )}
                    </div>
                    
                    <div className="upload-form-grid">
                        <div className="form-group">
                            <label>Video Title <span className="required">*</span></label>
                            <input 
                                type="text" 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter a descriptive title"
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Genre <span className="required">*</span></label>
                            <select 
                                value={genre}
                                onChange={(e) => setGenre(e.target.value)}
                                required
                            >
                                <option value="">Select Genre</option>
                                <option value="indie">Indie</option>
                                <option value="mainstream">Mainstream</option>
                                <option value="crowdfunding">Crowdfunding</option>
                            </select>
                        </div>
                        
                        <div className="form-group full-width">
                            <label>Description</label>
                            <textarea 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Tell viewers about your video"
                                rows="4"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Tags (comma separated)</label>
                            <input 
                                type="text" 
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="e.g., music, tutorial, gaming"
                            />
                        </div>
                        
                        <div className="form-group thumbnail-group">
                            <label>Thumbnail</label>
                            <div className="thumbnail-container">
                                {thumbnailPreview ? (
                                    <img 
                                        src={thumbnailPreview} 
                                        alt="Thumbnail preview" 
                                        className="thumbnail-preview" 
                                    />
                                ) : (
                                    <div className="thumbnail-placeholder">
                                        <p>No thumbnail selected</p>
                                    </div>
                                )}
                                <input 
                                    type="file" 
                                    ref={thumbnailInputRef}
                                    onChange={handleThumbnailChange} 
                                    accept="image/*" 
                                    style={{ display: 'none' }}
                                />
                                <button 
                                    type="button" 
                                    className="thumbnail-upload-btn"
                                    onClick={() => thumbnailInputRef.current.click()}
                                >
                                    {thumbnailPreview ? 'Change' : 'Upload'} Thumbnail
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {loading && (
                        <div className="upload-progress">
                            <div className="progress-bar">
                                <div 
                                    className="progress-fill" 
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <p>Uploading: {progress}%</p>
                        </div>
                    )}
                    
                    <div className="upload-actions">
                        <button 
                            type="button" 
                            className="cancel-button"
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="upload-button"
                            disabled={loading}
                        >
                            {loading ? 'Uploading...' : 'Upload Video'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default VideoUpload;