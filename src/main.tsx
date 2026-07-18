import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'

import App from './App'
import './styles.css'

// Sob subpath (GitHub Pages) usamos HashRouter; na raiz (Cloudflare Pages,
// Vercel) usamos BrowserRouter — o fallback de SPA é garantido pelo _redirects
// (Cloudflare) ou pelo rewrite (Vercel).
const isRootDeployment = import.meta.env.BASE_URL === '/'
const Router = isRootDeployment ? BrowserRouter : HashRouter

// Analytics/Speed Insights do Vercel só coletam quando servidos pela Vercel.
// Em outros hosts (Cloudflare Pages, GitHub Pages) não montamos os scripts.
const isVercelHost =
  typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app')

// PWA: registra o service worker apenas no build de produção servido da
// raiz (Cloudflare/Vercel); em dev e no GitHub Pages (subpath) fica de fora.
if (import.meta.env.PROD && isRootDeployment && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js')
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <App />
      {isVercelHost ? <Analytics /> : null}
      {isVercelHost ? <SpeedInsights /> : null}
    </Router>
  </React.StrictMode>
)
