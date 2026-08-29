import { ApiError } from '@ripple/api-client';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { rippleClient } from '../src/api/client';
import { colors, radii, spacing } from '../src/theme';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      await rippleClient.auth.forgotPassword(email);
      setSent(true);
    } catch (err) {
      console.error('forgotPassword failed', err);
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.muted}>
          If that email has an account, we&apos;ve sent a link to reset your
          password. Open it on your computer or phone&apos;s browser to
          finish.
        </Text>
        <Link href="/login" style={styles.link}>
          Back to log in
        </Link>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset your password</Text>
      <Text style={styles.muted}>
        Enter your email and we&apos;ll send you a link to reset it.
      </Text>
      <TextInput
        placeholder="Email"
        placeholderTextColor={colors.muted}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Pressable
        onPress={() => void onSubmit()}
        disabled={submitting || !email}
        style={[styles.submit, (submitting || !email) && styles.submitDisabled]}
      >
        <Text style={styles.submitText}>
          {submitting ? 'Sending…' : 'Send reset link'}
        </Text>
      </Pressable>
      <Link href="/login" style={styles.link}>
        Back to log in
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xxl, gap: spacing.md, justifyContent: 'center', backgroundColor: colors.background },
  title: { fontSize: 26, fontWeight: '700', color: colors.foreground },
  muted: { color: colors.muted, fontSize: 14, marginBottom: spacing.xs, lineHeight: 20 },
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
