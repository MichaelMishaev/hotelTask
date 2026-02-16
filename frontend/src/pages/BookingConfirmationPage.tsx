import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format, parseISO, differenceInDays } from 'date-fns';
import { useDateLocale } from '../hooks/useDateLocale';
import { useBooking } from '../hooks/useBooking';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { generateBookingPdf } from '../lib/pdfExport';
import { ROOM_DETAILS } from '../lib/roomData';
import type { Booking } from '../types';

export function BookingConfirmationPage() {
  const { t } = useTranslation();
  const dateLocale = useDateLocale();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  // Try to get booking from location state first (passed from checkout)
  const locationBooking = (location.state as { booking?: Booking })?.booking;

  // Fallback to fetching if direct URL access
  const { booking: hookBooking, loading, error } = useBooking(locationBooking ? undefined : id);

  // Use whichever booking is available
  const booking = locationBooking || hookBooking;

  const handleDownloadPdf = async () => {
    if (booking) {
      await generateBookingPdf(booking);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div data-testid="confirmation-page" className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div data-testid="confirmation-page" className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <ErrorBanner message={error || t('confirmation.bookingNotFound')} />
        </div>
      </div>
    );
  }

  const roomDetail = ROOM_DETAILS[booking.roomType as keyof typeof ROOM_DETAILS];
  const nights = differenceInDays(parseISO(booking.checkOut), parseISO(booking.checkIn));

  return (
    <div data-testid="confirmation-page" className="min-h-screen flex items-center justify-center p-4 relative bg-gray-50">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary rounded-full blur-[120px] opacity-5" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-primary rounded-full blur-[120px] opacity-5" />
      </div>

      {/* Main card */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <button
            onClick={() => navigate('/search')}
            className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-full transition-colors"
            aria-label={t('common.goBack')}
          >
            <MaterialIcon name="arrow_back" className="text-gray-700 rtl:scale-x-[-1]" />
          </button>
          <h1 className="text-sm font-bold text-gray-900">{t('confirmation.bookingStatus')}</h1>
          <div className="w-10" />
        </div>

        {/* Success section */}
        <div className="text-center pt-10 pb-6 px-6">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center size-20 rounded-full bg-primary/10 text-primary">
              <MaterialIcon
                name="check_circle"
                filled
                className="!text-5xl"
              />
            </div>
          </div>

          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">{t('confirmation.bookingConfirmed')}</h2>

          <div className="inline-flex items-center gap-2 bg-primary/5 rounded-lg px-3 py-1.5 mb-4">
            <span className="text-xs font-bold uppercase text-primary">{t('confirmation.referenceId')}</span>
            <span className="text-sm font-mono font-bold text-gray-900">
              #{booking.id.slice(0, 8).toUpperCase()}
            </span>
          </div>

          <p className="text-sm text-gray-600 max-w-md mx-auto">
            {t('confirmation.emailSent')}
          </p>
        </div>

        {/* Booking summary card */}
        <div className="px-6 pb-6">
          <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Image header */}
            <div
              className="h-40 w-full bg-cover bg-center relative"
              style={{ backgroundImage: `url(${roomDetail?.image || '/rooms/standard-room.png'})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-4" style={{ insetInlineStart: '1rem' }}>
                <p className="text-white/80 text-xs font-medium uppercase tracking-wide mb-1">
                  {t('common.hotelResidence')}
                </p>
                <h3 className="text-white text-xl font-bold">{t('common.grandHotel')}</h3>
              </div>
            </div>

            {/* Info section */}
            <div className="p-5 space-y-4">
              {/* Room type and price */}
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-gray-900">{t('confirmation.roomLabel', { type: booking.roomType })}</h4>
                <p className="text-2xl font-extrabold text-primary">
                  ${booking.totalAmount.toFixed(2)}
                </p>
              </div>

              {/* Check-in and duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                    <MaterialIcon name="calendar_today" className="text-base" />
                    <span className="text-xs font-medium">{t('common.checkIn')}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {format(parseISO(booking.checkIn), 'MMM dd, yyyy', { locale: dateLocale })}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                    <MaterialIcon name="nightlight" className="text-base" />
                    <span className="text-xs font-medium">{t('confirmation.duration')}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {t('common.nights', { count: nights })}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-2 pt-2 border-t border-gray-100">
                <MaterialIcon name="location_on" className="text-primary text-lg shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t('common.grandHotel')}</p>
                  <p className="text-xs text-gray-500">{t('common.coastalDrive')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-6 pb-10 space-y-3">
          {/* View booking details */}
          <button
            data-testid="view-booking-details"
            onClick={() => navigate(`/bookings/${booking.id}`)}
            className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <MaterialIcon name="description" />
            <span>{t('confirmation.viewBookingDetails')}</span>
          </button>

          {/* Print and download row */}
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="w-1/2 border-2 border-gray-100 font-bold py-4 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-gray-700"
            >
              <MaterialIcon name="print" />
              <span>{t('confirmation.printReceipt')}</span>
            </button>
            <button
              data-testid="download-pdf"
              onClick={handleDownloadPdf}
              className="w-1/2 border-2 border-gray-100 font-bold py-4 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-gray-700"
            >
              <MaterialIcon name="picture_as_pdf" />
              <span>{t('confirmation.downloadPdf')}</span>
            </button>
          </div>

          {/* View email in MailHog */}
          <a
            href="http://localhost:8025"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-amber-500 text-white font-bold py-4 rounded-xl hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <MaterialIcon name="mail" />
            <span>{t('confirmation.viewEmail')}</span>
          </a>

          {/* Return to home */}
          <button
            onClick={() => navigate('/search')}
            className="w-full border-2 border-gray-100 font-bold py-4 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-gray-700"
          >
            <MaterialIcon name="home" />
            <span>{t('confirmation.returnHome')}</span>
          </button>
        </div>

        {/* Support footer */}
        <div className="bg-gray-50 p-4 text-center">
          <p className="text-sm text-gray-600">
            {t('confirmation.needHelp')}{' '}
            <button className="text-primary font-semibold hover:underline">{t('confirmation.contactSupport')}</button>
          </p>
        </div>
      </div>
    </div>
  );
}
