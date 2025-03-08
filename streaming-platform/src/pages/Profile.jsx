import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { userService } from '../services/api';
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
                        <h3>Your Slice Allocations</h3>
                        <div className="slice-grid">
                            {sliceAllocation.map((allocation) => (
                                <div key={allocation.id} className="slice-card">
                                    <div className="slice-info">
                                        <h4>{allocation.video_title}</h4>
                                        <p>Slices: {allocation.slices}</p>
                                    </div>
                                    <div className="slice-actions">
                                        <button className="btn-adjust">
                                            Adjust Slices
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
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
                <h2>Welcome, <span className="gradient-text">{user?.username}</span></h2>
                <p>Manage your subscriptions and account settings</p>
            </div>

            <div className="profile-tabs">
                <button 
                    className={`tab-button ${activeTab === 'subscriptions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('subscriptions')}
                >
                    <span>Subscriptions</span>
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
