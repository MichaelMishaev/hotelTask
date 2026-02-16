import type { ReactNode } from 'react';
import { Button } from './Button';
import { MaterialIcon } from './MaterialIcon';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div data-testid="empty-state" className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="mb-4 text-slate-300">{icon}</div>}
      {!icon && (
        <div className="mb-4">
          <MaterialIcon name="inbox" className="text-slate-300 !text-5xl" />
        </div>
      )}
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      {actionLabel && onAction && (
        <div className="mt-4">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
