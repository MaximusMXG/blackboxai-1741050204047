import axios from 'axios';

const API_URL = 'http://localhost:3002/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Export the axios instance
export { api };

// User service
export const userService = {
    register: (username, email, password) =>
        api.post('/users/register', { username, email, password }),
    login: (email, password) =>
        api.post('/users/login', { email, password }),
    getProfile: () =>
        api.get('/users/profile'),
    updateProfile: (userData) =>
        api.put('/users/profile', userData),
    getSliceAllocation: (id) =>
        api.get(`/users/${id}/slices`),
    getAllSliceAllocations: () =>
        api.get('/users/slices/all'),
    addSlices: (amount) =>
        api.post('/users/slices/add', { amount }),
    allocateSlices: (videoId, sliceCount) =>
        api.post('/users/slices/allocate', { videoId, sliceCount }),
    logout: () => {
        localStorage.removeItem('token');
    },
    getWatchHistory: () =>
        api.get('/users/history'),
    addToWatchHistory: (videoId) =>
        api.post('/users/history', { videoId }),
    getRecommendedVideos: () =>
        api.get('/users/recommended'),
    getNotifications: () =>
        api.get('/users/notifications'),
    markNotificationAsRead: (notificationId) =>
        api.put(`/users/notifications/${notificationId}/read`),
    markAllNotificationsAsRead: () =>
        api.put('/users/notifications/read/all')
};

// Video service
export const videoService = {
    create: (videoData) =>
        api.post('/videos', videoData),
    getAll: () =>
        api.get('/videos'),
    getByGenre: (genre) =>
        api.get(`/videos/genre/${genre}`),
    getFeatured: () =>
        api.get('/videos/featured'),
    getById: (id) =>
        api.get(`/videos/${id}`),
    getStats: (id) =>
        api.get(`/videos/${id}/stats`),
    getTrending: () =>
        api.get('/videos/trending'),
    getRecommended: () =>
        api.get('/videos/recommended'),
    search: (query) =>
        api.get(`/videos/search?q=${encodeURIComponent(query)}`),
    getByTags: (tags) =>
        api.get(`/videos/tags?tags=${encodeURIComponent(tags.join(','))}`),
    addView: (id) =>
        api.post(`/videos/${id}/view`),
    rate: (id, rating) =>
        api.post(`/videos/${id}/rate`, { rating }),
    comment: (id, comment) =>
        api.post(`/videos/${id}/comments`, { comment }),
    getComments: (id) =>
        api.get(`/videos/${id}/comments`),
};

// Subscription service
export const subscriptionService = {
    allocateSlices: (userId, videoId, slices) => 
        api.post('/subscriptions', { user_id: userId, video_id: videoId, slices }),
    getCurrentAllocation: (userId, videoId) => 
        api.get(`/subscriptions/user/${userId}/video/${videoId}`),
    updateAllocation: (userId, videoId, slices) => 
        api.put(`/subscriptions/user/${userId}/video/${videoId}`, { slices }),
    removeAllocation: (userId, videoId) => 
        api.delete(`/subscriptions/user/${userId}/video/${videoId}`),
    getUserSubscriptions: (userId) => 
        api.get(`/subscriptions/user/${userId}`),
};

export default {
    user: userService,
    video: videoService,
    subscription: subscriptionService
};
