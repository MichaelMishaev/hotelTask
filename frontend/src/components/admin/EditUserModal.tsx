import { useState } from 'react';
import { MaterialIcon } from '../ui/MaterialIcon';
import { Button } from '../ui/Button';
import type { AdminUser } from '../../types';

interface EditUserModalProps {
  user: AdminUser;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: string, data: { name: string; email: string; role: string }) => Promise<void>;
}

export function EditUserModal({ user, isOpen, onClose, onSave }: EditUserModalProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name.trim() || name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSave(user.id, { name: name.trim(), email: email.trim(), role });
      onClose();
    } catch (err) {
      setError((err as { title?: string })?.title || 'Failed to update user');
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Edit User</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
            <MaterialIcon name="close" className="text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Full name"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'Guest' | 'Staff' | 'Admin')}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="Guest">Guest</option>
              <option value="Staff">Staff</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        <div className="mt-6 flex gap-3 justify-end">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} loading={loading}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
