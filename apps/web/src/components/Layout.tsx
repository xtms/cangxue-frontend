import { NavLink, Outlet } from 'react-router-dom';
import { MiniPlayer } from './MiniPlayer';

const tabs = [
  { to: '/', label: '首页', end: true, icon: HomeIcon },
  { to: '/search', label: '搜索', end: false, icon: SearchIcon },
  { to: '/mine', label: '我的', end: false, icon: MineIcon },
];

export function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 max-w-md mx-auto relative">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="flex items-center justify-between h-14 px-4">
          <span className="text-lg font-bold text-gray-900">Music</span>
          <span className="text-xs text-gray-400">自托管音乐</span>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 pb-28">
        <Outlet />
      </main>

      <MiniPlayer />

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-14 bg-white border-t border-gray-200 flex z-30">
        {tabs.map(({ to, label, end, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 gap-0.5 text-[11px] ${
                isActive ? 'text-primary-600' : 'text-gray-500'
              }`
            }
          >
            <Icon />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

function HomeIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3v-6h6v6h3a1 1 0 001-1V10" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
    </svg>
  );
}

function MineIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14c-4 0-7 2-7 5v1h14v-1c0-3-3-5-7-5z" />
    </svg>
  );
}
