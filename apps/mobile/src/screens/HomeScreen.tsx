import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  apiRequest,
  getRefreshCallCount,
  resetRefreshCallCount,
} from '../api/client';
import { useAuth } from '../auth/context';
import { overwriteAccessToken } from '../auth/storage';

export function HomeScreen() {
  const { user, logout } = useAuth();
  const [probe, setProbe] = useState('');
  const [probing, setProbing] = useState(false);

  async function testParallelRefresh() {
    setProbing(true);
    setProbe('');
    resetRefreshCallCount();
    try {
      await overwriteAccessToken('expired.invalid.token');
      const results = await Promise.allSettled([
        apiRequest('/auth/me'),
        apiRequest('/auth/me'),
        apiRequest('/auth/me'),
        apiRequest('/attendance/users'),
        apiRequest('/attendance/users'),
      ]);
      const ok = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results
        .filter((r) => r.status === 'rejected')
        .map((r) => (r as PromiseRejectedResult).reason?.message ?? 'error');
      setProbe(
        `refresh POSTs: ${getRefreshCallCount()} (want 1)\n` +
          `succeeded: ${ok}/5` +
          (failed.length ? `\nfailed: ${failed.join('; ')}` : ''),
      );
    } catch (err) {
      setProbe(err instanceof Error ? err.message : 'Probe failed');
    } finally {
      setProbing(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ERP Qalam</Text>
      <Text style={styles.body}>
        Signed in as {user?.firstName} {user?.lastName}
      </Text>
      <Text style={styles.meta}>{user?.email}</Text>

      <Pressable
        style={[styles.button, styles.secondary, probing && styles.disabled]}
        onPress={() => void testParallelRefresh()}
        disabled={probing}
      >
        {probing ? (
          <ActivityIndicator color="#0f766e" />
        ) : (
          <Text style={styles.secondaryText}>Test parallel 401 refresh</Text>
        )}
      </Pressable>

      {probe ? <Text style={styles.probe}>{probe}</Text> : null}

      <Pressable style={styles.button} onPress={() => void logout()}>
        <Text style={styles.buttonText}>Log out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  body: {
    fontSize: 16,
    color: '#334155',
  },
  meta: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#0f766e',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
    marginTop: 12,
  },
  secondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#0f766e',
  },
  secondaryText: { color: '#0f766e', fontSize: 16, fontWeight: '600' },
  disabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  probe: {
    marginTop: 16,
    fontSize: 13,
    color: '#334155',
    fontFamily: 'monospace',
  },
});
