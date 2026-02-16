import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import type { Booking } from '../../types';
import { CalendarDateRangePicker } from '../ui/CalendarDateRangePicker';
import { Button } from '../ui/Button';
import { MaterialIcon } from '../ui/MaterialIcon';

interface BookingEditFormProps {
  booking: Booking;
  onSave: (checkin: string, checkout: string) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function BookingEditForm({ booking, onSave, onCancel, loading = false }: BookingEditFormProps) {
  const [from, setFrom] = useState<Date | undefined>(new Date(booking.checkIn));
  const [to, setTo] = useState<Date | undefined>(new Date(booking.checkOut));
  const [error, setError] = useState<string | null>(null);

  const handleSelect = useCallback((range: DateRange | undefined) => {
    setFrom(range?.from);
    setTo(range?.to);
    setError(null);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to) {
      setError('Please select both check-in and check-out dates');
      return;
    }
    if (to <= from) {
      setError('Check-out must be after check-in');
      return;
    }
    onSave(format(from, 'yyyy-MM-dd'), format(to, 'yyyy-MM-dd'));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
        <MaterialIcon name="edit_calendar" className="text-primary" />
        Edit Stay Dates
      </h3>

      <div className="flex gap-3 mb-4">
        <div className="flex-1 p-3 border border-gray-200 rounded-xl bg-background-light/50">
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Check-in</p>
          <p className="text-sm font-semibold">{from ? format(from, 'MMM d, yyyy') : 'Select date'}</p>
        </div>
        <div className="flex-1 p-3 border border-gray-200 rounded-xl bg-background-light/50">
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Check-out</p>
          <p className="text-sm font-semibold">{to ? format(to, 'MMM d, yyyy') : 'Select date'}</p>
        </div>
      </div>

      <CalendarDateRangePicker
        from={from}
        to={to}
        onSelect={handleSelect}
        disabledBefore={new Date()}
      />

      {error && (
        <p className="text-sm text-red-500 font-medium">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          data-testid="booking-save"
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          loadingText="Saving..."
          className="flex-1"
        >
          Save Changes
        </Button>
        <Button
          data-testid="booking-cancel-edit"
          type="button"
          variant="secondary"
          size="md"
          onClick={onCancel}
          disabled={loading}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
