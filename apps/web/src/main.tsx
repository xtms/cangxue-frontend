import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';
import { initAudioEngine } from './lib/audio-engine-web';
import { initMediaCache } from './lib/media-cache-indexeddb';
import { HttpClient, usePlayerStore } from '@music-app/core';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const apiClient = new HttpClient('/api');
const audioEngine = initAudioEngine();
const mediaCache = initMediaCache();

usePlayerStore.getState().setAudioEngine(audioEngine);
usePlayerStore.getState().setApiClient(apiClient);
usePlayerStore.getState().setMediaCache(mediaCache);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
