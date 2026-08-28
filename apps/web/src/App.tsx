import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { LibraryPage } from './pages/LibraryPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PlaylistPage } from './pages/PlaylistPage';
import { AlbumPage } from './pages/AlbumPage';
import { ArtistPage } from './pages/ArtistPage';
import { PlayerBar } from './components/PlayerBar';

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="playlist/:id" element={<PlaylistPage />} />
          <Route path="album/:id" element={<AlbumPage />} />
          <Route path="artist/:id" element={<ArtistPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <PlayerBar />
    </>
  );
}

export default App;
