import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useAdminUsers } from '../hooks/useAdmin';
import { SearchInput } from '../components/shared/SearchInput';
import { RoleBadge } from '../components/shared/RoleBadge';
import { EditUserModal } from '../components/admin/EditUserModal';
import { DeleteUserDialog } from '../components/admin/DeleteUserDialog';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { EmptyState } from '../components/ui/EmptyState';
import type { AdminUser } from '../types';

const avatarColors: Record<string, { bg: string; text: string }> = {
  Guest: { bg: 'bg-blue-100', text: 'text-blue-700' },
  Staff: { bg: 'bg-green-100', text: 'text-green-700' },
  Admin: { bg: 'bg-purple-100', text: 'text-purple-700' },
};

function UserCard({
  user,
  isSelf,
  onEdit,
  onDelete,
}: {
  user: AdminUser;
  isSelf: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const colors = avatarColors[user.role] ?? avatarColors.Guest;
  const initial = user.name.charAt(0).toUpperCase();

  return (
    <div className="rounded-xl bg-white border border-gray-100 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className={`flex h-11 w-11 items-center justify-center rounded-full ${colors.bg} shrink-0`}>
          <span className={`text-lg font-bold ${colors.text}`}>{initial}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
            {isSelf && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                {t('common.you')}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
        </div>

        {/* Role Badge */}
        <RoleBadge role={user.role} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
        <button
          onClick={onEdit}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-gray-50 transition-colors"
        >
          <MaterialIcon name="edit" className="text-sm" />
          {t('common.edit')}
        </button>
        <button
          onClick={onDelete}
          disabled={isSelf}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <MaterialIcon name="delete" className="text-sm" />
          {t('common.delete')}
        </button>
      </div>
    </div>
  );
}

export function AdminUsersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { users, total, loading, error, fetchUsers, updateUser, deleteUser } = useAdminUsers();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);

  const roleFilters = [
    { key: 'all', label: t('enum.status.All') },
    { key: 'Guest', label: t('enum.role.Guests') },
    { key: 'Staff', label: t('enum.role.Staff') },
    { key: 'Admin', label: t('enum.role.Admins') },
  ];

  const loadUsers = useCallback(() => {
    fetchUsers({
      search: search || undefined,
      role: roleFilter === 'all' ? undefined : roleFilter,
    });
  }, [search, roleFilter, fetchUsers]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleUpdateUser = async (userId: string, data: { name: string; email: string; role: string }) => {
    await updateUser(userId, data);
    loadUsers();
  };

  const handleDeleteUser = async (userId: string) => {
    await deleteUser(userId);
    loadUsers();
  };

  return (
    <div data-testid="admin-users-page" className="pb-24 min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <MaterialIcon name="arrow_back" className="text-slate-700 text-2xl rtl:scale-x-[-1]" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">{t('admin.userManagement')}</h1>
            <p className="text-xs text-gray-500 mt-0.5">{t('admin.totalUsersCount', { count: total })}</p>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="px-4 pt-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={t('admin.searchUsers')}
        />
      </div>

      {/* Role Filter Tabs */}
      <div className="px-4 pt-3 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {roleFilters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setRoleFilter(filter.key)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                roleFilter === filter.key
                  ? 'bg-primary text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 pt-4">
          <ErrorBanner message={error} onRetry={loadUsers} />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* User List */}
      {!loading && !error && (
        <div className="px-4 pt-4">
          {users.length === 0 ? (
            <EmptyState
              title={t('admin.noUsers')}
              description={search ? t('admin.noUsersSearch') : t('admin.noUsersFilter', { role: roleFilter === 'all' ? '' : roleFilter.toLowerCase() })}
            />
          ) : (
            <div className="space-y-3">
              {users.map((u) => (
                <UserCard
                  key={u.id}
                  user={u}
                  isSelf={u.id === currentUser?.id}
                  onEdit={() => setEditingUser(u)}
                  onDelete={() => setDeletingUser(u)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleUpdateUser}
        />
      )}

      {/* Delete User Dialog */}
      {deletingUser && (
        <DeleteUserDialog
          user={deletingUser}
          isOpen={!!deletingUser}
          onClose={() => setDeletingUser(null)}
          onConfirm={handleDeleteUser}
          isSelf={deletingUser.id === currentUser?.id}
        />
      )}
    </div>
  );
}
