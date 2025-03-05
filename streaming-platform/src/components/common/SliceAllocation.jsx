import { useState, useEffect } from 'react';
import { FaPizzaSlice } from 'react-icons/fa';
import api from '../../services/api';

const SliceAllocation = ({ userId, videoId, onAllocationChange }) => {
    const [slices, setSlices] = useState(0);
    const [maxSlices, setMaxSlices] = useState(8);
    const [availableSlices, setAvailableSlices] = useState(8);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadAllocation = async () => {
            try {
                // Get user's total slice allocation
                const userSlices = await api.user.getSliceAllocation(userId);
                setAvailableSlices(userSlices.data.available_slices);
                
                // Get current allocation for this video
                const currentAllocation = await api.subscription.getCurrentAllocation(userId, videoId);
                setSlices(currentAllocation.data.slices);
                
                setLoading(false);
            } catch (err) {
                setError('Failed to load slice allocation');
                setLoading(false);
            }
        };

        loadAllocation();
    }, [userId, videoId]);

    const handleSliceChange = async (newValue) => {
        try {
            if (newValue >= 0 && newValue <= maxSlices) {
                const response = await api.subscription.allocateSlices(userId, videoId, newValue);
                setSlices(newValue);
                if (onAllocationChange) {
                    onAllocationChange(newValue);
                }
            }
        } catch (err) {
            setError('Failed to update slice allocation');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="slice-allocation">
            <h3>Support with Slices</h3>
            <div className="slice-counter">
                <button 
                    className="slice-btn"
                    onClick={() => handleSliceChange(slices - 1)}
                    disabled={slices <= 0}
                >
                    -
                </button>
                <div className="slice-display">
                    {[...Array(maxSlices)].map((_, i) => (
                        <FaPizzaSlice 
                            key={i}
                            className={i < slices ? 'slice active' : 'slice'}
                            size={24}
                        />
                    ))}
                </div>
                <button 
                    className="slice-btn"
                    onClick={() => handleSliceChange(slices + 1)}
                    disabled={slices >= maxSlices || slices >= availableSlices}
                >
                    +
                </button>
            </div>
            <p className="slice-info">
                {slices} out of {maxSlices} slices allocated
                <br />
                {availableSlices} slices available
            </p>
            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

export default SliceAllocation;
