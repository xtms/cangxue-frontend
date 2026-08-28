import { usePlayerStore } from '@music-app/core';

export function PlayerBar() {
  const {
    currentTrackId,
    status,
    positionMs,
    durationMs,
    volume,
    repeat,
    shuffle,
    play,
    pause,
    seek,
    setVolume,
    next,
    prev,
    toggleRepeat,
    toggleShuffle,
  } = usePlayerStore();

  if (!currentTrackId || status === 'idle') {
    return null;
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = durationMs > 0 ? (positionMs / durationMs) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-14 h-14 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                Track {currentTrackId.slice(0, 8)}
              </p>
              <p className="text-xs text-gray-500 truncate">Artist</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 flex-1 max-w-2xl">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleShuffle}
                className={`p-2 rounded-full transition-colors ${
                  shuffle ? 'text-primary-500' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M15.354 3.354a.5.5 0 010 .708L13.207 6.207a.5.5 0 01-.708-.708L14.586 3.414H12.5a.5.5 0 010-1h2.086a.5.5 0 01.354.146l.414.414a.5.5 0 010 .708zM4.5 10a.5.5 0 01.5-.5h2a.5.5 0 010 1H5a.5.5 0 01-.5-.5zm7.5-3a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5zm-7.5 6a.5.5 0 01.5-.5h2a.5.5 0 010 1H5a.5.5 0 01-.5-.5zm7.5-3a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5z" clipRule="evenodd" />
                </svg>
              </button>

              <button
                onClick={prev}
                className="p-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
                </svg>
              </button>

              <button
                onClick={status === 'playing' ? pause : play}
                className="p-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors"
              >
                {status === 'playing' ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              <button
                onClick={next}
                className="p-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798L4.555 5.168z" />
                </svg>
              </button>

              <button
                onClick={toggleRepeat}
                className={`p-2 rounded-full transition-colors ${
                  repeat !== 'off' ? 'text-primary-500' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-2 w-full">
              <span className="text-xs text-gray-500 w-12 text-right">
                {formatTime(positionMs)}
              </span>
              <input
                type="range"
                min="0"
                max={durationMs || 0}
                value={positionMs}
                onChange={(e) => seek(Number(e.target.value))}
                className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #0ea5e9 0%, #0ea5e9 ${progress}%, #e5e7eb ${progress}%, #e5e7eb 100%)`,
                }}
              />
              <span className="text-xs text-gray-500 w-12">
                {formatTime(durationMs)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-1 justify-end">
            <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" />
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-24 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
