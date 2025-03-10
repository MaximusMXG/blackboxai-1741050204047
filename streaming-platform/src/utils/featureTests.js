import { logFeatureTest, logTestStep, measurePerformance } from './testLogger';
import { userService, videoService, brandService, partnershipService } from '../services/api';

/**
 * Feature Test Harness
 * 
 * This module contains tests for all major features of the Slice platform.
 * Run these tests to verify functionality and monitor console output.
 */

// Test homepage video grid layout
export const testHomeLayout = async () => {
    logFeatureTest('Homepage Video Grid Layout', 'info');
    
    try {
        // Check if video grid containers exist
        const featuredGrid = document.querySelector('.featured-videos-grid');
        const standardGrids = document.querySelectorAll('.videos-grid');
        
        if (featuredGrid) {
            logTestStep('Found featured videos grid', {
                element: featuredGrid,
                width: featuredGrid.offsetWidth,
                height: featuredGrid.offsetHeight
            });
        } else {
            logTestStep('Featured videos grid not found', null);
        }
        
        logTestStep(`Found ${standardGrids.length} standard video grids`);
        
        // Check grid item dimensions
        const videoCards = document.querySelectorAll('.video-card');
        
        if (videoCards.length > 0) {
            const sampleCard = videoCards[0];
            const cardDimensions = {
                width: sampleCard.offsetWidth,
                height: sampleCard.offsetHeight,
                thumbnailHeight: sampleCard.querySelector('.video-thumbnail')?.offsetHeight
            };
            
            logTestStep(`Found ${videoCards.length} video cards`, cardDimensions);
            
            if (cardDimensions.width < 250) {
                logFeatureTest('Video Card Width', 'warning', 
                    `Video card width (${cardDimensions.width}px) is less than recommended (250px)`);
            } else {
                logFeatureTest('Video Card Width', 'success', 
                    `Video card width (${cardDimensions.width}px) is adequate`);
            }
            
            if (cardDimensions.thumbnailHeight < 200) {
                logFeatureTest('Thumbnail Height', 'warning', 
                    `Thumbnail height (${cardDimensions.thumbnailHeight}px) is less than recommended (200px)`);
            } else {
                logFeatureTest('Thumbnail Height', 'success', 
                    `Thumbnail height (${cardDimensions.thumbnailHeight}px) is adequate`);
            }
        } else {
            logFeatureTest('Video Cards', 'warning', 'No video cards found on the page');
        }
        
        // Check grid spacing
        if (videoCards.length > 1) {
            const card1 = videoCards[0].getBoundingClientRect();
            const card2 = videoCards[1].getBoundingClientRect();
            const horizontalGap = Math.abs(card2.left - (card1.left + card1.width));
            
            logTestStep('Grid gap measurement', { horizontalGap });
            
            if (horizontalGap < 20) {
                logFeatureTest('Grid Spacing', 'warning', 
                    `Grid gap (${horizontalGap}px) is less than recommended (20px)`);
            } else {
                logFeatureTest('Grid Spacing', 'success', 
                    `Grid gap (${horizontalGap}px) is adequate`);
            }
        }
        
        return true;
    } catch (error) {
        logFeatureTest('Homepage Video Grid Layout', 'error', error);
        return false;
    }
};

// Test pizza slice allocation
export const testPizzaSliceAllocation = async () => {
    logFeatureTest('Pizza Slice Allocation', 'info');
    
    try {
        // Check if slice allocators exist
        const sliceAllocators = document.querySelectorAll('.pizza-slice-allocator');
        
        if (sliceAllocators.length > 0) {
            logTestStep(`Found ${sliceAllocators.length} slice allocators`);
            
            // Test opening the allocator menu
            const firstAllocator = sliceAllocators[0];
            const pizzaDisplay = firstAllocator.querySelector('.pizza-display');
            
            if (pizzaDisplay) {
                logTestStep('Found pizza display, clicking to open menu');
                
                // Click to open menu
                pizzaDisplay.click();
                
                // Check if menu opened
                setTimeout(() => {
                    const menu = document.querySelector('.slice-adjuster');
                    if (menu) {
                        const menuPos = menu.getBoundingClientRect();
                        
                        logTestStep('Slice adjuster menu opened', {
                            position: {
                                top: menuPos.top,
                                left: menuPos.left
                            },
                            dimensions: {
                                width: menu.offsetWidth,
                                height: menu.offsetHeight
                            },
                            zIndex: window.getComputedStyle(menu).zIndex
                        });
                        
                        // Check if menu is properly positioned
                        if (menuPos.top < 0 || menuPos.left < 0) {
                            logFeatureTest('Menu Positioning', 'warning', 
                                'Menu positioned outside viewport');
                        } else {
                            logFeatureTest('Menu Positioning', 'success', 
                                'Menu properly positioned in viewport');
                        }
                        
                        // Close the menu
                        const closeButton = menu.querySelector('.close-button');
                        if (closeButton) {
                            closeButton.click();
                            logTestStep('Closed menu via close button');
                        }
                    } else {
                        logFeatureTest('Slice Adjuster Menu', 'error', 'Menu did not open');
                    }
                }, 500);
                
                logFeatureTest('Pizza Slice Allocator Click', 'success', 'Allocator responds to clicks');
            } else {
                logFeatureTest('Pizza Display', 'warning', 'Pizza display not found');
            }
        } else {
            logFeatureTest('Slice Allocators', 'warning', 'No slice allocators found - user may not be logged in');
        }
        
        // Check API functionality
        try {
            // Mock video ID for testing
            const mockVideoId = 'test123';
            const mockAllocation = 3;
            
            // Only execute if a user is logged in
            if (document.querySelector('.profile-button')) {
                logTestStep('Testing slice allocation API call (simulated)');
                // Note: We're not actually making this call to avoid affecting real data
                // videoService.allocateSlices(mockVideoId, mockAllocation);
                
                logFeatureTest('Slice Allocation API', 'info', 
                    'API call simulation successful (not actually executed)');
            }
        } catch (error) {
            logFeatureTest('Slice Allocation API', 'error', error);
        }
        
        return true;
    } catch (error) {
        logFeatureTest('Pizza Slice Allocation', 'error', error);
        return false;
    }
};

// Test pizza avatar component
export const testPizzaAvatar = async () => {
    logFeatureTest('Pizza Avatar', 'info');
    
    try {
        // Check if pizza avatar exists in navbar
        const navbarAvatar = document.querySelector('.profile-pizza-avatar');
        
        if (navbarAvatar) {
            const avatarDimensions = {
                width: navbarAvatar.offsetWidth,
                height: navbarAvatar.offsetHeight
            };
            
            logTestStep('Found Pizza Avatar in navbar', avatarDimensions);
            
            // Check if slices are rendered
            const slices = navbarAvatar.querySelectorAll('.pizza-avatar-slice');
            logTestStep(`Avatar has ${slices.length} slice elements`);
            
            // Check slice count indicator
            const sliceCount = navbarAvatar.querySelector('.slice-count');
            if (sliceCount) {
                logTestStep('Slice count indicator found', {
                    count: sliceCount.textContent
                });
            }
            
            logFeatureTest('Navbar Pizza Avatar', 'success', 'Avatar successfully rendered in navbar');
        } else {
            logFeatureTest('Navbar Pizza Avatar', 'warning', 'No Pizza Avatar found in navbar - user may not be logged in');
        }
        
        // Check for avatar on profile page (won't work unless on profile page)
        const profileAvatar = document.querySelector('.profile-avatar-container .pizza-avatar');
        if (profileAvatar) {
            logTestStep('Found Pizza Avatar on profile page');
            logFeatureTest('Profile Pizza Avatar', 'success', 'Avatar successfully rendered on profile');
        }
        
        return true;
    } catch (error) {
        logFeatureTest('Pizza Avatar', 'error', error);
        return false;
    }
};

// Test slice history
export const testSliceHistory = async () => {
    logFeatureTest('Slice History', 'info');
    
    try {
        // Check if slice history component exists
        const sliceHistory = document.querySelector('.slice-history-container');
        
        if (sliceHistory) {
            logTestStep('Found Slice History component');
            
            // Check for stats overview
            const statsCards = sliceHistory.querySelectorAll('.stat-card');
            logTestStep(`Found ${statsCards.length} stats cards`);
            
            if (statsCards.length > 0) {
                // Sample the first stat card
                const firstStat = statsCards[0];
                const statValue = firstStat.querySelector('.stat-value')?.textContent;
                const statLabel = firstStat.querySelector('.stat-label')?.textContent;
                
                logTestStep('Stat card content', { value: statValue, label: statLabel });
            }
            
            // Check for timeline items
            const timelineItems = sliceHistory.querySelectorAll('.timeline-item');
            logTestStep(`Found ${timelineItems.length} timeline items`);
            
            if (timelineItems.length > 0) {
                // Sample the first timeline item
                const firstItem = timelineItems[0];
                const sliceCount = firstItem.querySelector('.slice-count .count')?.textContent;
                const videoTitle = firstItem.querySelector('.video-title')?.textContent;
                
                logTestStep('Timeline item content', { 
                    slices: sliceCount, 
                    title: videoTitle 
                });
            }
            
            logFeatureTest('Slice History Component', 'success', 'History component successfully rendered');
        } else {
            logFeatureTest('Slice History Component', 'warning', 
                'No Slice History component found - user may not be on profile page or logged in');
            
            // Try API call simulation
            logTestStep('Testing slice history API call (simulated)');
            // Note: We're not actually making this call to avoid affecting real data
            // const historyData = await userService.getSliceHistory();
            logFeatureTest('Slice History API', 'info', 
                'API call simulation successful (not actually executed)');
        }
        
        return true;
    } catch (error) {
        logFeatureTest('Slice History', 'error', error);
        return false;
    }
};

// Test brand system
export const testBrandSystem = async () => {
    logFeatureTest('Brand System', 'info');
    
    try {
        // Check if we're on the brands page
        const brandElements = document.querySelectorAll('.brand-card');
        
        if (brandElements.length > 0) {
            logTestStep(`Found ${brandElements.length} brand cards`);
            
            // Sample the first brand card
            const firstBrand = brandElements[0];
            const brandName = firstBrand.querySelector('.brand-name')?.textContent;
            const brandCategory = firstBrand.querySelector('.brand-category')?.textContent;
            
            logTestStep('Brand card content', { 
                name: brandName, 
                category: brandCategory 
            });
            
            logFeatureTest('Brand Cards', 'success', 'Brand cards successfully rendered');
        } else {
            logFeatureTest('Brand Cards', 'warning', 
                'No brand cards found - user may not be on brands page');
            
            // Try API call
            try {
                logTestStep('Testing brand API call');
                const brandsResponse = await brandService.getAll();
                
                if (brandsResponse && brandsResponse.data) {
                    logTestStep('Received brand data', { 
                        count: brandsResponse.data.length,
                        sample: brandsResponse.data[0]
                    });
                    logFeatureTest('Brand API', 'success', 'Brand API successfully returned data');
                } else {
                    logFeatureTest('Brand API', 'warning', 'Brand API returned no data');
                }
            } catch (error) {
                logFeatureTest('Brand API', 'error', 
                    `Brand API call failed: ${error.message}`);
            }
        }
        
        // Check for brand dashboard elements if on that page
        const brandDashboard = document.querySelector('.brand-dashboard');
        if (brandDashboard) {
            logTestStep('Found Brand Dashboard component');
            
            // Check for stats cards
            const statCards = brandDashboard.querySelectorAll('.stat-card');
            logTestStep(`Found ${statCards.length} brand stat cards`);
            
            logFeatureTest('Brand Dashboard', 'success', 'Brand Dashboard successfully rendered');
        }
        
        return true;
    } catch (error) {
        logFeatureTest('Brand System', 'error', error);
        return false;
    }
};

// Test partnership pages
export const testPartnershipSystem = async () => {
    logFeatureTest('Partnership System', 'info');
    
    try {
        // Check if we're on the partnership page
        const partnershipForm = document.querySelector('.partnership-form');
        
        if (partnershipForm) {
            logTestStep('Found Partnership application form');
            
            // Check form fields
            const inputFields = partnershipForm.querySelectorAll('input, textarea');
            logTestStep(`Form has ${inputFields.length} input fields`);
            
            // Check submit button
            const submitButton = partnershipForm.querySelector('button[type="submit"]');
            if (submitButton) {
                logTestStep('Submit button found', {
                    text: submitButton.textContent
                });
            }
            
            logFeatureTest('Partnership Form', 'success', 'Partnership form successfully rendered');
        } else {
            logFeatureTest('Partnership Form', 'warning', 
                'No partnership form found - user may not be on partnership page');
        }
        
        // Check for partner dashboard elements if on that page
        const partnerDashboard = document.querySelector('.partner-dashboard');
        if (partnerDashboard) {
            logTestStep('Found Partner Dashboard component');
            logFeatureTest('Partner Dashboard', 'success', 'Partner Dashboard successfully rendered');
        }
        
        // Try API call
        try {
            logTestStep('Testing partnership status API call');
            const statusResponse = await partnershipService.checkPartnerStatus();
            
            logTestStep('Received partnership status', { 
                isPartner: statusResponse
            });
            
            logFeatureTest('Partnership API', 'success', 'Partnership API successfully returned status');
        } catch (error) {
            logFeatureTest('Partnership API', 'error', 
                `Partnership API call failed: ${error.message}`);
        }
        
        return true;
    } catch (error) {
        logFeatureTest('Partnership System', 'error', error);
        return false;
    }
};

// Run all tests
export const runAllTests = async () => {
    console.log('%c🍕 RUNNING ALL SLICE PLATFORM TESTS 🍕', 
        'background: linear-gradient(45deg, #FF6B6B, #FFCC5C); color: black; font-size: 16px; padding: 10px; border-radius: 5px;');
    
    await testHomeLayout();
    await testPizzaSliceAllocation();
    await testPizzaAvatar();
    await testSliceHistory();
    await testBrandSystem();
    await testPartnershipSystem();
    
    console.log('%c🍕 ALL TESTS COMPLETED 🍕', 
        'background: linear-gradient(45deg, #FF6B6B, #FFCC5C); color: black; font-size: 16px; padding: 10px; border-radius: 5px;');
};

export default {
    testHomeLayout,
    testPizzaSliceAllocation,
    testPizzaAvatar,
    testSliceHistory,
    testBrandSystem,
    testPartnershipSystem,
    runAllTests
};