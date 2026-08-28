import { Alert } from 'react-native';
import type { Song } from '@music-app/core';
import { usePlayerStore } from '@music-app/core';
import { apiClient } from './api';
import { toggleFavorite } from './favorites';

type MenuButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

// MusicFree-style song action sheet: play / play-next / favorite / add-to-
// playlist. Built on Alert so it needs no extra UI dependency; the "添加到
// 歌单" entry opens a second picker listing the user's playlists. When an
// `onRemove` handler is supplied (e.g. inside a playlist) a "从歌单移除"
// destructive entry is appended.
export function showSongMenu(
  song: Song,
  queue: number[],
  onFavoriteChange?: () => void,
  onRemove?: () => void,
): void {
  const play = usePlayerStore.getState().playTrack;
  const addToQueue = usePlayerStore.getState().addToQueue;

  const buttons: MenuButton[] = [
    { text: '播放', onPress: () => play(song.id, queue) },
    { text: '下一首播放', onPress: () => addToQueue(song.id) },
    {
      text: '收藏/取消收藏',
      onPress: async () => {
        await toggleFavorite(song);
        onFavoriteChange?.();
      },
    },
    {
      text: '添加到歌单',
      onPress: async () => {
        try {
          const pls = await apiClient.playlists.list();
          Alert.alert(
            '选择歌单',
            undefined,
            pls
              .map((p): MenuButton => ({
                text: p.name,
                onPress: () =>
                  apiClient.playlists
                    .addSong(p.id, { songId: song.id })
                    .catch((e) => Alert.alert('添加失败', e instanceof Error ? e.message : undefined)),
              }))
              .concat([{ text: '取消', style: 'cancel' as const }]),
          );
        } catch (e) {
          Alert.alert('加载歌单失败', e instanceof Error ? e.message : undefined);
        }
      },
    },
  ];

  if (onRemove) {
    buttons.push({ text: '从歌单移除', style: 'destructive', onPress: onRemove });
  }
  buttons.push({ text: '取消', style: 'cancel' });

  Alert.alert(song.title, song.artist || '未知艺术家', buttons);
}
