import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminApi';

const AdminPartnerships = () => {
    const [partnerships, setPartnerships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        pages: 1,
        total: 0
    });
    const [statusFilter, setStatusFilter] = useState('pending');
    const [selectedPartnership, setSelectedPartnership] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchPartnerships();
    }, [pagination.page, statusFilter]);

    const fetchPartnerships = async () => {
        try {
            setLoading(true);
            const response = await adminService.getPartnerships(
                pagination.page, 
                20, 
                statusFilter
            );
            setPartnerships(response.data.partnerships);
            setPagination(response.data.pagination);
        } catch (err) {
            console.error('Error fetching partnerships:', err);
            setError('Failed to load partnership applications. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > pagination.pages) return;
        setPagination(prev => ({ ...prev, page: newPage }));
    };
    
    const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const openPartnershipModal = (partnership) => {
        setSelectedPartnership(partnership);
        setRejectionReason('');
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedPartnership(null);
    };

    const handleApprovePartnership = async () => {
        try {
            await adminService.approvePartnership(selectedPartnership._id);
            
            // Update partnership in the local state
            setPartnerships(prevPartnerships => 
                prevPartnerships.map(partnership => 
                    partnership._id === selectedPartnership._id 
                        ? { ...partnership, status: 'approved' } 
                        : partnership
                )
            );
            
            closeModal();
        } catch (err) {
            console.error('Error approving partnership:', err);
            setError('Failed to approve partnership. Please try again.');
        }
    };

    const handleRejectPartnership = async () => {
        if (!rejectionReason) {
            alert('Please provide a reason for rejection');
            return;
        }
        
        try {
            await adminService.rejectPartnership(selectedPartnership._id, rejectionReason);
            
            // Update partnership in the local state
            setPartnerships(prevPartnerships => 
                prevPartnerships.map(partnership => 
                    partnership._id === selectedPartnership._id 
                        ? { ...partnership, status: 'rejected', rejectionReason } 
                        : partnership
                )
            );
            
            closeModal();
        } catch (err) {
            console.error('Error rejecting partnership:', err);
            setError('Failed to reject partnership. Please try again.');
        }
    };

    if (loading && partnerships.length === 0) {
        return (
            <div className="admin-loading">
                <div className="admin-loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="admin-partnerships">
            <h2>Partnership Applications</h2>
            
            {error && (
                <div className="admin-error">
                    <p>{error}</p>
                </div>
            )}
            
            <div className="admin-filters">
                <div className="admin-filter">
                    <select 
                        className="admin-filter-select"
                        value={statusFilter}
                        onChange={handleStatusChange}
                    >
                        <option value="">All Applications</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>
            
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Applicant</th>
                            <th>Email</th>
                            <th>Brand/Channel</th>
                            <th>Status</th>
                            <th>Applied On</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {partnerships.map(partnership => (
                            <tr key={partnership._id}>
                                <td>{partnership.userId?.username || 'Unknown User'}</td>
                                <td>{partnership.userId?.email || 'Unknown Email'}</td>
                                <td>{partnership.brandName}</td>
                                <td>
                                    <span className={`admin-status admin-status-${partnership.status}`}>
                                        {partnership.status}
                                    </span>
                                </td>
                                <td>{new Date(partnership.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <div className="admin-actions">
                                        <button 
                                            className="admin-btn admin-btn-primary"
                                            onClick={() => openPartnershipModal(partnership)}
                                        >
                                            Review
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {partnerships.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center' }}>
                                    No partnership applications found
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
                    ({pagination.total} total applications)
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
            
            {/* Partnership Application Modal */}
            {modalOpen && selectedPartnership && (
                <div className="admin-modal-backdrop" onClick={closeModal}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h2 className="admin-modal-title">
                                Partnership Application Review
                            </h2>
                            <button className="admin-modal-close" onClick={closeModal}>×</button>
                        </div>
                        
                        <div className="admin-modal-body">
                            <div className="admin-application-details">
                                <div className="admin-detail-item">
                                    <strong>Applicant:</strong> {selectedPartnership.userId?.username}
                                </div>
                                <div className="admin-detail-item">
                                    <strong>Email:</strong> {selectedPartnership.userId?.email}
                                </div>
                                <div className="admin-detail-item">
                                    <strong>Brand/Channel Name:</strong> {selectedPartnership.brandName}
                                </div>
                                <div className="admin-detail-item">
                                    <strong>Current Status:</strong> 
                                    <span className={`admin-status admin-status-${selectedPartnership.status}`}>
                                        {selectedPartnership.status}
                                    </span>
                                </div>
                                <div className="admin-detail-item">
                                    <strong>Application Date:</strong> 
                                    {new Date(selectedPartnership.createdAt).toLocaleString()}
                                </div>
                                
                                {selectedPartnership.status === 'rejected' && (
                                    <div className="admin-detail-item">
                                        <strong>Rejection Reason:</strong> 
                                        {selectedPartnership.rejectionReason}
                                    </div>
                                )}
                                
                                <div className="admin-detail-section">
                                    <h3>Application Statement</h3>
                                    <div className="admin-application-content">
                                        {selectedPartnership.applicationStatement}
                                    </div>
                                </div>
                                
                                <div className="admin-detail-section">
                                    <h3>Content Examples & Links</h3>
                                    <div className="admin-application-content">
                                        {selectedPartnership.contentExamples}
                                    </div>
                                </div>
                                
                                <div className="admin-detail-section">
                                    <h3>Audience & Demographics</h3>
                                    <div className="admin-application-content">
                                        {selectedPartnership.audienceDescription}
                                    </div>
                                </div>
                                
                                {selectedPartnership.socialLinks && (
                                    <div className="admin-detail-section">
                                        <h3>Social Media</h3>
                                        <div className="admin-social-links">
                                            {Object.entries(selectedPartnership.socialLinks)
                                                .filter(([_, url]) => url && url.trim() !== '')
                                                .map(([platform, url]) => (
                                                    <div key={platform} className="admin-social-link">
                                                        <strong>{platform}:</strong> 
                                                        <a href={url} target="_blank" rel="noopener noreferrer">
                                                            {url}
                                                        </a>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {selectedPartnership.status === 'pending' && (
                                <div className="admin-application-actions">
                                    <div className="admin-form-group">
                                        <label className="admin-form-label">
                                            Rejection Reason (required if rejecting)
                                        </label>
                                        <textarea
                                            className="admin-form-textarea"
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            placeholder="Provide a reason for rejection..."
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="admin-modal-footer">
                            <button className="admin-btn admin-btn-secondary" onClick={closeModal}>
                                Close
                            </button>
                            
                            {selectedPartnership.status === 'pending' && (
                                <>
                                    <button 
                                        className="admin-btn admin-btn-danger" 
                                        onClick={handleRejectPartnership}
                                    >
                                        Reject
                                    </button>
                                    <button 
                                        className="admin-btn admin-btn-primary" 
                                        onClick={handleApprovePartnership}
                                    >
                                        Approve
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPartnerships;