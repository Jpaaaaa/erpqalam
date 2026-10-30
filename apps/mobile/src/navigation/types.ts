import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { DailyStatusFilter } from '../attendance/dailyFilters';

export type RecordsStackParamList = {
  RecordsList: undefined;
  ManualPunch: { deviceUserId?: string } | undefined;
};

export type MoreStackParamList = {
  MoreMenu: undefined;
  EmployeesList: undefined;
  Daily: { attentionOnly?: boolean; initialFilter?: DailyStatusFilter } | undefined;
  EmployeeDetail: { deviceUserId: string; name: string };
  EmployeeReport: { deviceUserId?: string } | undefined;
  Holidays: undefined;
  ManualPunch: { deviceUserId?: string } | undefined;
};

export type MainTabParamList = {
  Overview: undefined;
  RecordsTab: NavigatorScreenParams<RecordsStackParamList>;
  ShiftTab: undefined;
  MoreTab: NavigatorScreenParams<MoreStackParamList>;
};

export type EmployeeDetailProps = NativeStackScreenProps<
  MoreStackParamList,
  'EmployeeDetail'
>;
