import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../lib/api-client';
import type {
  ApiError,
  ConciergeCategory,
  ConciergeReservation,
  ConciergeService,
  ConciergeSuggestion,
} from '../types';

interface UseConciergeReturn {
  services: ConciergeService[];
  suggestions: ConciergeSuggestion[];
  loading: boolean;
  reserving: boolean;
  error: string | null;
  selectedCategory: ConciergeCategory | null;
  setSelectedCategory: (cat: ConciergeCategory | null) => void;
  fetchServices: (category?: ConciergeCategory) => Promise<void>;
  makeReservation: (req: ConciergeReservation) => Promise<void>;
}

export function useConcierge(): UseConciergeReturn {
  const [services, setServices] = useState<ConciergeService[]>([]);
  const [suggestions, setSuggestions] = useState<ConciergeSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ConciergeCategory | null>(null);

  const fetchServices = useCallback(async (category?: ConciergeCategory) => {
    setLoading(true);
    setError(null);
    try {
      const query = category ? `?category=${category}` : '';
      const result = await apiClient.get<ConciergeService[]>(`/concierge/services${query}`);
      setServices(result);
      const sug = await apiClient.get<ConciergeSuggestion[]>('/concierge/suggestions');
      setSuggestions(sug);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.title || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  }, []);

  const makeReservation = useCallback(async (req: ConciergeReservation) => {
    setReserving(true);
    setError(null);
    try {
      await apiClient.post('/concierge/reservations', req);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.title || 'Failed to make reservation');
      throw err;
    } finally {
      setReserving(false);
    }
  }, []);

  useEffect(() => {
    fetchServices(selectedCategory ?? undefined);
  }, [selectedCategory, fetchServices]);

  return {
    services,
    suggestions,
    loading,
    reserving,
    error,
    selectedCategory,
    setSelectedCategory,
    fetchServices,
    makeReservation,
  };
}
