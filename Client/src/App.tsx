import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home'
import { Landing } from './pages/Landing'
import { useState, useEffect } from 'react';
import { SignedIn, SignedOut, RedirectToSignIn, useAuth } from '@clerk/clerk-react';
import { setApiToken } from './api';

function App() {
  const { getToken } = useAuth();

  useEffect(() => {
    const syncToken = async () => {
      const token = await getToken();
      setApiToken(token);
    };
    syncToken();
    // Re-run periodically to handle expiry or component mount
    const interval = setInterval(syncToken, 60000);
    return () => clearInterval(interval);
  }, [getToken]);

  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>(() => {
    return (localStorage.getItem('theme') as any) || 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    root.classList.remove('dark', 'light');
    body.classList.remove('dark', 'light');

    if (theme === 'dark' || (theme === 'system' && systemDark)) {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.add('light'); // Explicit light class as well
    }

    localStorage.setItem('theme', theme);
  }, [theme]);

  // We could use a Context, but passing props to Home for now is simpler for this fix
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />

        {/* Protected Route */}
        <Route
          path="/app"
          element={
            <>
              <SignedIn>
                <Home theme={theme} setTheme={setTheme} />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
