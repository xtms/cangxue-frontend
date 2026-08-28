import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { apiClient } from '../lib/api';
import { useAsync } from '../lib/useAsync';
import { theme } from '../theme';
import { Artwork } from '../components/Artwork';
import { SongRow } from '../components/SongRow';
import type { RootStackParamList } from '../navigation/types';

type Tab = 'recommend' | 'rank' | 'sheets';

const TABS: { key: Tab; label: string }[] = [
  { key: 'recommend', label: '推荐' },
  { key: 'rank', label: '排行榜' },
  { key: 'sheets', label: '歌单' },
];

export function HomeScreen() {
  const [tab, setTab] = useState<Tab>('recommend');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const songs = useAsync(() => apiClient.songs.list({ limit: 50 }), []);
  const playlists = useAsync(() => apiClient.playlists.list(), []);

  const items = songs.data?.items ?? [];
  const queueIds = items.map((s) => s.id);
  const ranked = [...items].sort((a, b) => (b.plays ?? 0) - (a.plays ?? 0));

  return (
    <View style={styles.flex}>
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <Pressable
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      {tab !== 'sheets' ? (
        <FlatList
          data={tab === 'rank' ? ranked : items}
          keyExtractor={(s) => String(s.id)}
          renderItem={({ item, index }) =>
            tab === 'rank' ? (
              <View style={styles.rankRow}>
                <Text style={[styles.rankNum, index < 3 && styles.rankTop]}>{index + 1}</Text>
                <View style={styles.flex1}>
                  <SongRow song={item} queue={queueIds} />
                </View>
              </View>
            ) : (
              <SongRow song={item} queue={queueIds} />
            )
          }
          ListEmptyComponent={
            <Text style={styles.empty}>{songs.loading ? '加载中…' : '还没有歌曲'}</Text>
          }
        />
      ) : (
        <FlatList
          data={playlists.data ?? []}
          numColumns={2}
          keyExtractor={(p) => String(p.id)}
          columnWrapperStyle={styles.grid}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => navigation.navigate('Playlist', { id: item.id })}>
              <Artwork size={160} rounded={10} />
              <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>{playlists.loading ? '加载中…' : '还没有歌单，去「我的」创建'}</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.bg },
  flex1: { flex: 1 },
  tabs: { flexDirection: 'row', backgroundColor: '#e5e7eb', margin: 12, borderRadius: 10, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: theme.surface },
  tabText: { fontSize: 14, color: theme.textMuted },
  tabTextActive: { color: theme.primary, fontWeight: '600' },
  rankRow: { flexDirection: 'row', alignItems: 'center', paddingRight: 12 },
  rankNum: { width: 32, textAlign: 'center', fontWeight: '700', color: theme.textMuted },
  rankTop: { color: theme.primary },
  grid: { justifyContent: 'space-between', paddingHorizontal: 12 },
  card: { flex: 1, marginHorizontal: 6, marginBottom: 12 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: theme.text, marginTop: 6 },
  empty: { textAlign: 'center', color: theme.textMuted, marginTop: 40 },
});
