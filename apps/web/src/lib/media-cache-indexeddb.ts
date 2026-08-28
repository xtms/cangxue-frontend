import Dexie, { type Table } from 'dexie';
import type { MediaCache } from '@music-app/core';

interface CachedSong {
  songId: string;
  data: Blob;
  cachedAt: number;
  size: number;
}

class MusicCacheDB extends Dexie {
  songs!: Table<CachedSong, string>;

  constructor() {
    super('MusicCacheDB');
    this.version(1).stores({
      songs: 'songId, cachedAt, size',
    });
  }
}

const key = (songId: number | string): string => String(songId);

export function initMediaCache(): MediaCache {
  const db = new MusicCacheDB();

  return {
    has: async (songId) => {
      const row = await db.songs.get(key(songId));
      return !!row;
    },

    get: async (songId) => {
      const row = await db.songs.get(key(songId));
      return row?.data || null;
    },

    put: async (songId, data) => {
      const blob = data instanceof Blob ? data : new Blob([data]);
      await db.songs.put({
        songId: key(songId),
        data: blob,
        cachedAt: Date.now(),
        size: blob.size,
      });
    },

    url: async (songId) => {
      const row = await db.songs.get(key(songId));
      if (!row) return null;
      return URL.createObjectURL(row.data);
    },

    evict: async (policy) => {
      const { maxBytes, maxItems } = policy;

      if (maxItems) {
        const count = await db.songs.count();
        if (count > maxItems) {
          const toRemove = await db.songs
            .orderBy('cachedAt')
            .limit(count - maxItems)
            .toArray();
          await db.songs.bulkDelete(toRemove.map((t) => t.songId));
        }
      }

      if (maxBytes) {
        const all = await db.songs.orderBy('size').reverse().toArray();
        let totalSize = all.reduce((sum, t) => sum + t.size, 0);
        const toRemove: string[] = [];
        for (const song of all) {
          if (totalSize <= maxBytes) break;
          toRemove.push(song.songId);
          totalSize -= song.size;
        }
        if (toRemove.length > 0) {
          await db.songs.bulkDelete(toRemove);
        }
      }
    },
  };
}
