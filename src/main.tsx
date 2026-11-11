import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/fredoka'
import './styles/tokens.css'
import './styles/base.css'
import { i18nReady } from './i18n'
import App from './app/App'

// The first language is fetched before the app paints, so nobody sees a
// flash of the wrong language.
await i18nReady

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
