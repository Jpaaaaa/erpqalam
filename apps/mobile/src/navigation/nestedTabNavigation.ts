import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { EventArg, NavigatorScreenParams } from '@react-navigation/native';
import type { MainTabParamList, MoreStackParamList } from './types';

type TabNav = BottomTabNavigationProp<MainTabParamList>;

type MoreNestedScreen = Exclude<keyof MoreStackParamList, 'MoreMenu'>;

/** Open a More stack screen from another tab while keeping MoreMenu as the stack root. */
export function navigateToMoreStackScreen<S extends MoreNestedScreen>(
  navigation: TabNav,
  screen: S,
  params?: MoreStackParamList[S],
) {
  navigation.navigate('MoreTab', {
    screen,
    params,
    initial: false,
  } as NavigatorScreenParams<MoreStackParamList>);
}

export function navigateToMoreMenu(navigation: TabNav) {
  navigation.navigate('MoreTab', { screen: 'MoreMenu' });
}

export function navigateToEmployeeDetail(
  navigation: TabNav,
  params: { deviceUserId: string; name: string },
) {
  navigateToMoreStackScreen(navigation, 'EmployeeDetail', params);
}

/** Pop nested stack to its root when the user re-taps the same tab. */
export function nestedStackTabPressListener(
  tabRouteName: keyof MainTabParamList,
  rootScreenName: string,
) {
  return ({ navigation }: { navigation: TabNav }) => ({
    tabPress: (e: EventArg<'tabPress', true>) => {
      const state = navigation.getState();
      const tabRoute = state.routes.find((r) => r.name === tabRouteName);
      const stackIndex = tabRoute?.state?.index ?? 0;
      if (stackIndex > 0) {
        e.preventDefault();
        navigation.navigate(tabRouteName, {
          screen: rootScreenName,
        } as never);
      }
    },
  });
}
