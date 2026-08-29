import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export function Avatar({
  src,
  alt,
  size = 40,
}: {
  src: string | null;
  alt: string;
  size?: number;
}) {
  if (src) {
    return (
      <Image
        source={{ uri: src }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }
  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={styles.fallbackText}>{alt.charAt(0).toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceRaised,
  },
  fallbackText: { color: colors.muted, fontWeight: '600' },
});
