import type { ListQuery, MusicApiClient } from './api-client.js';
import type {
  AuthResponse,
  Page,
  Playlist,
  RegisterInput,
  Song,
  User,
} from './types.js';

export interface HttpClientOptions {
  baseUrl: string;
  /** Returns the current JWT (single-token model; backend has no refresh). */
  tokenGetter?: () => string | null;
  /** Called on 401 so the app can clear auth and redirect. */
  onUnauthorized?: () => void;
}

export class HttpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

/**
 * HTTP client for cangxue-backend. Single-token JWT auth (`Authorization:
 * Bearer`), envelope unwrapping ({song}/{playlist}/{user}), and
 * `?token=`-appended stream URLs (so headerless media elements play protected
 * audio). No refresh endpoint exists on the backend.
 */
export class HttpClient implements MusicApiClient {
  private readonly baseUrl: string;
  private readonly tokenGetter: () => string | null;
  private readonly onUnauthorized?: () => void;

  constructor(opts: HttpClientOptions | string = '/api') {
    if (typeof opts === 'string') {
      this.baseUrl = opts;
      this.tokenGetter = () => null;
    } else {
      this.baseUrl = opts.baseUrl;
      this.tokenGetter = opts.tokenGetter ?? (() => null);
      this.onUnauthorized = opts.onUnauthorized;
    }
  }

  private get token(): string | null {
    return this.tokenGetter();
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const isFormData = init.body instanceof FormData;
    const headers: Record<string, string> = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...((init.headers as Record<string, string>) || {}),
    };
    const tok = this.token;
    if (tok) headers['Authorization'] = `Bearer ${tok}`;

    const res = await fetch(`${this.baseUrl}${path}`, { ...init, headers });

    if (res.status === 401) {
      this.onUnauthorized?.();
    }
    if (!res.ok) {
      let message = `HTTP ${res.status}`;
      try {
        const body = await res.json();
        if (body && body.message) message = String(body.message);
      } catch {
        /* non-JSON error body */
      }
      throw new HttpError(message, res.status);
    }
    if (res.status === 204) {
      return undefined as T;
    }
    return (await res.json()) as T;
  }

  auth = {
    register: (input: RegisterInput): Promise<AuthResponse> =>
      this.request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    login: (identifier: string, password: string): Promise<AuthResponse> =>
      this.request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      }),
    me: (): Promise<User> =>
      this.request<{ user: User }>('/auth/me').then((r) => r.user),
  };

  songs = {
    list: (query?: ListQuery): Promise<Page<Song>> => {
      const params = new URLSearchParams();
      if (query?.q) params.set('q', query.q);
      if (query?.limit != null) params.set('limit', String(query.limit));
      if (query?.offset != null) params.set('offset', String(query.offset));
      const qs = params.toString();
      return this.request<Page<Song>>(`/songs/${qs ? `?${qs}` : ''}`);
    },
    get: (id: number): Promise<Song> =>
      this.request<{ song: Song }>(`/songs/${id}`).then((r) => r.song),
    streamUrl: (id: number): string => {
      const tok = this.token;
      const base = `${this.baseUrl}/songs/${id}/stream`;
      return tok ? `${base}?token=${encodeURIComponent(tok)}` : base;
    },
    play: (id: number): Promise<void> =>
      this.request<void>(`/songs/${id}/play`, { method: 'POST' }),
    upload: (input: {
      file: Blob;
      title?: string;
      artist?: string;
      album?: string;
      year?: number;
      duration?: number;
    }): Promise<Song> => {
      const form = new FormData();
      form.append('file', input.file);
      if (input.title != null) form.append('title', input.title);
      if (input.artist != null) form.append('artist', input.artist);
      if (input.album != null) form.append('album', input.album);
      if (input.year != null) form.append('year', String(input.year));
      if (input.duration != null) form.append('duration', String(input.duration));
      return this.request<{ song: Song }>('/songs/', {
        method: 'POST',
        body: form,
      }).then((r) => r.song);
    },
    remove: (id: number): Promise<void> =>
      this.request<void>(`/songs/${id}`, { method: 'DELETE' }),
  };

  playlists = {
    list: (): Promise<Playlist[]> =>
      this.request<{ items: Playlist[] }>('/playlists/').then((r) => r.items),
    get: (id: number): Promise<Playlist> =>
      this.request<{ playlist: Playlist }>(`/playlists/${id}`).then((r) => r.playlist),
    create: (input: { name: string; description?: string }): Promise<Playlist> =>
      this.request<{ playlist: Playlist }>('/playlists/', {
        method: 'POST',
        body: JSON.stringify(input),
      }).then((r) => r.playlist),
    update: (
      id: number,
      input: { name?: string; description?: string },
    ): Promise<Playlist> =>
      this.request<{ playlist: Playlist }>(`/playlists/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      }).then((r) => r.playlist),
    remove: (id: number): Promise<void> =>
      this.request<void>(`/playlists/${id}`, { method: 'DELETE' }),
    songs: (id: number): Promise<Song[]> =>
      this.request<{ items: Song[] }>(`/playlists/${id}/songs`).then((r) => r.items),
    addSong: (id: number, input: { songId: number; position?: number }): Promise<void> =>
      this.request<void>(`/playlists/${id}/songs`, {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    removeSong: (id: number, songId: number): Promise<void> =>
      this.request<void>(`/playlists/${id}/songs/${songId}`, { method: 'DELETE' }),
  };
}
