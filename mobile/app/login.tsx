import { ApiError } from '@ripple/api-client';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../src/lib/auth-context';
import { colors, radii, spacing } from '../src/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.back();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log in</Text>
      <TextInput
        placeholder="Email"
        placeholderTextColor={colors.muted}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor={colors.muted}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Pressable
        onPress={() => void onSubmit()}
        disabled={submitting}
        style={[styles.submit, submitting && styles.submitDisabled]}
      >
        <Text style={styles.submitText}>
          {submitting ? 'Logging in…' : 'Log in'}
        </Text>
      </Pressable>
      <Link href="/forgot-password" style={styles.link}>
        Forgot password?
      </Link>
      <Link href="/register" style={styles.link}>
        No account? Sign up
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xxl, gap: spacing.md, justifyContent: 'center', backgroundColor: colors.background },
  title: { fontSize: 26, fontWeight: '700', marginBottom: spacing.sm, color: colors.foreground },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    color: colors.foreground,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 2,
  },
  error: { color: colors.danger, fontSize: 14 },
  submit: {
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: '#071018', fontWeight: '700' },
  link: { textAlign: 'center', marginTop: spacing.md, color: colors.muted },
});
