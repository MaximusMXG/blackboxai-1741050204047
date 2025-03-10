import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminApi';

const AdminLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        pages: 1,
        total: 0
    });
    const [actionFilter, setActionFilter] = useState('');
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        fetchLogs();
    }, [pagination.page, actionFilter, dateRange]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await adminService.getLogs(
                pagination.page, 
                50, 
                actionFilter,
                dateRange.startDate,
                dateRange.endDate
            );
            setLogs(response.data.logs);
            setPagination(response.data.pagination);
        } catch (err) {
            console.error('Error fetching logs:', err);
            setError('Failed to load activity logs. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > pagination.pages) return;
        setPagination(prev => ({ ...prev, page: newPage }));
    };
    
    const handleActionChange = (e) => {
        setActionFilter(e.target.value);
        setPagination(prev => ({ ...prev, page: 1 }));
    };
    
    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({
            ...prev,
            [name]: value
        }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };
    
    const handleClearFilters = () => {
        setActionFilter('');
        setDateRange({
            startDate: '',
            endDate: ''
        });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    // Helper function to format timestamp
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };
    
    // Helper function to get action color
    const getActionColor = (action) => {
        if (action.includes('delete')) return 'admin-status-rejected';
        if (action.includes('approve')) return 'admin-status-approved';
        if (action.includes('reject')) return 'admin-status-rejected';
        if (action.includes('suspend')) return 'admin-status-suspended';
        if (action.includes('reinstate')) return 'admin-status-approved';
        if (action.includes('update')) return 'admin-status-pending';
        if (action.includes('create')) return 'admin-status-approved';
        return '';
    };

    if (loading && logs.length === 0) {
        return (
            <div className="admin-loading">
                <div className="admin-loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="admin-logs">
            <h2>System Activity Logs</h2>
            
            {error && (
                <div className="admin-error">
                    <p>{error}</p>
                </div>
            )}
            
            <div className="admin-filters">
                <div className="admin-filter">
                    <select 
                        className="admin-filter-select"
                        value={actionFilter}
                        onChange={handleActionChange}
                    >
                        <option value="">All Actions</option>
                        <option value="user_login">User Login</option>
                        <option value="user_register">User Register</option>
                        <option value="user_update">User Update</option>
                        <option value="user_suspend">User Suspend</option>
                        <option value="user_reinstate">User Reinstate</option>
                        <option value="video_upload">Video Upload</option>
                        <option value="video_update">Video Update</option>
                        <option value="video_delete">Video Delete</option>
                        <option value="partnership_approved">Partnership Approved</option>
                        <option value="partnership_rejected">Partnership Rejected</option>
                        <option value="admin_login">Admin Login</option>
                        <option value="system_config_update">System Config Update</option>
                    </select>
                </div>
                
                <div className="admin-filter admin-date-filter">
                    <label>From:</label>
                    <input 
                        type="date" 
                        name="startDate"
                        value={dateRange.startDate}
                        onChange={handleDateChange}
                    />
                </div>
                
                <div className="admin-filter admin-date-filter">
                    <label>To:</label>
                    <input 
                        type="date" 
                        name="endDate"
                        value={dateRange.endDate}
                        onChange={handleDateChange}
                    />
                </div>
                
                <button 
                    className="admin-btn admin-btn-secondary"
                    onClick={handleClearFilters}
                >
                    Clear Filters
                </button>
            </div>
            
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>User</th>
                            <th>Action</th>
                            <th>Details</th>
                            <th>IP Address</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log._id}>
                                <td>{formatTimestamp(log.timestamp)}</td>
                                <td>{log.userId ? log.userId.username : 'System'}</td>
                                <td>
                                    <span className={`admin-status ${getActionColor(log.action)}`}>
                                        {log.action.replace(/_/g, ' ')}
                                    </span>
                                </td>
                                <td>{log.details}</td>
                                <td>{log.ipAddress || 'N/A'}</td>
                            </tr>
                        ))}
                        {logs.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center' }}>
                                    No logs found
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
                    ({pagination.total} total logs)
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
        </div>
    );
};

export default AdminLogs;