import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Registers the offline app-shell cache (see public/sw.js) -- lets the app
// installed as a PWA still open (with whatever was last loaded) when
// there's no connection. Only runs in production: a dev-mode service
// worker would otherwise keep serving a stale build after every edit.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Best-effort -- the app works fine online without it.
    });
  });
}
