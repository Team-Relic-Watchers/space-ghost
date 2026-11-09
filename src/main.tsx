import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/fredoka'
import '@fontsource/baloo-da-2/bengali-600.css'
import '@fontsource/baloo-da-2/bengali-700.css'
import './styles/tokens.css'
import './styles/base.css'
import './i18n'
import App from './app/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

