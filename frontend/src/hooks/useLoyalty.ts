import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../lib/api-client';
import type { ApiError, LoyaltyInfo, LoyaltyReward, LoyaltyTransaction } from '../types';

interface UseLoyaltyReturn {
  loyalty: LoyaltyInfo | null;
  rewards: LoyaltyReward[];
  transactions: LoyaltyTransaction[];
  loading: boolean;
  error: string | null;
  fetchLoyalty: () => Promise<void>;
  fetchRewards: () => Promise<void>;
}

export function useLoyalty(): UseLoyaltyReturn {
  const [loyalty, setLoyalty] = useState<LoyaltyInfo | null>(null);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLoyalty = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.get<LoyaltyInfo>('/loyalty/account');
      setLoyalty(result);
      setTransactions(result?.recentTransactions ?? []);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.title || 'Failed to load loyalty info');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRewards = useCallback(async () => {
    try {
      const result = await apiClient.get<LoyaltyReward[]>('/loyalty/rewards');
      setRewards(result);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.title || 'Failed to load rewards');
    }
  }, []);

  useEffect(() => {
    fetchLoyalty();
    fetchRewards();
  }, [fetchLoyalty, fetchRewards]);

  return { loyalty, rewards, transactions, loading, error, fetchLoyalty, fetchRewards };
}
