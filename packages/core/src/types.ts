export interface User {
  id: string;
  nickname: string;
  avatarUrl?: string;
}

export interface Artist {
  id: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
}

export interface Album {
  id: string;
  title: string;
  coverUrl?: string;
  artistId: string;
  releaseYear?: number;
  trackIds: string[];
}

export interface Track {
  id: string;
  title: string;
  durationMs: number;
  artistId: string;
  albumId?: string;
  coverUrl?: string;
  streamUrl?: string;
  codec?: 'mp3' | 'aac' | 'flac' | 'ogg';
}

export interface Playlist {
  id: string;
  title: string;
  ownerUserId: string;
  trackIds: string[];
  coverUrl?: string;
  createdAt: string;
}

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export interface PlaybackState {
  currentTrackId: string | null;
  status: PlaybackStatus;
  positionMs: number;
  durationMs: number;
  queue: string[];
  index: number;
  repeat: 'off' | 'all' | 'one';
  shuffle: boolean;
  volume: number;
}

export interface TokenSet {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type SearchType = 'track' | 'album' | 'artist' | 'playlist';

export interface SearchResult {
  tracks: Page<Track>;
  albums: Page<Album>;
  artists: Page<Artist>;
  playlists: Page<Playlist>;
}

export interface RegisterInput {
  username: string;
  password: string;
  nickname?: string;
}
