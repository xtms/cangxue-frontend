import { HttpClient, useAuthStore } from '@music-app/core';
import type { User } from '@music-app/core';

const TOKEN_KEY = 'mf_token';
const USER_KEY = 'mf_user';

/**
 * Singleton HTTP client for cangxue-backend. The token is sourced from the
 * auth store (not held here), so login/logout anywhere in the app takes effect
 * immediately. On 401 the backend has no refresh endpoint, so we clear auth and
 * bounce to /login.
 */
export const apiClient = new HttpClient({
  baseUrl: '/api',
  tokenGetter: () => useAuthStore.getState().token,
  onUnauthorized: () => {
    useAuthStore.getState().clear();
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    if (location.pathname !== '/login' && location.pathname !== '/register') {
      location.href = '/login';
    }
  },
});

/** Read persisted credentials (if any) and hydrate the auth store on boot. */
export function bootstrapAuth(): void {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return;
  let user: User | null = null;
  try {
    user = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    user = null;
  }
  if (user) useAuthStore.getState().setAuth(user, token);
}

/** Persist auth state whenever it changes. */
export function persistAuth(user: User | null, token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}
