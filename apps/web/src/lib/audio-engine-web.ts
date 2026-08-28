import type { AudioEngine, Track } from '@music-app/core';

type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export function initAudioEngine(): AudioEngine {
  const audio = new Audio();
  let statusCallbacks: ((s: PlaybackStatus) => void)[] = [];
  let progressCallbacks: ((posMs: number, durMs: number) => void)[] = [];
  let endedCallbacks: (() => void)[] = [];
  let progressInterval: number | null = null;

  const setStatus = (status: PlaybackStatus) => {
    statusCallbacks.forEach(cb => cb(status));
  };

  const startProgressTracking = () => {
    if (progressInterval) clearInterval(progressInterval);
    progressInterval = window.setInterval(() => {
      if (audio.duration && !isNaN(audio.duration)) {
        const posMs = audio.currentTime * 1000;
        const durMs = audio.duration * 1000;
        progressCallbacks.forEach(cb => cb(posMs, durMs));
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
    endedCallbacks.forEach(cb => cb());
  });

  audio.addEventListener('error', () => {
    setStatus('error');
    stopProgressTracking();
  });

  audio.addEventListener('loadedmetadata', () => {
    const durMs = audio.duration * 1000;
    progressCallbacks.forEach(cb => cb(audio.currentTime * 1000, durMs));
  });

  return {
    load: async (track: Track) => {
      setStatus('loading');
      if (track.streamUrl) {
        audio.src = track.streamUrl;
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
        statusCallbacks = statusCallbacks.filter(c => c !== cb);
      };
    },
    onProgress: (cb) => {
      progressCallbacks.push(cb);
      return () => {
        progressCallbacks = progressCallbacks.filter(c => c !== cb);
      };
    },
    onEnded: (cb) => {
      endedCallbacks.push(cb);
      return () => {
        endedCallbacks = endedCallbacks.filter(c => c !== cb);
      };
    },
  };
}
