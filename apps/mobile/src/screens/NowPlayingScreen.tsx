import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { usePlayerStore } from '@music-app/core';
import { apiClient } from '../lib/api';
import { useAsync } from '../lib/useAsync';
import { formatMs } from '../lib/format';
import { getFavorites, toggleFavorite } from '../lib/favorites';
import { theme } from '../theme';
import { Artwork } from '../components/Artwork';

export function NowPlayingScreen() {
  const currentSong = usePlayerStore((s) => s.currentSong);
  const status = usePlayerStore((s) => s.status);
  const positionMs = usePlayerStore((s) => s.positionMs);
  const durationMs = usePlayerStore((s) => s.durationMs);
  const repeat = usePlayerStore((s) => s.repeat);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const queue = usePlayerStore((s) => s.queue);
  const index = usePlayerStore((s) => s.index);
  const play = usePlayerStore((s) => s.play);
  const pause = usePlayerStore((s) => s.pause);
  const seek = usePlayerStore((s) => s.seek);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const toggleRepeat = usePlayerStore((s) => s.toggleRepeat);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const removeFromQueue = usePlayerStore((s) => s.removeFromQueue);
  const playTrack = usePlayerStore((s) => s.playTrack);

  const favState = useAsync(
    async () => (currentSong ? (await getFavorites()).some((s) => s.id === currentSong.id) : false),
    [currentSong?.id],
  );
  const fav = favState.data ?? false;

  const [barWidth, setBarWidth] = useState(1);
  const isPlaying = status === 'playing';
  const progress = durationMs > 0 ? (positionMs / durationMs) * 100 : 0;

  if (!currentSong) {
    return (
      <View style={[styles.flex, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: '#9ca3af' }}>没有正在播放的歌曲</Text>
      </View>
    );
  }

  const onSeek = (x: number) => {
    if (durationMs > 0 && barWidth > 0) seek((x / barWidth) * durationMs);
  };

  const onFav = async () => {
    await toggleFavorite(currentSong);
    favState.reload();
  };

  return (
    <View style={styles.flex}>
      <View style={styles.body}>
        <View style={styles.artworkWrap}>
          <Artwork size={260} rounded={16} />
        </View>
        <Text style={styles.title} numberOfLines={1}>{currentSong.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{currentSong.artist || '未知艺术家'}</Text>

        {/* Seek bar */}
        <View>
          <Pressable
            style={styles.bar}
            onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
            onPress={(e) => onSeek(e.nativeEvent.locationX)}
          >
            <View style={[styles.barFill, { width: `${progress}%` }]} />
          </Pressable>
          <View style={styles.times}>
            <Text style={styles.time}>{formatMs(positionMs)}</Text>
            <Text style={styles.time}>{formatMs(durationMs)}</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <Pressable onPress={toggleShuffle}>
            <Text style={[styles.ctl, shuffle && styles.ctlActive]}>🔀</Text>
          </Pressable>
          <Pressable onPress={() => prev()}><Text style={styles.ctlLg}>⏮</Text></Pressable>
          <Pressable style={styles.playBtn} onPress={() => (isPlaying ? pause() : play())}>
            <Text style={styles.playIcon}>{isPlaying ? '❚❚' : '▶'}</Text>
          </Pressable>
          <Pressable onPress={() => next()}><Text style={styles.ctlLg}>⏭</Text></Pressable>
          <Pressable onPress={toggleRepeat}>
            <Text style={[styles.ctl, repeat !== 'off' && styles.ctlActive]}>
              🔁{repeat === 'one' ? '¹' : ''}
            </Text>
          </Pressable>
        </View>

        <Pressable onPress={onFav} style={styles.favBtn}>
          <Text style={{ fontSize: 22 }}>{fav ? '❤️' : '🤍'}</Text>
        </Pressable>
      </View>

      {/* Queue */}
      {queue.length > 0 && (
        <View style={styles.queueWrap}>
          <Text style={styles.queueTitle}>播放队列</Text>
          <FlatList
            data={queue}
            keyExtractor={(id, i) => `${id}-${i}`}
            renderItem={({ item: songId, index: i }) => (
              <QueueItem
                songId={songId}
                active={i === index}
                onPlay={() => playTrack(songId, queue)}
                onRemove={() => removeFromQueue(i)}
              />
            )}
          />
        </View>
      )}
    </View>
  );
}

function QueueItem({ songId, active, onPlay, onRemove }: { songId: number; active: boolean; onPlay: () => void; onRemove: () => void }) {
  const { data } = useAsync(() => apiClient.songs.get(songId), [songId]);
  return (
    <View style={[styles.qRow, active && styles.qRowActive]}>
      <Pressable style={styles.flex1} onPress={onPlay}>
        <Text style={[styles.qTitle, active && { color: theme.primary }]} numberOfLines={1}>
          {data?.title ?? `歌曲 #${songId}`}
        </Text>
        <Text style={styles.qArtist} numberOfLines={1}>{data?.artist || '未知艺术家'}</Text>
      </Pressable>
      <Pressable hitSlop={10} onPress={onRemove}>
        <Text style={styles.qRemove}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#111827' },
  body: { alignItems: 'center', paddingHorizontal: 32, paddingTop: 24, paddingBottom: 16 },
  artworkWrap: { marginBottom: 24 },
  title: { fontSize: 20, fontWeight: '800', color: '#f9fafb', textAlign: 'center' },
  artist: { fontSize: 14, color: '#9ca3af', marginTop: 4, textAlign: 'center' },
  bar: { height: 28, justifyContent: 'center', width: '100%', marginTop: 16 },
  barFill: { height: 4, backgroundColor: theme.primary, borderRadius: 2 },
  times: { flexDirection: 'row', justifyContent: 'space-between' },
  time: { fontSize: 11, color: '#9ca3af' },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: 20 },
  ctl: { fontSize: 20, color: '#9ca3af' },
  ctlActive: { color: theme.primary },
  ctlLg: { fontSize: 30, color: '#f9fafb' },
  playBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  playIcon: { fontSize: 24, color: '#111827' },
  favBtn: { marginTop: 20 },
  queueWrap: { flex: 1, paddingHorizontal: 16, paddingBottom: 24 },
  queueTitle: { fontSize: 14, fontWeight: '700', color: '#d1d5db', marginBottom: 8 },
  qRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  qRowActive: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 8, paddingHorizontal: 8 },
  flex1: { flex: 1, minWidth: 0 },
  qTitle: { fontSize: 14, color: '#e5e7eb' },
  qArtist: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  qRemove: { fontSize: 16, color: '#9ca3af', paddingHorizontal: 8 },
});
