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
    getSliceAllocation: (id) => 
        api.get(`/users/${id}/slices`),
    logout: () => {
        localStorage.removeItem('token');
    }
};

// Video service
export const videoService = {
    create: (title, creator, thumbnail_url, genre) => 
        api.post('/videos', { title, creator, thumbnail_url, genre }),
    getAll: () => 
        api.get('/videos'),
    getById: (id) => 
        api.get(`/videos/${id}`),
    getStats: (id) => 
        api.get(`/videos/${id}/stats`),
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
