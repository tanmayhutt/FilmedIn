import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './assets/index.css'

import { GoogleOAuthProvider } from '@react-oauth/google';

import { SavedMediaProvider } from './context/SavedMediaContext'

// After a deploy, an open tab may request route chunks that no longer exist. Reload once to pick up the new build.
window.addEventListener('vite:preloadError', (event) => {
  const reloadKey = 'filmedin-chunk-reload'
  try {
    if (sessionStorage.getItem(reloadKey)) return
    sessionStorage.setItem(reloadKey, '1')
  } catch {
    return
  }
  event.preventDefault()
  window.location.reload()
})
window.addEventListener('load', () => {
  try { sessionStorage.removeItem('filmedin-chunk-reload') } catch { /* storage unavailable */ }
})

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '741007561589-smjao34064v663da3h7nsak6vnh0g11g.apps.googleusercontent.com';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <SavedMediaProvider>
          <App />
        </SavedMediaProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
