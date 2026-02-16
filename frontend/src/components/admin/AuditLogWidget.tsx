import { MaterialIcon } from '../ui/MaterialIcon';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import type { AuditLogEntry } from '../../types';

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

const actionIcons: Record<string, { icon: string; color: string }> = {
  Created: { icon: 'add_circle', color: 'text-emerald-500' },
  Cancelled: { icon: 'cancel', color: 'text-red-500' },
  StatusChanged: { icon: 'swap_horiz', color: 'text-primary' },
  Updated: { icon: 'edit', color: 'text-amber-500' },
};

interface AuditLogWidgetProps {
  entries: AuditLogEntry[];
  loading: boolean;
}

export function AuditLogWidget({ entries, loading }: AuditLogWidgetProps) {
  return (
    <div className="rounded-xl bg-white border border-gray-100 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5">
          <MaterialIcon name="history" className="text-primary text-lg" />
        </div>
        <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <LoadingSpinner size="sm" />
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-center">
          <MaterialIcon name="history" className="text-gray-300 text-3xl mb-2" />
          <p className="text-sm text-gray-400">No recent activity</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gray-200" />

          <div className="space-y-4">
            {entries.map((entry) => {
              const actionKey = Object.keys(actionIcons).find((k) => entry.action.includes(k));
              const iconCfg = actionKey ? actionIcons[actionKey] : { icon: 'circle', color: 'text-gray-400' };

              return (
                <div key={entry.id} className="flex gap-3 relative">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-gray-200 shrink-0 z-10">
                    <MaterialIcon name={iconCfg.icon} className={`text-sm ${iconCfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm text-slate-900">
                      <span className="font-semibold">{entry.userId || 'System'}</span>{' '}
                      <span className="text-gray-500">{entry.action}</span>{' '}
                      <span className="font-medium">{entry.entityType}</span>{' '}
                      <span className="text-primary">#{entry.entityId.slice(0, 8)}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatTimeAgo(entry.timestamp)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
