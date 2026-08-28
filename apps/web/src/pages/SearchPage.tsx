import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrackItem, Input } from '@music-app/ui';
import { usePlayerStore } from '@music-app/core';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const playTrack = usePlayerStore(s => s.playTrack);

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query.trim()) return null;
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    enabled: query.trim().length > 0,
  });

  return (
    <div className="space-y-6">
      <div className="max-w-2xl">
        <Input
          placeholder="搜索歌曲、专辑、艺人..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-16" />
          ))}
        </div>
      )}

      {results && (
        <>
          {results.tracks?.items?.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">歌曲</h2>
              <div className="space-y-1">
                {results.tracks.items.map((track: any) => (
                  <TrackItem
                    key={track.id}
                    title={track.title}
                    artist={`Artist`}
                    coverUrl={track.coverUrl}
                    onPlay={() => playTrack(track.id, results.tracks.items.map((t: any) => t.id))}
                  />
                ))}
              </div>
            </section>
          )}

          {results.albums?.items?.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">专辑</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {results.albums.items.map((album: any) => (
                  <div
                    key={album.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="w-full aspect-square bg-gray-200 rounded-lg mb-3" />
                    <h3 className="font-medium text-gray-900 truncate">{album.title}</h3>
                  </div>
                ))}
              </div>
            </section>
          )}

          {results.artists?.items?.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">艺人</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {results.artists.items.map((artist: any) => (
                  <div
                    key={artist.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full mb-3" />
                    <h3 className="font-medium text-gray-900 text-center truncate">{artist.name}</h3>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {!isLoading && query && results && !results.tracks?.items?.length && !results.albums?.items?.length && !results.artists?.items?.length && (
        <div className="text-center py-12">
          <p className="text-gray-500">未找到相关结果</p>
        </div>
      )}
    </div>
  );
}
