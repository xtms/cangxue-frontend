import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Input } from '@music-app/ui';
import { useAuthStore } from '@music-app/core';
import { apiClient } from '../lib/api';
import { getFavorites } from '../lib/favorites';
import { Artwork } from '../components/Artwork';
import { SongRow } from '../components/SongRow';

export function MinePage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const clear = useAuthStore((s) => s.clear);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [, bumpFav] = useState(0);

  const me = useQuery({ queryKey: ['me'], queryFn: () => apiClient.auth.me() });
  useEffect(() => {
    if (me.data) setUser(me.data);
  }, [me.data, setUser]);

  const playlists = useQuery({ queryKey: ['playlists'], queryFn: () => apiClient.playlists.list() });

  const create = useMutation({
    mutationFn: () => apiClient.playlists.create({ name, description: desc || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['playlists'] });
      setName('');
      setDesc('');
    },
  });

  const favorites = getFavorites();
  const favQueue = favorites.map((s) => s.id);

  const logout = () => {
    clear();
    navigate('/login');
  };

  return (
    <div className="space-y-6">
      {/* Profile */}
      <section className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-xl font-bold">
          {(user?.username || '?').charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{user?.username || '用户'}</p>
          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
        </div>
        <button onClick={logout} className="text-sm text-gray-500 hover:text-red-500">退出</button>
      </section>

      {/* Create playlist */}
      <section className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">新建歌单</h3>
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            if (name.trim()) create.mutate();
          }}
          className="space-y-3"
        >
          <Input label="歌单名称" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required />
          <Input label="描述（可选）" value={desc} onChange={(e) => setDesc(e.target.value)} />
          {create.isError && (
            <p className="text-xs text-red-500">{create.error instanceof Error ? create.error.message : '创建失败'}</p>
          )}
          <Button type="submit" disabled={create.isPending || !name.trim()} size="sm">
            {create.isPending ? '创建中…' : '创建'}
          </Button>
        </form>
      </section>

      {/* My playlists */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700 px-2">我的歌单</h3>
        {playlists.isLoading && <div className="text-sm text-gray-400 px-2">加载中…</div>}
        {(playlists.data ?? []).length === 0 && !playlists.isLoading && (
          <div className="text-sm text-gray-400 px-2">还没有歌单</div>
        )}
        <div className="grid grid-cols-2 gap-3">
          {(playlists.data ?? []).map((pl) => (
            <Link key={pl.id} to={`/playlist/${pl.id}`} className="block">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <Artwork size="lg" rounded="rounded-none" />
                <div className="p-2">
                  <p className="text-sm font-medium text-gray-900 truncate">{pl.name}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Local favorites */}
      <section className="space-y-1">
        <h3 className="text-sm font-semibold text-gray-700 px-2">我的喜欢</h3>
        {favorites.length === 0 && <div className="text-sm text-gray-400 px-2">还没有收藏的歌曲</div>}
        {favorites.map((s) => (
          <SongRow
            key={s.id}
            song={s}
            queue={favQueue}
            onFavoriteChange={() => bumpFav((v) => v + 1)}
          />
        ))}
      </section>
    </div>
  );
}
