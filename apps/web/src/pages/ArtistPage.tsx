import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { TrackItem } from '@music-app/ui';
import { usePlayerStore } from '@music-app/core';

export function ArtistPage() {
  const { id } = useParams<{ id: string }>();

  const { data: artist, isLoading } = useQuery({
    queryKey: ['artist', id],
    queryFn: async () => {
      const response = await fetch(`/api/artists/${id}`);
      if (!response.ok) throw new Error('Failed to fetch artist');
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
      <div className="flex gap-6 items-center">
        <div className="w-32 h-32 bg-gray-200 rounded-full flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-gray-500">艺人</p>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">{artist?.name}</h1>
          {artist?.bio && <p className="text-gray-600 mt-2">{artist.bio}</p>}
        </div>
      </div>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">热门歌曲</h2>
        <div className="space-y-1">
          <TrackItem
            title="Sample Track"
            artist={artist?.name}
          />
        </div>
      </section>
    </div>
  );
}
