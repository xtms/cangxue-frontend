import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@music-app/core';
import type { User } from '@music-app/core';

const TOKEN_KEY = 'mf_token';
const USER_KEY = 'mf_user';

/** Read persisted credentials (if any) and hydrate the auth store on boot. */
export async function bootstrapAuth(): Promise<void> {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (!token) return;
  let user: User | null = null;
  try {
    user = JSON.parse((await AsyncStorage.getItem(USER_KEY)) || 'null');
  } catch {
    user = null;
  }
  if (user) useAuthStore.getState().setAuth(user, token);
}

/** Persist auth state whenever it changes. Subscribe to the store in App.tsx. */
export async function persistAuth(user: User | null, token: string | null): Promise<void> {
  if (token) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  }
}
