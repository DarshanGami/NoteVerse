import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NoteProvider } from './context/NoteContext';
import AppRouter from './routes/AppRouter';
import axios from 'axios';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081/api';

function App() {
  const [backendReady, setBackendReady] = useState(false);
  const [waking, setWaking] = useState(true);

  useEffect(() => {
    const warmup = async () => {
      try {
        await axios.get(`${API_URL}/health`, { timeout: 30000 });
      } catch (_) {
        // ignore — backend may just be waking up
      } finally {
        setBackendReady(true);
        setWaking(false);
      }
    };
    warmup();
  }, []);

  if (waking) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100vh',
        background: '#1A1A2E', color: '#a78bfa', gap: '16px',
        fontFamily: 'Inter, sans-serif'
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
        <p style={{ fontSize: '1.1rem', margin: 0 }}>Connecting to server…</p>
        <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>
          Free tier — first load may take up to 30s
        </p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <NoteProvider>
            <AppRouter />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1A1A2E',
                  color: '#E0E0E0',
                  border: '1px solid #0F3460',
                },
              }}
            />
          </NoteProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
