import { useCallback, useState } from 'react';
import { apiClient } from '../lib/api-client';
import type { ApiError, RevenueAnalytics, OccupancyAnalytics, BookingsByTypeAnalytics } from '../types';

interface UseAnalyticsReturn {
  revenueData: RevenueAnalytics | null;
  occupancyData: OccupancyAnalytics | null;
  bookingsByTypeData: BookingsByTypeAnalytics | null;
  revenueLoading: boolean;
  occupancyLoading: boolean;
  bookingsByTypeLoading: boolean;
  error: string | null;
  fetchRevenue: (period: string) => Promise<void>;
  fetchOccupancy: (period: string) => Promise<void>;
  fetchBookingsByType: () => Promise<void>;
}

export function useAnalytics(): UseAnalyticsReturn {
  const [revenueData, setRevenueData] = useState<RevenueAnalytics | null>(null);
  const [occupancyData, setOccupancyData] = useState<OccupancyAnalytics | null>(null);
  const [bookingsByTypeData, setBookingsByTypeData] = useState<BookingsByTypeAnalytics | null>(null);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [occupancyLoading, setOccupancyLoading] = useState(false);
  const [bookingsByTypeLoading, setBookingsByTypeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenue = useCallback(async (period: string) => {
    setRevenueLoading(true);
    setError(null);
    try {
      const result = await apiClient.get<RevenueAnalytics>(`/admin/analytics/revenue?period=${period}`);
      setRevenueData(result);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.title || 'Failed to load revenue analytics');
    } finally {
      setRevenueLoading(false);
    }
  }, []);

  const fetchOccupancy = useCallback(async (period: string) => {
    setOccupancyLoading(true);
    setError(null);
    try {
      const result = await apiClient.get<OccupancyAnalytics>(`/admin/analytics/occupancy?period=${period}`);
      setOccupancyData(result);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.title || 'Failed to load occupancy analytics');
    } finally {
      setOccupancyLoading(false);
    }
  }, []);

  const fetchBookingsByType = useCallback(async () => {
    setBookingsByTypeLoading(true);
    setError(null);
    try {
      const result = await apiClient.get<BookingsByTypeAnalytics>('/admin/analytics/bookings-by-type');
      setBookingsByTypeData(result);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.title || 'Failed to load bookings by type analytics');
    } finally {
      setBookingsByTypeLoading(false);
    }
  }, []);

  return {
    revenueData,
    occupancyData,
    bookingsByTypeData,
    revenueLoading,
    occupancyLoading,
    bookingsByTypeLoading,
    error,
    fetchRevenue,
    fetchOccupancy,
    fetchBookingsByType,
  };
}
