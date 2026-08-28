import { useState } from 'react';
import type { FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { Artwork } from '../components/Artwork';
import { SongRow } from '../components/SongRow';

export function SearchPage() {
  const [q, setQ] = useState('');
  const [submitted, setSubmitted] = useState('');

  const songs = useQuery({
    queryKey: ['songs', 'search', submitted],
    queryFn: () => apiClient.songs.list({ q: submitted, limit: 50 }),
    enabled: submitted.length > 0,
  });
  const playlists = useQuery({
    queryKey: ['playlists'],
    queryFn: () => apiClient.playlists.list(),
    enabled: submitted.length > 0,
  });

  const filteredPlaylists = (playlists.data ?? []).filter((p) =>
    p.name.toLowerCase().includes(submitted.toLowerCase()),
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(q.trim());
  };

  const songItems = songs.data?.items ?? [];
  const queueIds = songItems.map((s) => s.id);

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="relative">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索歌曲、歌单"
          className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
      </form>

      {submitted.length === 0 ? (
        <div className="text-center text-sm text-gray-400 py-12">输入关键词搜索歌曲或歌单</div>
      ) : (
        <>
          {songs.isLoading && <div className="text-sm text-gray-400">搜索中…</div>}

          {songItems.length > 0 && (
            <section className="space-y-1">
              <h3 className="text-sm font-semibold text-gray-700 px-2">歌曲 · {songItems.length}</h3>
              {songItems.map((s) => (
                <SongRow key={s.id} song={s} queue={queueIds} />
              ))}
            </section>
          )}

          {filteredPlaylists.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700 px-2">歌单 · {filteredPlaylists.length}</h3>
              <div className="grid grid-cols-2 gap-3">
                {filteredPlaylists.map((pl) => (
                  <Link key={pl.id} to={`/playlist/${pl.id}`} className="block">
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                      <Artwork size="lg" rounded="rounded-none" />
                      <div className="p-2">
                        <p className="text-sm font-medium text-gray-900 truncate">{pl.name}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {!songs.isLoading && songItems.length === 0 && filteredPlaylists.length === 0 && (
            <div className="text-center text-sm text-gray-400 py-12">没有找到「{submitted}」相关结果</div>
          )}
        </>
      )}
    </div>
  );
}
