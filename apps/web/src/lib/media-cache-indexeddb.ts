import Dexie, { type Table } from 'dexie';
import type { MediaCache } from '@music-app/core';

interface CachedTrack {
  trackId: string;
  data: Blob;
  cachedAt: number;
  size: number;
}

class MusicCacheDB extends Dexie {
  tracks!: Table<CachedTrack, string>;

  constructor() {
    super('MusicCacheDB');
    this.version(1).stores({
      tracks: 'trackId, cachedAt, size',
    });
  }
}

export function initMediaCache(): MediaCache {
  const db = new MusicCacheDB();

  return {
    has: async (trackId: string) => {
      const track = await db.tracks.get(trackId);
      return !!track;
    },

    get: async (trackId: string) => {
      const track = await db.tracks.get(trackId);
      return track?.data || null;
    },

    put: async (trackId: string, data: Blob | ArrayBuffer) => {
      const blob = data instanceof Blob ? data : new Blob([data]);
      await db.tracks.put({
        trackId,
        data: blob,
        cachedAt: Date.now(),
        size: blob.size,
      });
    },

    url: async (trackId: string) => {
      const track = await db.tracks.get(trackId);
      if (!track) return null;
      return URL.createObjectURL(track.data);
    },

    evict: async (policy) => {
      const { maxBytes, maxItems } = policy;

      if (maxItems) {
        const count = await db.tracks.count();
        if (count > maxItems) {
          const toRemove = await db.tracks
            .orderBy('cachedAt')
            .limit(count - maxItems)
            .toArray();
          await db.tracks.bulkDelete(toRemove.map(t => t.trackId));
        }
      }

      if (maxBytes) {
        const all = await db.tracks.orderBy('size').reverse().toArray();
        let totalSize = all.reduce((sum, t) => sum + t.size, 0);
        const toRemove: string[] = [];

        for (const track of all) {
          if (totalSize <= maxBytes) break;
          toRemove.push(track.trackId);
          totalSize -= track.size;
        }

        if (toRemove.length > 0) {
          await db.tracks.bulkDelete(toRemove);
        }
      }
    },
  };
}
