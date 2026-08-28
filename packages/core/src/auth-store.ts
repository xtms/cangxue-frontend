import { create } from 'zustand';
import type { User } from './types.js';

// Auth state source of truth (single token, no refresh). Not persisted here —
// each app persists (web: localStorage, mobile: secure-store) and hydrates via
// setAuth on startup. The HttpClient reads the token via a tokenGetter pointing
// at this store, so requests stay authenticated without prop-drilling.
interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => set({ user, token }),
  setUser: (user) => set({ user }),
  clear: () => set({ user: null, token: null }),
}));
