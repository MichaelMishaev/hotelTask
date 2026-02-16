import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useGuestBookings } from '../hooks/useBooking';
import { useDateLocale } from '../hooks/useDateLocale';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import type { Booking } from '../types';

const ROOM_IMAGES: Record<string, string> = {
  Standard: '/rooms/standard-room.png',
  Deluxe: '/rooms/deluxe-room.png',
  Suite: '/rooms/suite-room.png',
};

function getRoomImage(roomType: string): string {
  return ROOM_IMAGES[roomType] ?? '/rooms/standard-room.png';
}

function ActiveBookingCard({ booking, onClick }: { booking: Booking; onClick: () => void }) {
  const { t } = useTranslation();
  const dateLocale = useDateLocale();
  const isCancelled = booking.status === 'Cancelled';

  return (
    <div
      data-testid={`booking-card-${booking.id}`}
      onClick={onClick}
      className="cursor-pointer overflow-hidden rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative">
        <img
          src={getRoomImage(booking.roomType)}
          alt={t(`enum.roomType.${booking.roomType}`)}
          className={`w-full h-48 object-cover ${isCancelled ? 'grayscale' : ''}`}
        />
        <div className="absolute top-3" style={{ insetInlineStart: '0.75rem' }}>
          <StatusBadge status={booking.status} />
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-slate-900">{t(`enum.roomType.${booking.roomType}`)}</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {t('common.room')} {booking.roomNumber} &middot; {t('common.grandHotel')}
        </p>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="flex items-center gap-2">
            <MaterialIcon name="calendar_today" className="text-primary text-base" />
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">{t('common.checkIn')}</p>
              <p className="text-sm font-semibold">{format(new Date(booking.checkIn), 'MMM dd, yyyy', { locale: dateLocale })}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MaterialIcon name="calendar_today" className="text-primary text-base" />
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">{t('common.checkOut')}</p>
              <p className="text-sm font-semibold">{format(new Date(booking.checkOut), 'MMM dd, yyyy', { locale: dateLocale })}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">{t('common.id')}: #{booking.id.slice(0, 8)}</p>
          <button className="text-sm font-semibold text-primary flex items-center gap-1">
            {t('common.viewDetails')}
            <MaterialIcon name="chevron_right" className="text-base rtl:scale-x-[-1]" />
          </button>
        </div>
      </div>
    </div>
  );
}

function PastBookingCard({ booking, onClick }: { booking: Booking; onClick: () => void }) {
  const { t } = useTranslation();
  const dateLocale = useDateLocale();
  const isCancelled = booking.status === 'Cancelled';

  return (
    <div
      data-testid={`booking-card-${booking.id}`}
      onClick={onClick}
      className="cursor-pointer flex gap-3 rounded-xl bg-white border border-gray-100 p-3 opacity-70 hover:opacity-90 transition-opacity"
    >
      <img
        src={getRoomImage(booking.roomType)}
        alt={t(`enum.roomType.${booking.roomType}`)}
        className={`w-20 h-20 rounded-lg object-cover shrink-0 ${isCancelled ? 'grayscale' : ''}`}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-bold text-slate-900 truncate">{t(`enum.roomType.${booking.roomType}`)}</h4>
          <StatusBadge status={booking.status} />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {format(new Date(booking.checkIn), 'MMM dd', { locale: dateLocale })} - {format(new Date(booking.checkOut), 'MMM dd, yyyy', { locale: dateLocale })}
        </p>
        <p className="text-xs text-gray-400 mt-1">{t('common.room')} {booking.roomNumber}</p>
      </div>
    </div>
  );
}

export function GuestDashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const guestId = user?.id;
  const { bookings, loading, error, fetchBookings } = useGuestBookings(guestId);
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

  const activeBookings = bookings.filter(
    (b) => b.status === 'Confirmed' || b.status === 'CheckedIn',
  );
  const pastBookings = bookings.filter(
    (b) => b.status === 'CheckedOut' || b.status === 'Cancelled',
  );

  return (
    <div data-testid="guest-dashboard-page" className="pb-24 min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            data-testid="back-to-search"
            onClick={() => navigate('/search')}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <MaterialIcon name="arrow_back" className="text-slate-700 text-2xl rtl:scale-x-[-1]" />
          </button>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{t('dashboard.myBookings')}</h1>
        </div>
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
          <MaterialIcon name="notifications" className="text-slate-700" />
          <span className="absolute top-2" style={{ insetInlineEnd: '0.5rem' }}>
            <span className="flex h-2 w-2 rounded-full bg-red-500" />
          </span>
        </button>
      </header>

      {/* Segmented Control */}
      <div className="px-4 py-4">
        <div className="flex h-12 items-center justify-center rounded-xl bg-gray-200/50 p-1">
          <button
            data-testid="tab-active"
            onClick={() => setActiveTab('active')}
            className={`flex-1 h-full rounded-lg text-sm font-medium transition-all ${
              activeTab === 'active'
                ? 'bg-white shadow-sm text-primary font-semibold'
                : 'text-gray-500'
            }`}
          >
            {t('dashboard.active')} ({activeBookings.length})
          </button>
          <button
            data-testid="tab-past"
            onClick={() => setActiveTab('past')}
            className={`flex-1 h-full rounded-lg text-sm font-medium transition-all ${
              activeTab === 'past'
                ? 'bg-white shadow-sm text-primary font-semibold'
                : 'text-gray-500'
            }`}
          >
            {t('dashboard.past')} ({pastBookings.length})
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4">
          <ErrorBanner message={error} onRetry={guestId ? () => fetchBookings(guestId) : undefined} />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Active Bookings Tab */}
      {!loading && !error && activeTab === 'active' && (
        <div className="px-4">
          {activeBookings.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">{t('dashboard.currentStays')}</h2>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {activeBookings.length}
              </span>
            </div>
          )}

          {activeBookings.length === 0 ? (
            <EmptyState
              title={t('dashboard.noActiveBookings')}
              description={t('dashboard.noActiveDesc')}
              actionLabel={t('dashboard.searchRooms')}
              onAction={() => navigate('/search')}
            />
          ) : (
            <div className="space-y-4">
              {activeBookings.map((booking) => (
                <ActiveBookingCard
                  key={booking.id}
                  booking={booking}
                  onClick={() => navigate(`/bookings/${booking.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Past Bookings Tab */}
      {!loading && !error && activeTab === 'past' && (
        <div className="px-4">
          {pastBookings.length > 0 && (
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">{t('dashboard.pastBookings')}</h2>
          )}

          {pastBookings.length === 0 ? (
            <EmptyState
              title={t('dashboard.noPastBookings')}
              description={t('dashboard.noPastDesc')}
            />
          ) : (
            <div className="space-y-3">
              {pastBookings.map((booking) => (
                <PastBookingCard
                  key={booking.id}
                  booking={booking}
                  onClick={() => navigate(`/bookings/${booking.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
