import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../auth/context';

export function NoAccessScreen() {
  const { logout, user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>No access</Text>
      <Text style={styles.body}>
        You don&apos;t have access to this module.
      </Text>
      {user ? (
        <Text style={styles.meta}>
          {user.email} · {user.role}
        </Text>
      ) : null}
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
    color: '#475569',
    marginBottom: 12,
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
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
