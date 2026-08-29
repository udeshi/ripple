import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Chat, OverlayProvider } from 'stream-chat-expo';
import { AuthProvider } from '../src/lib/auth-context';
import { ChatProvider, useChat } from '../src/lib/chat-context';
import { QueryProvider } from '../src/lib/query-provider';
import { colors } from '../src/theme';

function AppNavigator() {
  const { client } = useChat();

  const stack = (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode: 'minimal',
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.foreground,
        headerTitleStyle: { color: colors.foreground },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="login"
        options={{ title: 'Log in', presentation: 'modal' }}
      />
      <Stack.Screen
        name="register"
        options={{ title: 'Sign up', presentation: 'modal' }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{ title: 'Reset password', presentation: 'modal' }}
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
      <Stack.Screen name="chat/index" options={{ title: 'Chat' }} />
      <Stack.Screen
        name="chat/new"
        options={{ title: 'New message', presentation: 'modal' }}
      />
      <Stack.Screen name="chat/[cid]" options={{ title: 'Chat' }} />
    </Stack>
  );

  return client ? <Chat client={client}>{stack}</Chat> : stack;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryProvider>
          <AuthProvider>
            <ChatProvider>
              <OverlayProvider>
                <AppNavigator />
              </OverlayProvider>
              <StatusBar style="light" />
            </ChatProvider>
          </AuthProvider>
        </QueryProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
