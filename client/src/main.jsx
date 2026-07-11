import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'leaflet/dist/leaflet.css'
import App from './App.jsx'
import { WorkflowProvider } from './context/WorkflowContext'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/ToastContainer'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <WorkflowProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </WorkflowProvider>
    </AuthProvider>
  </StrictMode>,
)
