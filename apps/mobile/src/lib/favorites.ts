import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Song } from '@music-app/core';

const KEY = 'mf_favorites';

export async function getFavorites(): Promise<Song[]> {
  try {
    return JSON.parse((await AsyncStorage.getItem(KEY)) || '[]') as Song[];
  } catch {
    return [];
  }
}

export async function toggleFavorite(song: Song): Promise<Song[]> {
  const list = await getFavorites();
  const i = list.findIndex((s) => s.id === song.id);
  if (i >= 0) list.splice(i, 1);
  else list.unshift({ id: song.id, title: song.title, artist: song.artist, duration: song.duration });
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
  return list;
}
