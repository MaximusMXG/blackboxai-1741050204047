import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { userService, videoService } from '../services/api';
import PizzaAvatar from '../components/common/PizzaAvatar';
import SliceHistory from '../components/user/SliceHistory';
import VideoCard from '../components/common/VideoCard';
import '../styles/profile.css';

const Profile = () => {
    const { user } = useAuth();
    const [sliceAllocation, setSliceAllocation] = useState([]);
    const [activeTab, setActiveTab] = useState('subscriptions');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (user?.id) {
                    const response = await userService.getSliceAllocation(user.id);
                    setSliceAllocation(response.data);
                }
            } catch (error) {
                console.error('Error fetching slice allocation:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user]);

    const renderContent = () => {
        switch (activeTab) {
            case 'subscriptions':
                return (
                    <div className="profile-subscriptions">
                        <h3>Videos You're Supporting</h3>
                        {sliceAllocation.length === 0 ? (
                            <div className="empty-state">
                                <p>You haven't allocated slices to any videos yet!</p>
                                <Link to="/" className="browse-videos-btn">Browse Videos</Link>
                            </div>
                        ) : (
                            <div className="videos-grid">
                                {sliceAllocation.map((allocation) => (
                                    <VideoCard
                                        key={allocation.video_id}
                                        video={{
                                            _id: allocation.video_id,
                                            title: allocation.video_title,
                                            creator: allocation.video_creator,
                                            thumbnail: allocation.video_thumbnail,
                                            user_slices: allocation.slices
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'slice-history':
                return (
                    <div className="profile-history">
                        <SliceHistory userId={user?.id} />
                    </div>
                );
            case 'settings':
                return (
                    <div className="profile-settings">
                        <h3>Account Settings</h3>
                        <form className="settings-form">
                            <div className="form-group">
                                <label>Username</label>
                                <input 
                                    type="text" 
                                    value={user?.username || ''} 
                                    disabled 
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input 
                                    type="email" 
                                    value={user?.email || ''} 
                                    disabled 
                                />
                            </div>
                            <div className="form-group">
                                <label>Change Password</label>
                                <input 
                                    type="password" 
                                    placeholder="New password" 
                                />
                            </div>
                            <button type="submit" className="btn-save">
                                Save Changes
                            </button>
                        </form>
                    </div>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return <div className="profile-loading">Loading...</div>;
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-avatar-container">
                    <PizzaAvatar
                        user={user}
                        size="large"
                        animated={true}
                    />
                </div>
                <div className="profile-info">
                    <h2>Welcome, <span className="gradient-text">{user?.username}</span></h2>
                    <p>Manage your subscriptions, slice history, and account settings</p>
                    <div className="user-stats">
                        <div className="stat">
                            <span className="value">{user?.slices || 0}</span>
                            <span className="label">Slices Available</span>
                        </div>
                        <div className="stat">
                            <span className="value">{sliceAllocation.length}</span>
                            <span className="label">Videos Supported</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="profile-tabs">
                <button
                    className={`tab-button ${activeTab === 'subscriptions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('subscriptions')}
                >
                    <span>My Videos</span>
                </button>
                <button
                    className={`tab-button ${activeTab === 'slice-history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('slice-history')}
                >
                    <span>Slice History</span>
                </button>
                <button
                    className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    <span>Settings</span>
                </button>
            </div>

            <div className="profile-content">
                {renderContent()}
            </div>
        </div>
    );
};

export default Profile;
