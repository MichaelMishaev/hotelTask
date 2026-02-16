import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../lib/api-client';
import type { ApiError, Booking, CreateBookingRequest, UpdateBookingRequest } from '../types';

interface UseBookingReturn {
  booking: Booking | null;
  loading: boolean;
  error: string | null;
  fetchBooking: (id: string) => Promise<void>;
  createBooking: (req: CreateBookingRequest) => Promise<Booking>;
  updateBooking: (id: string, req: UpdateBookingRequest) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
}

export function useBooking(bookingId?: string): UseBookingReturn {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBooking = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.get<Booking>(`/bookings/${id}`);
      setBooking(result);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.title || 'Failed to load booking');
    } finally {
      setLoading(false);
    }
  }, []);

  const createBooking = useCallback(async (req: CreateBookingRequest): Promise<Booking> => {
    const result = await apiClient.post<Booking>('/bookings', req);
    return result;
  }, []);

  const updateBooking = useCallback(async (id: string, req: UpdateBookingRequest) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.put<Booking>(`/bookings/${id}`, req);
      setBooking(result);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.title || 'Failed to update booking');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelBooking = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.delete<Booking>(`/bookings/${id}`);
      setBooking(result);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.title || 'Failed to cancel booking');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (bookingId) {
      fetchBooking(bookingId);
    }
  }, [bookingId, fetchBooking]);

  return { booking, loading, error, fetchBooking, createBooking, updateBooking, cancelBooking };
}

interface UseGuestBookingsReturn {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  fetchBookings: (guestId: string) => Promise<void>;
}

export function useGuestBookings(guestId?: string): UseGuestBookingsReturn {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.get<Booking[]>(`/guests/${id}/bookings`);
      setBookings(result);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.title || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (guestId) {
      fetchBookings(guestId);
    }
  }, [guestId, fetchBookings]);

  return { bookings, loading, error, fetchBookings };
}
