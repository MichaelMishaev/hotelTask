import { useNavigate } from 'react-router-dom';
import { MaterialIcon } from '../ui/MaterialIcon';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import type { UserCounts } from '../../types';

interface UserManagementCardProps {
  counts: UserCounts | null;
  loading: boolean;
}

export function UserManagementCard({ counts, loading }: UserManagementCardProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl bg-white border border-gray-100 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
          <MaterialIcon name="group" className="text-purple-600 text-lg" />
        </div>
        <h3 className="text-sm font-bold text-slate-900">User Management</h3>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <LoadingSpinner size="sm" />
        </div>
      ) : counts ? (
        <>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 rounded-lg bg-blue-50 p-3 text-center">
              <p className="text-lg font-bold text-blue-700">{counts.guests}</p>
              <p className="text-[10px] uppercase tracking-wider font-bold text-blue-400">Guests</p>
            </div>
            <div className="flex-1 rounded-lg bg-green-50 p-3 text-center">
              <p className="text-lg font-bold text-green-700">{counts.staff}</p>
              <p className="text-[10px] uppercase tracking-wider font-bold text-green-400">Staff</p>
            </div>
            <div className="flex-1 rounded-lg bg-purple-50 p-3 text-center">
              <p className="text-lg font-bold text-purple-700">{counts.admins}</p>
              <p className="text-[10px] uppercase tracking-wider font-bold text-purple-400">Admins</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/admin/users')}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-colors"
          >
            <MaterialIcon name="manage_accounts" className="text-lg" />
            Manage Users
          </button>
        </>
      ) : null}
    </div>
  );
}
