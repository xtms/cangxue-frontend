import TrackPlayer, { Event } from 'react-native-track-player';
import { usePlayerStore } from '@music-app/core';

/**
 * Background playback service for react-native-track-player. It wires
 * lock-screen / notification / Bluetooth remote-control buttons to the shared
 * player-store (so the queue/Repeat/Shuffle logic stays in one place). The
 * AudioEngine drives progress/state; this module only handles remote actions.
 */
export async function PlaybackService(): Promise<void> {
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    void usePlayerStore.getState().play();
  });
  TrackPlayer.addEventListener(Event.RemotePause, () => {
    usePlayerStore.getState().pause();
  });
  TrackPlayer.addEventListener(Event.RemoteNext, () => {
    void usePlayerStore.getState().next();
  });
  TrackPlayer.addEventListener(Event.RemotePrevious, () => {
    void usePlayerStore.getState().prev();
  });
  TrackPlayer.addEventListener(Event.RemoteSeek, (e) => {
    usePlayerStore.getState().seek((e.position ?? 0) * 1000);
  });
}
