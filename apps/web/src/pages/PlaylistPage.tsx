import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { TrackItem } from '@music-app/ui';
import { usePlayerStore } from '@music-app/core';

export function PlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const playTrack = usePlayerStore(s => s.playTrack);

  const { data: playlist, isLoading } = useQuery({
    queryKey: ['playlist', id],
    queryFn: async () => {
      const response = await fetch(`/api/playlists/${id}`);
      if (!response.ok) throw new Error('Failed to fetch playlist');
      return response.json();
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-gray-200 animate-pulse rounded-lg h-8 w-64" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{playlist?.title}</h1>
        <p className="text-gray-500 mt-2">{playlist?.trackIds?.length || 0} 首歌曲</p>
      </div>

      <div className="space-y-1">
        {playlist?.trackIds?.map((trackId: string) => (
          <TrackItem
            key={trackId}
            title={`Track ${trackId.slice(0, 8)}`}
            artist="Artist"
            onPlay={() => playTrack(trackId, playlist.trackIds)}
          />
        ))}
      </div>
    </div>
  );
}
