export interface BackupSettings {
  id: string;
  botToken: string;
  chatIds: string[];
  backupTime: string;
  dailyReportEnabled: boolean;
  dailyReportTime: string;
  weeklyReportEnabled: boolean;
  weeklyReportDay: number;
  weeklyReportTime: string;
  monthlyReportEnabled: boolean;
  monthlyReportDay: number;
  monthlyReportTime: string;
  updatedAt: string;
}

export interface UpsertBackupSettingsPayload {
  botToken: string;
  chatIds: string[];
  backupTime: string;
  dailyReportEnabled: boolean;
  dailyReportTime: string;
  weeklyReportEnabled: boolean;
  weeklyReportDay: number;
  weeklyReportTime: string;
  monthlyReportEnabled: boolean;
  monthlyReportDay: number;
  monthlyReportTime: string;
}

export interface DetectedTelegramChat {
  chatId: string;
  type?: string;
  title?: string;
}

export type ReportKind = 'daily' | 'weekly' | 'monthly';
