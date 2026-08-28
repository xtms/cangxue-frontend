import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { theme } from '../theme';

// Cover-art placeholder (the backend exposes no artwork): a gradient tile.
export const Artwork: React.FC<{ size?: number; rounded?: number }> = ({
  size = 48,
  rounded = 8,
}) => {
  return (
    <View
      style={[
        styles.tile,
        { width: size, height: size, borderRadius: rounded },
      ]}
    >
      <Text style={[styles.note, { fontSize: size * 0.5 }]}>♪</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tile: {
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  note: {
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '700',
  },
});
