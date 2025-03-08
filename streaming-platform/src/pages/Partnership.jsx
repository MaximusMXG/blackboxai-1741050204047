import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { api } from '../services/api';
import '../styles/Partnership.css';

const Partnership = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        channelName: '',
        description: '',
        socialLinks: '',
        contentType: 'indie',
        uploadFrequency: 'weekly'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await api.post('/partnerships/apply', {
                ...formData,
                userId: user.id
            });
            setSuccess(true);
            setFormData({
                channelName: '',
                description: '',
                socialLinks: '',
                contentType: 'indie',
                uploadFrequency: 'weekly'
            });
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit application');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="partnership-container">
            <div className="partnership-header">
                <h1>Become a <span className="gradient-text">Partner</span></h1>
                <p>Join our community of content creators and start earning from your content</p>
            </div>

            <div className="partnership-content">
                <div className="benefits-section">
                    <h2>Why Partner With Us?</h2>
                    <div className="benefits-grid">
                        <div className="benefit-card">
                            <div className="benefit-icon">💰</div>
                            <h3>Fair Revenue Share</h3>
                            <p>Earn more from your content with our slice-based revenue model</p>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon">🎯</div>
                            <h3>Target Your Audience</h3>
                            <p>Connect with viewers who value your content</p>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon">📊</div>
                            <h3>Analytics Dashboard</h3>
                            <p>Track your performance with detailed insights</p>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon">🤝</div>
                            <h3>Community Support</h3>
                            <p>Join a network of creators and grow together</p>
                        </div>
                    </div>
                </div>

                <div className="application-section">
                    <h2>Apply Now</h2>
                    <form onSubmit={handleSubmit} className="partnership-form">
                        <div className="form-group">
                            <label htmlFor="channelName">Channel Name</label>
                            <input
                                type="text"
                                id="channelName"
                                name="channelName"
                                value={formData.channelName}
                                onChange={handleChange}
                                required
                                placeholder="Your channel name"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Channel Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                placeholder="Tell us about your content"
                                rows="4"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="socialLinks">Social Media Links</label>
                            <input
                                type="text"
                                id="socialLinks"
                                name="socialLinks"
                                value={formData.socialLinks}
                                onChange={handleChange}
                                placeholder="Your social media links (comma separated)"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="contentType">Content Type</label>
                                <select
                                    id="contentType"
                                    name="contentType"
                                    value={formData.contentType}
                                    onChange={handleChange}
                                >
                                    <option value="indie">Indie</option>
                                    <option value="mainstream">Mainstream</option>
                                    <option value="educational">Educational</option>
                                    <option value="entertainment">Entertainment</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="uploadFrequency">Upload Frequency</label>
                                <select
                                    id="uploadFrequency"
                                    name="uploadFrequency"
                                    value={formData.uploadFrequency}
                                    onChange={handleChange}
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>
                        </div>

                        {error && <div className="error-message">{error}</div>}
                        {success && (
                            <div className="success-message">
                                Application submitted successfully! We'll review your application and get back to you soon.
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className="submit-button"
                            disabled={loading}
                        >
                            <span>
                                {loading ? 'Submitting...' : 'Submit Application'}
                            </span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Partnership;
