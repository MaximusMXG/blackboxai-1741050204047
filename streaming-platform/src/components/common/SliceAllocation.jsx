import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/sliceAllocation.css';

const SliceAllocation = ({ videoId, currentSlices = 0 }) => {
    const { allocateSlices, user, refreshUserData, isRefreshing } = useAuth();
    const [slices, setSlices] = useState(currentSlices);
    const [isAdjusting, setIsAdjusting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [animating, setAnimating] = useState(false);
    
    // Update local state when props change
    useEffect(() => {
        setSlices(currentSlices);
    }, [currentSlices]);

    const handleSliceChange = async (newValue) => {
        if (newValue === slices) return;
        
        const change = newValue - slices;
        if (change > 0 && user.slices < change) {
            setError(`You only have ${user.slices} slices available`);
            return;
        }
        
        try {
            setLoading(true);
            setError(null);
            const success = await allocateSlices(videoId, newValue);
            
            if (success) {
                setSlices(newValue);
                setAnimating(true);
                setTimeout(() => setAnimating(false), 1000);
            } else {
                setError('Failed to update slice allocation');
            }
        } catch (err) {
            setError('Failed to update slice allocation');
            console.error('Error updating slices:', err);
        } finally {
            setLoading(false);
        }
    };

    const renderSliceIndicator = () => {
        return Array.from({ length: 8 }, (_, i) => (
            <div 
                key={i}
                className={`slice-indicator ${i < slices ? 'active' : ''}`}
                style={{
                    transform: `rotate(${45 * i}deg)`,
                    '--delay': `${i * 0.1}s`
                }}
            >
                <div className="slice-fill"></div>
            </div>
        ));
    };

    return (
        <div className="slice-allocation">
            <div 
                className={`slice-display ${isAdjusting ? 'adjusting' : ''}`}
                onClick={() => setIsAdjusting(true)}
            >
                <div className="slice-circle">
                    {renderSliceIndicator()}
                    <span className="slice-count">{slices}</span>
                </div>
                <span className="slice-label">Slices</span>
            </div>

            {isAdjusting && (
                <div className="slice-adjuster">
                    <div className="adjuster-header">
                        <h3>Adjust Your Slices</h3>
                        <button 
                            className="close-button"
                            onClick={() => setIsAdjusting(false)}
                        >
                            ×
                        </button>
                    </div>

                    <div className="slice-controls">
                        <input
                            type="range"
                            min="0"
                            max="8"
                            value={slices}
                            onChange={(e) => handleSliceChange(parseInt(e.target.value))}
                            className="slice-slider"
                            disabled={loading}
                        />
                        <div className="slice-value">
                            <span>{slices} slices</span>
                        </div>
                    </div>

                    {error && (
                        <div className="slice-error">
                            {error}
                        </div>
                    )}

                    <div className="slice-info">
                        <p>Allocate slices to support this content</p>
                        <small>You can adjust this at any time</small>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SliceAllocation;
