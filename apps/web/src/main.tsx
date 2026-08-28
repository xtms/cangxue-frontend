import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';
import { initAudioEngine } from './lib/audio-engine-web';
import { initMediaCache } from './lib/media-cache-indexeddb';
import { useAuthStore, usePlayerStore } from '@music-app/core';
import { apiClient, bootstrapAuth, persistAuth } from './lib/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

// Restore session (if any), then keep localStorage in sync with the auth store.
bootstrapAuth();
useAuthStore.subscribe((s) => persistAuth(s.user, s.token));

// Wire the cross-platform player store to the web adapters + the shared client.
const audioEngine = initAudioEngine();
const mediaCache = initMediaCache();
usePlayerStore.getState().setApiClient(apiClient);
usePlayerStore.getState().setAudioEngine(audioEngine);
usePlayerStore.getState().setMediaCache(mediaCache);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
