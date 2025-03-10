import React, { createContext, useState, useEffect, useCallback } from 'react';
import { api, userService } from '../services/api';

// Create the context
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
    const [theme, setTheme] = useState('system');
    const [watchHistory, setWatchHistory] = useState([]);

    // Load theme from user preferences if available, otherwise use system default
    useEffect(() => {
        if (user?.preferences?.theme) {
            setTheme(user.preferences.theme);
        } else {
            // Check system preference
            const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(prefersDarkMode ? 'dark' : 'light');
        }
    }, [user]);

    // Apply theme
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await userService.getProfile();
                setUser(response.data);
                
                // Load notifications and watch history
                fetchNotifications();
                fetchWatchHistory();
            }
        } catch (err) {
            console.error('Auth check failed:', err);
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchNotifications = async () => {
        if (!localStorage.getItem('token')) return;
        
        try {
            const response = await userService.getNotifications();
            setNotifications(response.data);
            
            // Count unread notifications
            const unreadCount = response.data.filter(notification => !notification.read).length;
            setUnreadNotificationsCount(unreadCount);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    };

    const fetchWatchHistory = async () => {
        if (!localStorage.getItem('token')) return;
        
        try {
            const response = await userService.getWatchHistory();
            setWatchHistory(response.data);
        } catch (err) {
            console.error('Failed to fetch watch history:', err);
        }
    };

    const refreshUserData = useCallback(async () => {
        if (!localStorage.getItem('token')) return;
        
        setIsRefreshing(true);
        try {
            const response = await userService.getProfile();
            setUser(response.data);
            
            // Refresh notifications and watch history
            fetchNotifications();
            fetchWatchHistory();
        } catch (err) {
            console.error('Failed to refresh user data:', err);
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    // Add a video to watch history
    const addToWatchHistory = async (videoId) => {
        if (!user) return;
        
        try {
            await userService.addToWatchHistory(videoId);
            // Refresh watch history
            fetchWatchHistory();
        } catch (err) {
            console.error('Failed to add to watch history:', err);
        }
    };

    // Mark a notification as read
    const markNotificationAsRead = async (notificationId) => {
        try {
            await userService.markNotificationAsRead(notificationId);
            
            // Update local state
            setNotifications(prevNotifications =>
                prevNotifications.map(notification =>
                    notification._id === notificationId
                        ? { ...notification, read: true }
                        : notification
                )
            );
            
            // Update unread count
            setUnreadNotificationsCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    // Update user theme preference
    const updateTheme = async (newTheme) => {
        setTheme(newTheme);
        
        if (!user) return;
        
        try {
            await userService.updateProfile({
                preferences: {
                    ...user.preferences,
                    theme: newTheme
                }
            });
        } catch (err) {
            console.error('Failed to update theme preference:', err);
        }
    };

    const login = async (email, password) => {
        try {
            setError(null);
            const response = await userService.login(email, password);
            const userData = response.data;
            
            // Store the token
            localStorage.setItem('token', userData.token);
            
            // Create a user object from response data
            const user = {
                id: userData.id,
                username: userData.username,
                email: userData.email,
                slices: userData.slices
            };
            
            setUser(user);
            
            // Fetch user data
            await Promise.all([
                fetchNotifications(),
                fetchWatchHistory()
            ]);
            
            // Refresh the page after successful login
            window.location.reload();
            return true;
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.error || 'Login failed');
            return false;
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            const response = await userService.register(
                userData.username,
                userData.email,
                userData.password
            );
            const registerData = response.data;
            
            // Store the token
            localStorage.setItem('token', registerData.token);
            
            // Create a user object from response data
            const user = {
                id: registerData.id,
                username: registerData.username,
                email: registerData.email,
                slices: registerData.slices
            };
            
            setUser(user);
            
            // Initialize empty data
            setNotifications([]);
            setWatchHistory([]);
            
            // Refresh the page after successful registration
            window.location.reload();
            return true;
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.response?.data?.error || 'Registration failed');
            return false;
        }
    };

    const logout = () => {
        userService.logout();
        localStorage.removeItem('token');
        setUser(null);
        setNotifications([]);
        setWatchHistory([]);
        setUnreadNotificationsCount(0);
        
        // Refresh the page after logout
        window.location.reload();
    };
    
    // Allocate slices to a video
    const allocateSlices = async (videoId, sliceCount) => {
        if (!user) return false;
        
        try {
            await userService.allocateSlices(videoId, sliceCount);
            // Refresh user data to get updated slice count
            await refreshUserData();
            return true;
        } catch (err) {
            console.error('Failed to allocate slices:', err);
            setError(err.response?.data?.message || 'Failed to allocate slices');
            return false;
        }
    };

    if (loading) {
        return <div className="auth-loading">Loading user data...</div>;
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                register,
                logout,
                error,
                setError,
                refreshUserData,
                isRefreshing,
                notifications,
                unreadNotificationsCount,
                markNotificationAsRead,
                watchHistory,
                addToWatchHistory,
                theme,
                updateTheme,
                allocateSlices
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook for using auth context
export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default useAuth;
