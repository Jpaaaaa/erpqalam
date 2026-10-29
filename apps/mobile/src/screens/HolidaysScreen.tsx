import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { resolveUserFacingError } from '../api/client';
import { DateFieldPicker } from '../components/CalendarDatePicker';
import { NetworkErrorPanel } from '../components/NetworkErrorPanel';
import {
  addEmployeeHoliday,
  addEmployeeHolidayRange,
  addHoliday,
  addHolidayRange,
  addTimeLeaveUsage,
  getAttendanceSettings,
  getEmployeeReport,
  listAttendanceRecords,
  listEmployeeHolidays,
  listHolidays,
  listAttendanceUsers,
  listLeaveBalances,
  listTimeLeaveUsage,
  removeEmployeeHoliday,
  removeHoliday,
  removeTimeLeaveUsage,
  setLeaveBalance,
  updateAttendanceSettings,
} from '../api/attendance';
import { displayName, formatDisplayDate, getQuickRange, isValidDateKey } from '../attendance/formatters';
import { buildNameLookup, mergeEmployeesWithPunchIds } from '../attendance/lookups';
import { DateRangeChips } from '../components/DateRangeChips';
import { EmployeePicker } from '../components/EmployeePicker';
import { TimeLeaveCoverAllSection } from '../components/TimeLeaveCoverAllSection';
import { ViewOnlyBanner } from '../components/ViewOnlyBanner';
import { useCanManageAttendance } from '../hooks/useCanManageAttendance';
import type {
  AttendanceHoliday,
  AttendanceHolidayType,
  AttendanceRecord,
  AttendanceSettings,
  AttendanceUser,
  DateFilter,
  EmployeeHoliday,
  LeaveBalance,
  TimeLeaveUsage,
} from '../types/attendance';
import { useI18n } from '../i18n/I18nProvider';
import { mirroredRow } from '../ui/rtlLayout';
import { AppText } from '../ui/AppText';
import { ltrText } from '../ui/ltr';

type TabKey = 'official' | 'employee' | 'temporary' | 'settings';

export function HolidaysScreen() {
  const { t } = useTranslation('attendance');
  const canManage = useCanManageAttendance();
  const { fontFamily, mirrorLayout } = useI18n();
  const [errorIsNetwork, setErrorIsNetwork] = useState(false);
  const [tab, setTab] = useState<TabKey>('official');
  const [holidays, setHolidays] = useState<AttendanceHoliday[]>([]);
  const [employeeHolidays, setEmployeeHolidays] = useState<EmployeeHoliday[]>([]);
  const [users, setUsers] = useState<AttendanceUser[]>([]);
  const [settings, setSettings] = useState<AttendanceSettings | null>(null);
  const [timeLeave, setTimeLeave] = useState<TimeLeaveUsage[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [coverRecords, setCoverRecords] = useState<AttendanceRecord[]>([]);
  const [lateOccurrences, setLateOccurrences] = useState<
    { deviceUserId: string; date: string }[]
  >([]);
  const [earlyOccurrences, setEarlyOccurrences] = useState<
    { deviceUserId: string; date: string; timestamp: string }[]
  >([]);
  const [coverFilter, setCoverFilter] = useState<DateFilter>(() => {
    const month = getQuickRange('month');
    return { fromDate: month.from, toDate: month.to };
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [orgType, setOrgType] = useState<AttendanceHolidayType>('day_off');
  const [orgFrom, setOrgFrom] = useState('');
  const [orgTo, setOrgTo] = useState('');

  const [empUserId, setEmpUserId] = useState('');
  const [empFrom, setEmpFrom] = useState('');
  const [empTo, setEmpTo] = useState('');

  const [annualDays, setAnnualDays] = useState('7');
  const [tempRatio, setTempRatio] = useState('3');
  const [balanceUserId, setBalanceUserId] = useState('');
  const [balanceDays, setBalanceDaysInput] = useState('7');

  const nameLookup = useMemo(
    () => buildNameLookup(mergeEmployeesWithPunchIds(users, coverRecords)),
    [users, coverRecords],
  );

  const loadCore = useCallback(async () => {
    setError('');
    setErrorIsNetwork(false);
    try {
      const [h, eh, tl, bal, settingsRow, userRows] = await Promise.all([
        listHolidays(),
        listEmployeeHolidays(),
        listTimeLeaveUsage(),
        listLeaveBalances(),
        getAttendanceSettings(),
        listAttendanceUsers(),
      ]);
      setHolidays(h);
      setEmployeeHolidays(eh);
      setTimeLeave(tl);
      setBalances(bal);
      setSettings(settingsRow);
      setUsers(userRows);
      setAnnualDays(String(settingsRow.annualHolidaysDays));
      setTempRatio(String(settingsRow.tempHolidaysPerFullHoliday));
    } catch (err) {
      const resolved = resolveUserFacingError(err, t, 'holidays.loadError');
      if (resolved.sessionExpired) return;
      setError(resolved.message);
      setErrorIsNetwork(resolved.isNetwork);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  const loadCoverData = useCallback(async () => {
    try {
      const [report, records] = await Promise.all([
        getEmployeeReport({
          fromDate: coverFilter.fromDate,
          toDate: coverFilter.toDate,
        }),
        listAttendanceRecords({
          fromDate: coverFilter.fromDate,
          toDate: coverFilter.toDate,
          limit: 5000,
        }),
      ]);
      setLateOccurrences(report.lateOccurrences);
      setEarlyOccurrences(report.earlyExitOccurrences);
      setCoverRecords(records);
    } catch (err) {
      const resolved = resolveUserFacingError(err, t, 'holidays.loadError');
      if (resolved.sessionExpired) return;
      setError(resolved.message);
      setErrorIsNetwork(resolved.isNetwork);
    }
  }, [coverFilter.fromDate, coverFilter.toDate, t]);

  useEffect(() => {
    void loadCore();
  }, [loadCore]);

  useEffect(() => {
    if (tab === 'temporary') void loadCoverData();
  }, [tab, loadCoverData]);

  async function refreshAfterMutation() {
    await loadCore();
    if (tab === 'temporary') await loadCoverData();
  }

  async function handleAddOrg() {
    if (!canManage || !isValidDateKey(orgFrom)) return;
    setError('');
    setSuccess('');
    const to = orgTo && isValidDateKey(orgTo) ? orgTo : orgFrom;
    try {
      if (to !== orgFrom) {
        await addHolidayRange({ dateFrom: orgFrom, dateTo: to, type: orgType });
      } else {
        await addHoliday({ date: orgFrom, type: orgType });
      }
      setSuccess(t('holidays.orgAdded'));
      setOrgFrom('');
      setOrgTo('');
      await refreshAfterMutation();
    } catch (err) {
      const resolved = resolveUserFacingError(err, t, 'holidays.saveError');
      if (resolved.sessionExpired) return;
      setError(resolved.message);
      setErrorIsNetwork(resolved.isNetwork);
    }
  }

  async function handleAddEmp() {
    if (!canManage || !empUserId || !isValidDateKey(empFrom)) return;
    setError('');
    setSuccess('');
    const to = empTo && isValidDateKey(empTo) ? empTo : empFrom;
    try {
      if (to !== empFrom) {
        await addEmployeeHolidayRange({
          deviceUserId: empUserId,
          dateFrom: empFrom,
          dateTo: to,
        });
      } else {
        await addEmployeeHoliday({ deviceUserId: empUserId, date: empFrom });
      }
      setSuccess(t('holidays.empAdded'));
      setEmpFrom('');
      setEmpTo('');
      await refreshAfterMutation();
    } catch (err) {
      const resolved = resolveUserFacingError(err, t, 'holidays.saveError');
      if (resolved.sessionExpired) return;
      setError(resolved.message);
      setErrorIsNetwork(resolved.isNetwork);
    }
  }

  async function handleSaveLeaveConfig() {
    if (!canManage) return;
    setError('');
    setSuccess('');
    try {
      await updateAttendanceSettings({
        annualHolidaysDays: parseInt(annualDays, 10) || 0,
        tempHolidaysPerFullHoliday: parseInt(tempRatio, 10) || 1,
      });
      setSuccess(t('holidays.configSaved'));
      await refreshAfterMutation();
    } catch (err) {
      const resolved = resolveUserFacingError(err, t, 'holidays.saveError');
      if (resolved.sessionExpired) return;
      setError(resolved.message);
      setErrorIsNetwork(resolved.isNetwork);
    }
  }

  async function handleSetBalance() {
    if (!canManage || !balanceUserId.trim()) return;
    setError('');
    setSuccess('');
    try {
      await setLeaveBalance(balanceUserId.trim(), parseFloat(balanceDays) || 0);
      setSuccess(t('holidays.balanceSaved'));
      await refreshAfterMutation();
    } catch (err) {
      const resolved = resolveUserFacingError(err, t, 'holidays.saveError');
      if (resolved.sessionExpired) return;
      setError(resolved.message);
      setErrorIsNetwork(resolved.isNetwork);
    }
  }

  const sortedOrg = useMemo(
    () => [...holidays].sort((a, b) => b.date.localeCompare(a.date)),
    [holidays],
  );
  const sortedEmp = useMemo(
    () => [...employeeHolidays].sort((a, b) => b.date.localeCompare(a.date)),
    [employeeHolidays],
  );

  const ORG_TYPES: AttendanceHolidayType[] = ['day_off', 'entry_late', 'early_exit'];
  const tabItems: { key: TabKey; label: string }[] = [
    { key: 'official', label: t('holidays.subtabs.official') },
    { key: 'employee', label: t('holidays.subtabs.employee') },
    { key: 'temporary', label: t('holidays.subtabs.temporary') },
    { key: 'settings', label: t('holidays.subtabs.settings') },
  ];

  if (loading && !settings) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!canManage ? <ViewOnlyBanner /> : null}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScroll}
        contentContainerStyle={mirroredRow(mirrorLayout)}
      >
        <View style={[styles.tabs, mirroredRow(mirrorLayout)]}>
          {tabItems.map((item) => (
            <Pressable
              key={item.key}
              style={[styles.tab, tab === item.key && styles.tabActive]}
              onPress={() => setTab(item.key)}
            >
              <AppText
                style={[styles.tabText, tab === item.key && styles.tabTextActive]}
                numberOfLines={1}
              >
                {item.label}
              </AppText>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {errorIsNetwork ? (
        <NetworkErrorPanel
          message={error}
          onRetry={() => {
            void loadCore();
            if (tab === 'temporary') void loadCoverData();
          }}
        />
      ) : error ? (
        <AppText style={styles.error}>{error}</AppText>
      ) : null}
      {success ? <AppText style={styles.success}>{success}</AppText> : null}

      {tab === 'temporary' && settings ? (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                void refreshAfterMutation().finally(() => setRefreshing(false));
              }}
              tintColor="#0f766e"
            />
          }
        >
          <DateRangeChips filter={coverFilter} onChange={setCoverFilter} />
          <TimeLeaveCoverAllSection
            lateOccurrences={lateOccurrences}
            earlyExitOccurrences={earlyOccurrences}
            records={coverRecords}
            settings={settings}
            timeLeaveUsage={timeLeave}
            leaveBalances={balances}
            employeeHolidays={employeeHolidays}
            nameLookup={nameLookup}
            canManage={canManage}
            onCover={async (payload) => {
              await addTimeLeaveUsage(payload);
              await refreshAfterMutation();
            }}
            onRemove={async (id) => {
              await removeTimeLeaveUsage(id);
              await refreshAfterMutation();
            }}
          />
        </ScrollView>
      ) : null}

      {tab === 'settings' ? (
        <ScrollView contentContainerStyle={styles.form}>
          <AppText style={styles.formTitle}>{t('holidays.leaveConfig')}</AppText>
          <AppText style={styles.fieldLabel}>{t('holidays.annualDays')}</AppText>
          <TextInput
            style={[styles.input, ltrText, fontFamily ? { fontFamily } : null]}
            value={annualDays}
            onChangeText={setAnnualDays}
            keyboardType="number-pad"
            editable={canManage}
          />
          <AppText style={styles.fieldLabel}>{t('holidays.tempRatio')}</AppText>
          <TextInput
            style={[styles.input, ltrText, fontFamily ? { fontFamily } : null]}
            value={tempRatio}
            onChangeText={setTempRatio}
            keyboardType="number-pad"
            editable={canManage}
          />
          {canManage ? (
            <Pressable style={styles.saveBtn} onPress={() => void handleSaveLeaveConfig()}>
              <AppText style={styles.saveBtnText}>{t('holidays.saveConfig')}</AppText>
            </Pressable>
          ) : null}

          <AppText style={[styles.formTitle, styles.sectionGap]}>
            {t('holidays.leaveBalances')}
          </AppText>
          <EmployeePicker users={users} value={balanceUserId} onChange={setBalanceUserId} />
          <AppText style={styles.fieldLabel}>{t('holidays.balanceDays')}</AppText>
          <TextInput
            style={[styles.input, ltrText, fontFamily ? { fontFamily } : null]}
            value={balanceDays}
            onChangeText={setBalanceDaysInput}
            keyboardType="decimal-pad"
            editable={canManage}
          />
          {canManage ? (
            <Pressable style={styles.saveBtn} onPress={() => void handleSetBalance()}>
              <AppText style={styles.saveBtnText}>{t('holidays.setBalance')}</AppText>
            </Pressable>
          ) : null}

          {balances.length > 0 ? (
            <View style={styles.balanceList}>
              {balances.map((b) => (
                <AppText key={b.deviceUserId} style={styles.balanceRow} numberOfLines={1}>
                  {displayName(nameLookup.get(b.deviceUserId), b.deviceUserId)}:{' '}
                  {b.balanceDays}
                </AppText>
              ))}
            </View>
          ) : (
            <AppText style={styles.muted}>{t('holidays.noBalances')}</AppText>
          )}
        </ScrollView>
      ) : null}

      {tab === 'official' ? (
        <FlatList
          data={sortedOrg}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                void loadCore();
              }}
              tintColor="#0f766e"
            />
          }
          ListHeaderComponent={
            canManage ? (
              <View style={styles.form}>
                <AppText style={styles.formTitle}>{t('holidays.addOrg')}</AppText>
                <View style={[styles.typeRow, mirroredRow(mirrorLayout)]}>
                  {ORG_TYPES.map((type) => (
                    <Pressable
                      key={type}
                      style={[styles.typeChip, orgType === type && styles.typeChipActive]}
                      onPress={() => setOrgType(type)}
                    >
                      <AppText
                        style={[
                          styles.typeChipText,
                          orgType === type && styles.typeChipTextActive,
                        ]}
                        numberOfLines={1}
                      >
                        {t(`holidays.types.${type}`)}
                      </AppText>
                    </Pressable>
                  ))}
                </View>
                <DateFieldPicker
                  label={t('holidays.dateFrom')}
                  value={orgFrom}
                  onChange={setOrgFrom}
                />
                <DateFieldPicker
                  label={t('holidays.dateTo')}
                  value={orgTo}
                  onChange={setOrgTo}
                  optional
                />
                <Pressable style={styles.saveBtn} onPress={() => void handleAddOrg()}>
                  <AppText style={styles.saveBtnText}>{t('holidays.addOrg')}</AppText>
                </Pressable>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <AppText style={styles.empty}>{t('holidays.noOrg')}</AppText>
          }
          renderItem={({ item }) => (
            <View style={[styles.row, mirroredRow(mirrorLayout)]}>
              <View style={styles.rowBody}>
                <AppText style={[ltrText]} numberOfLines={1}>
                  {formatDisplayDate(item.date)}
                </AppText>
                <AppText style={styles.rowMeta} numberOfLines={1}>
                  {t(`holidays.types.${item.type}`)}
                </AppText>
              </View>
              {canManage ? (
                <Pressable onPress={() => void removeHoliday(item.id).then(loadCore)}>
                  <AppText style={styles.remove}>{t('holidays.remove')}</AppText>
                </Pressable>
              ) : null}
            </View>
          )}
        />
      ) : null}

      {tab === 'employee' ? (
        <FlatList
          data={sortedEmp}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                void loadCore();
              }}
              tintColor="#0f766e"
            />
          }
          ListHeaderComponent={
            canManage ? (
              <View style={styles.form}>
                <AppText style={styles.formTitle}>{t('holidays.addEmp')}</AppText>
                <EmployeePicker users={users} value={empUserId} onChange={setEmpUserId} />
                <DateFieldPicker
                  label={t('holidays.dateFrom')}
                  value={empFrom}
                  onChange={setEmpFrom}
                />
                <DateFieldPicker
                  label={t('holidays.dateTo')}
                  value={empTo}
                  onChange={setEmpTo}
                  optional
                />
                <Pressable style={styles.saveBtn} onPress={() => void handleAddEmp()}>
                  <AppText style={styles.saveBtnText}>{t('holidays.addEmp')}</AppText>
                </Pressable>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <AppText style={styles.empty}>{t('holidays.noEmp')}</AppText>
          }
          renderItem={({ item }) => (
            <View style={[styles.row, mirroredRow(mirrorLayout)]}>
              <View style={styles.rowBody}>
                <AppText style={styles.rowName} numberOfLines={1}>
                  {displayName(nameLookup.get(item.deviceUserId), item.deviceUserId)}
                </AppText>
                <AppText style={[styles.rowMeta, ltrText]}>
                  {formatDisplayDate(item.date)}
                </AppText>
              </View>
              {canManage ? (
                <Pressable onPress={() => void removeEmployeeHoliday(item.id).then(loadCore)}>
                  <AppText style={styles.remove}>{t('holidays.remove')}</AppText>
                </Pressable>
              ) : null}
            </View>
          )}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabScroll: { maxHeight: 44, marginBottom: 12 },
  tabs: { flexDirection: 'row', gap: 6 },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  tabActive: { backgroundColor: '#ccfbf1' },
  tabText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  tabTextActive: { color: '#0f766e' },
  error: { color: '#b91c1c', marginBottom: 8 },
  success: { color: '#047857', marginBottom: 8 },
  form: { marginBottom: 16 },
  formTitle: { fontSize: 15, fontWeight: '600', marginBottom: 8 },
  sectionGap: { marginTop: 24 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  typeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  typeChipActive: { backgroundColor: '#ffedd5' },
  typeChipText: { fontSize: 12, color: '#475569' },
  typeChipTextActive: { color: '#c2410c', fontWeight: '600' },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#64748b', marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginTop: 4,
    backgroundColor: '#fff',
  },
  saveBtn: {
    backgroundColor: '#0f766e',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  saveBtnText: { color: '#fff', fontWeight: '600' },
  empty: { textAlign: 'center', color: '#64748b', marginTop: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  rowBody: { flex: 1, minWidth: 0 },
  rowName: { fontSize: 15, fontWeight: '600' },
  rowMeta: { fontSize: 13, color: '#64748b', marginTop: 2 },
  remove: { color: '#b91c1c', fontWeight: '600', fontSize: 13 },
  balanceList: { marginTop: 16, gap: 6 },
  balanceRow: { fontSize: 14, color: '#334155' },
  muted: { fontSize: 13, color: '#94a3b8', marginTop: 8 },
});
