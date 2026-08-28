// Domain types aligned to the real cangxue-backend API contract
// (see app/modules/{auth,songs,playlists}). IDs are integers server-side.

export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

// `duration` is in seconds (backend `duration_seconds`). `streamUrl` is a
// transient, client-set field (built by the HTTP client, never sent by server).
export interface Song {
  id: number;
  title: string;
  artist?: string | null;
  album?: string | null;
  artistId?: number | null;
  albumId?: number | null;
  year?: number | null;
  duration?: number | null;
  mimeType?: string | null;
  size?: number | null;
  plays?: number | null;
  createdAt?: string;
  streamUrl?: string;
}

export interface Playlist {
  id: number;
  name: string;
  description?: string | null;
  ownerId: number;
  createdAt: string;
}

// `GET /api/songs/?q=&limit=&offset=` → {items,total,limit,offset}
export interface Page<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

// Playback internals are kept in milliseconds (standard audio unit); song
// durations (seconds) are converted at the boundary.
export interface PlaybackState {
  currentSongId: number | null;
  status: PlaybackStatus;
  positionMs: number;
  durationMs: number;
  queue: number[];
  index: number;
  repeat: 'off' | 'all' | 'one';
  shuffle: boolean;
  volume: number;
}
