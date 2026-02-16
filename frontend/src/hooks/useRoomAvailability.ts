import { useCallback, useState } from 'react';
import { apiClient } from '../lib/api-client';
import type { ApiError, Room } from '../types';

interface SearchFilters {
  roomType?: string;
  minPrice?: number;
  maxPrice?: number;
}

interface UseRoomAvailabilityReturn {
  rooms: Room[];
  loading: boolean;
  error: string | null;
  search: (checkIn: string, checkOut: string, filters?: SearchFilters) => Promise<void>;
  searched: boolean;
}

export function useRoomAvailability(): UseRoomAvailabilityReturn {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const search = useCallback(async (checkIn: string, checkOut: string, filters?: SearchFilters) => {
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const params = new URLSearchParams({
        checkin: checkIn,
        checkout: checkOut,
      });

      if (filters?.roomType) params.append('roomType', filters.roomType);
      if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
      if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());

      const result = await apiClient.get<Room[]>(
        `/rooms/availability?${params.toString()}`,
      );
      setRooms(result);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.title || 'Could not connect to server. Please check your connection and try again.');
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { rooms, loading, error, search, searched };
}
