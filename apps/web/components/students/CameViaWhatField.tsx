'use client';

import { useTranslations } from 'next-intl';
import { CAME_VIA_SOURCES, type CameViaSource } from '@/lib/students/came-via';
import { Input } from '@/components/ui/Input';
import { SelectField } from '@/components/ui/SelectField';

interface CameViaWhatFieldProps {
  source: CameViaSource | '';
  friendDetail: string;
  onSourceChange: (source: CameViaSource | '') => void;
  onFriendDetailChange: (detail: string) => void;
  required?: boolean;
}

export function CameViaWhatField({
  source,
  friendDetail,
  onSourceChange,
  onFriendDetailChange,
  required = false,
}: CameViaWhatFieldProps) {
  const t = useTranslations('students');

  return (
    <div className="space-y-3">
      <SelectField
        label={t('cameViaWhat')}
        name="cameViaSource"
        required={required}
        value={source}
        onChange={(e) => onSourceChange(e.target.value as CameViaSource | '')}
      >
        <option value="" disabled>
          {t('cameViaSelectPlaceholder')}
        </option>
        {CAME_VIA_SOURCES.map((option) => (
          <option key={option} value={option}>
            {t(`cameViaOptions.${option}`)}
          </option>
        ))}
      </SelectField>

      {source === 'friends' && (
        <Input
          label={t('cameViaFriendDetail')}
          name="cameViaFriendDetail"
          value={friendDetail}
          onChange={(e) => onFriendDetailChange(e.target.value)}
          placeholder={t('cameViaFriendDetailPlaceholder')}
        />
      )}
    </div>
  );
}
