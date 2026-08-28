import type { AudioEngine } from '@music-app/core';
import type { PlaybackStatus, Song } from '@music-app/core';

export function initAudioEngine(): AudioEngine {
  const audio = new Audio();
  let statusCallbacks: ((s: PlaybackStatus) => void)[] = [];
  let progressCallbacks: ((posMs: number, durMs: number) => void)[] = [];
  let endedCallbacks: (() => void)[] = [];
  let progressInterval: number | null = null;

  const setStatus = (status: PlaybackStatus) => {
    statusCallbacks.forEach((cb) => cb(status));
  };

  const startProgressTracking = () => {
    if (progressInterval) clearInterval(progressInterval);
    progressInterval = window.setInterval(() => {
      if (audio.duration && !isNaN(audio.duration)) {
        progressCallbacks.forEach((cb) => cb(audio.currentTime * 1000, audio.duration * 1000));
      }
    }, 500);
  };

  const stopProgressTracking = () => {
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
  };

  audio.addEventListener('play', () => {
    setStatus('playing');
    startProgressTracking();
  });
  audio.addEventListener('pause', () => {
    setStatus('paused');
    stopProgressTracking();
  });
  audio.addEventListener('ended', () => {
    stopProgressTracking();
    endedCallbacks.forEach((cb) => cb());
  });
  audio.addEventListener('error', () => {
    setStatus('error');
    stopProgressTracking();
  });
  audio.addEventListener('loadedmetadata', () => {
    if (audio.duration && !isNaN(audio.duration)) {
      progressCallbacks.forEach((cb) => cb(audio.currentTime * 1000, audio.duration * 1000));
    }
  });

  return {
    load: async (song: Song) => {
      setStatus('loading');
      if (song.streamUrl) {
        audio.src = song.streamUrl;
        audio.load();
      }
    },
    play: async () => {
      try {
        await audio.play();
      } catch (err) {
        setStatus('error');
        throw err;
      }
    },
    pause: () => {
      audio.pause();
    },
    seek: (ms: number) => {
      audio.currentTime = ms / 1000;
    },
    setVolume: (v: number) => {
      audio.volume = Math.max(0, Math.min(1, v));
    },
    onStatus: (cb) => {
      statusCallbacks.push(cb);
      return () => {
        statusCallbacks = statusCallbacks.filter((c) => c !== cb);
      };
    },
    onProgress: (cb) => {
      progressCallbacks.push(cb);
      return () => {
        progressCallbacks = progressCallbacks.filter((c) => c !== cb);
      };
    },
    onEnded: (cb) => {
      endedCallbacks.push(cb);
      return () => {
        endedCallbacks = endedCallbacks.filter((c) => c !== cb);
      };
    },
  };
}
