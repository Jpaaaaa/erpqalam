export type StudentAuditChange = {
  field: string;
  old: string | null;
  new: string | null;
};

export type StudentAuditLogEntry = {
  id: string;
  action: 'CREATE' | 'UPDATE' | string;
  changedByName: string;
  createdAt: string;
  changes: StudentAuditChange[];
};

export const STUDENT_AUDIT_CREATED_FIELD = 'created';
