import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { resolveUserFacingError } from '../../api/client';
import { updateAttendanceUser } from '../../api/attendance';
import {
  applyShiftScheduleUpdate,
  employeeSchedulePayload,
  employeeUsesGlobalSchedule,
  scheduleFromSettings,
  scheduleFromUser,
  type ShiftScheduleForm,
} from '../../attendance/scheduleModel';
import { validateShiftSchedule } from '../../attendance/scheduleValidation';
import type { AttendanceSettings, AttendanceUser } from '../../types/attendance';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { HomeGlassCard } from '../home/HomeGlassCard';
import { ShiftScheduleEditor } from '../schedule/ShiftScheduleEditor';
import { mirroredRow } from '../../ui/rtlLayout';

type Props = {
  deviceUserId: string;
  user: AttendanceUser | undefined;
  globalSettings: AttendanceSettings;
  onSaved: () => void;
};

export function EmployeeDetailCustomSchedule({
  deviceUserId,
  user,
  globalSettings,
  onSaved,
}: Props) {
  const { t } = useTranslation('attendance');
  const { mirrorLayout, typography } = useI18n();
  const { isDark, palette } = useHomeTheme();
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );

  const [useGlobal, setUseGlobal] = useState(true);
  const [form, setForm] = useState<ShiftScheduleForm>(() =>
    scheduleFromSettings(globalSettings),
  );
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) return;
    const global = employeeUsesGlobalSchedule(user);
    setUseGlobal(global);
    setForm(scheduleFromUser(user, globalSettings));
  }, [user, globalSettings]);

  async function save() {
    if (!user) {
      setError(t('employees.scheduleNeedsRegistered'));
      return;
    }
    setError('');
    setSuccess('');
    if (!useGlobal) {
      const validation = validateShiftSchedule(form);
      setFieldErrors(validation);
      if (Object.keys(validation).length > 0) return;
    } else {
      setFieldErrors({});
    }
    setSaving(true);
    try {
      await updateAttendanceUser(deviceUserId, {
        ...employeeSchedulePayload(useGlobal, form),
      });
      setSuccess(t('employees.scheduleSaved'));
      onSaved();
    } catch (err) {
      const resolved = resolveUserFacingError(err, t, 'employees.saveError');
      if (resolved.sessionExpired) return;
      setError(resolved.message);
    } finally {
      setSaving(false);
    }
  }

  function onToggleGlobal(next: boolean) {
    setUseGlobal(next);
    setFieldErrors({});
    if (!next) {
      setForm(scheduleFromSettings(globalSettings));
    }
  }

  return (
    <HomeGlassCard>
      <Text style={styles.title}>{t('employees.customScheduleTitle')}</Text>
      <View style={[styles.toggleRow, mirroredRow(mirrorLayout)]}>
        <Text style={styles.toggleLabel}>{t('employees.useGlobalSchedule')}</Text>
        <Switch
          value={useGlobal}
          onValueChange={onToggleGlobal}
          trackColor={{ false: '#94A3B8', true: palette.teal }}
        />
      </View>

      {!useGlobal ? (
        <View style={styles.editorWrap}>
          <ShiftScheduleEditor
            value={form}
            onChange={(next) => {
              setForm((prev) => applyShiftScheduleUpdate(prev, next));
              setFieldErrors({});
            }}
            errors={fieldErrors}
          />
        </View>
      ) : (
        <Text style={styles.hint}>{t('employees.inheritGlobalSchedule')}</Text>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}

      <Pressable
        style={[styles.saveBtn, { backgroundColor: palette.teal }, saving && styles.saveDisabled]}
        disabled={saving}
        onPress={() => void save()}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>{t('employees.saveSchedule')}</Text>
        )}
      </Pressable>
    </HomeGlassCard>
  );
}

function createStyles(isDark: boolean, typography: AppTypography) {
  const text = isDark ? '#F1F5F9' : '#0F172A';
  const muted = isDark ? '#94A3B8' : '#64748B';

  return StyleSheet.create({
    title: {
      fontFamily: typography.noto.bold,
      fontSize: 16,
      color: text,
      marginBottom: 12,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 12,
    },
    toggleLabel: {
      flex: 1,
      fontFamily: typography.noto.medium,
      fontSize: 14,
      color: text,
    },
    editorWrap: { marginTop: 8, marginHorizontal: -4 },
    hint: {
      fontFamily: typography.noto.medium,
      fontSize: 13,
      color: muted,
      lineHeight: 20,
      marginBottom: 8,
    },
    error: {
      fontFamily: typography.noto.medium,
      fontSize: 13,
      color: '#EF4444',
      marginTop: 8,
    },
    success: {
      fontFamily: typography.noto.medium,
      fontSize: 13,
      color: '#059669',
      marginTop: 8,
    },
    saveBtn: {
      marginTop: 12,
      borderRadius: 14,
      paddingVertical: 12,
      alignItems: 'center',
    },
    saveDisabled: { opacity: 0.7 },
    saveText: {
      fontFamily: typography.noto.bold,
      fontSize: 15,
      color: '#FFFFFF',
    },
  });
}
