import { useCallback, useState } from 'react';
import { apiClient } from '../lib/api-client';
import type { ApiError, Booking, CheckInOutItem, StaffRoom } from '../types';

interface UseStaffDashboardReturn {
  checkIns: CheckInOutItem[];
  checkOuts: CheckInOutItem[];
  loading: boolean;
  error: string | null;
  fetchTodayCheckIns: () => Promise<void>;
  fetchTodayCheckOuts: () => Promise<void>;
}

export function useStaffDashboard(): UseStaffDashboardReturn {
  const [checkIns, setCheckIns] = useState<CheckInOutItem[]>([]);
  const [checkOuts, setCheckOuts] = useState<CheckInOutItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTodayCheckIns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.get<CheckInOutItem[]>('/staff/dashboard/today-checkins');
      setCheckIns(result);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.title || 'Failed to load check-ins');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTodayCheckOuts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.get<CheckInOutItem[]>('/staff/dashboard/today-checkouts');
      setCheckOuts(result);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.title || 'Failed to load check-outs');
    } finally {
      setLoading(false);
    }
  }, []);

  return { checkIns, checkOuts, loading, error, fetchTodayCheckIns, fetchTodayCheckOuts };
}

interface UseStaffRoomsReturn {
  rooms: StaffRoom[];
  loading: boolean;
  error: string | null;
  fetchRooms: (status?: string) => Promise<void>;
  updateRoomStatus: (roomId: string, status: string) => Promise<void>;
}

export function useStaffRooms(): UseStaffRoomsReturn {
  const [rooms, setRooms] = useState<StaffRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback(async (status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const query = status ? `?status=${status}` : '';
      const result = await apiClient.get<StaffRoom[]>(`/staff/rooms${query}`);
      setRooms(result);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.title || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRoomStatus = useCallback(async (roomId: string, status: string) => {
    try {
      await apiClient.put(`/staff/rooms/${roomId}/status`, { status });
    } catch (err) {
      const apiErr = err as ApiError;
      throw new Error(apiErr.title || 'Failed to update room status');
    }
  }, []);

  return { rooms, loading, error, fetchRooms, updateRoomStatus };
}

interface UseStaffBookingsReturn {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  fetchStaffBookings: (params?: { status?: string; search?: string }) => Promise<void>;
  checkInBooking: (bookingId: string) => Promise<void>;
  checkOutBooking: (bookingId: string) => Promise<void>;
}

export function useStaffBookings(): UseStaffBookingsReturn {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStaffBookings = useCallback(async (params?: { status?: string; search?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.set('status', params.status);
      if (params?.search) searchParams.set('search', params.search);
      const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
      const result = await apiClient.get<{ items: Booking[]; total: number }>(`/staff/bookings${query}`);
      setBookings(result.items ?? []);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.title || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  const checkInBooking = useCallback(async (bookingId: string) => {
    try {
      await apiClient.post(`/staff/bookings/${bookingId}/check-in`);
    } catch (err) {
      const apiErr = err as ApiError;
      throw new Error(apiErr.title || 'Failed to check in');
    }
  }, []);

  const checkOutBooking = useCallback(async (bookingId: string) => {
    try {
      await apiClient.post(`/staff/bookings/${bookingId}/check-out`);
    } catch (err) {
      const apiErr = err as ApiError;
      throw new Error(apiErr.title || 'Failed to check out');
    }
  }, []);

  return { bookings, loading, error, fetchStaffBookings, checkInBooking, checkOutBooking };
}
