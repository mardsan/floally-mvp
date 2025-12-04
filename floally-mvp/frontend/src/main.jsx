// Build: FORCE_DEPLOY_20251123_234500 - Mobile Responsive + Schema Fix
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { DEPLOYMENT_INFO } from './deployment-marker.js'

console.log('🚀 Hey Aimi Deployment Info:', DEPLOYMENT_INFO);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
