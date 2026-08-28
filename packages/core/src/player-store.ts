import { create } from 'zustand';
import type { AudioEngine } from './audio-engine.js';
import type { MusicApiClient } from './api-client.js';
import type { MediaCache } from './media-cache.js';
import type { PlaybackState, PlaybackStatus, Song } from './types.js';

interface PlayerStore extends PlaybackState {
  audioEngine: AudioEngine | null;
  apiClient: MusicApiClient | null;
  mediaCache: MediaCache | null;
  currentSong: Song | null;

  setAudioEngine: (engine: AudioEngine) => void;
  setApiClient: (client: MusicApiClient) => void;
  setMediaCache: (cache: MediaCache) => void;

  playTrack: (songId: number, queue?: number[]) => Promise<void>;
  play: () => Promise<void>;
  pause: () => void;
  seek: (ms: number) => void;
  setVolume: (v: number) => void;
  next: () => Promise<void>;
  prev: () => Promise<void>;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  addToQueue: (songId: number) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
}

const initialState: PlaybackState = {
  currentSongId: null,
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
  currentSong: null,

  setAudioEngine: (engine) => {
    set({ audioEngine: engine });

    engine.onStatus((status) => set({ status }));

    engine.onProgress((positionMs, durationMs) => set({ positionMs, durationMs }));

    engine.onEnded(() => {
      const state = get();
      if (state.repeat === 'one') {
        engine.seek(0);
        void engine.play();
      } else {
        void get().next();
      }
    });
  },

  setApiClient: (client) => set({ apiClient: client }),
  setMediaCache: (cache) => set({ mediaCache: cache }),

  playTrack: async (songId, queue) => {
    const { audioEngine, apiClient, mediaCache } = get();
    if (!audioEngine || !apiClient) return;

    const newQueue = queue || [songId];
    const index = newQueue.indexOf(songId);

    set({
      currentSongId: songId,
      currentSong: null,
      queue: newQueue,
      index,
      status: 'loading',
      positionMs: 0,
      durationMs: 0,
    });

    try {
      let streamUrl: string | null = null;
      if (mediaCache) {
        streamUrl = await mediaCache.url(songId);
      }
      if (!streamUrl) {
        streamUrl = apiClient.songs.streamUrl(songId);
      }

      const song = await apiClient.songs.get(songId);
      set({ currentSong: song });
      await audioEngine.load({ ...song, streamUrl });
      await audioEngine.play();

      // Best-effort play-count recording (backend POST /songs/{id}/play).
      void apiClient.songs.play(songId).catch(() => undefined);
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

  addToQueue: (songId) => {
    set((state) => ({ queue: [...state.queue, songId] }));
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
    set({ queue: [], index: -1, currentSongId: null, currentSong: null, status: 'idle' });
  },
}));
