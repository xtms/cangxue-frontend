import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '@music-app/core';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { MinePage } from './pages/MinePage';
import { PlaylistPage } from './pages/PlaylistPage';
import { NowPlayingPage } from './pages/NowPlayingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

function RequireAuth() {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="mine" element={<MinePage />} />
          <Route path="playlist/:id" element={<PlaylistPage />} />
        </Route>
        <Route path="now-playing" element={<NowPlayingPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
