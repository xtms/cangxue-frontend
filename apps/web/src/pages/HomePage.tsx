import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import type { Song } from '@music-app/core';
import { apiClient } from '../lib/api';
import { Artwork } from '../components/Artwork';
import { SongRow } from '../components/SongRow';

type Tab = 'recommend' | 'rank' | 'sheets';

const tabs: { key: Tab; label: string }[] = [
  { key: 'recommend', label: '推荐' },
  { key: 'rank', label: '排行榜' },
  { key: 'sheets', label: '歌单' },
];

export function HomePage() {
  const [tab, setTab] = useState<Tab>('recommend');

  const songs = useQuery({
    queryKey: ['songs', 'home'],
    queryFn: () => apiClient.songs.list({ limit: 50 }),
  });
  const playlists = useQuery({
    queryKey: ['playlists'],
    queryFn: () => apiClient.playlists.list(),
  });

  const items = songs.data?.items ?? [];
  const queueIds = items.map((s) => s.id);
  const ranked = [...items].sort((a, b) => (b.plays ?? 0) - (a.plays ?? 0));

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
              tab === t.key ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'recommend' && <SongList songs={items} queueIds={queueIds} loading={songs.isLoading} />}
      {tab === 'rank' && <RankList songs={ranked} queueIds={queueIds} loading={songs.isLoading} />}
      {tab === 'sheets' && <PlaylistGrid loading={playlists.isLoading} />}
    </div>
  );
}

function SongList({ songs, queueIds, loading }: { songs: Song[]; queueIds: number[]; loading: boolean }) {
  if (loading) return <Skeleton rows={6} />;
  if (songs.length === 0) return <Empty text="还没有歌曲，去后端上传一些吧" />;
  return (
    <div className="space-y-1">
      {songs.map((s) => (
        <SongRow key={s.id} song={s} queue={queueIds} />
      ))}
    </div>
  );
}

function RankList({ songs, queueIds, loading }: { songs: Song[]; queueIds: number[]; loading: boolean }) {
  if (loading) return <Skeleton rows={6} />;
  if (songs.length === 0) return <Empty text="暂无排行数据" />;
  return (
    <div className="space-y-1">
      {songs.map((s, i) => (
        <div key={s.id} className="flex items-center gap-3 p-2">
          <span className={`w-6 text-center text-sm font-bold ${i < 3 ? 'text-primary-600' : 'text-gray-400'}`}>
            {i + 1}
          </span>
          <div className="flex-1 min-w-0">
            <SongRow song={s} queue={queueIds} />
          </div>
        </div>
      ))}
    </div>
  );
}

function PlaylistGrid({ loading }: { loading: boolean }) {
  const playlists = useQuery({
    queryKey: ['playlists'],
    queryFn: () => apiClient.playlists.list(),
  });
  if (loading || playlists.isLoading) return <Skeleton rows={3} />;
  const list = playlists.data ?? [];
  if (list.length === 0) return <Empty text="还没有歌单，去「我的」创建一个" />;
  return (
    <div className="grid grid-cols-2 gap-3">
      {list.map((pl) => (
        <Link key={pl.id} to={`/playlist/${pl.id}`} className="block">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="w-full aspect-square">
              <Artwork size="lg" rounded="rounded-none" />
            </div>
            <div className="p-2">
              <p className="text-sm font-medium text-gray-900 truncate">{pl.name}</p>
              <p className="text-xs text-gray-400">{pl.description || '歌单'}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function Skeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-2">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2">
          <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
            <div className="h-2 bg-gray-200 rounded animate-pulse w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="text-center text-sm text-gray-400 py-12">{text}</div>;
}
