import { useQuery } from '@tanstack/react-query';
import { TrackItem } from '@music-app/ui';
import { usePlayerStore } from '@music-app/core';

export function HomePage() {
  const playTrack = usePlayerStore(s => s.playTrack);

  const { data: recentTracks, isLoading } = useQuery({
    queryKey: ['tracks', 'recent'],
    queryFn: async () => {
      const response = await fetch('/api/tracks?page=1');
      if (!response.ok) throw new Error('Failed to fetch tracks');
      return response.json();
    },
  });

  const { data: playlists } = useQuery({
    queryKey: ['playlists'],
    queryFn: async () => {
      const response = await fetch('/api/playlists?page=1');
      if (!response.ok) throw new Error('Failed to fetch playlists');
      return response.json();
    },
  });

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">推荐歌曲</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-20" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {recentTracks?.items?.map((track: any) => (
              <TrackItem
                key={track.id}
                title={track.title}
                artist={`Artist ${track.artistId?.slice(0, 8)}`}
                coverUrl={track.coverUrl}
                onPlay={() => playTrack(track.id, recentTracks.items.map((t: any) => t.id))}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">我的歌单</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {playlists?.items?.map((playlist: any) => (
            <div
              key={playlist.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="w-full aspect-square bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M0 2a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V2zm4 0v12h12V2H4z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 truncate">{playlist.title}</h3>
              <p className="text-sm text-gray-500">{playlist.trackIds?.length || 0} 首歌曲</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
