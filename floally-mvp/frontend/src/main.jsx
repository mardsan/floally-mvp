// Build: FORCE_DEPLOY_20251107_181102 - Trusted Contacts deployment
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { DEPLOYMENT_INFO } from './deployment-marker.js'

console.log('🚀 OkAimy Deployment Info:', DEPLOYMENT_INFO);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
