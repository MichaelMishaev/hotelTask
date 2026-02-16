import { useState } from 'react';
import { MaterialIcon } from '../ui/MaterialIcon';
import { StatusBadge } from '../ui/StatusBadge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import type { CheckInOutItem } from '../../types';

interface TodayCheckInsCardProps {
  items: CheckInOutItem[];
  loading: boolean;
  onCheckIn: (bookingId: string) => Promise<void>;
}

export function TodayCheckInsCard({ items, loading, onCheckIn }: TodayCheckInsCardProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleCheckIn = async (bookingId: string) => {
    setProcessingId(bookingId);
    try {
      await onCheckIn(bookingId);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="rounded-xl bg-white border border-gray-100 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
          <MaterialIcon name="login" className="text-emerald-600 text-lg" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Today's Check-Ins</h3>
          <p className="text-xs text-gray-400">{items.length} guest{items.length !== 1 ? 's' : ''} checking in</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <LoadingSpinner size="sm" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-center">
          <MaterialIcon name="event_available" className="text-gray-300 text-3xl mb-2" />
          <p className="text-sm text-gray-400">No check-ins scheduled for today</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.bookingId} className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 p-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 truncate">{item.guestName}</p>
                <p className="text-xs text-gray-500">
                  Room {item.roomNumber} &middot; {item.roomType}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={item.status} />
                <button
                  onClick={() => handleCheckIn(item.bookingId)}
                  disabled={processingId === item.bookingId}
                  className="flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                >
                  {processingId === item.bookingId ? (
                    <LoadingSpinner size="sm" className="text-white" />
                  ) : (
                    <>
                      <MaterialIcon name="login" className="text-sm" />
                      Check In
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
