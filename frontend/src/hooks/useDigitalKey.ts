import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../lib/api-client';
import type { ApiError, DigitalKeyInfo, UnlockResult } from '../types';

interface UseDigitalKeyReturn {
  keyInfo: DigitalKeyInfo | null;
  loading: boolean;
  unlocking: boolean;
  unlockResult: UnlockResult | null;
  error: string | null;
  fetchKeyInfo: () => Promise<void>;
  unlockRoom: () => Promise<void>;
}

export function useDigitalKey(): UseDigitalKeyReturn {
  const [keyInfo, setKeyInfo] = useState<DigitalKeyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [unlockResult, setUnlockResult] = useState<UnlockResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchKeyInfo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.get<DigitalKeyInfo>('/digital-key');
      setKeyInfo(result);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.title || 'Failed to load digital key');
    } finally {
      setLoading(false);
    }
  }, []);

  const unlockRoom = useCallback(async () => {
    setUnlocking(true);
    setError(null);
    setUnlockResult(null);
    try {
      const result = await apiClient.post<UnlockResult>('/digital-key/unlock');
      setUnlockResult(result);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.title || 'Failed to unlock room');
    } finally {
      setUnlocking(false);
    }
  }, []);

  useEffect(() => {
    fetchKeyInfo();
  }, [fetchKeyInfo]);

  return { keyInfo, loading, unlocking, unlockResult, error, fetchKeyInfo, unlockRoom };
}
