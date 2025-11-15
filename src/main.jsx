import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import RouterRoot from './route'
import ThemeProvider from './components/ThemeProvider'
import ErrorBoundary from './components/ErrorBoundary'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <RouterRoot />
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>
)
