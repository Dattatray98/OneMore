import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { ClerkProvider } from '@clerk/clerk-react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  // Graceful fallback for development if key is missing
  console.error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env");
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white p-4">
          <div className="max-w-lg w-full bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-2xl">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h1>
            <pre className="bg-slate-950 p-4 rounded-lg text-xs overflow-auto font-mono text-slate-300 max-h-60 border border-slate-800">
              {this.state.error?.toString()}
              {this.state.error?.stack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold transition-colors w-full"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
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
    </ErrorBoundary>
  </StrictMode>,
)
