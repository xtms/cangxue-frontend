import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePlayerStore } from '@music-app/core';
import { theme } from '../theme';
import { Artwork } from './Artwork';

type RootParamList = { NowPlaying: undefined; Playlist: { id: number } };

export const MiniPlayer: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
  const currentSong = usePlayerStore((s) => s.currentSong);
  const status = usePlayerStore((s) => s.status);
  const positionMs = usePlayerStore((s) => s.positionMs);
  const durationMs = usePlayerStore((s) => s.durationMs);
  const play = usePlayerStore((s) => s.play);
  const pause = usePlayerStore((s) => s.pause);

  if (!currentSong) return null;
  const isPlaying = status === 'playing';
  const progress = durationMs > 0 ? (positionMs / durationMs) * 100 : 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.bar}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Pressable style={styles.inner} onPress={() => navigation.navigate('NowPlaying')}>
          <Artwork size={40} />
          <View style={styles.meta}>
            <Text style={styles.title} numberOfLines={1}>{currentSong.title}</Text>
            <Text style={styles.artist} numberOfLines={1}>{currentSong.artist || '未知艺术家'}</Text>
          </View>
          <Pressable hitSlop={12} onPress={() => (isPlaying ? pause() : play())}>
            <Text style={styles.playBtn}>{isPlaying ? '❚❚' : '▶'}</Text>
          </Pressable>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { position: 'absolute', bottom: 60, left: 8, right: 8 },
  bar: { backgroundColor: theme.surface, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: theme.border, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  progressTrack: { height: 2, backgroundColor: theme.border },
  progressFill: { height: 2, backgroundColor: theme.primary },
  inner: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 8 },
  meta: { flex: 1, minWidth: 0 },
  title: { fontSize: 14, fontWeight: '600', color: theme.text },
  artist: { fontSize: 12, color: theme.textMuted, marginTop: 1 },
  playBtn: { fontSize: 18, color: theme.text, paddingHorizontal: 8 },
});
