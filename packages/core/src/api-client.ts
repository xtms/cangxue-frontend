import type {
  TokenSet,
  Page,
  Track,
  Album,
  Artist,
  Playlist,
  SearchResult,
  SearchType,
  RegisterInput,
  User,
} from './types.js';

export interface MusicApiClient {
  auth: {
    login(username: string, password: string): Promise<TokenSet>;
    register(input: RegisterInput): Promise<TokenSet>;
    refresh(refreshToken: string): Promise<TokenSet>;
  };
  tracks: {
    list(query?: { q?: string; page?: number }): Promise<Page<Track>>;
    get(id: string): Promise<Track>;
    streamUrl(id: string): string;
  };
  albums: {
    list(query?: { page?: number }): Promise<Page<Album>>;
    get(id: string): Promise<Album>;
  };
  artists: {
    list(query?: { page?: number }): Promise<Page<Artist>>;
    get(id: string): Promise<Artist>;
  };
  playlists: {
    list(query?: { page?: number }): Promise<Page<Playlist>>;
    get(id: string): Promise<Playlist>;
    create(input: { title: string }): Promise<Playlist>;
    addTrack(id: string, trackId: string): Promise<void>;
    removeTrack(id: string, trackId: string): Promise<void>;
  };
  search: {
    query(q: string, type?: SearchType): Promise<SearchResult>;
  };
  me: {
    get(): Promise<User>;
    history(): Promise<Page<Track>>;
    favorites(): Promise<Page<Track>>;
    toggleFavorite(trackId: string, fav: boolean): Promise<void>;
  };
}
