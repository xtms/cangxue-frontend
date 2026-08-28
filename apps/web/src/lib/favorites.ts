import type { Song } from '@music-app/core';

// Local-only favorites (the backend has no favorites endpoint yet). We store a
// song snapshot so the list renders offline; playback still resolves the song by
// id via the API so it stays fresh.
const KEY = 'mf_favorites';

export function getFavorites(): Song[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]') as Song[];
  } catch {
    return [];
  }
}

export function isFavorite(id: number): boolean {
  return getFavorites().some((s) => s.id === id);
}

export function toggleFavorite(song: Song): Song[] {
  const list = getFavorites();
  const i = list.findIndex((s) => s.id === song.id);
  if (i >= 0) list.splice(i, 1);
  else list.unshift({ id: song.id, title: song.title, artist: song.artist, duration: song.duration });
  localStorage.setItem(KEY, JSON.stringify(list));
  return list;
}
