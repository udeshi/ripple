import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import type { Channel as StreamChannel } from 'stream-chat';
import { Channel, MessageComposer, MessageList } from 'stream-chat-expo';
import { useChat } from '../../src/lib/chat-context';
import { colors } from '../../src/theme';

export default function ChatChannelScreen() {
  const { cid } = useLocalSearchParams<{ cid: string }>();
  const { client } = useChat();
  const [channel, setChannel] = useState<StreamChannel | null>(null);

  useEffect(() => {
    if (!client || !cid) return;
    let cancelled = false;
    const ch = client.channel('messaging', cid);
    ch.watch().then(() => {
      if (!cancelled) setChannel(ch);
    });
    return () => {
      cancelled = true;
    };
  }, [client, cid]);

  if (!channel) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <Channel channel={channel}>
      <MessageList />
      <MessageComposer />
    </Channel>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
});
