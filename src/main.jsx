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
if ('serviceWorker' in navigator) {
  // Use relative path to service worker so it works under a subpath
  window.addEventListener('load', () => {
    const swPath = './service-worker.js';
    navigator.serviceWorker.register(swPath)
      .then((reg) => console.log('Service worker registered:', reg.scope))
      .catch((err) => console.log('Service worker registration failed:', err));
  });
}