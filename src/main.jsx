import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Register service worker in production builds
// Unregister any old service workers (cleanup from previous manual SWs)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((r) => {
      // If the registration script URL ends with 'service-worker.js' or 'service-worker', unregister it
      if (r?.active?.scriptURL?.includes('service-worker')) {
        r.unregister().then((ok) => console.log('Unregistered old SW:', r.scope, ok));
      }
    });
  }).catch((err) => console.warn('Error checking service workers:', err));
}