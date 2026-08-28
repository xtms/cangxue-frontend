import type { PlaybackStatus, Song } from './types.js';

// Cross-platform audio playback interface. Web implements it with an
// HTMLAudioElement; mobile with react-native-track-player. `seek`/progress are
// in milliseconds.
export interface AudioEngine {
  load(song: Song): Promise<void>;
  play(): Promise<void>;
  pause(): void;
  seek(ms: number): void;
  setVolume(v: number): void;
  onStatus(cb: (s: PlaybackStatus) => void): () => void;
  onProgress(cb: (posMs: number, durMs: number) => void): () => void;
  onEnded(cb: () => void): () => void;
}
