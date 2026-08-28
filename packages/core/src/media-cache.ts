// Offline media cache interface. Web implements it with IndexedDB (Dexie);
// mobile with expo-file-system. Cache hits take priority over network streaming
// (see player-store.playTrack). Keys are song ids (number|string).
export interface MediaCache {
  has(songId: number | string): Promise<boolean>;
  get(songId: number | string): Promise<Blob | string | null>;
  put(songId: number | string, data: Blob | ArrayBuffer): Promise<void>;
  url(songId: number | string): Promise<string | null>;
  evict(policy: { maxBytes?: number; maxItems?: number }): Promise<void>;
}
