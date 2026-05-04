import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home'
import { Landing } from './pages/Landing'
import { AuthPage } from './pages/AuthPage'
import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useSettingQuery } from './hooks/useSettingQuery';

function App() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { settings, isLoading: settingsLoading, updateSettings } = useSettingQuery();

  const [theme, setThemeState] = useState<'dark' | 'light' | 'system'>(() => {
    return (localStorage.getItem('theme') as any) || 'dark';
  });

  // Sync theme state with backend settings
  useEffect(() => {
    if (settings?.theme) {
      setThemeState(settings.theme);
    }
  }, [settings?.theme]);

  const setTheme = async (newTheme: 'dark' | 'light' | 'system') => {
    setThemeState(newTheme);
    if (isAuthenticated) {
      await updateSettings({ theme: newTheme });
    }
  };

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
      root.classList.add('light');
    }

    localStorage.setItem('theme', theme);
  }, [theme]);

  const isLoading = authLoading || (isAuthenticated && settingsLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={isAuthenticated ? <Navigate to="/app" replace /> : <AuthPage />} />

        {/* Protected Route */}
        <Route
          path="/app"
          element={
            isAuthenticated ? (
              <Home theme={theme} setTheme={setTheme} />
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
      </Routes>
    </Router>
  )
}

export default App
