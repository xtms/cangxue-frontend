import { create } from 'zustand';
import type { PlaybackState, PlaybackStatus, Track } from './types.js';
import type { AudioEngine } from './audio-engine.js';
import type { MusicApiClient } from './api-client.js';
import type { MediaCache } from './media-cache.js';

interface PlayerStore extends PlaybackState {
  audioEngine: AudioEngine | null;
  apiClient: MusicApiClient | null;
  mediaCache: MediaCache | null;

  setAudioEngine: (engine: AudioEngine) => void;
  setApiClient: (client: MusicApiClient) => void;
  setMediaCache: (cache: MediaCache) => void;

  playTrack: (trackId: string, queue?: string[]) => Promise<void>;
  play: () => Promise<void>;
  pause: () => void;
  seek: (ms: number) => void;
  setVolume: (v: number) => void;
  next: () => Promise<void>;
  prev: () => Promise<void>;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  addToQueue: (trackId: string) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
}

const initialState: PlaybackState = {
  currentTrackId: null,
  status: 'idle',
  positionMs: 0,
  durationMs: 0,
  queue: [],
  index: -1,
  repeat: 'off',
  shuffle: false,
  volume: 1,
};

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  ...initialState,
  audioEngine: null,
  apiClient: null,
  mediaCache: null,

  setAudioEngine: (engine) => {
    set({ audioEngine: engine });

    engine.onStatus((status) => {
      set({ status });
    });

    engine.onProgress((positionMs, durationMs) => {
      set({ positionMs, durationMs });
    });

    engine.onEnded(() => {
      const state = get();
      if (state.repeat === 'one') {
        engine.seek(0);
        engine.play();
      } else {
        get().next();
      }
    });
  },

  setApiClient: (client) => set({ apiClient: client }),
  setMediaCache: (cache) => set({ mediaCache: cache }),

  playTrack: async (trackId, queue) => {
    const { audioEngine, apiClient, mediaCache } = get();
    if (!audioEngine || !apiClient) return;

    const newQueue = queue || [trackId];
    const index = newQueue.indexOf(trackId);

    set({
      currentTrackId: trackId,
      queue: newQueue,
      index,
      status: 'loading',
      positionMs: 0,
      durationMs: 0,
    });

    try {
      let streamUrl: string | null = null;

      if (mediaCache) {
        streamUrl = await mediaCache.url(trackId);
      }

      if (!streamUrl) {
        streamUrl = apiClient.tracks.streamUrl(trackId);
      }

      const track = await apiClient.tracks.get(trackId);
      const trackWithUrl = { ...track, streamUrl };

      await audioEngine.load(trackWithUrl);
      await audioEngine.play();
    } catch (error) {
      set({ status: 'error' });
      console.error('Failed to play track:', error);
    }
  },

  play: async () => {
    const { audioEngine } = get();
    if (audioEngine) {
      await audioEngine.play();
    }
  },

  pause: () => {
    const { audioEngine } = get();
    if (audioEngine) {
      audioEngine.pause();
    }
  },

  seek: (ms) => {
    const { audioEngine } = get();
    if (audioEngine) {
      audioEngine.seek(ms);
    }
  },

  setVolume: (v) => {
    const { audioEngine } = get();
    if (audioEngine) {
      audioEngine.setVolume(v);
    }
    set({ volume: v });
  },

  next: async () => {
    const { queue, index, repeat } = get();
    if (queue.length === 0) return;

    let nextIndex = index + 1;
    if (nextIndex >= queue.length) {
      if (repeat === 'all') {
        nextIndex = 0;
      } else {
        return;
      }
    }

    await get().playTrack(queue[nextIndex], queue);
  },

  prev: async () => {
    const { queue, index, positionMs, repeat } = get();
    if (queue.length === 0) return;

    if (positionMs > 3000) {
      get().seek(0);
      return;
    }

    let prevIndex = index - 1;
    if (prevIndex < 0) {
      if (repeat === 'all') {
        prevIndex = queue.length - 1;
      } else {
        prevIndex = 0;
      }
    }

    await get().playTrack(queue[prevIndex], queue);
  },

  toggleRepeat: () => {
    const { repeat } = get();
    const nextRepeat = repeat === 'off' ? 'all' : repeat === 'all' ? 'one' : 'off';
    set({ repeat: nextRepeat });
  },

  toggleShuffle: () => {
    set((state) => ({ shuffle: !state.shuffle }));
  },

  addToQueue: (trackId) => {
    set((state) => ({
      queue: [...state.queue, trackId],
    }));
  },

  removeFromQueue: (index) => {
    set((state) => {
      const newQueue = [...state.queue];
      newQueue.splice(index, 1);
      let newIndex = state.index;
      if (index < state.index) {
        newIndex--;
      } else if (index === state.index) {
        newIndex = Math.min(newIndex, newQueue.length - 1);
      }
      return { queue: newQueue, index: newIndex };
    });
  },

  clearQueue: () => {
    set({ queue: [], index: -1, currentTrackId: null, status: 'idle' });
  },
}));
