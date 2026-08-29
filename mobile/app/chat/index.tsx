import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { ChannelList } from 'stream-chat-expo';
import { useAuth } from '../../src/lib/auth-context';
import { useChat } from '../../src/lib/chat-context';
import { colors } from '../../src/theme';

export default function ChatListScreen() {
  const { client } = useChat();
  const { user } = useAuth();
  const router = useRouter();

  const composeButton = (
    <Stack.Screen
      options={{
        headerRight: () => (
          <Pressable
            onPress={() => router.push('/chat/new')}
            hitSlop={8}
            style={styles.composeButton}
          >
            <Ionicons name="create-outline" size={24} color={colors.foreground} />
          </Pressable>
        ),
      }}
    />
  );

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Log in to use chat.</Text>
      </View>
    );
  }
  if (!client) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <>
      {composeButton}
      <ChannelList
        filters={{ type: 'messaging', members: { $in: [user.id] } }}
        sort={{ last_message_at: -1 }}
        onSelect={(channel) => router.push(`/chat/${channel.id}`)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  muted: { color: colors.muted },
  composeButton: { paddingHorizontal: 4 },
});
