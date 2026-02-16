import { useCallback, useState } from 'react';
import { apiClient } from '../lib/api-client';
import type { AdminUser, ApiError, AuditLogEntry, DashboardStats, PagedResult, UpdateUserRequest, UserCounts } from '../types';

interface UseAdminDashboardReturn {
  stats: DashboardStats | null;
  userCounts: UserCounts | null;
  auditLog: AuditLogEntry[];
  loading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
  fetchUserCounts: () => Promise<void>;
  fetchAuditLog: (limit?: number) => Promise<void>;
}

export function useAdminDashboard(): UseAdminDashboardReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userCounts, setUserCounts] = useState<UserCounts | null>(null);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.get<DashboardStats>('/admin/dashboard/stats');
      setStats(result);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.title || 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserCounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.get<UserCounts>('/admin/dashboard/user-counts');
      setUserCounts(result);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.title || 'Failed to load user counts');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAuditLog = useCallback(async (limit?: number) => {
    setLoading(true);
    setError(null);
    try {
      const query = limit ? `?limit=${limit}` : '';
      const result = await apiClient.get<AuditLogEntry[]>(`/admin/audit-log${query}`);
      setAuditLog(result);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.title || 'Failed to load audit log');
    } finally {
      setLoading(false);
    }
  }, []);

  return { stats, userCounts, auditLog, loading, error, fetchStats, fetchUserCounts, fetchAuditLog };
}

interface UseAdminUsersReturn {
  users: AdminUser[];
  total: number;
  loading: boolean;
  error: string | null;
  fetchUsers: (params?: { page?: number; limit?: number; search?: string; role?: string }) => Promise<void>;
  updateUser: (id: string, data: UpdateUserRequest) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

export function useAdminUsers(): UseAdminUsersReturn {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (params?: { page?: number; limit?: number; search?: string; role?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.limit) searchParams.set('limit', String(params.limit));
      if (params?.search) searchParams.set('search', params.search);
      if (params?.role) searchParams.set('role', params.role);
      const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
      const result = await apiClient.get<PagedResult<AdminUser>>(`/admin/users${query}`);
      setUsers(result.items);
      setTotal(result.total);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.title || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (id: string, data: UpdateUserRequest) => {
    try {
      await apiClient.put(`/admin/users/${id}`, data);
    } catch (err) {
      const apiErr = err as ApiError;
      throw new Error(apiErr.title || 'Failed to update user');
    }
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    try {
      await apiClient.delete(`/admin/users/${id}`);
    } catch (err) {
      const apiErr = err as ApiError;
      throw new Error(apiErr.title || 'Failed to delete user');
    }
  }, []);

  return { users, total, loading, error, fetchUsers, updateUser, deleteUser };
}
