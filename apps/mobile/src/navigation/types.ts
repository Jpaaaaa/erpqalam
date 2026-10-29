import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RecordsStackParamList = {
  RecordsList: undefined;
  ManualPunch: { deviceUserId?: string } | undefined;
};

export type MoreStackParamList = {
  MoreMenu: undefined;
  EmployeesList: undefined;
  Daily: { attentionOnly?: boolean } | undefined;
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
