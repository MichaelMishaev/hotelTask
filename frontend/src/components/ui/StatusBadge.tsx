import { useTranslation } from 'react-i18next';
import type { BookingStatus } from '../../types';
import { MaterialIcon } from './MaterialIcon';

const statusConfig: Record<BookingStatus, { bg: string; text: string; icon: string }> = {
  Confirmed: { bg: 'bg-emerald-500', text: 'text-white', icon: 'check_circle' },
  CheckedIn: { bg: 'bg-primary', text: 'text-white', icon: 'key' },
  CheckedOut: { bg: 'bg-gray-100', text: 'text-gray-500', icon: 'logout' },
  Cancelled: { bg: 'bg-red-50', text: 'text-red-400', icon: 'cancel' },
};

interface StatusBadgeProps {
  status: BookingStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();
  const config = statusConfig[status];
  return (
    <span
      data-testid="booking-status"
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-lg ${config.bg} ${config.text}`}
    >
      <MaterialIcon name={config.icon} className="text-[14px]" />
      {t(`enum.status.${status}`)}
    </span>
  );
}
