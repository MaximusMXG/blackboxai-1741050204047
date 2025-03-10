import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminApi';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        pages: 1,
        total: 0
    });
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('view'); // view, edit, suspend

    // Form state for editing user
    const [formState, setFormState] = useState({
        slices: 0,
        isPremium: false,
        isAdmin: false,
        isPartner: false
    });

    // Form state for suspension
    const [suspensionState, setSuspensionState] = useState({
        reason: '',
        days: 7
    });

    useEffect(() => {
        fetchUsers();
    }, [pagination.page]);

    const fetchUsers = async (searchQuery = search) => {
        try {
            setLoading(true);
            const response = await adminService.getUsers(pagination.page, 20, searchQuery);
            setUsers(response.data.users);
            setPagination(response.data.pagination);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load users. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers(search);
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > pagination.pages) return;
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const openUserModal = async (user, mode = 'view') => {
        setSelectedUser(user);
        setModalMode(mode);
        
        if (mode === 'edit') {
            setFormState({
                slices: user.slices,
                isPremium: user.isPremium,
                isAdmin: user.isAdmin,
                isPartner: user.isPartner
            });
        } else if (mode === 'suspend') {
            setSuspensionState({
                reason: '',
                days: 7
            });
        }
        
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedUser(null);
        setModalMode('view');
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (modalMode === 'edit') {
            setFormState(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        } else if (modalMode === 'suspend') {
            setSuspensionState(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleUpdateUser = async () => {
        try {
            await adminService.updateUser(selectedUser._id, formState);
            
            // Update user in the local state
            setUsers(prevUsers => 
                prevUsers.map(user => 
                    user._id === selectedUser._id 
                        ? { ...user, ...formState } 
                        : user
                )
            );
            
            closeModal();
        } catch (err) {
            console.error('Error updating user:', err);
            setError('Failed to update user. Please try again.');
        }
    };

    const handleSuspendUser = async () => {
        try {
            await adminService.suspendUser(
                selectedUser._id, 
                suspensionState.reason, 
                parseInt(suspensionState.days)
            );
            
            // Update user in the local state
            setUsers(prevUsers => 
                prevUsers.map(user => 
                    user._id === selectedUser._id 
                        ? { ...user, suspended: true } 
                        : user
                )
            );
            
            closeModal();
        } catch (err) {
            console.error('Error suspending user:', err);
            setError('Failed to suspend user. Please try again.');
        }
    };

    const handleReinstateUser = async (userId) => {
        try {
            await adminService.reinstateUser(userId);
            
            // Update user in the local state
            setUsers(prevUsers => 
                prevUsers.map(user => 
                    user._id === userId 
                        ? { ...user, suspended: false } 
                        : user
                )
            );
        } catch (err) {
            console.error('Error reinstating user:', err);
            setError('Failed to reinstate user. Please try again.');
        }
    };

    if (loading && users.length === 0) {
        return (
            <div className="admin-loading">
                <div className="admin-loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="admin-users">
            <h2>User Management</h2>
            
            {error && (
                <div className="admin-error">
                    <p>{error}</p>
                </div>
            )}
            
            <div className="admin-filters">
                <form className="admin-search" onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button type="submit" className="admin-btn admin-btn-primary">
                        Search
                    </button>
                </form>
            </div>
            
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Slices</th>
                            <th>Status</th>
                            <th>Role</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id}>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{user.slices}</td>
                                <td>
                                    {user.suspended ? (
                                        <span className="admin-status admin-status-suspended">
                                            Suspended
                                        </span>
                                    ) : (
                                        <span className="admin-status admin-status-active">
                                            Active
                                        </span>
                                    )}
                                </td>
                                <td>
                                    {user.isAdmin ? (
                                        <span className="admin-status admin-status-admin">
                                            Admin
                                        </span>
                                    ) : user.isPartner ? (
                                        <span className="admin-status admin-status-partner">
                                            Creator
                                        </span>
                                    ) : (
                                        <span className="admin-status admin-status-viewer">
                                            Viewer
                                        </span>
                                    )}
                                </td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <div className="admin-actions">
                                        <button 
                                            className="admin-btn admin-btn-secondary"
                                            onClick={() => openUserModal(user, 'view')}
                                        >
                                            View
                                        </button>
                                        <button 
                                            className="admin-btn admin-btn-primary"
                                            onClick={() => openUserModal(user, 'edit')}
                                        >
                                            Edit
                                        </button>
                                        {user.suspended ? (
                                            <button 
                                                className="admin-btn admin-btn-secondary"
                                                onClick={() => handleReinstateUser(user._id)}
                                            >
                                                Reinstate
                                            </button>
                                        ) : (
                                            <button 
                                                className="admin-btn admin-btn-danger"
                                                onClick={() => openUserModal(user, 'suspend')}
                                            >
                                                Suspend
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center' }}>
                                    No users found
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
                    ({pagination.total} total users)
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
            
            {/* User Modal */}
            {modalOpen && selectedUser && (
                <div className="admin-modal-backdrop" onClick={closeModal}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h2 className="admin-modal-title">
                                {modalMode === 'view' && `User: ${selectedUser.username}`}
                                {modalMode === 'edit' && `Edit User: ${selectedUser.username}`}
                                {modalMode === 'suspend' && `Suspend User: ${selectedUser.username}`}
                            </h2>
                            <button className="admin-modal-close" onClick={closeModal}>×</button>
                        </div>
                        
                        <div className="admin-modal-body">
                            {modalMode === 'view' && (
                                <div className="admin-user-details">
                                    <div className="admin-user-avatar">
                                        <img src={selectedUser.profilePicture} alt={selectedUser.username} />
                                    </div>
                                    <div className="admin-detail-item">
                                        <strong>Username:</strong> {selectedUser.username}
                                    </div>
                                    <div className="admin-detail-item">
                                        <strong>Email:</strong> {selectedUser.email}
                                    </div>
                                    <div className="admin-detail-item">
                                        <strong>Slices:</strong> {selectedUser.slices}
                                    </div>
                                    <div className="admin-detail-item">
                                        <strong>Status:</strong> 
                                        {selectedUser.suspended ? 'Suspended' : 'Active'}
                                    </div>
                                    <div className="admin-detail-item">
                                        <strong>Role:</strong> 
                                        {selectedUser.isAdmin ? 'Admin' : 
                                         (selectedUser.isPartner ? 'Creator' : 'Viewer')}
                                    </div>
                                    <div className="admin-detail-item">
                                        <strong>Premium:</strong> 
                                        {selectedUser.isPremium ? 'Yes' : 'No'}
                                    </div>
                                    <div className="admin-detail-item">
                                        <strong>Joined:</strong> 
                                        {new Date(selectedUser.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            )}
                            
                            {modalMode === 'edit' && (
                                <form className="admin-form">
                                    <div className="admin-form-group">
                                        <label className="admin-form-label">
                                            Slices
                                        </label>
                                        <input
                                            type="number"
                                            name="slices"
                                            className="admin-form-input"
                                            value={formState.slices}
                                            onChange={handleInputChange}
                                            min="0"
                                        />
                                    </div>
                                    
                                    <div className="admin-form-group">
                                        <label className="admin-form-label">
                                            <input
                                                type="checkbox"
                                                name="isPremium"
                                                checked={formState.isPremium}
                                                onChange={handleInputChange}
                                            />
                                            Premium User
                                        </label>
                                    </div>
                                    
                                    <div className="admin-form-group">
                                        <label className="admin-form-label">
                                            <input
                                                type="checkbox"
                                                name="isAdmin"
                                                checked={formState.isAdmin}
                                                onChange={handleInputChange}
                                            />
                                            Admin Privileges
                                        </label>
                                    </div>
                                    
                                    <div className="admin-form-group">
                                        <label className="admin-form-label">
                                            <input
                                                type="checkbox"
                                                name="isPartner"
                                                checked={formState.isPartner}
                                                onChange={handleInputChange}
                                            />
                                            Creator Privileges
                                        </label>
                                    </div>
                                </form>
                            )}
                            
                            {modalMode === 'suspend' && (
                                <form className="admin-form">
                                    <div className="admin-form-group">
                                        <label className="admin-form-label">
                                            Suspension Reason
                                        </label>
                                        <textarea
                                            name="reason"
                                            className="admin-form-textarea"
                                            value={suspensionState.reason}
                                            onChange={handleInputChange}
                                            placeholder="Reason for suspension..."
                                            required
                                        />
                                    </div>
                                    
                                    <div className="admin-form-group">
                                        <label className="admin-form-label">
                                            Suspension Duration (days)
                                        </label>
                                        <select
                                            name="days"
                                            className="admin-form-select"
                                            value={suspensionState.days}
                                            onChange={handleInputChange}
                                        >
                                            <option value="1">1 day</option>
                                            <option value="3">3 days</option>
                                            <option value="7">7 days</option>
                                            <option value="14">14 days</option>
                                            <option value="30">30 days</option>
                                            <option value="90">90 days</option>
                                            <option value="0">Indefinite</option>
                                        </select>
                                    </div>
                                </form>
                            )}
                        </div>
                        
                        <div className="admin-modal-footer">
                            <button className="admin-btn admin-btn-secondary" onClick={closeModal}>
                                Cancel
                            </button>
                            
                            {modalMode === 'edit' && (
                                <button className="admin-btn admin-btn-primary" onClick={handleUpdateUser}>
                                    Save Changes
                                </button>
                            )}
                            
                            {modalMode === 'suspend' && (
                                <button 
                                    className="admin-btn admin-btn-danger" 
                                    onClick={handleSuspendUser}
                                    disabled={!suspensionState.reason}
                                >
                                    Suspend User
                                </button>
                            )}
                            
                            {modalMode === 'view' && selectedUser.suspended && (
                                <button 
                                    className="admin-btn admin-btn-primary" 
                                    onClick={() => handleReinstateUser(selectedUser._id)}
                                >
                                    Reinstate User
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;