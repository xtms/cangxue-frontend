import { registerRootComponent } from 'expo';
import TrackPlayer from 'react-native-track-player';
import App from './App';
import { PlaybackService } from './src/adapters/playbackService';

// Register the background playback service once, before the app mounts. This
// wires lock-screen / notification / Bluetooth remote controls (defined in
// PlaybackService) to react-native-track-player.
TrackPlayer.registerPlaybackService(() => PlaybackService);

registerRootComponent(App);
