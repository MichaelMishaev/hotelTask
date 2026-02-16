import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useStaffBookings } from '../hooks/useStaff';
import { SearchInput } from '../components/shared/SearchInput';
import { StatusBadge } from '../components/ui/StatusBadge';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { EmptyState } from '../components/ui/EmptyState';
import type { Booking } from '../types';

function BookingCard({ booking, onClick }: { booking: Booking; onClick: () => void }) {
  const { t } = useTranslation();
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-xl bg-white border border-gray-100 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900 truncate">{booking.guestName}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {t(`enum.roomType.${booking.roomType}`)} &middot; {t('common.room')} {booking.roomNumber}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <MaterialIcon name="calendar_today" className="text-primary text-sm" />
          <span className="text-xs text-gray-600">
            {format(new Date(booking.checkIn), 'MMM dd')} - {format(new Date(booking.checkOut), 'MMM dd, yyyy')}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-400">{t('common.id')}: #{booking.id.slice(0, 8)}</p>
        <div className="flex items-center gap-1 text-sm font-semibold text-primary">
          {t('common.viewDetails')}
          <MaterialIcon name="chevron_right" className="text-base rtl:scale-x-[-1]" />
        </div>
      </div>
    </div>
  );
}

export function StaffBookingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { bookings, loading, error, fetchStaffBookings } = useStaffBookings();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  const statusTabs = [
    { key: 'all', label: t('enum.status.All') },
    { key: 'Confirmed', label: t('enum.status.Confirmed') },
    { key: 'CheckedIn', label: t('enum.status.CheckedIn') },
    { key: 'CheckedOut', label: t('enum.status.CheckedOut') },
    { key: 'Cancelled', label: t('enum.status.Cancelled') },
  ];

  const loadBookings = useCallback(() => {
    fetchStaffBookings({
      status: activeTab === 'all' ? undefined : activeTab,
      search: search || undefined,
    });
  }, [activeTab, search, fetchStaffBookings]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  return (
    <div data-testid="staff-bookings-page" className="pb-24 min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/staff/dashboard')}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <MaterialIcon name="arrow_back" className="text-slate-700 text-2xl rtl:scale-x-[-1]" />
          </button>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{t('staff.allBookings')}</h1>
        </div>
      </header>

      {/* Search */}
      <div className="px-4 pt-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={t('staff.searchPlaceholder')}
        />
      </div>

      {/* Status Filter Tabs */}
      <div className="px-4 pt-3">
        <div className="flex flex-wrap gap-2">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                activeTab === tab.key
                  ? 'bg-primary text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 pt-4">
          <ErrorBanner message={error} onRetry={loadBookings} />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Bookings List */}
      {!loading && !error && (
        <div className="px-4 pt-4">
          {bookings.length === 0 ? (
            <EmptyState
              title={t('staff.noBookings')}
              description={search ? t('staff.noBookingsSearch') : t('staff.noBookingsFilter')}
            />
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <BookingCard
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
