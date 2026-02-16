import { useTranslation } from 'react-i18next';

interface PeriodSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  const { t } = useTranslation();

  const periods = [
    { value: 'daily', label: t('analytics.daily') },
    { value: 'weekly', label: t('analytics.weekly') },
    { value: 'monthly', label: t('analytics.monthly') },
  ];

  return (
    <div className="flex gap-2">
      {periods.map((period) => (
        <button
          key={period.value}
          onClick={() => onChange(period.value)}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            value === period.value
              ? 'bg-primary text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          data-testid={`period-selector-${period.value}`}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}
