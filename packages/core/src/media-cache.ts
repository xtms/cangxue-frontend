export interface MediaCache {
  has(trackId: string): Promise<boolean>;
  get(trackId: string): Promise<Blob | string | null>;
  put(trackId: string, data: Blob | ArrayBuffer): Promise<void>;
  url(trackId: string): Promise<string | null>;
  evict(policy: { maxBytes?: number; maxItems?: number }): Promise<void>;
}
