import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/auth/context';
import { canAccessAttendance } from './src/permissions';
import { HomeScreen } from './src/screens/HomeScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { NoAccessScreen } from './src/screens/NoAccessScreen';

function Root() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  if (!canAccessAttendance(user.role, user.permissions)) {
    return <NoAccessScreen />;
  }

  return <HomeScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <Root />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
