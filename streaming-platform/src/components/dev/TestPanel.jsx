import React, { useState } from 'react';
import {
  testHomeLayout,
  testPizzaSliceAllocation,
  testPizzaAvatar,
  testSliceHistory,
  testBrandSystem,
  testPartnershipSystem,
  runAllTests
} from '../../utils/featureTests.js';
import './TestPanel.css';

/**
 * Test Panel Component
 * 
 * This component provides a UI for running feature tests in the browser.
 * Only visible in development mode.
 */
const TestPanel = () => {
  const [expanded, setExpanded] = useState(false);
  const [activeTest, setActiveTest] = useState(null);
  const [testResults, setTestResults] = useState({});

  // Toggle panel expansion
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // Run a specific test
  const runTest = async (testName, testFunction) => {
    setActiveTest(testName);
    
    console.group(`Running test: ${testName}`);
    try {
      const result = await testFunction();
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: true, timestamp: new Date().toLocaleTimeString() }
      }));
      console.log(`Test ${testName} completed successfully`);
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: false, error, timestamp: new Date().toLocaleTimeString() }
      }));
      console.error(`Test ${testName} failed:`, error);
    }
    console.groupEnd();
    
    setActiveTest(null);
  };

  // Run all tests sequentially
  const runAll = async () => {
    setActiveTest('All Tests');
    
    console.group('Running all tests');
    try {
      await runAllTests();
      setTestResults(prev => ({
        ...prev,
        'All Tests': { success: true, timestamp: new Date().toLocaleTimeString() }
      }));
      console.log('All tests completed successfully');
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        'All Tests': { success: false, error, timestamp: new Date().toLocaleTimeString() }
      }));
      console.error('Test suite failed:', error);
    }
    console.groupEnd();
    
    setActiveTest(null);
  };

  // Only render in development mode
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className={`test-panel ${expanded ? 'expanded' : 'collapsed'}`}>
      <div className="test-panel-header" onClick={toggleExpanded}>
        <h3>🍕 Slice Test Panel</h3>
        <span className="toggle-icon">{expanded ? '▼' : '▲'}</span>
      </div>
      
      {expanded && (
        <div className="test-panel-content">
          <div className="test-buttons">
            <button 
              className={`test-button ${activeTest === 'All Tests' ? 'active' : ''} ${testResults['All Tests']?.success ? 'success' : testResults['All Tests']?.success === false ? 'failure' : ''}`}
              onClick={runAll}
              disabled={activeTest !== null}
            >
              Run All Tests
            </button>
            
            <button 
              className={`test-button ${activeTest === 'Home Layout' ? 'active' : ''} ${testResults['Home Layout']?.success ? 'success' : testResults['Home Layout']?.success === false ? 'failure' : ''}`}
              onClick={() => runTest('Home Layout', testHomeLayout)}
              disabled={activeTest !== null}
            >
              Test Home Layout
            </button>
            
            <button 
              className={`test-button ${activeTest === 'Pizza Slice Allocation' ? 'active' : ''} ${testResults['Pizza Slice Allocation']?.success ? 'success' : testResults['Pizza Slice Allocation']?.success === false ? 'failure' : ''}`}
              onClick={() => runTest('Pizza Slice Allocation', testPizzaSliceAllocation)}
              disabled={activeTest !== null}
            >
              Test Slice Allocation
            </button>
            
            <button 
              className={`test-button ${activeTest === 'Pizza Avatar' ? 'active' : ''} ${testResults['Pizza Avatar']?.success ? 'success' : testResults['Pizza Avatar']?.success === false ? 'failure' : ''}`}
              onClick={() => runTest('Pizza Avatar', testPizzaAvatar)}
              disabled={activeTest !== null}
            >
              Test Pizza Avatar
            </button>
            
            <button 
              className={`test-button ${activeTest === 'Slice History' ? 'active' : ''} ${testResults['Slice History']?.success ? 'success' : testResults['Slice History']?.success === false ? 'failure' : ''}`}
              onClick={() => runTest('Slice History', testSliceHistory)}
              disabled={activeTest !== null}
            >
              Test Slice History
            </button>
            
            <button 
              className={`test-button ${activeTest === 'Brand System' ? 'active' : ''} ${testResults['Brand System']?.success ? 'success' : testResults['Brand System']?.success === false ? 'failure' : ''}`}
              onClick={() => runTest('Brand System', testBrandSystem)}
              disabled={activeTest !== null}
            >
              Test Brand System
            </button>
            
            <button 
              className={`test-button ${activeTest === 'Partnership System' ? 'active' : ''} ${testResults['Partnership System']?.success ? 'success' : testResults['Partnership System']?.success === false ? 'failure' : ''}`}
              onClick={() => runTest('Partnership System', testPartnershipSystem)}
              disabled={activeTest !== null}
            >
              Test Partnership
            </button>
          </div>
          
          <div className="test-results">
            <h4>Test Results</h4>
            {activeTest && (
              <div className="running-test">
                <div className="loader"></div>
                <span>Running: {activeTest}</span>
              </div>
            )}
            
            <div className="results-list">
              {Object.entries(testResults).map(([testName, result]) => (
                <div 
                  key={testName} 
                  className={`result-item ${result.success ? 'success' : 'failure'}`}
                >
                  <span className="result-name">{testName}</span>
                  <span className="result-status">
                    {result.success ? '✓ Passed' : '✗ Failed'}
                  </span>
                  <span className="result-time">{result.timestamp}</span>
                </div>
              ))}
              
              {Object.keys(testResults).length === 0 && (
                <div className="no-results">No tests run yet</div>
              )}
            </div>
          </div>
          
          <div className="test-instructions">
            <p>Open browser console (F12) to view detailed test output</p>
            <p><strong>Note:</strong> Some tests may require being on specific pages or logged in</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestPanel;