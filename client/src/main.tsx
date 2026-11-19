import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './ScheduleEditor.css'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'

// The router is mounted once around the app so every page can use route context.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
