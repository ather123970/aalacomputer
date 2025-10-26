import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import RouterRoot from './route'
import ThemeProvider from './components/ThemeProvider'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <RouterRoot />
    </ThemeProvider>
  </StrictMode>
)
