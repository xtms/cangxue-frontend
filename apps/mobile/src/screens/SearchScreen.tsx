import { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { Page, Playlist, Song } from '@music-app/core';
import { apiClient } from '../lib/api';
import { useAsync } from '../lib/useAsync';
import { theme } from '../theme';
import { SongRow } from '../components/SongRow';
import type { RootStackParamList } from '../navigation/types';

type Row =
  | { kind: 'header'; text: string }
  | { kind: 'song'; song: Song }
  | { kind: 'playlist'; id: number; name: string };

const emptyPage: Page<Song> = { items: [], total: 0, limit: 0, offset: 0 };

export function SearchScreen() {
  const [q, setQ] = useState('');
  const [submitted, setSubmitted] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const songs = useAsync<Page<Song>>(
    () => (submitted ? apiClient.songs.list({ q: submitted, limit: 50 }) : Promise.resolve(emptyPage)),
    [submitted],
  );
  const playlists = useAsync<Playlist[]>(
    () => (submitted ? apiClient.playlists.list() : Promise.resolve([])),
    [submitted],
  );

  const songItems = songs.data?.items ?? [];
  const queueIds = songItems.map((s) => s.id);
  const filteredPlaylists = (playlists.data ?? []).filter((p) =>
    p.name.toLowerCase().includes(submitted.toLowerCase()),
  );

  const data: Row[] = [];
  if (songItems.length > 0) data.push({ kind: 'header', text: `歌曲 · ${songItems.length}` });
  songItems.forEach((song) => data.push({ kind: 'song', song }));
  if (filteredPlaylists.length > 0) data.push({ kind: 'header', text: `歌单 · ${filteredPlaylists.length}` });
  filteredPlaylists.forEach((p) => data.push({ kind: 'playlist', id: p.id, name: p.name }));

  return (
    <View style={styles.flex}>
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.input}
          value={q}
          onChangeText={setQ}
          placeholder="搜索歌曲、歌单"
          returnKeyType="search"
          onSubmitEditing={() => setSubmitted(q.trim())}
        />
      </View>

      {submitted.length === 0 ? (
        <Text style={styles.hint}>输入关键词搜索歌曲或歌单</Text>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, i) =>
            item.kind === 'song' ? `s${item.song.id}` : item.kind === 'playlist' ? `p${item.id}` : `h${i}`
          }
          renderItem={({ item }) => {
            if (item.kind === 'header') return <Text style={styles.sectionTitle}>{item.text}</Text>;
            if (item.kind === 'song') return <SongRow song={item.song} queue={queueIds} />;
            return (
              <Text
                style={styles.playlistRow}
                onPress={() => navigation.navigate('Playlist', { id: item.id })}
              >
                ♫ {item.name}
              </Text>
            );
          }}
          ListEmptyComponent={<Text style={styles.hint}>没有找到「{submitted}」相关结果</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.bg },
  searchWrap: { padding: 12 },
  input: { backgroundColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15 },
  hint: { textAlign: 'center', color: theme.textMuted, marginTop: 40 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: theme.text, paddingHorizontal: 12, paddingTop: 12, paddingBottom: 4 },
  playlistRow: { fontSize: 15, color: theme.text, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: theme.border },
});
