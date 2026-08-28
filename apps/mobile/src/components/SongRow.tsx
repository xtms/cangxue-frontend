import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Song } from '@music-app/core';
import { usePlayerStore } from '@music-app/core';
import { theme } from '../theme';
import { formatDuration } from '../lib/format';
import { showSongMenu } from '../lib/songMenu';
import { Artwork } from './Artwork';

export const SongRow: React.FC<{
  song: Song;
  queue: number[];
  onFavoriteChange?: () => void;
  onRemove?: () => void;
}> = ({ song, queue, onFavoriteChange, onRemove }) => {
  const currentSongId = usePlayerStore((s) => s.currentSongId);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const isActive = currentSongId === song.id;

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={() => playTrack(song.id, queue)}
    >
      <Artwork size={44} />
      <View style={styles.meta}>
        <Text style={[styles.title, isActive && { color: theme.primary }]} numberOfLines={1}>
          {song.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {song.artist || '未知艺术家'}
        </Text>
      </View>
      <Text style={styles.duration}>{formatDuration(song.duration)}</Text>
      <Pressable hitSlop={12} onPress={() => showSongMenu(song, queue, onFavoriteChange, onRemove)}>
        <Text style={styles.more}>⋯</Text>
      </Pressable>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  pressed: { backgroundColor: '#f3f4f6' },
  meta: { flex: 1, minWidth: 0 },
  title: { fontSize: 15, fontWeight: '600', color: theme.text },
  artist: { fontSize: 13, color: theme.textMuted, marginTop: 2 },
  duration: { fontSize: 12, color: theme.textMuted },
  more: { fontSize: 22, color: theme.textMuted, paddingHorizontal: 6 },
});
