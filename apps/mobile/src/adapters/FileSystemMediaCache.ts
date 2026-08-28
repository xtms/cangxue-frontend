import * as FileSystem from 'expo-file-system';
import type { MediaCache } from '@music-app/core';

const DIR = `${FileSystem.documentDirectory}media-cache/`;

const path = (songId: number | string): string => `${DIR}${songId}.bin`;

async function ensureDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(DIR, { intermediates: true });
  }
}

const toBase64 = (data: ArrayBuffer): string => {
  const bytes = new Uint8Array(data);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  // btoa is available in the React Native JS runtime.
  return btoa(binary);
};

/**
 * MediaCache backed by expo-file-system. The player-store prefers a cached
 * `url()` over the network stream, so downloaded songs play offline. `put`
 * handles ArrayBuffer; explicit downloads (not in the current screens) would
 * feed bytes here. When nothing is cached, playback falls back to the
 * authenticated `?token=` stream URL transparently.
 */
export function createFileSystemMediaCache(): MediaCache {
  return {
    has: async (songId) => {
      await ensureDir();
      const info = await FileSystem.getInfoAsync(path(songId));
      return info.exists;
    },

    get: async (songId) => {
      await ensureDir();
      const info = await FileSystem.getInfoAsync(path(songId));
      return info.exists ? path(songId) : null;
    },

    put: async (songId, data) => {
      await ensureDir();
      const bytes = data instanceof ArrayBuffer ? data : await (data as Blob).arrayBuffer();
      await FileSystem.writeAsStringAsync(path(songId), toBase64(bytes), {
        encoding: FileSystem.EncodingType.Base64,
      });
    },

    url: async (songId) => {
      await ensureDir();
      const info = await FileSystem.getInfoAsync(path(songId));
      return info.exists ? path(songId) : null;
    },

    evict: async (policy) => {
      await ensureDir();
      const files = await FileSystem.readDirectoryAsync(DIR);
      const infos = await Promise.all(
        files.map(async (f) => {
          const p = `${DIR}${f}`;
          const info = await FileSystem.getInfoAsync(p);
          return { path: p, size: (info as any).size ?? 0, mod: (info as any).modificationTime ?? 0 };
        }),
      );
      // LRU eviction by modification time.
      const sorted = [...infos].sort((a, b) => a.mod - b.mod);
      let removed = 0;
      if (policy.maxItems) {
        while (sorted.length - removed > policy.maxItems) {
          await FileSystem.deleteAsync(sorted[removed].path, { idempotent: true });
          removed++;
        }
      }
      if (policy.maxBytes) {
        let total = sorted.reduce((sum, f) => sum + f.size, 0);
        for (let i = removed; i < sorted.length && total > policy.maxBytes; i++) {
          await FileSystem.deleteAsync(sorted[i].path, { idempotent: true });
          total -= sorted[i].size;
          removed++;
        }
      }
    },
  };
}
