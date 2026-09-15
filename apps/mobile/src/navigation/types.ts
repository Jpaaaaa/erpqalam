import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type EmployeesStackParamList = {
  EmployeesList: undefined;
  EmployeeDetail: { deviceUserId: string; name: string };
};

export type RecordsStackParamList = {
  RecordsList: undefined;
  EmployeeDetail: { deviceUserId: string; name: string };
};

export type MainTabParamList = {
  Overview: undefined;
  EmployeesTab: undefined;
  RecordsTab: undefined;
};

export type EmployeeDetailProps =
  | NativeStackScreenProps<EmployeesStackParamList, 'EmployeeDetail'>
  | NativeStackScreenProps<RecordsStackParamList, 'EmployeeDetail'>;
