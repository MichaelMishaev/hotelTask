import { MaterialIcon } from '../ui/MaterialIcon';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'amber';
}

const colorConfig = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-500' },
  green: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'text-emerald-500' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', icon: 'text-purple-500' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', icon: 'text-amber-500' },
};

export function StatsCard({ title, value, icon, color }: StatsCardProps) {
  const cfg = colorConfig[color];

  return (
    <div className="rounded-xl bg-white border border-gray-100 p-4">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${cfg.bg} mb-3`}>
        <MaterialIcon name={icon} className={`text-xl ${cfg.icon}`} />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{title}</p>
    </div>
  );
}
