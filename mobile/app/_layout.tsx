import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/lib/auth-context';
import { QueryProvider } from '../src/lib/query-provider';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryProvider>
        <AuthProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="login"
              options={{ title: 'Log in', presentation: 'modal' }}
            />
            <Stack.Screen
              name="register"
              options={{ title: 'Sign up', presentation: 'modal' }}
            />
            <Stack.Screen name="[username]/index" options={{ title: '' }} />
            <Stack.Screen
              name="[username]/followers"
              options={{ title: 'Followers' }}
            />
            <Stack.Screen
              name="[username]/following"
              options={{ title: 'Following' }}
            />
            <Stack.Screen name="posts/[id]" options={{ title: 'Post' }} />
            <Stack.Screen name="chat" options={{ title: 'Chat' }} />
          </Stack>
          <StatusBar style="auto" />
        </AuthProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
