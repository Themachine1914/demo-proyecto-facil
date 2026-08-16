import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { APP_VERSION } from './lib/appVersion'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void refreshServiceWorker()
  })
}

async function refreshServiceWorker() {
  const storageKey = 'facil-app-version'
  const previous = window.localStorage.getItem(storageKey)
  const registrations = await navigator.serviceWorker.getRegistrations()

  if (previous !== APP_VERSION) {
    await Promise.all(registrations.map((registration) => registration.unregister()))
    if ('caches' in window) {
      const keys = await caches.keys()
      await Promise.all(keys.map((key) => caches.delete(key)))
    }
    window.localStorage.setItem(storageKey, APP_VERSION)
    window.location.reload()
    return
  }

  await navigator.serviceWorker.register(`/sw.js?v=${encodeURIComponent(APP_VERSION)}`)
}
