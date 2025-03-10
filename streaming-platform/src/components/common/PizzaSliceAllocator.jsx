import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/PizzaSliceAllocator.css';

const PizzaSliceAllocator = ({ videoId, currentSlices = 0, maxSlices = 8 }) => {
    const { allocateSlices, user, refreshUserData, isRefreshing } = useAuth();
    const [slices, setSlices] = useState(currentSlices);
    const [availableSlices, setAvailableSlices] = useState(0);
    const [isAdjusting, setIsAdjusting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [animating, setAnimating] = useState(false);
    const [flyingSlices, setFlyingSlices] = useState([]);
    const [flyAnimation, setFlyAnimation] = useState(false);
    const pizzaRef = useRef(null);
    
    // Update local state when props change or user changes
    useEffect(() => {
        setSlices(currentSlices);
        if (user) {
            setAvailableSlices(user.slices);
        }
    }, [currentSlices, user]);
    
    // Slice colors for variety
    const sliceColors = [
        '#FF6B6B', // Red
        '#FF9E7D', // Orange
        '#FFCC5C', // Yellow
        '#88D8B0', // Green
        '#6BB5FF', // Blue
        '#B088D8', // Purple
        '#FF88D8', // Pink
        '#FF6BB5'  // Rose
    ];
    
    // Handle slice change
    const handleSliceChange = async (newValue) => {
        if (newValue === slices) return;
        
        const change = newValue - slices;
        if (change > 0 && availableSlices < change) {
            setError(`You only have ${availableSlices} slices available`);
            setTimeout(() => setError(null), 3000);
            return;
        }
        
        try {
            setLoading(true);
            setError(null);
            const success = await allocateSlices(videoId, newValue);
            
            if (success) {
                // Create flying slice animation if increasing slices
                if (change > 0) {
                    createFlyingSlices(change);
                }
                
                // Update local values
                setSlices(newValue);
                setAvailableSlices(prev => prev - change);
                setAnimating(true);
                setTimeout(() => setAnimating(false), 1000);
            } else {
                setError('Failed to update slice allocation');
                setTimeout(() => setError(null), 3000);
            }
        } catch (err) {
            setError('Failed to update slice allocation');
            console.error('Error updating slices:', err);
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoading(false);
        }
    };
    
    // Create flying slice animations
    const createFlyingSlices = (count) => {
        if (!pizzaRef.current) return;
        
        const pizzaRect = pizzaRef.current.getBoundingClientRect();
        const pizzaCenterX = pizzaRect.left + pizzaRect.width / 2;
        const pizzaCenterY = pizzaRect.top + pizzaRect.height / 2;
        
        // Get avatar element for destination
        const avatarEl = document.querySelector('.profile-avatar');
        let destX = window.innerWidth - 50; // Default position if avatar not found
        let destY = 50;
        
        if (avatarEl) {
            const avatarRect = avatarEl.getBoundingClientRect();
            destX = avatarRect.left + avatarRect.width / 2;
            destY = avatarRect.top + avatarRect.height / 2;
        }
        
        // Create new flying slices
        const newFlyingSlices = Array(count).fill(0).map((_, i) => {
            const angle = Math.random() * Math.PI * 2; // Random angle
            const distance = 20 + Math.random() * 30; // Random starting distance
            
            return {
                id: Date.now() + i,
                startX: pizzaCenterX + Math.cos(angle) * distance,
                startY: pizzaCenterY + Math.sin(angle) * distance,
                destX,
                destY,
                color: sliceColors[Math.floor(Math.random() * sliceColors.length)],
                scale: 0.5 + Math.random() * 0.5,
                rotation: Math.floor(Math.random() * 360),
                delay: i * 100
            };
        });
        
        setFlyingSlices(newFlyingSlices);
        setFlyAnimation(true);
        
        // Clean up flying slices after animation completes
        setTimeout(() => {
            setFlyingSlices([]);
            setFlyAnimation(false);
        }, 1000 + count * 100);
    };
    
    // Render pizza slices
    const renderPizzaSlices = () => {
        return Array.from({ length: maxSlices }, (_, i) => {
            const isActive = i < slices;
            const angle = 360 / maxSlices;
            const rotation = angle * i;
            const color = sliceColors[i % sliceColors.length];
            
            return (
                <div 
                    key={i}
                    className={`pizza-slice ${isActive ? 'active' : ''} ${animating && i === slices - 1 ? 'pulse' : ''}`}
                    style={{
                        transform: `rotate(${rotation}deg)`,
                        '--slice-color': color,
                        '--slice-angle': `${angle}deg`
                    }}
                    onClick={() => !isAdjusting && setIsAdjusting(true)}
                >
                    <div className="slice-fill"></div>
                </div>
            );
        });
    };
    
    // Render flying slice animations
    const renderFlyingSlices = () => {
        return flyingSlices.map(slice => (
            <div 
                key={slice.id}
                className="flying-slice"
                style={{
                    '--start-x': `${slice.startX}px`,
                    '--start-y': `${slice.startY}px`,
                    '--dest-x': `${slice.destX}px`,
                    '--dest-y': `${slice.destY}px`,
                    '--slice-color': slice.color,
                    '--scale': slice.scale,
                    '--rotation': `${slice.rotation}deg`,
                    '--delay': `${slice.delay}ms`,
                    animationPlayState: flyAnimation ? 'running' : 'paused'
                }}
            ></div>
        ));
    };
    
    return (
        <div className="pizza-slice-allocator">
            <div 
                className={`pizza-display ${isAdjusting ? 'adjusting' : ''} ${error ? 'error' : ''}`}
                onClick={() => !isAdjusting && setIsAdjusting(true)}
                ref={pizzaRef}
            >
                <div className="pizza-plate">
                    <div className="pizza">
                        {renderPizzaSlices()}
                        <div className="pizza-center">
                            <span className="slice-count">{slices}</span>
                        </div>
                    </div>
                </div>
                <span className="slice-label">Slices</span>
                {error && <span className="error-message">{error}</span>}
            </div>
            
            {/* Flying slices animation container */}
            <div className="flying-slices-container">
                {renderFlyingSlices()}
            </div>
            
            {isAdjusting && (
                <div className="slice-adjuster">
                    <div className="adjuster-header">
                        <h3>Adjust Your Slices</h3>
                        <div className="available-slices">
                            <span>Available: </span>
                            <span className="count">{availableSlices + slices}</span>
                        </div>
                        <button 
                            className="close-button"
                            onClick={() => setIsAdjusting(false)}
                        >
                            ×
                        </button>
                    </div>
                    
                    <div className="pizza-preview">
                        <div className="pizza mini">
                            {renderPizzaSlices()}
                            <div className="pizza-center">
                                <span className="slice-count">{slices}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="slice-controls">
                        <div className="slice-buttons">
                            {Array.from({ length: maxSlices + 1 }, (_, i) => (
                                <button 
                                    key={i}
                                    className={`slice-button ${slices === i ? 'active' : ''}`}
                                    onClick={() => handleSliceChange(i)}
                                    disabled={loading || (i > slices && i - slices > availableSlices)}
                                >
                                    {i}
                                </button>
                            ))}
                        </div>
                        
                        <input
                            type="range"
                            min="0"
                            max={Math.min(maxSlices, slices + availableSlices)}
                            value={slices}
                            onChange={(e) => handleSliceChange(parseInt(e.target.value))}
                            className="slice-slider"
                            disabled={loading}
                        />
                    </div>
                    
                    <div className="slice-info">
                        <p>Allocate slices to support this content</p>
                        <small>Each slice contributes to the creator's earnings</small>
                    </div>
                    
                    <div className="slice-actions">
                        <button 
                            className="cancel-button"
                            onClick={() => setIsAdjusting(false)}
                        >
                            Cancel
                        </button>
                        <button 
                            className="apply-button"
                            onClick={() => setIsAdjusting(false)}
                            disabled={loading}
                        >
                            {loading ? 'Updating...' : 'Apply'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PizzaSliceAllocator;