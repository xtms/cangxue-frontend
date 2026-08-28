import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { usePlayerStore } from '@music-app/core';
import { apiClient } from '../lib/api';
import { formatMs } from '../lib/format';
import { isFavorite, toggleFavorite } from '../lib/favorites';
import { Artwork } from '../components/Artwork';

export function NowPlayingPage() {
  const navigate = useNavigate();
  const currentSong = usePlayerStore((s) => s.currentSong);
  const status = usePlayerStore((s) => s.status);
  const positionMs = usePlayerStore((s) => s.positionMs);
  const durationMs = usePlayerStore((s) => s.durationMs);
  const volume = usePlayerStore((s) => s.volume);
  const repeat = usePlayerStore((s) => s.repeat);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const queue = usePlayerStore((s) => s.queue);
  const index = usePlayerStore((s) => s.index);
  const play = usePlayerStore((s) => s.play);
  const pause = usePlayerStore((s) => s.pause);
  const seek = usePlayerStore((s) => s.seek);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const toggleRepeat = usePlayerStore((s) => s.toggleRepeat);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const removeFromQueue = usePlayerStore((s) => s.removeFromQueue);
  const playTrack = usePlayerStore((s) => s.playTrack);

  const [, bumpFav] = useState(0);
  const isPlaying = status === 'playing';
  const fav = currentSong ? isFavorite(currentSong.id) : false;
  const progress = durationMs > 0 ? (positionMs / durationMs) * 100 : 0;

  if (!currentSong) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-900 text-gray-100">
        <p className="text-gray-400">没有正在播放的歌曲</p>
        <button onClick={() => navigate('/')} className="text-primary-300">去首页选一首</button>
      </div>
    );
  }

  const handleFav = () => {
    toggleFavorite(currentSong);
    bumpFav((v) => v + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-950 text-gray-100 flex flex-col">
      <div className="flex items-center justify-between p-4">
        <button onClick={() => navigate(-1)} className="p-2" aria-label="返回">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm text-gray-400">正在播放</span>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-6">
        <div className="w-64 max-w-full">
          <Artwork size="lg" rounded="rounded-2xl" />
        </div>
        <div className="text-center w-full">
          <h1 className="text-xl font-bold truncate">{currentSong.title}</h1>
          <p className="text-sm text-gray-400 truncate">{currentSong.artist || '未知艺术家'}</p>
        </div>

        {/* Progress */}
        <div className="w-full max-w-md space-y-1">
          <input
            type="range"
            min={0}
            max={durationMs || 0}
            value={positionMs}
            onChange={(e) => seek(Number(e.target.value))}
            className="w-full h-1 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #38bdf8 0%, #38bdf8 ${progress}%, #4b5563 ${progress}%, #4b5563 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-gray-400 tabular-nums">
            <span>{formatMs(positionMs)}</span>
            <span>{formatMs(durationMs)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
          <button onClick={toggleShuffle} className={shuffle ? 'text-primary-400' : 'text-gray-400'} aria-label="随机">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M15.354 3.354a.5.5 0 010 .708L13.207 6.207a.5.5 0 01-.708-.708L14.586 3.414H12.5a.5.5 0 010-1h2.086a.5.5 0 01.354.146l.414.414a.5.5 0 010 .708zM4.5 10a.5.5 0 01.5-.5h2a.5.5 0 010 1H5a.5.5 0 01-.5-.5zm7.5-3a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5zm-7.5 6a.5.5 0 01.5-.5h2a.5.5 0 010 1H5a.5.5 0 01-.5-.5zm7.5-3a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5z" clipRule="evenodd" />
            </svg>
          </button>
          <button onClick={() => prev()} className="text-gray-100" aria-label="上一首">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
            </svg>
          </button>
          <button
            onClick={() => (isPlaying ? pause() : play())}
            className="p-4 bg-white text-gray-900 rounded-full hover:scale-105 transition-transform"
            aria-label={isPlaying ? '暂停' : '播放'}
          >
            {isPlaying ? (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          <button onClick={() => next()} className="text-gray-100" aria-label="下一首">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798L4.555 5.168z" />
            </svg>
          </button>
          <button onClick={toggleRepeat} className={repeat !== 'off' ? 'text-primary-400' : 'text-gray-400'} aria-label="循环">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Favorite + volume */}
        <div className="flex items-center gap-4 w-full max-w-md">
          <button onClick={handleFav} className={fav ? 'text-red-500' : 'text-gray-400'} aria-label="收藏">
            <svg className="w-6 h-6" fill={fav ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" />
          </svg>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="flex-1 h-1 rounded-full appearance-none cursor-pointer bg-gray-600"
          />
        </div>
      </div>

      {/* Queue */}
      {queue.length > 0 && (
        <div className="px-4 pb-8 max-h-64 overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">播放队列</h3>
          <div className="space-y-1">
            {queue.map((songId, i) => (
              <QueueItem
                key={`${songId}-${i}`}
                songId={songId}
                queue={queue}
                active={i === index}
                onPlay={() => playTrack(songId, queue)}
                onRemove={() => removeFromQueue(i)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function QueueItem({
  songId,
  active,
  onPlay,
  onRemove,
}: {
  songId: number;
  queue: number[];
  active: boolean;
  onPlay: () => void;
  onRemove: () => void;
}) {
  const { data: song } = useQuery({
    queryKey: ['song', songId],
    queryFn: () => apiClient.songs.get(songId),
  });
  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg ${active ? 'bg-white/10' : 'hover:bg-white/5'}`}>
      <button onClick={onPlay} className="flex-1 min-w-0 text-left">
        <p className={`text-sm truncate ${active ? 'text-primary-300' : 'text-gray-200'}`}>
          {song?.title ?? `歌曲 #${songId}`}
        </p>
        <p className="text-xs text-gray-400 truncate">{song?.artist || '未知艺术家'}</p>
      </button>
      <button onClick={onRemove} className="p-1 text-gray-500 hover:text-red-400" aria-label="移出队列">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
