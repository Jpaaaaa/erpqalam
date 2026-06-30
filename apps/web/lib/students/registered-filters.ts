import type { SectionOption } from '@/lib/students/sections';
import type { CameViaSource } from '@/lib/students/came-via';

export type DetailsStatusFilter = '' | 'complete' | 'incomplete';

export interface RegisteredStudentFilters {
  q: string;
  section: SectionOption | '' | 'Unassigned';
  detailsStatus: DetailsStatusFilter;
  cameVia: CameViaSource | '';
  phone: string;
  stage: string;
}

export function emptyRegisteredStudentFilters(): RegisteredStudentFilters {
  return {
    q: '',
    section: '',
    detailsStatus: '',
    cameVia: '',
    phone: '',
    stage: '',
  };
}

export function filtersToQueryParams(
  filters: RegisteredStudentFilters,
): Record<string, string> {
  const params: Record<string, string> = {};

  if (filters.q.trim()) params.q = filters.q.trim();
  if (filters.section) params.section = filters.section;
  if (filters.detailsStatus) params.detailsStatus = filters.detailsStatus;
  if (filters.cameVia) params.cameVia = filters.cameVia;
  if (filters.phone.trim()) params.phone = filters.phone.trim();
  if (filters.stage.trim()) params.stage = filters.stage.trim();

  return params;
}

export function hasActiveFilters(filters: RegisteredStudentFilters): boolean {
  return Object.keys(filtersToQueryParams(filters)).length > 0;
}
