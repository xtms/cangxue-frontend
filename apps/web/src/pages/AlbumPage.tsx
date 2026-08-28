import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { TrackItem } from '@music-app/ui';
import { usePlayerStore } from '@music-app/core';

export function AlbumPage() {
  const { id } = useParams<{ id: string }>();
  const playTrack = usePlayerStore(s => s.playTrack);

  const { data: album, isLoading } = useQuery({
    queryKey: ['album', id],
    queryFn: async () => {
      const response = await fetch(`/api/albums/${id}`);
      if (!response.ok) throw new Error('Failed to fetch album');
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
      <div className="flex gap-6">
        <div className="w-48 h-48 bg-gray-200 rounded-lg flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-gray-500">专辑</p>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">{album?.title}</h1>
          <p className="text-gray-500 mt-2">{album?.trackIds?.length || 0} 首歌曲</p>
        </div>
      </div>

      <div className="space-y-1">
        {album?.trackIds?.map((trackId: string) => (
          <TrackItem
            key={trackId}
            title={`Track ${trackId.slice(0, 8)}`}
            artist="Artist"
            onPlay={() => playTrack(trackId, album.trackIds)}
          />
        ))}
      </div>
    </div>
  );
}
