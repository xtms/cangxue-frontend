import TrackPlayer, { Event, State } from 'react-native-track-player';
import type { AudioEngine } from '@music-app/core';
import type { PlaybackStatus, Song } from '@music-app/core';

const mapState = (state: State | undefined): PlaybackStatus => {
  switch (state) {
    case State.Playing:
      return 'playing';
    case State.Paused:
    case State.Stopped:
      return 'paused';
    case State.Loading:
    case State.Buffering:
    case State.Connecting:
      return 'loading';
    case State.Error:
      return 'error';
    default:
      return 'idle';
  }
};

/**
 * AudioEngine backed by react-native-track-player. TrackPlayer is used as a
 * single-track player (reset + add one track per `load`), so the player-store
 * owns the queue and Repeat/Shuffle logic — mirroring exactly how the web
 * HTMLAudioElement adapter behaves. Background playback, lock-screen controls,
 * and notification artwork come from TrackPlayer for free.
 */
export function createTrackPlayerAudioEngine(): AudioEngine {
  let statusCb: ((s: PlaybackStatus) => void)[] = [];
  let progressCb: ((posMs: number, durMs: number) => void)[] = [];
  let endedCb: (() => void)[] = [];
  let ready = false;

  const ensureReady = async () => {
    if (ready) return;
    await TrackPlayer.setupPlayer();
    ready = true;
  };

  TrackPlayer.addEventListener(Event.PlaybackState, (e) => {
    const s = mapState(e.state);
    statusCb.forEach((cb) => cb(s));
  });
  TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, (e) => {
    progressCb.forEach((cb) => cb(e.position * 1000, e.duration * 1000));
  });
  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () => {
    endedCb.forEach((cb) => cb());
  });

  return {
    load: async (song: Song) => {
      await ensureReady();
      statusCb.forEach((cb) => cb('loading'));
      await TrackPlayer.reset();
      await TrackPlayer.add([
        {
          id: String(song.id),
          url: song.streamUrl ?? '',
          title: song.title,
          artist: song.artist || '未知艺术家',
        },
      ]);
    },
    play: async () => {
      await ensureReady();
      await TrackPlayer.play();
    },
    pause: () => {
      void TrackPlayer.pause();
    },
    seek: (ms: number) => {
      void TrackPlayer.seekTo(ms / 1000);
    },
    setVolume: (v: number) => {
      void TrackPlayer.setVolume(Math.max(0, Math.min(1, v)));
    },
    onStatus: (cb) => {
      statusCb.push(cb);
      return () => {
        statusCb = statusCb.filter((c) => c !== cb);
      };
    },
    onProgress: (cb) => {
      progressCb.push(cb);
      return () => {
        progressCb = progressCb.filter((c) => c !== cb);
      };
    },
    onEnded: (cb) => {
      endedCb.push(cb);
      return () => {
        endedCb = endedCb.filter((c) => c !== cb);
      };
    },
  };
}
