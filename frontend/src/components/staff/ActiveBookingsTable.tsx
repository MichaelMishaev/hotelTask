import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { MaterialIcon } from '../ui/MaterialIcon';
import { StatusBadge } from '../ui/StatusBadge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import type { Booking } from '../../types';

interface ActiveBookingsTableProps {
  bookings: Booking[];
  loading: boolean;
  collapsed?: boolean;
}

export function ActiveBookingsTable({ bookings, loading, collapsed = false }: ActiveBookingsTableProps) {
  const navigate = useNavigate();

  if (collapsed && bookings.length === 0 && !loading) return null;

  return (
    <div className="rounded-xl bg-white border border-gray-100 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5">
          <MaterialIcon name="book_online" className="text-primary text-lg" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Active Bookings</h3>
          <p className="text-xs text-gray-400">{bookings.length} active booking{bookings.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <LoadingSpinner size="sm" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-center">
          <MaterialIcon name="event_busy" className="text-gray-300 text-3xl mb-2" />
          <p className="text-sm text-gray-400">No active bookings</p>
        </div>
      ) : (
        <div className="space-y-2">
          {bookings.slice(0, collapsed ? 5 : undefined).map((booking) => (
            <div
              key={booking.id}
              onClick={() => navigate(`/bookings/${booking.id}`)}
              className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 p-3 cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900 truncate">{booking.guestName}</p>
                  <StatusBadge status={booking.status} />
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Room {booking.roomNumber} &middot; {format(new Date(booking.checkIn), 'MMM dd')} - {format(new Date(booking.checkOut), 'MMM dd')}
                </p>
              </div>
              <MaterialIcon name="chevron_right" className="text-gray-400 text-lg shrink-0" />
            </div>
          ))}
          {collapsed && bookings.length > 5 && (
            <p className="text-center text-xs text-primary font-semibold pt-2">
              +{bookings.length - 5} more bookings
            </p>
          )}
        </div>
      )}
    </div>
  );
}
