import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { PERMISSIONS } from './src/permissions';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://api.erpqalam.dev/api/v1';

type HealthResponse = {
  status?: string;
  postgres?: string;
  cache?: string;
  redis?: string;
};

export default function App() {
  const [health, setHealth] = useState<string>('Checking…');

  useEffect(() => {
    let cancelled = false;

    async function ping() {
      try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const body = (await response.json()) as HealthResponse;
        if (cancelled) return;
        if (!response.ok) {
          setHealth(`HTTP ${response.status}`);
          return;
        }
        setHealth(
          `${body.status ?? 'unknown'} · postgres ${body.postgres ?? '?'} · ${API_BASE_URL}`,
        );
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Health check failed';
        setHealth(message);
      }
    }

    void ping();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ERP Qalam</Text>
      <Text style={styles.meta}>HR scaffold · {PERMISSIONS.ATTENDANCE_VIEW}</Text>
      <Text style={styles.health}>{health}</Text>
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
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  meta: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 16,
  },
  health: {
    fontSize: 14,
    textAlign: 'center',
  },
});
