import React from 'react';

export interface TrackItemProps {
  title: string;
  artist?: string;
  coverUrl?: string;
  duration?: string;
  onClick?: () => void;
  onPlay?: () => void;
}

export const TrackItem: React.FC<TrackItemProps> = ({
  title,
  artist,
  coverUrl,
  duration,
  onClick,
  onPlay,
}) => {
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative w-12 h-12 flex-shrink-0">
        {coverUrl ? (
          <img src={coverUrl} alt={title} className="w-full h-full object-cover rounded" />
        ) : (
          <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
            </svg>
          </div>
        )}
        {onPlay && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay();
            }}
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded"
          >
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
        {artist && <p className="text-xs text-gray-500 truncate">{artist}</p>}
      </div>
      {duration && <span className="text-xs text-gray-500">{duration}</span>}
    </div>
  );
};
