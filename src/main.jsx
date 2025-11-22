import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/selection-control.css'
import './utils/selectionControl'
import RouterRoot from './route'
import ThemeProvider from './components/ThemeProvider'
import ErrorBoundary from './components/ErrorBoundary'
import { ProductProvider } from './context/ProductContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ProductProvider>
        <ThemeProvider>
          <RouterRoot />
        </ThemeProvider>
      </ProductProvider>
    </ErrorBoundary>
  </StrictMode>
)
