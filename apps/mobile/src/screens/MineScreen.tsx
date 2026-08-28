import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '@music-app/core';
import type { Playlist, Song } from '@music-app/core';
import { apiClient } from '../lib/api';
import { useAsync } from '../lib/useAsync';
import { getFavorites } from '../lib/favorites';
import { theme } from '../theme';
import { Artwork } from '../components/Artwork';
import { SongRow } from '../components/SongRow';
import type { RootStackParamList } from '../navigation/types';

export function MineScreen() {
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [favorites, setFavorites] = useState<Song[]>([]);

  const playlists = useAsync(() => apiClient.playlists.list(), []);
  const loadFav = useCallback(() => {
    getFavorites().then(setFavorites);
  }, []);
  useFocusEffect(useCallback(() => {
    loadFav();
    playlists.reload();
  }, [loadFav, playlists]));

  const create = async () => {
    if (!name.trim()) return;
    try {
      await apiClient.playlists.create({ name, description: desc || undefined });
      setName('');
      setDesc('');
      playlists.reload();
    } catch (e) {
      Alert.alert('创建失败', e instanceof Error ? e.message : undefined);
    }
  };

  const favQueue = favorites.map((s) => s.id);

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      {/* Profile */}
      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user?.username || '?').charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.profileMeta}>
          <Text style={styles.username}>{user?.username || '用户'}</Text>
          <Text style={styles.email} numberOfLines={1}>{user?.email}</Text>
        </View>
        <Pressable onPress={() => clear()}>
          <Text style={styles.logout}>退出</Text>
        </Pressable>
      </View>

      {/* Create playlist */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>新建歌单</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="歌单名称" maxLength={100} />
        <TextInput style={styles.input} value={desc} onChangeText={setDesc} placeholder="描述（可选）" />
        <Pressable style={[styles.btn, !name.trim() && styles.btnDisabled]} onPress={create}>
          <Text style={styles.btnText}>创建</Text>
        </Pressable>
      </View>

      {/* My playlists */}
      <Text style={styles.sectionTitle}>我的歌单</Text>
      {(playlists.data ?? []).length === 0 && !playlists.loading && (
        <Text style={styles.empty}>还没有歌单</Text>
      )}
      {(playlists.data ?? []).map((pl: Playlist) => (
        <Pressable
          key={pl.id}
          style={styles.plRow}
          onPress={() => navigation.navigate('Playlist', { id: pl.id })}
        >
          <Artwork size={48} />
          <View style={styles.flex1}>
            <Text style={styles.plName} numberOfLines={1}>{pl.name}</Text>
            <Text style={styles.plDesc} numberOfLines={1}>{pl.description || '歌单'}</Text>
          </View>
        </Pressable>
      ))}

      {/* Favorites */}
      <Text style={[styles.sectionTitle, { marginTop: 16 }]}>我的喜欢</Text>
      {favorites.length === 0 && <Text style={styles.empty}>还没有收藏的歌曲</Text>}
      {favorites.map((s) => (
        <SongRow key={s.id} song={s} queue={favQueue} onFavoriteChange={loadFav} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.bg },
  flex1: { flex: 1, minWidth: 0 },
  container: { padding: 16, paddingBottom: 100 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  profileMeta: { flex: 1, minWidth: 0 },
  username: { fontSize: 17, fontWeight: '700', color: theme.text },
  email: { fontSize: 13, color: theme.textMuted, marginTop: 2 },
  logout: { color: '#dc2626', fontSize: 14 },
  card: { backgroundColor: theme.surface, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: theme.border, padding: 14, marginBottom: 8 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: theme.text, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: theme.border, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 14, marginTop: 8 },
  btn: { backgroundColor: theme.primary, borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginTop: 12 },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontWeight: '600' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: theme.text, marginBottom: 8 },
  plRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  plName: { fontSize: 15, fontWeight: '600', color: theme.text },
  plDesc: { fontSize: 13, color: theme.textMuted, marginTop: 2 },
  empty: { color: theme.textMuted, fontSize: 14, textAlign: 'center', marginVertical: 16 },
});
