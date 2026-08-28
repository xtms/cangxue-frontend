import { HttpClient, useAuthStore } from '@music-app/core';
import type { User } from '@music-app/core';

/**
 * Singleton HTTP client for cangxue-backend. The token is sourced from the auth
 * store; on 401 (no refresh endpoint on the backend) we clear auth and the
 * navigator bounces to the login screen. Set EXPO_PUBLIC_API_URL to point at
 * your backend (default assumes the dev host runs the API on :3000).
 */
const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export const apiClient = new HttpClient({
  baseUrl,
  tokenGetter: () => useAuthStore.getState().token,
  onUnauthorized: () => {
    useAuthStore.getState().clear();
    // Persistence cleanup is handled by the storage subscriber in App.tsx.
  },
});

export type { User };
