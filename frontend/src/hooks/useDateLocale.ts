import { useTranslation } from 'react-i18next';
import { he } from 'date-fns/locale/he';
import { enUS } from 'date-fns/locale/en-US';

export function useDateLocale() {
  const { i18n } = useTranslation();
  return i18n.language === 'he' ? he : enUS;
}
