import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParamList, RootStackParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { MineScreen } from '../screens/MineScreen';
import { PlaylistScreen } from '../screens/PlaylistScreen';
import { NowPlayingScreen } from '../screens/NowPlayingScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { MiniPlayer } from '../components/MiniPlayer';
import { theme } from '../theme';

type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Mine: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

// Bottom-tab shell (首页 / 搜索 / 我的) with a persistent MiniPlayer overlay.
// Tab screens call navigation.navigate('Playlist'/'NowPlaying'); react-navigation
// resolves those against the parent root stack.
function MainTabs() {
  return (
    <>
      <Tab.Navigator
        screenOptions={{ headerShown: false, tabBarActiveTintColor: theme.primary }}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: '首页' }} />
        <Tab.Screen name="Search" component={SearchScreen} options={{ tabBarLabel: '搜索' }} />
        <Tab.Screen name="Mine" component={MineScreen} options={{ tabBarLabel: '我的' }} />
      </Tab.Navigator>
      <MiniPlayer />
    </>
  );
}

// Auth gate: an unauthenticated user only sees Login/Register; once the auth
// store is hydrated with a user we swap to the main root stack.
export function RootNavigator({ authenticated }: { authenticated: boolean }) {
  if (!authenticated) {
    return (
      <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name="Login" component={LoginScreen} />
        <AuthStack.Screen name="Register" component={RegisterScreen} />
      </AuthStack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="Playlist" component={PlaylistScreen} />
      <Stack.Screen
        name="NowPlaying"
        component={NowPlayingScreen}
        options={{ presentation: 'fullScreenModal' }}
      />
    </Stack.Navigator>
  );
}
