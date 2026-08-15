import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useFeatureFlags } from './src/hooks/useFeatureFlags';

export default function App() {
  const { loading, isEnabled } = useFeatureFlags();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ripple</Text>

      {loading ? (
        <ActivityIndicator />
      ) : isEnabled('chat') ? (
        <Text style={styles.body}>Chat is live for this device.</Text>
      ) : (
        <Text style={styles.body}>Chat is coming soon.</Text>
      )}

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    color: '#555',
  },
});
