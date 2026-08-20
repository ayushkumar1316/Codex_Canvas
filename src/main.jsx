import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/geist'
import './index.css'
import App from './App.jsx'
import { useAppStore } from './store/useAppStore.js'
import { setStoreRef } from './ai/providerManager.js'

setStoreRef(useAppStore)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
