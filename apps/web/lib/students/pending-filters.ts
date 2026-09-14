import type { SectionOption } from '@/lib/students/sections';

export type GuardianMobileFilter = '' | 'true' | 'false';

export interface PendingStudentFilters {
  section: SectionOption | '' | 'Unassigned';
  createdFrom: string;
  createdTo: string;
  hasGuardianMobile: GuardianMobileFilter;
}

export function emptyPendingStudentFilters(): PendingStudentFilters {
  return {
    section: '',
    createdFrom: '',
    createdTo: '',
    hasGuardianMobile: '',
  };
}

export function pendingFiltersToQueryParams(
  filters: PendingStudentFilters,
): Record<string, string> {
  const params: Record<string, string> = {};

  if (filters.section) params.section = filters.section;
  if (filters.createdFrom.trim()) params.createdFrom = filters.createdFrom.trim();
  if (filters.createdTo.trim()) params.createdTo = filters.createdTo.trim();
  if (filters.hasGuardianMobile) params.hasGuardianMobile = filters.hasGuardianMobile;

  return params;
}

export function hasActivePendingFilters(filters: PendingStudentFilters): boolean {
  return Object.keys(pendingFiltersToQueryParams(filters)).length > 0;
}
