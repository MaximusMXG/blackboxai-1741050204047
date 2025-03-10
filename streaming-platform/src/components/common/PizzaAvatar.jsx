import React, { useMemo } from 'react';
import '../../styles/PizzaAvatar.css';

const PizzaAvatar = ({ 
    user, 
    size = 'medium', 
    showSliceCount = true,
    animated = true,
    className = '' 
}) => {
    // Get the maximum number of slices (8 by default)
    const maxSlices = 8;
    
    // Calculate available slices and percentage
    const availableSlices = user?.slices || 0;
    const slicePercentage = Math.min(100, (availableSlices / maxSlices) * 100);
    
    // Generate slice colors - we'll use a different color for each slice
    const sliceColors = useMemo(() => [
        '#FF6B6B', // Red
        '#FF9E7D', // Orange
        '#FFCC5C', // Yellow
        '#88D8B0', // Green
        '#6BB5FF', // Blue
        '#B088D8', // Purple
        '#FF88D8', // Pink
        '#FF6BB5'  // Rose
    ], []);
    
    // Determine the size class
    const sizeClass = size === 'large' ? 'pizza-avatar-large' : 
                      size === 'small' ? 'pizza-avatar-small' : 
                      'pizza-avatar-medium';
    
    // Render the pizza slices
    const renderPizzaSlices = () => {
        return Array.from({ length: maxSlices }, (_, i) => {
            const angle = 360 / maxSlices;
            const rotation = angle * i;
            const hasSlice = i < availableSlices;
            const color = sliceColors[i % sliceColors.length];
            
            return (
                <div 
                    key={i}
                    className={`pizza-avatar-slice ${hasSlice ? 'has-slice' : ''}`}
                    style={{
                        transform: `rotate(${rotation}deg)`,
                        '--slice-color': color,
                        '--slice-angle': `${angle}deg`
                    }}
                >
                    <div className="slice-fill"></div>
                </div>
            );
        });
    };
    
    // Get the avatar image source
    const avatarSrc = user?.profilePicture || 'https://picsum.photos/200';
    
    return (
        <div className={`pizza-avatar-wrapper ${className}`}>
            <div className={`pizza-avatar ${sizeClass} ${animated ? 'animated' : ''}`}>
                <div className="pizza-avatar-plate">
                    <div className="pizza-avatar-content">
                        {renderPizzaSlices()}
                        
                        {/* Center avatar image */}
                        <div className="pizza-avatar-center">
                            <img 
                                src={avatarSrc} 
                                alt={user?.username || 'User Avatar'} 
                                className="avatar-img"
                            />
                        </div>
                        
                        {/* Slice count indicator */}
                        {showSliceCount && (
                            <div className="slice-count-indicator">
                                <span className="slice-count">{availableSlices}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Radial progress indicator for available slices */}
            {animated && (
                <svg className="slice-progress" width="100%" height="100%" viewBox="0 0 100 100">
                    <circle 
                        className="progress-background"
                        cx="50" 
                        cy="50" 
                        r="46"
                    />
                    <circle 
                        className="progress-indicator"
                        cx="50" 
                        cy="50" 
                        r="46"
                        style={{
                            strokeDasharray: `${slicePercentage * 2.89}, 1000`,
                        }}
                    />
                </svg>
            )}
        </div>
    );
};

export default PizzaAvatar;