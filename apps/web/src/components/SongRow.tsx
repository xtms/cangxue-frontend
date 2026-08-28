import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Song } from '@music-app/core';
import { usePlayerStore } from '@music-app/core';
import { apiClient } from '../lib/api';
import { formatDuration } from '../lib/format';
import { isFavorite, toggleFavorite } from '../lib/favorites';
import { Artwork } from './Artwork';

// A MusicFree-style song row: tap/double-click to play, with a "⋯" menu offering
// play-now / play-next / favorite / add-to-playlist.
export function SongRow({
  song,
  queue,
  onFavoriteChange,
  onRemove,
}: {
  song: Song;
  queue: number[];
  onFavoriteChange?: () => void;
  onRemove?: () => void;
}) {
  const playTrack = usePlayerStore((s) => s.playTrack);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const currentSongId = usePlayerStore((s) => s.currentSongId);
  const status = usePlayerStore((s) => s.status);
  const [menuOpen, setMenuOpen] = useState(false);
  const [fav, setFav] = useState(() => isFavorite(song.id));

  const isActive = currentSongId === song.id;
  const isPlaying = isActive && status === 'playing';

  const { data: playlists } = useQuery({
    queryKey: ['playlists'],
    queryFn: () => apiClient.playlists.list(),
    enabled: menuOpen,
  });

  const play = () => playTrack(song.id, queue);

  const handleFavorite = () => {
    toggleFavorite(song);
    setFav((v) => !v);
    onFavoriteChange?.();
    setMenuOpen(false);
  };

  const addToPlaylist = async (playlistId: number) => {
    try {
      await apiClient.playlists.addSong(playlistId, { songId: song.id });
    } catch (e) {
      alert(e instanceof Error ? e.message : '添加失败');
    }
    setMenuOpen(false);
  };

  return (
    <div
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 group cursor-default"
      onDoubleClick={play}
    >
      <button onClick={play} className="relative flex-shrink-0" aria-label={`播放 ${song.title}`}>
        <Artwork size="sm" />
        <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
          {isPlaying ? (
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </span>
      </button>

      <div className="flex-1 min-w-0" onClick={play}>
        <p className={`text-sm font-medium truncate ${isActive ? 'text-primary-600' : 'text-gray-900'}`}>
          {song.title}
        </p>
        <p className="text-xs text-gray-500 truncate">{song.artist || '未知艺术家'}</p>
      </div>

      <span className="text-xs text-gray-400 tabular-nums">{formatDuration(song.duration)}</span>

      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="p-2 text-gray-400 hover:text-gray-700 rounded-full"
          aria-label="更多操作"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-9 z-30 w-44 bg-white rounded-lg shadow-xl border border-gray-200 py-1 text-sm">
              <button
                onClick={() => { play(); setMenuOpen(false); }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
              >
                播放
              </button>
              <button
                onClick={() => { addToQueue(song.id); setMenuOpen(false); }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
              >
                下一首播放
              </button>
              <button
                onClick={handleFavorite}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
              >
                {fav ? '取消收藏' : '收藏'}
              </button>
              {onRemove && (
                <button
                  onClick={() => { onRemove(); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                >
                  从歌单移除
                </button>
              )}
              <div className="border-t border-gray-100 my-1" />
              <div className="px-4 py-1 text-xs text-gray-400">添加到歌单</div>
              <div className="max-h-44 overflow-y-auto">
                {playlists && playlists.length === 0 && (
                  <div className="px-4 py-1 text-xs text-gray-400">暂无歌单</div>
                )}
                {playlists?.map((pl) => (
                  <button
                    key={pl.id}
                    onClick={() => addToPlaylist(pl.id)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 truncate"
                  >
                    {pl.name}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
