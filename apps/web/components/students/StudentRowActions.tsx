'use client';

import { useTranslations } from 'next-intl';
import { DocumentIcon } from '@/components/layout/NavIcons';
import {
  StudentDetailsIcon,
  StudentEditIcon,
} from '@/components/students/StudentListActionIcons';
import { IconButton } from '@/components/ui/IconButton';
import type { CreateDocumentRequestTarget } from '@/lib/types/document-request';
import type { Student } from '@/lib/types/student';
import { formatStudentName } from '@/lib/students/format';

interface StudentRowActionsProps {
  student: Student;
  onOpenDetails: () => void;
  onOpenEdit: () => void;
  onOpenDocumentRequest: (target: CreateDocumentRequestTarget) => void;
  className?: string;
}

export function StudentRowActions({
  student,
  onOpenDetails,
  onOpenEdit,
  onOpenDocumentRequest,
  className = '',
}: StudentRowActionsProps) {
  const t = useTranslations('students');

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
        label={t('documentRequest.generateButton')}
        onClick={() =>
          onOpenDocumentRequest({
            studentName: formatStudentName(student),
            studentId: student.id,
          })
        }
      >
        <DocumentIcon className="h-5 w-5" />
      </IconButton>
    </div>
  );
}
