import { useState } from 'react';
import { Button } from '../ui/Button';
import type { AdminUser } from '../../types';

interface DeleteUserDialogProps {
  user: AdminUser;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (userId: string) => Promise<void>;
  isSelf: boolean;
}

export function DeleteUserDialog({ user, isOpen, onClose, onConfirm, isSelf }: DeleteUserDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      await onConfirm(user.id);
      onClose();
    } catch (err) {
      const apiErr = err as { title?: string; detail?: string };
      setError(apiErr.detail || apiErr.title || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div role="dialog" aria-modal="true" className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-bold text-slate-900">Delete User</h2>
        <p className="mt-2 text-sm text-slate-500">
          Are you sure you want to delete <span className="font-semibold">{user.name}</span>? This action cannot be undone.
        </p>

        {isSelf && (
          <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3">
            <p className="text-xs text-amber-700 font-medium">You cannot delete your own account.</p>
          </div>
        )}

        {error && (
          <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-3">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        <div className="mt-6 flex gap-3 justify-end">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleConfirm}
            loading={loading}
            disabled={isSelf}
          >
            Delete User
          </Button>
        </div>
      </div>
    </div>
  );
}
