import { useTranslation } from 'react-i18next';
import { MaterialIcon } from './MaterialIcon';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  const { t } = useTranslation();
  return (
    <div
      data-testid="error-banner"
      className="flex items-center justify-between rounded-xl bg-red-50 px-4 py-3 mb-4"
    >
      <div className="flex items-center gap-2">
        <MaterialIcon name="error" className="text-red-500 text-xl shrink-0" />
        <p className="text-sm font-medium text-red-800">{message}</p>
      </div>
      {onRetry && (
        <button
          data-testid="error-retry"
          onClick={onRetry}
          className="text-sm font-bold text-red-600 hover:text-red-700 underline min-h-[44px] px-2"
        >
          {t('common.retry')}
        </button>
      )}
    </div>
  );
}
