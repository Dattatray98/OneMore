import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home'
import { Landing } from './pages/Landing'
import { useState, useEffect } from 'react';

function App() {
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
        <Route path="/app" element={<Home theme={theme} setTheme={setTheme} />} />
      </Routes>
    </Router>
  )
}

export default App
