import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore, usePlayerStore } from '@music-app/core';
import { apiClient } from './src/lib/api';
import { bootstrapAuth, persistAuth } from './src/lib/storage';
import { createTrackPlayerAudioEngine } from './src/adapters/TrackPlayerAudioEngine';
import { createFileSystemMediaCache } from './src/adapters/FileSystemMediaCache';
import { RootNavigator } from './src/navigation/RootNavigator';
import { theme } from './src/theme';

/**
 * App root. On boot it hydrates persisted auth (SecureStore/AsyncStorage) and
 * wires the shared player-store with its mobile adapters (TrackPlayer audio
 * engine + file-system media cache). Auth changes are persisted back. The
 * navigator swaps between the auth stack and the main stack based on the auth
 * store; TrackPlayer's playback service is registered separately in index.js.
 */
export default function App() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const [ready, setReady] = useState(false);
  const wired = useRef(false);

  useEffect(() => {
    if (wired.current) return;
    wired.current = true;
    (async () => {
      await bootstrapAuth();
      const store = usePlayerStore.getState();
      store.setAudioEngine(createTrackPlayerAudioEngine());
      store.setApiClient(apiClient);
      store.setMediaCache(createFileSystemMediaCache());
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    void persistAuth(user, token);
  }, [user, token]);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg }}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootNavigator authenticated={!!user} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
