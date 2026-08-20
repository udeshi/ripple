import { ApiError } from '@ripple/api-client';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../src/lib/auth-context';

export default function RegisterScreen() {
  const { register } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      await register(email, username, password);
      router.back();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign up</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Pressable
        onPress={() => void onSubmit()}
        disabled={submitting}
        style={styles.submit}
      >
        <Text style={styles.submitText}>
          {submitting ? 'Creating account…' : 'Sign up'}
        </Text>
      </Pressable>
      <Link href="/login" style={styles.link}>
        Already have an account? Log in
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 12, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  error: { color: '#e11d48', fontSize: 14 },
  submit: {
    backgroundColor: '#18181b',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  submitText: { color: 'white', fontWeight: '600' },
  link: { textAlign: 'center', marginTop: 12, color: '#52525b' },
});
