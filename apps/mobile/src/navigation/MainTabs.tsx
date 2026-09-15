import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { EmployeeDetailScreen } from '../screens/EmployeeDetailScreen';
import { EmployeesScreen } from '../screens/EmployeesScreen';
import { OverviewScreen } from '../screens/OverviewScreen';
import { RecordsScreen } from '../screens/RecordsScreen';
import type {
  EmployeesStackParamList,
  MainTabParamList,
  RecordsStackParamList,
} from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const EmployeesStack = createNativeStackNavigator<EmployeesStackParamList>();
const RecordsStack = createNativeStackNavigator<RecordsStackParamList>();

function EmployeesNavigator() {
  const { t } = useTranslation('attendance');
  return (
    <EmployeesStack.Navigator>
      <EmployeesStack.Screen
        name="EmployeesList"
        component={EmployeesScreen}
        options={{ title: t('tabs.employees') }}
      />
      <EmployeesStack.Screen
        name="EmployeeDetail"
        component={EmployeeDetailScreen}
        options={({ route }) => ({ title: route.params.name })}
      />
    </EmployeesStack.Navigator>
  );
}

function RecordsNavigator() {
  const { t } = useTranslation('attendance');
  return (
    <RecordsStack.Navigator>
      <RecordsStack.Screen
        name="RecordsList"
        component={RecordsScreen}
        options={{ title: t('tabs.records') }}
      />
      <RecordsStack.Screen
        name="EmployeeDetail"
        component={EmployeeDetailScreen}
        options={({ route }) => ({ title: route.params.name })}
      />
    </RecordsStack.Navigator>
  );
}

export function MainTabs() {
  const { t } = useTranslation('attendance');
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#0f766e',
        tabBarInactiveTintColor: '#94a3b8',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Overview"
        component={OverviewScreen}
        options={{
          title: t('tabs.overview'),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="EmployeesTab"
        component={EmployeesNavigator}
        options={{
          title: t('tabs.employees'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="RecordsTab"
        component={RecordsNavigator}
        options={{
          title: t('tabs.records'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
