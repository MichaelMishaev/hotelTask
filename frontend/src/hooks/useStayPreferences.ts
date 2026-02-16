import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../lib/api-client';
import type { ApiError, StayPreferences, UpdateStayPreferencesRequest } from '../types';

interface UseStayPreferencesReturn {
  preferences: StayPreferences | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  fetchPreferences: (bookingId: string) => Promise<void>;
  updatePreferences: (bookingId: string, req: UpdateStayPreferencesRequest) => Promise<void>;
}

export function useStayPreferences(bookingId?: string): UseStayPreferencesReturn {
  const [preferences, setPreferences] = useState<StayPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.get<StayPreferences>(`/bookings/${id}/preferences`);
      setPreferences(result);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.title || 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePreferences = useCallback(async (id: string, req: UpdateStayPreferencesRequest) => {
    setSaving(true);
    setError(null);
    try {
      const result = await apiClient.put<StayPreferences>(`/bookings/${id}/preferences`, req);
      setPreferences(result);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.title || 'Failed to update preferences');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  useEffect(() => {
    if (bookingId) {
      fetchPreferences(bookingId);
    }
  }, [bookingId, fetchPreferences]);

  return { preferences, loading, saving, error, fetchPreferences, updatePreferences };
}
