import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/selection-control.css'
import './utils/selectionControl'
import RouterRoot from './route'
import ThemeProvider from './components/ThemeProvider'
import ErrorBoundary from './components/ErrorBoundary'
import { ProductProvider } from './context/ProductContext'

// Add global error handler for better debugging
window.addEventListener('error', (event) => {
  console.error('[Global Error]', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Rejection]', event.reason);
});

// ✅ Register Service Worker for offline support and caching
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('[SW] Registered successfully:', registration);
        
        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute
      })
      .catch((error) => {
        console.warn('[SW] Registration failed:', error);
      });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('[Main] Root element not found in HTML');
  document.body.innerHTML = '<div style="color:red; padding: 20px;">Root element not found</div>';
} else {
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <ErrorBoundary>
          <ProductProvider>
            <ThemeProvider>
              <RouterRoot />
            </ThemeProvider>
          </ProductProvider>
        </ErrorBoundary>
      </StrictMode>
    );
    console.log('[Main] React app mounted successfully');
  } catch (error) {
    console.error('[Main] Failed to mount React app:', error);
    rootElement.innerHTML = '<div style="color:red; padding: 20px;">Failed to initialize app: ' + error.message + '</div>';
  }
}
