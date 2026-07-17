import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'

import App from './App'
import './styles.css'

const isRootDeployment = import.meta.env.BASE_URL === '/'
const Router = isRootDeployment ? BrowserRouter : HashRouter

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <App />
      {isRootDeployment ? <Analytics /> : null}
      {isRootDeployment ? <SpeedInsights /> : null}
    </Router>
  </React.StrictMode>
)
