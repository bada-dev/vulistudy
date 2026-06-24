import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { LoginScreen } from '@/components/login-screen';
import { SessionProvider, useSession } from '@/lib/session';

// Keeps the tab navigator mounted at all times and overlays the login screen
// on top while signed out — the same sibling-overlay approach the splash uses.
function RootNavigator() {
  const { username } = useSession();
  return (
    <>
      <AppTabs />
      {!username && <LoginScreen />}
      <AnimatedSplashOverlay />
    </>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SessionProvider>
        <RootNavigator />
      </SessionProvider>
    </ThemeProvider>
  );
}
