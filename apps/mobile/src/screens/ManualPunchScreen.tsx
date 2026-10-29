import { useCallback, useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { resolveUserFacingError } from '../api/client';
import { addManualPunch, listAttendanceUsers } from '../api/attendance';
import {
  buildLocalTimestamp,
  isValidDateKey,
  todayDateKey,
} from '../attendance/formatters';
import { EmployeePicker } from '../components/EmployeePicker';
import { SingleDatePicker } from '../components/SingleDatePicker';
import { NetworkErrorPanel } from '../components/NetworkErrorPanel';
import { useCanManageAttendance } from '../hooks/useCanManageAttendance';
import type { AttendanceUser } from '../types/attendance';
import { useI18n } from '../i18n/I18nProvider';
import { AppText } from '../ui/AppText';
import { ltrText } from '../ui/ltr';
import { mirroredRow } from '../ui/rtlLayout';

export function ManualPunchScreen() {
  const { t } = useTranslation('attendance');
  const navigation = useNavigation();
  const canManage = useCanManageAttendance();
  const { fontFamily, mirrorLayout } = useI18n();

  useEffect(() => {
    if (!canManage) {
      navigation.goBack();
    }
  }, [canManage, navigation]);
  const [users, setUsers] = useState<AttendanceUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [errorIsNetwork, setErrorIsNetwork] = useState(false);
  const [networkRetry, setNetworkRetry] = useState<'load' | 'save'>('load');
  const [success, setSuccess] = useState('');
  const [deviceUserId, setDeviceUserId] = useState('');
  const [date, setDate] = useState(todayDateKey());
  const [time, setTime] = useState('08:00');
  const [punchKind, setPunchKind] = useState<'in' | 'out'>('in');

  const load = useCallback(async () => {
    setError('');
    setErrorIsNetwork(false);
    try {
      setUsers(await listAttendanceUsers());
    } catch (err) {
      const resolved = resolveUserFacingError(err, t, 'employees.loadError');
      if (resolved.sessionExpired) return;
      setError(resolved.message);
      setErrorIsNetwork(resolved.isNetwork);
      setNetworkRetry('load');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave() {
    if (!deviceUserId || !isValidDateKey(date)) {
      setError(t('records.manualError'));
      setErrorIsNetwork(false);
      return;
    }
    setSaving(true);
    setError('');
    setErrorIsNetwork(false);
    setSuccess('');
    try {
      await addManualPunch({
        deviceUserId,
        timestamp: buildLocalTimestamp(date, time),
        punchKind,
      });
      setSuccess(t('records.manualSuccess'));
    } catch (err) {
      const resolved = resolveUserFacingError(err, t, 'records.manualError');
      if (resolved.sessionExpired) return;
      setError(resolved.message);
      setErrorIsNetwork(resolved.isNetwork);
      setNetworkRetry('save');
    } finally {
      setSaving(false);
    }
  }

  if (!canManage) {
    return (
      <View style={styles.centered}>
        <AppText>{t('more.viewOnly')}</AppText>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            void load();
          }}
          tintColor="#0f766e"
        />
      }
    >
      <AppText style={styles.title}>{t('records.manualTitle')}</AppText>
      <EmployeePicker users={users} value={deviceUserId} onChange={setDeviceUserId} />

      <SingleDatePicker label={t('records.date')} value={date} onChange={setDate} />

      <AppText style={styles.label}>{t('records.time')}</AppText>
      <TextInput
        style={[styles.input, ltrText, fontFamily ? { fontFamily } : null]}
        value={time}
        onChangeText={setTime}
        placeholder="HH:MM"
        autoCapitalize="none"
      />

      <AppText style={styles.label}>{t('records.punchKind')}</AppText>
      <View style={[styles.kindRow, mirroredRow(mirrorLayout)]}>
        {(['in', 'out'] as const).map((kind) => (
          <Pressable
            key={kind}
            style={[styles.kindChip, punchKind === kind && styles.kindChipActive]}
            onPress={() => setPunchKind(kind)}
          >
            <AppText
              style={[
                styles.kindText,
                punchKind === kind && styles.kindTextActive,
              ]}
              numberOfLines={1}
            >
              {kind === 'in' ? t('records.punchIn') : t('records.punchOut')}
            </AppText>
          </Pressable>
        ))}
      </View>

      {errorIsNetwork ? (
        <NetworkErrorPanel
          message={error}
          onRetry={() => {
            if (networkRetry === 'save') void handleSave();
            else void load();
          }}
        />
      ) : error ? (
        <AppText style={styles.error}>{error}</AppText>
      ) : null}
      {success ? <AppText style={styles.success}>{success}</AppText> : null}

      <Pressable
        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
        disabled={saving}
        onPress={() => void handleSave()}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <AppText style={styles.saveBtnText}>{t('records.saveManual')}</AppText>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16, backgroundColor: '#fff', flexGrow: 1 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#64748b', marginTop: 8 },
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
  kindRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  kindChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  kindChipActive: { backgroundColor: '#ccfbf1' },
  kindText: { fontWeight: '600', color: '#64748b' },
  kindTextActive: { color: '#0f766e' },
  error: { color: '#b91c1c', marginTop: 12 },
  success: { color: '#047857', marginTop: 12 },
  saveBtn: {
    backgroundColor: '#0f766e',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
