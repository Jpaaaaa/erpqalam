'use client';

import { useTranslations } from 'next-intl';
import {
  StudentDeleteIcon,
  StudentDetailsIcon,
  StudentEditIcon,
} from '@/components/students/StudentListActionIcons';
import { IconButton } from '@/components/ui/IconButton';
import type { PendingStudent } from '@/lib/types/student';

interface PendingStudentRowActionsProps {
  student: PendingStudent;
  onOpenDetails: () => void;
  onOpenEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
  className?: string;
}

export function PendingStudentRowActions({
  student,
  onOpenDetails,
  onOpenEdit,
  onDelete,
  isDeleting = false,
  className = '',
}: PendingStudentRowActionsProps) {
  const t = useTranslations('students');
  const tCommon = useTranslations('common');

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <IconButton label={t('detailsButton')} onClick={onOpenDetails}>
        <StudentDetailsIcon className="h-5 w-5" />
        {!student.detailsCompletedAt && (
          <span
            className="absolute end-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white"
            aria-hidden
          />
        )}
      </IconButton>

      <IconButton label={t('editButton')} onClick={onOpenEdit}>
        <StudentEditIcon className="h-5 w-5" />
      </IconButton>

      <IconButton
        label={t('deleteButton')}
        variant="danger"
        isLoading={isDeleting}
        loadingLabel={tCommon('pleaseWait')}
        onClick={onDelete}
      >
        <StudentDeleteIcon className="h-5 w-5" />
      </IconButton>
    </div>
  );
}
