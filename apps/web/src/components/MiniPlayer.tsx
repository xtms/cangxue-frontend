import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '@music-app/core';
import { Artwork } from './Artwork';

// Compact now-playing bar pinned above the bottom nav. Tapping it opens the
// full-screen player (MusicFree's 音乐详情页).
export function MiniPlayer() {
  const navigate = useNavigate();
  const currentSong = usePlayerStore((s) => s.currentSong);
  const status = usePlayerStore((s) => s.status);
  const positionMs = usePlayerStore((s) => s.positionMs);
  const durationMs = usePlayerStore((s) => s.durationMs);
  const play = usePlayerStore((s) => s.play);
  const pause = usePlayerStore((s) => s.pause);
  const next = usePlayerStore((s) => s.next);

  if (!currentSong) return null;
  const isPlaying = status === 'playing';
  const progress = durationMs > 0 ? (positionMs / durationMs) * 100 : 0;

  return (
    <div className="fixed bottom-14 left-1/2 -translate-x-1/2 w-full max-w-md z-20 px-2">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
        <div className="h-0.5 bg-gray-200">
          <div className="h-full bg-primary-500 transition-[width] duration-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center gap-3 px-3 py-2">
          <button onClick={() => navigate('/now-playing')} className="flex items-center gap-3 flex-1 min-w-0 text-left">
            <Artwork size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{currentSong.title}</p>
              <p className="text-xs text-gray-500 truncate">{currentSong.artist || '未知艺术家'}</p>
            </div>
          </button>
          <button
            onClick={() => navigate('/now-playing')}
            className="p-2 text-gray-600 hover:text-gray-900"
            aria-label="展开播放器"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            onClick={() => (isPlaying ? pause() : play())}
            className="p-2 text-gray-700 hover:text-gray-900"
            aria-label={isPlaying ? '暂停' : '播放'}
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          <button onClick={() => next()} className="p-2 text-gray-700 hover:text-gray-900" aria-label="下一首">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798L4.555 5.168z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
