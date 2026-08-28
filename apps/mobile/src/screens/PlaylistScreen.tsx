import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { usePlayerStore } from '@music-app/core';
import { apiClient } from '../lib/api';
import { useAsync } from '../lib/useAsync';
import { theme } from '../theme';
import { Artwork } from '../components/Artwork';
import { SongRow } from '../components/SongRow';
import type { RootScreenProps } from '../navigation/types';

export function PlaylistScreen({ route, navigation }: RootScreenProps<'Playlist'>) {
  const id = route.params.id;
  const playTrack = usePlayerStore((s) => s.playTrack);

  const playlist = useAsync(() => apiClient.playlists.get(id), [id]);
  const songs = useAsync(() => apiClient.playlists.songs(id), [id]);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  useEffect(() => {
    if (playlist.data && editing) {
      setName(playlist.data.name);
      setDesc(playlist.data.description ?? '');
    }
  }, [playlist.data, editing]);

  const queueIds = (songs.data ?? []).map((s) => s.id);

  const save = async () => {
    if (!name.trim()) return;
    try {
      await apiClient.playlists.update(id, { name, description: desc });
      setEditing(false);
      playlist.reload();
    } catch (e) {
      Alert.alert('保存失败', e instanceof Error ? e.message : undefined);
    }
  };

  const removeSong = async (songId: number) => {
    try {
      await apiClient.playlists.removeSong(id, songId);
      songs.reload();
    } catch (e) {
      Alert.alert('移除失败', e instanceof Error ? e.message : undefined);
    }
  };

  const removePlaylist = () => {
    Alert.alert('删除歌单', '确定删除该歌单？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          await apiClient.playlists.remove(id);
          navigation.goBack();
        },
      },
    ]);
  };

  if (playlist.loading) {
    return <View style={styles.center}><Text style={styles.muted}>加载中…</Text></View>;
  }
  if (playlist.error || !playlist.data) {
    return <View style={styles.center}><Text style={styles.muted}>无法加载歌单</Text></View>;
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.header}>
        <Artwork size={112} rounded={12} />
        <View style={styles.headerMeta}>
          {editing ? (
            <>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="歌单名称" maxLength={100} />
              <TextInput style={[styles.input, { marginTop: 8 }]} value={desc} onChangeText={setDesc} placeholder="描述" />
              <View style={styles.row}>
                <Pressable style={styles.btnSmall} onPress={save}><Text style={styles.btnText}>保存</Text></Pressable>
                <Pressable style={styles.btnGhost} onPress={() => setEditing(false)}><Text>取消</Text></Pressable>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.title} numberOfLines={2}>{playlist.data.name}</Text>
              <Text style={styles.desc} numberOfLines={2}>{playlist.data.description || '暂无描述'}</Text>
              <Text style={styles.count}>{(songs.data ?? []).length} 首</Text>
            </>
          )}
        </View>
      </View>

      {!editing && (
        <View style={[styles.row, { paddingHorizontal: 16, marginBottom: 8 }]}>
          <Pressable style={styles.btnSmall} onPress={() => queueIds.length && playTrack(queueIds[0], queueIds)}>
            <Text style={styles.btnText}>播放全部</Text>
          </Pressable>
          <Pressable style={styles.btnGhost} onPress={() => setEditing(true)}><Text>编辑</Text></Pressable>
          <Pressable style={styles.btnGhost} onPress={removePlaylist}><Text style={{ color: '#dc2626' }}>删除</Text></Pressable>
        </View>
      )}

      {(songs.data ?? []).length === 0 && !songs.loading && (
        <Text style={styles.empty}>歌单是空的，去首页收藏或添加歌曲</Text>
      )}
      {(songs.data ?? []).map((s) => (
        <SongRow key={s.id} song={s} queue={queueIds} onRemove={() => removeSong(s.id)} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg },
  muted: { color: theme.textMuted },
  header: { flexDirection: 'row', gap: 16, padding: 16 },
  headerMeta: { flex: 1, justifyContent: 'flex-end' },
  title: { fontSize: 20, fontWeight: '800', color: theme.text },
  desc: { fontSize: 13, color: theme.textMuted, marginTop: 4 },
  count: { fontSize: 12, color: theme.textMuted, marginTop: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  btnSmall: { backgroundColor: theme.primary, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  btnGhost: { paddingVertical: 8, paddingHorizontal: 10 },
  btnText: { color: '#fff', fontWeight: '600' },
  input: { borderWidth: 1, borderColor: theme.border, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 14 },
  empty: { textAlign: 'center', color: theme.textMuted, marginVertical: 24 },
});
