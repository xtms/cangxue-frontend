import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Input } from '@music-app/ui';
import { usePlayerStore } from '@music-app/core';
import { apiClient } from '../lib/api';
import { Artwork } from '../components/Artwork';
import { SongRow } from '../components/SongRow';

export function PlaylistPage() {
  const { id } = useParams();
  const playlistId = Number(id);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const playTrack = usePlayerStore((s) => s.playTrack);

  const playlist = useQuery({
    queryKey: ['playlist', playlistId],
    queryFn: () => apiClient.playlists.get(playlistId),
    enabled: !Number.isNaN(playlistId),
  });
  const songs = useQuery({
    queryKey: ['playlist-songs', playlistId],
    queryFn: () => apiClient.playlists.songs(playlistId),
    enabled: !Number.isNaN(playlistId),
  });

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  useEffect(() => {
    if (playlist.data && editing) {
      setName(playlist.data.name);
      setDesc(playlist.data.description ?? '');
    }
  }, [playlist.data, editing]);

  const update = useMutation({
    mutationFn: () => apiClient.playlists.update(playlistId, { name, description: desc }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['playlist', playlistId] });
      qc.invalidateQueries({ queryKey: ['playlists'] });
      setEditing(false);
    },
  });
  const removeSong = useMutation({
    mutationFn: (songId: number) => apiClient.playlists.removeSong(playlistId, songId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['playlist-songs', playlistId] }),
  });
  const removePlaylist = useMutation({
    mutationFn: () => apiClient.playlists.remove(playlistId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['playlists'] });
      navigate('/mine');
    },
  });

  const songList = songs.data ?? [];
  const queueIds = songList.map((s) => s.id);
  const playAll = () => {
    if (queueIds.length) playTrack(queueIds[0], queueIds);
  };

  if (playlist.isLoading) return <div className="text-sm text-gray-400">加载中…</div>;
  if (playlist.isError) return <div className="text-sm text-red-500">无法加载歌单</div>;

  return (
    <div className="space-y-4">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回
      </button>

      <section className="flex gap-4">
        <div className="w-28 flex-shrink-0">
          <Artwork size="lg" />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-end">
          {editing ? (
            <div className="space-y-2">
              <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} placeholder="歌单名称" />
              <Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="描述" />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => update.mutate()} disabled={update.isPending || !name.trim()}>
                  保存
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                  取消
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-gray-900 truncate">{playlist.data?.name}</h1>
              <p className="text-sm text-gray-500 line-clamp-2">{playlist.data?.description || '暂无描述'}</p>
              <p className="text-xs text-gray-400 mt-1">{songList.length} 首</p>
            </>
          )}
        </div>
      </section>

      {!editing && (
        <div className="flex items-center gap-2">
          <Button onClick={playAll} disabled={songList.length === 0} size="sm">
            播放全部
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
            编辑
          </Button>
          <Button variant="ghost" size="sm" onClick={() => removePlaylist.mutate()} className="text-red-500">
            删除歌单
          </Button>
        </div>
      )}

      <section className="space-y-1">
        {songList.length === 0 && <div className="text-sm text-gray-400 py-8 text-center">歌单是空的，去首页收藏或添加歌曲</div>}
        {songList.map((s) => (
          <SongRow
            key={s.id}
            song={s}
            queue={queueIds}
            onRemove={() => removeSong.mutate(s.id)}
          />
        ))}
      </section>
    </div>
  );
}
