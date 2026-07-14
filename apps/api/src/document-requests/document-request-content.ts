import type { BodyTemplateFields } from './body-template.util';
import { serializeBodyTemplate } from './body-template.util';
import type { DocumentRequestLanguage } from './document-request-language';

export const DEFAULT_KURDISH_BODY_TEMPLATE_FIELDS: BodyTemplateFields = {
  introText:
    'داواکارین لە بەڕێزتان کە بەرزامەندی بەفەرموون بۆ ناردنی بڕوانامەی و پڕۆفایلی قوتابی',
  afterStudentText: 'کە یەکێکە لە خوێندکارانی پەیمانگاکەمان',
  instituteName: 'پەیمانگای قەڵەمی ناحکومی',
  beforeYearText: 'بۆ ساڵی خوێندنی',
  closingText:
    'لە ڕێکەی ئی-میلی پەروەردەوە بۆ کۆدی پەیمانگا (٦٠٢٠١٠) یان بەدەستی قوتابی بۆمان ڕەوان بکەن.',
};

export const KURDISH_MANAGER_NAME = 'هاوسەر عەزیز عەبدالقادر';

interface DocumentRequestStaticContent {
  toPrefix: string;
  subject: string;
  greeting: string;
  closing: string;
  directorTitle: string;
  footerCopyLine?: string;
  footerBullet?: string;
}

const STATIC_CONTENT: Record<DocumentRequestLanguage, DocumentRequestStaticContent> =
  {
    ar: {
      toPrefix: 'إلى /',
      subject: 'موضوع / طلب الوثيقة',
      greeting: 'تحية طيبة:',
      closing: 'مع التقدير....',
      directorTitle: 'مدير المعهد',
      footerCopyLine: 'نخسة منه الى:',
      footerBullet: '• الصادرة',
    },
    ku: {
      toPrefix: 'بۆ/',
      subject: 'بابەت/ ناردنی بڕوانامە',
      greeting: 'سڵاو:',
      closing: 'لەگەڵ ڕێزماندا.....',
      directorTitle: 'بەڕێوەبەری پەیمانگا بە وەکالەت',
      footerCopyLine: 'کۆپی بۆ:',
      footerBullet: '• دەرچوو',
    },
  };

export function getDocumentRequestStaticContent(
  language: DocumentRequestLanguage,
): DocumentRequestStaticContent {
  return STATIC_CONTENT[language];
}

export function resolveBodyTemplateForLanguage(
  storedArabicTemplate: string,
  language: DocumentRequestLanguage,
): string {
  if (language === 'ku') {
    return serializeBodyTemplate(DEFAULT_KURDISH_BODY_TEMPLATE_FIELDS);
  }

  return storedArabicTemplate;
}
