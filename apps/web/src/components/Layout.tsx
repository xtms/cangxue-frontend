import { Outlet, Link, useLocation } from 'react-router-dom';
import { usePlayerStore } from '@music-app/core';

export function Layout() {
  const location = useLocation();
  const status = usePlayerStore(s => s.status);

  const navItems = [
    { path: '/', label: '首页', icon: HomeIcon },
    { path: '/search', label: '搜索', icon: SearchIcon },
    { path: '/library', label: '音乐库', icon: LibraryIcon },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <MusicIcon />
              <span className="text-xl font-bold text-gray-900">Music App</span>
            </Link>
            <nav className="flex gap-1">
              {navItems.map(({ path, label, icon: Icon }) => {
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon active={isActive} />
                    {label}
                  </Link>
                );
              })}
            </nav>
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                登录
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
              >
                注册
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {status !== 'idle' && <div className="h-24" />}
    </div>
  );
}

function MusicIcon() {
  return (
    <svg className="w-8 h-8 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
      <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
    </svg>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-5 h-5 ${active ? 'text-primary-700' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
  );
}

function SearchIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-5 h-5 ${active ? 'text-primary-700' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
  );
}

function LibraryIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-5 h-5 ${active ? 'text-primary-700' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
      <path d="M0 2a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V2zm4 0v12h12V2H4z" />
    </svg>
  );
}
