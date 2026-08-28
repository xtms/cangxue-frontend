import type {
  AuthResponse,
  Page,
  Playlist,
  RegisterInput,
  Song,
  User,
} from './types.js';

export interface ListQuery {
  q?: string;
  limit?: number;
  offset?: number;
}

// The cross-platform client surface every app (web / mobile / tv / pad) programs
// against. Implementations (HttpClient, SelfHostedSource, fakes) satisfy this.
// Envelope unwrapping ({song}/{playlist}/{user}) and paging normalization happen
// inside the implementation, so callers receive clean domain objects.
export interface MusicApiClient {
  auth: {
    register(input: RegisterInput): Promise<AuthResponse>;
    login(identifier: string, password: string): Promise<AuthResponse>;
    me(): Promise<User>;
  };
  songs: {
    list(query?: ListQuery): Promise<Page<Song>>;
    get(id: number): Promise<Song>;
    streamUrl(id: number): string;
    play(id: number): Promise<void>;
    upload(input: {
      file: Blob;
      title?: string;
      artist?: string;
      album?: string;
      year?: number;
      duration?: number;
    }): Promise<Song>;
    remove(id: number): Promise<void>;
  };
  playlists: {
    list(): Promise<Playlist[]>;
    get(id: number): Promise<Playlist>;
    create(input: { name: string; description?: string }): Promise<Playlist>;
    update(id: number, input: { name?: string; description?: string }): Promise<Playlist>;
    remove(id: number): Promise<void>;
    songs(id: number): Promise<Song[]>;
    addSong(id: number, input: { songId: number; position?: number }): Promise<void>;
    removeSong(id: number, songId: number): Promise<void>;
  };
}
