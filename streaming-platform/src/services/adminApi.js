import { api } from './api';

// Admin service for privileged operations
const adminService = {
    // Dashboard
    getDashboardStats: () => 
        api.get('/admin/dashboard'),
    
    // User management
    getUsers: (page = 1, limit = 20, search = '') => 
        api.get(`/admin/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`),
    
    getUserDetails: (userId) => 
        api.get(`/admin/users/${userId}`),
    
    updateUser: (userId, userData) => 
        api.put(`/admin/users/${userId}`, userData),
    
    suspendUser: (userId, reason, days) => 
        api.post(`/admin/users/${userId}/suspend`, { reason, days }),
    
    reinstateUser: (userId) => 
        api.post(`/admin/users/${userId}/reinstate`),
    
    // Video management
    getVideos: (page = 1, limit = 20, search = '', genre = '', flagged = false) => {
        let url = `/admin/videos?page=${page}&limit=${limit}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (genre) url += `&genre=${genre}`;
        if (flagged) url += `&flagged=true`;
        return api.get(url);
    },
    
    getVideoDetails: (videoId) => 
        api.get(`/admin/videos/${videoId}`),
    
    updateVideo: (videoId, videoData) => 
        api.put(`/admin/videos/${videoId}`, videoData),
    
    deleteVideo: (videoId) => 
        api.delete(`/admin/videos/${videoId}`),
    
    // Partnership management
    getPartnerships: (page = 1, limit = 20, status = '') => {
        let url = `/admin/partnerships?page=${page}&limit=${limit}`;
        if (status) url += `&status=${status}`;
        return api.get(url);
    },
    
    approvePartnership: (partnershipId) => 
        api.put(`/admin/partnerships/${partnershipId}`, { status: 'approved' }),
    
    rejectPartnership: (partnershipId, rejectionReason) => 
        api.put(`/admin/partnerships/${partnershipId}`, { 
            status: 'rejected',
            rejectionReason
        }),
    
    // Activity logs
    getLogs: (page = 1, limit = 50, action = '', startDate = '', endDate = '') => {
        let url = `/admin/logs?page=${page}&limit=${limit}`;
        if (action) url += `&action=${action}`;
        if (startDate) url += `&startDate=${startDate}`;
        if (endDate) url += `&endDate=${endDate}`;
        return api.get(url);
    }
};

export default adminService;