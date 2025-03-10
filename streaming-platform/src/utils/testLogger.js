/**
 * Test Logger Utility
 * 
 * This utility provides enhanced console logging for feature testing
 * with styled output and grouping capabilities.
 */

// Set to false in production
const DEBUG_MODE = true;

/**
 * Log a feature test with styled output
 * @param {string} featureName - Name of the feature being tested
 * @param {string} status - Status of the test (success, warning, error, info)
 * @param {any} data - Additional data to log
 */
export const logFeatureTest = (featureName, status = 'info', data = null) => {
    if (!DEBUG_MODE) return;
    
    const styles = {
        success: 'color: #88D8B0; font-weight: bold;',  // Green
        warning: 'color: #FFCC5C; font-weight: bold;',  // Yellow
        error: 'color: #FF6B6B; font-weight: bold;',    // Red
        info: 'color: #6BB5FF; font-weight: bold;'      // Blue
    };
    
    console.group(`%c🍕 FEATURE TEST: ${featureName}`, styles[status]);
    console.log(`%cStatus: ${status.toUpperCase()}`, styles[status]);
    
    if (data) {
        console.log('Data:', data);
    }
    
    console.groupEnd();
};

/**
 * Log a feature test step with styled output
 * @param {string} stepName - Name of the step
 * @param {any} data - Additional data to log
 */
export const logTestStep = (stepName, data = null) => {
    if (!DEBUG_MODE) return;
    console.log(`%c → ${stepName}`, 'color: #B088D8; font-style: italic;');
    
    if (data) {
        console.log('  Data:', data);
    }
};

/**
 * Measure performance of a feature
 * @param {string} featureName - Name of the feature being measured
 * @param {Function} callback - Function to measure
 * @returns {Promise<any>} - Result of the callback
 */
export const measurePerformance = async (featureName, callback) => {
    if (!DEBUG_MODE) return callback();
    
    console.time(`🕒 ${featureName} performance`);
    let result;
    
    try {
        result = await callback();
        console.timeEnd(`🕒 ${featureName} performance`);
        return result;
    } catch (error) {
        console.timeEnd(`🕒 ${featureName} performance`);
        console.error(`Error in ${featureName}:`, error);
        throw error;
    }
};

/**
 * Initialize the test logger and log browser information
 */
export const initTestLogger = () => {
    if (!DEBUG_MODE) return;
    
    console.log('%c🍕 SLICE PLATFORM TEST MODE ENABLED 🍕', 
        'background: linear-gradient(45deg, #FF6B6B, #FFCC5C); color: black; font-size: 16px; padding: 10px; border-radius: 5px;');
    
    // Log browser and environment info
    console.group('Environment Info');
    console.log(`User Agent: ${navigator.userAgent}`);
    console.log(`Window Size: ${window.innerWidth}x${window.innerHeight}`);
    console.log(`Date/Time: ${new Date().toLocaleString()}`);
    console.groupEnd();
    
    // Log available features for testing
    console.group('Available Features for Testing');
    console.log('- Video Grid Layout');
    console.log('- Pizza Slice Allocation');
    console.log('- Pizza Avatar');
    console.log('- Slice History');
    console.log('- Brand System');
    console.log('- Partnership Pages');
    console.groupEnd();
};

export default {
    logFeatureTest,
    logTestStep,
    measurePerformance,
    initTestLogger
};