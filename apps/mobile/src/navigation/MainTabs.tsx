import { useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeBlurTargetContext } from '../components/home/HomeBlurTargetContext';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { EmployeeDetailScreen } from '../screens/EmployeeDetailScreen';
import { EmployeesScreen } from '../screens/EmployeesScreen';
import { OverviewScreen } from '../screens/OverviewScreen';
import { RecordsScreen } from '../screens/RecordsScreen';
import { ShiftScreen } from '../screens/ShiftScreen';
import { MoreMenuScreen } from '../screens/MoreMenuScreen';
import { DailyAttendanceScreen } from '../screens/DailyAttendanceScreen';
import { EmployeeReportScreen } from '../screens/EmployeeReportScreen';
import { HolidaysScreen } from '../screens/HolidaysScreen';
import { ManualPunchScreen } from '../screens/ManualPunchScreen';
import { FloatingTabBar } from './FloatingTabBar';
import { nestedStackTabPressListener } from './nestedTabNavigation';

import type {
  MainTabParamList,
  MoreStackParamList,
  RecordsStackParamList,
} from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const RecordsStack = createNativeStackNavigator<RecordsStackParamList>();
const MoreStack = createNativeStackNavigator<MoreStackParamList>();

function RecordsNavigator() {
  const { t } = useTranslation('attendance');
  return (
    <RecordsStack.Navigator>
      <RecordsStack.Screen
        name="RecordsList"
        component={RecordsScreen}
        options={{ headerShown: false }}
      />
      <RecordsStack.Screen
        name="ManualPunch"
        component={ManualPunchScreen}
        options={{ title: t('records.manualTitle') }}
      />
    </RecordsStack.Navigator>
  );
}

function MoreNavigator() {
  const { t } = useTranslation('attendance');
  return (
    <MoreStack.Navigator>
      <MoreStack.Screen
        name="MoreMenu"
        component={MoreMenuScreen}
        options={{ headerShown: false, title: t('tabs.more') }}
      />
      <MoreStack.Screen
        name="EmployeesList"
        component={EmployeesScreen}
        options={{ headerShown: false }}
      />
      <MoreStack.Screen
        name="Daily"
        component={DailyAttendanceScreen}
        options={{ headerShown: false, title: t('tabs.daily') }}
      />
      <MoreStack.Screen
        name="EmployeeDetail"
        component={EmployeeDetailScreen}
        options={{ headerShown: false }}
      />
      <MoreStack.Screen
        name="EmployeeReport"
        component={EmployeeReportScreen}
        options={{ headerShown: false, title: t('tabs.report') }}
      />
      <MoreStack.Screen
        name="Holidays"
        component={HolidaysScreen}
        options={{ headerShown: false, title: t('tabs.holidays') }}
      />
      <MoreStack.Screen
        name="ManualPunch"
        component={ManualPunchScreen}
        options={{ title: t('records.manualTitle') }}
      />
    </MoreStack.Navigator>
  );
}

export function MainTabs() {
  const { t } = useTranslation('attendance');
  const homeBlurTargetRef = useRef<View>(null);
  const [homeBlurReady, setHomeBlurReady] = useState(false);
  const homeBlurContext = useMemo(
    () => ({
      ref: homeBlurTargetRef,
      ready: homeBlurReady,
      setReady: setHomeBlurReady,
    }),
    [homeBlurReady],
  );

  return (
    <HomeBlurTargetContext.Provider value={homeBlurContext}>
    <Tab.Navigator
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
      }}
    >
      <Tab.Screen
        name="Overview"
        component={OverviewScreen}
        options={{
          title: t('tabs.overview'),
          headerShown: false,
          tabBarLabel: t('tabs.overview'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="RecordsTab"
        component={RecordsNavigator}
        listeners={nestedStackTabPressListener('RecordsTab', 'RecordsList')}
        options={{
          title: t('tabs.records'),
          tabBarLabel: t('tabs.records'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ShiftTab"
        component={ShiftScreen}
        options={{
          title: t('tabs.shift'),
          tabBarLabel: t('tabs.shift'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreNavigator}
        listeners={nestedStackTabPressListener('MoreTab', 'MoreMenu')}
        options={{
          title: t('tabs.more'),
          tabBarLabel: t('tabs.more'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ellipsis-horizontal-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
    </HomeBlurTargetContext.Provider>
  );
}
