import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/auth/context';
import { canAccessAttendance } from './src/permissions';
import { MainTabs } from './src/navigation/MainTabs';
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

  return (
    <NavigationContainer>
      <MainTabs />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="auto" />
        <Root />
      </AuthProvider>
    </SafeAreaProvider>
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
