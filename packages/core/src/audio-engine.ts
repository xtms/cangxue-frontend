import { Track } from './types.js';

export interface AudioEngine {
  load(track: Track): Promise<void>;
  play(): Promise<void>;
  pause(): void;
  seek(ms: number): void;
  setVolume(v: number): void;
  onStatus(cb: (s: 'idle' | 'loading' | 'playing' | 'paused' | 'error') => void): () => void;
  onProgress(cb: (posMs: number, durMs: number) => void): () => void;
  onEnded(cb: () => void): () => void;
}
