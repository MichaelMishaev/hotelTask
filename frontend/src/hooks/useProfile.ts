import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../lib/api-client';
import { useAuth } from './useAuth';
import type { ApiError, UpdateProfileRequest, UserProfile } from '../types';

interface UseProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (req: UpdateProfileRequest) => Promise<void>;
}

export function useProfile(): UseProfileReturn {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.get<UserProfile>(`/profile/${user.id}`);
      setProfile(result);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.title || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const updateProfile = useCallback(async (req: UpdateProfileRequest) => {
    if (!user?.id) return;
    setSaving(true);
    setError(null);
    try {
      const result = await apiClient.put<UserProfile>(`/profile/${user.id}`, req);
      setProfile(result);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.title || 'Failed to update profile');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, saving, error, fetchProfile, updateProfile };
}
