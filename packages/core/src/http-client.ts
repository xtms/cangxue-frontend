import type { MusicApiClient } from './api-client.js';
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

export class HttpClient implements MusicApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  setTokens(access: string, refresh: string) {
    this.accessToken = access;
    this.refreshToken = refresh;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401 && this.refreshToken) {
        const newTokens = await this.auth.refresh(this.refreshToken);
        this.setTokens(newTokens.accessToken, newTokens.refreshToken);
        headers['Authorization'] = `Bearer ${newTokens.accessToken}`;
        const retryResponse = await fetch(`${this.baseUrl}${path}`, {
          ...options,
          headers,
        });
        if (!retryResponse.ok) {
          throw new Error(`HTTP ${retryResponse.status}`);
        }
        return retryResponse.json();
      }
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }

  auth = {
    login: async (username: string, password: string): Promise<TokenSet> => {
      const tokens = await this.request<TokenSet>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      this.setTokens(tokens.accessToken, tokens.refreshToken);
      return tokens;
    },
    register: async (input: RegisterInput): Promise<TokenSet> => {
      const tokens = await this.request<TokenSet>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      this.setTokens(tokens.accessToken, tokens.refreshToken);
      return tokens;
    },
    refresh: async (refreshToken: string): Promise<TokenSet> => {
      const tokens = await this.request<TokenSet>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
      this.setTokens(tokens.accessToken, tokens.refreshToken);
      return tokens;
    },
  };

  tracks = {
    list: (query?: { q?: string; page?: number }): Promise<Page<Track>> => {
      const params = new URLSearchParams();
      if (query?.q) params.set('q', query.q);
      if (query?.page) params.set('page', String(query.page));
      return this.request<Page<Track>>(`/tracks?${params}`);
    },
    get: (id: string): Promise<Track> => {
      return this.request<Track>(`/tracks/${id}`);
    },
    streamUrl: (id: string): string => {
      return `${this.baseUrl}/tracks/${id}/stream`;
    },
  };

  albums = {
    list: (query?: { page?: number }): Promise<Page<Album>> => {
      const params = new URLSearchParams();
      if (query?.page) params.set('page', String(query.page));
      return this.request<Page<Album>>(`/albums?${params}`);
    },
    get: (id: string): Promise<Album> => {
      return this.request<Album>(`/albums/${id}`);
    },
  };

  artists = {
    list: (query?: { page?: number }): Promise<Page<Artist>> => {
      const params = new URLSearchParams();
      if (query?.page) params.set('page', String(query.page));
      return this.request<Page<Artist>>(`/artists?${params}`);
    },
    get: (id: string): Promise<Artist> => {
      return this.request<Artist>(`/artists/${id}`);
    },
  };

  playlists = {
    list: (query?: { page?: number }): Promise<Page<Playlist>> => {
      const params = new URLSearchParams();
      if (query?.page) params.set('page', String(query.page));
      return this.request<Page<Playlist>>(`/playlists?${params}`);
    },
    get: (id: string): Promise<Playlist> => {
      return this.request<Playlist>(`/playlists/${id}`);
    },
    create: (input: { title: string }): Promise<Playlist> => {
      return this.request<Playlist>('/playlists', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },
    addTrack: (id: string, trackId: string): Promise<void> => {
      return this.request<void>(`/playlists/${id}/tracks`, {
        method: 'POST',
        body: JSON.stringify({ trackId }),
      });
    },
    removeTrack: (id: string, trackId: string): Promise<void> => {
      return this.request<void>(`/playlists/${id}/tracks/${trackId}`, {
        method: 'DELETE',
      });
    },
  };

  search = {
    query: (q: string, type?: SearchType): Promise<SearchResult> => {
      const params = new URLSearchParams({ q });
      if (type) params.set('type', type);
      return this.request<SearchResult>(`/search?${params}`);
    },
  };

  me = {
    get: (): Promise<User> => {
      return this.request<User>('/users/me');
    },
    history: (): Promise<Page<Track>> => {
      return this.request<Page<Track>>('/me/history');
    },
    favorites: (): Promise<Page<Track>> => {
      return this.request<Page<Track>>('/me/favorites');
    },
    toggleFavorite: (trackId: string, fav: boolean): Promise<void> => {
      if (fav) {
        return this.request<void>(`/me/favorites/${trackId}`, { method: 'POST' });
      } else {
        return this.request<void>(`/me/favorites/${trackId}`, { method: 'DELETE' });
      }
    },
  };
}
