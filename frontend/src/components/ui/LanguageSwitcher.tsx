import { useTranslation } from 'react-i18next';
import { MaterialIcon } from './MaterialIcon';

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const next = i18n.language === 'he' ? 'en' : 'he';
    i18n.changeLanguage(next);
  };

  return (
    <button
      data-testid="language-switcher"
      onClick={toggleLanguage}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-gray-100 ${className}`}
      aria-label={i18n.language === 'he' ? 'Switch to English' : 'Switch to Hebrew'}
    >
      <MaterialIcon name="language" className="text-lg" />
      <span>{i18n.language === 'he' ? 'EN' : 'HE'}</span>
    </button>
  );
}
