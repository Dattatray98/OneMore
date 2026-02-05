import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { ClerkProvider } from '@clerk/clerk-react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  // Graceful fallback for development if key is missing
  console.error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env");
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {PUBLISHABLE_KEY ? (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    ) : (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white p-4 text-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Configuration Error</h1>
          <p className="text-slate-400 mb-4">Missing <code>VITE_CLERK_PUBLISHABLE_KEY</code> in .env file.</p>
          <p className="text-sm text-slate-500">Please add your Clerk Publishable Key and restart the server.</p>
        </div>
      </div>
    )}
  </StrictMode>,
)
