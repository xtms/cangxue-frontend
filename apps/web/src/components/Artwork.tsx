// Cover-art placeholder. The backend exposes no artwork, so songs render as a
// gradient tile with a music glyph (consistent across the app).
export function Artwork({
  size = 'md',
  rounded = 'rounded-lg',
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  rounded?: string;
}) {
  const dims =
    size === 'xs'
      ? 'w-10 h-10'
      : size === 'sm'
        ? 'w-12 h-12'
        : size === 'lg'
          ? 'w-full aspect-square'
          : 'w-14 h-14';
  return (
    <div
      className={`${dims} ${rounded} bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center flex-shrink-0 overflow-hidden`}
    >
      <svg className="w-1/2 h-1/2 text-white/90" fill="currentColor" viewBox="0 0 20 20">
        <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
      </svg>
    </div>
  );
}
