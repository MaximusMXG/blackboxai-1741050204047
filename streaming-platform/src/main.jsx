import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/main.css'
import { initTestLogger } from './utils/testLogger.js'

// Initialize test logger in development mode
if (import.meta.env.DEV) {
  console.log('🍕 Development mode detected - enabling test logger')
  initTestLogger()
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
