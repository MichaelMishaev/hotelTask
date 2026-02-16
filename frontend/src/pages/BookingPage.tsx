import { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useBooking } from '../hooks/useBooking';
import { useDateLocale } from '../hooks/useDateLocale';
import { apiClient } from '../lib/api-client';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { generateBookingPdf } from '../lib/pdfExport';
import type { ApiError, Booking } from '../types';

const ROOM_IMAGES: Record<string, string> = {
  Standard: '/rooms/standard-room.png',
  Deluxe: '/rooms/deluxe-room.png',
  Suite: '/rooms/suite-room.png',
};

function getRoomImage(roomType: string): string {
  return ROOM_IMAGES[roomType] ?? '/rooms/standard-room.png';
}

export function BookingPage() {
  const { t } = useTranslation();
  const dateLocale = useDateLocale();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { booking, loading, error, fetchBooking, cancelBooking } = useBooking(id);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState(false);

  const canEdit = booking?.status === 'Confirmed';

  const handleStatusUpdate = useCallback(async () => {
    if (!id || !selectedStatus || selectedStatus === booking?.status) return;
    setStatusUpdateLoading(true);
    setStatusUpdateError(null);
    setStatusUpdateSuccess(false);
    try {
      await apiClient.patch<Booking>(`/bookings/${id}/status`, { status: selectedStatus });
      if (id) await fetchBooking(id);
      setStatusUpdateSuccess(true);
      setTimeout(() => setStatusUpdateSuccess(false), 3000);
    } catch (err) {
      const apiErr = err as ApiError;
      setStatusUpdateError(apiErr.detail || apiErr.title || 'Failed to update status');
    } finally {
      setStatusUpdateLoading(false);
    }
  }, [id, selectedStatus, booking?.status, fetchBooking]);

  const handleCancel = useCallback(async () => {
    if (!id) return;
    setCancelLoading(true);
    try {
      await cancelBooking(id);
      setShowCancelDialog(false);
    } catch {
      // error handled in hook
    } finally {
      setCancelLoading(false);
    }
  }, [id, cancelBooking]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 min-h-screen bg-gray-50">
        <ErrorBanner message={error} onRetry={id ? () => fetchBooking(id) : undefined} />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <EmptyState title={t('booking.bookingNotFound')} description={t('booking.bookingNotFoundDesc')} />
      </div>
    );
  }

  const nights = Math.max(
    1,
    Math.round(
      (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );
  const pricePerNight = nights > 0 ? booking.totalAmount / nights : 100;
  const serviceFee = booking.totalAmount * 0.12;
  const grandTotal = booking.totalAmount + serviceFee;
  const isStaff = user?.role === 'Staff' || user?.role === 'Admin';

  return (
    <div data-testid="booking-page" className="pb-32 min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between bg-white/80 px-4 py-4 backdrop-blur-md border-b border-primary/10">
        <button
          data-testid="back-to-bookings"
          onClick={() => navigate('/bookings')}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-primary/5 transition-colors"
        >
          <MaterialIcon name="arrow_back" className="text-slate-700 rtl:scale-x-[-1]" />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-sm font-bold uppercase tracking-wider text-slate-900">{t('booking.bookingDetails')}</h1>
          <span className="text-[10px] font-medium text-slate-500">{t('common.id')}: #{booking.id.slice(0, 8)}</span>
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-primary/5 transition-colors">
          <MaterialIcon name="share" className="text-slate-700" />
        </button>
      </header>

      {/* Hero Image */}
      <div className="px-4 pt-4">
        <div className="relative overflow-hidden rounded-xl">
          <img
            src={getRoomImage(booking.roomType)}
            alt={t(`enum.roomType.${booking.roomType}`)}
            className="w-full aspect-[16/9] object-cover"
          />
          <div className="absolute bottom-3" style={{ insetInlineStart: '0.75rem' }}>
            <StatusBadge status={booking.status} />
          </div>
        </div>
      </div>

      {/* Room Title & Location */}
      <div className="px-4 pt-4">
        <h2 className="text-2xl font-bold text-slate-900">{t(`enum.roomType.${booking.roomType}`)}</h2>
        <div className="flex items-center gap-1 mt-1">
          <MaterialIcon name="location_on" className="text-primary text-base" />
          <p className="text-sm text-gray-500">{t('booking.location')}</p>
        </div>
      </div>

      {/* Stay Dates Grid */}
      <div className="px-4 pt-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-primary/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <MaterialIcon name="login" className="text-primary text-lg" />
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">{t('common.checkIn')}</p>
            </div>
            <p className="text-sm font-bold text-slate-900">
              {format(new Date(booking.checkIn), 'MMM dd, yyyy', { locale: dateLocale })}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{t('booking.fromTime')}</p>
          </div>
          <div className="rounded-xl bg-primary/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <MaterialIcon name="logout" className="text-primary text-lg" />
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">{t('common.checkOut')}</p>
            </div>
            <p className="text-sm font-bold text-slate-900">
              {format(new Date(booking.checkOut), 'MMM dd, yyyy', { locale: dateLocale })}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{t('booking.beforeTime')}</p>
          </div>
        </div>
      </div>

      {/* Guest & Room Info */}
      <div className="px-4 pt-4">
        <div className="flex rounded-xl border border-gray-100 bg-white overflow-hidden">
          <div className="flex-1 p-4 flex items-center gap-3 border-r border-gray-100">
            <MaterialIcon name="group" className="text-primary text-xl" />
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">{t('booking.guests')}</p>
              <p className="text-sm font-semibold text-slate-900">{t('booking.twoAdults')}</p>
            </div>
          </div>
          <div className="flex-1 p-4 flex items-center gap-3">
            <MaterialIcon name="king_bed" className="text-primary text-xl" />
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">{t('booking.roomType')}</p>
              <p className="text-sm font-semibold text-slate-900">{t(`enum.roomType.${booking.roomType}`)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      {isStaff && (
        <div className="px-4 pt-4">
          <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <MaterialIcon name="admin_panel_settings" className="text-primary text-xl" />
              <h3 className="text-sm font-bold text-slate-900">{t('booking.adminActions')}</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-1">
                  {t('booking.updateStatus')}
                </label>
                <select
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={selectedStatus || booking.status}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setStatusUpdateError(null);
                    setStatusUpdateSuccess(false);
                  }}
                >
                  <option value="Confirmed">{t('enum.status.Confirmed')}</option>
                  <option value="CheckedIn">{t('enum.status.CheckedIn')}</option>
                  <option value="CheckedOut">{t('enum.status.CheckedOut')}</option>
                  <option value="Cancelled">{t('enum.status.Cancelled')}</option>
                </select>
              </div>
              {statusUpdateError && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2">
                  <p className="text-xs text-red-600">{statusUpdateError}</p>
                </div>
              )}
              {statusUpdateSuccess && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2">
                  <p className="text-xs text-emerald-600 font-medium">{t('booking.statusUpdated')}</p>
                </div>
              )}
              <button
                onClick={handleStatusUpdate}
                disabled={statusUpdateLoading || !selectedStatus || selectedStatus === booking.status}
                className="w-full rounded-lg bg-primary/10 px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {statusUpdateLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    {t('booking.updating')}
                  </>
                ) : (
                  t('booking.updateStatus')
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Summary */}
      <div className="px-4 pt-4">
        <div className="rounded-xl bg-white border border-gray-100 p-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">{t('booking.paymentSummary')}</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {t('booking.nightsPrice', { count: nights, price: pricePerNight.toFixed(0) })}
              </p>
              <p className="text-sm font-semibold text-slate-900">${booking.totalAmount.toFixed(2)}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{t('booking.serviceFee')}</p>
              <p className="text-sm font-semibold text-slate-900">${serviceFee.toFixed(2)}</p>
            </div>
            <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
              <p className="text-base font-bold text-slate-900">{t('booking.total')}</p>
              <p className="text-lg font-bold text-primary">${grandTotal.toFixed(2)}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2">
            <MaterialIcon name="check_circle" className="text-emerald-500 text-base" />
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              {t('booking.paidVia')}
            </p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => window.print()}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <MaterialIcon name="print" className="text-lg" />
              {t('confirmation.printReceipt')}
            </button>
            <button
              data-testid="download-pdf"
              onClick={() => booking && generateBookingPdf(booking)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary/20 bg-primary/5 py-3 text-xs font-bold text-primary hover:bg-primary/10 transition-colors"
            >
              <MaterialIcon name="picture_as_pdf" className="text-lg" />
              {t('confirmation.downloadPdf')}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Footer */}
      {canEdit && (
        <footer className="fixed bottom-0 z-20 w-full max-w-md bg-white/95 p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] backdrop-blur-md" style={{ insetInlineStart: '50%', transform: 'translateX(-50%)' }}>
          <button
            data-testid="booking-cancel"
            onClick={() => setShowCancelDialog(true)}
            className="flex items-center justify-center gap-1 w-full rounded-xl px-6 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
          >
            {t('booking.cancelBooking')}
          </button>
        </footer>
      )}

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        title={t('booking.cancelTitle')}
        message={t('booking.cancelMessage')}
        confirmLabel={t('booking.cancelConfirm')}
        cancelLabel={t('booking.keepBooking')}
        variant="danger"
        onConfirm={handleCancel}
        onCancel={() => setShowCancelDialog(false)}
        loading={cancelLoading}
      />
    </div>
  );
}
