import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { format, differenceInDays, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useDateLocale } from '../hooks/useDateLocale';
import { useAuth } from '../hooks/useAuth';
import { useBooking } from '../hooks/useBooking';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ROOM_DETAILS } from '../lib/roomData';
import type { Room } from '../types';

function PaymentProcessingOverlay({
  totalAmount,
  onComplete,
}: {
  totalAmount: number;
  onComplete: () => void;
}) {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 2500;
    const interval = 20;
    const ticks = duration / interval;
    let tick = 0;

    const timer = setInterval(() => {
      tick++;
      // Ease-out curve for natural feel
      const t = tick / ticks;
      setProgress(Math.min(t * (2 - t) * 100, 100));
      if (tick >= ticks) {
        clearInterval(timer);
        setTimeout(onComplete, 400);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-72 bg-white rounded-2xl p-6 shadow-2xl text-center">
        {/* Spinner */}
        <div className="w-12 h-12 mx-auto mb-4 border-4 border-gray-200 border-t-[#1152d4] rounded-full animate-spin" />

        <p className="text-base font-semibold text-gray-900 mb-1">{t('checkout.processingPayment')}</p>
        <p className="text-sm text-gray-500 mb-4">${totalAmount.toFixed(2)}</p>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-[#1152d4] rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-[11px] text-gray-400">{t('checkout.paymentSystem')}</p>
      </div>
    </div>
  );
}

interface CheckoutLocationState {
  room: Room;
  checkIn: string;
  checkOut: string;
}

export function CheckoutPage() {
  const { t } = useTranslation();
  const dateLocale = useDateLocale();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { createBooking } = useBooking();

  const state = location.state as CheckoutLocationState | null;

  const [guestName, setGuestName] = useState(user?.name || '');
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const [guestPhone, setGuestPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPaymentOverlay, setShowPaymentOverlay] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to search if no state
  if (!state || !state.room || !state.checkIn || !state.checkOut) {
    return <Navigate to="/search" replace />;
  }

  const { room, checkIn, checkOut } = state;
  const roomDetail = ROOM_DETAILS[room.roomType];

  // Calculate nights and total
  const nights = differenceInDays(parseISO(checkOut), parseISO(checkIn));
  const totalAmount = room.pricePerNight * nights;

  // Format dates
  const checkInDate = format(parseISO(checkIn), 'MMM d', { locale: dateLocale });
  const checkOutDate = format(parseISO(checkOut), 'MMM d', { locale: dateLocale });
  const dateRange = t('checkout.dateRange', {
    from: checkInDate,
    to: checkOutDate,
    nights: t('common.nights', { count: nights }),
  });

  const handleConfirmBooking = () => {
    if (!user) {
      setError(t('checkout.loginRequired'));
      return;
    }
    setError(null);
    setShowPaymentOverlay(true);
  };

  const handlePaymentComplete = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const booking = await createBooking({
        guestId: user.id,
        roomId: room.id,
        checkIn,
        checkOut,
      });
      navigate(`/confirmation/${booking.id}`, { state: { booking } });
    } catch (err: any) {
      setShowPaymentOverlay(false);
      setError(err.title || err.message || t('checkout.bookingFailed'));
    } finally {
      setLoading(false);
    }
  }, [user, createBooking, room.id, checkIn, checkOut, navigate, t]);

  return (
    <div data-testid="checkout-page" className="flex flex-col min-h-screen max-w-md mx-auto bg-white shadow-xl">
      {/* Payment Processing Overlay */}
      {showPaymentOverlay && (
        <PaymentProcessingOverlay
          totalAmount={totalAmount}
          onComplete={handlePaymentComplete}
        />
      )}

      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          aria-label={t('common.goBack')}
        >
          <MaterialIcon name="arrow_back" className="text-gray-700 rtl:scale-x-[-1]" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">{t('checkout.title')}</h1>
        <MaterialIcon name="lock" className="text-[#1152d4]" />
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-32 overflow-y-auto">
        {/* Booking Summary Section */}
        <section className="px-4 py-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('checkout.bookingSummary')}</h2>
          <div className="rounded-xl border border-gray-100 shadow-sm p-4 flex gap-4">
            <div className="flex-[2_2_0px] flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">{roomDetail.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{dateRange}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{t('common.totalPrice')}</p>
                <p className="text-2xl font-bold text-[#1152d4]">${totalAmount.toFixed(2)}</p>
              </div>
            </div>
            <div
              className="w-32 aspect-square bg-cover bg-center rounded-lg"
              style={{ backgroundImage: `url(${roomDetail.image})` }}
              role="img"
              aria-label={`${roomDetail.title} image`}
            />
          </div>
        </section>

        {/* Guest Information Section */}
        <section className="px-4 py-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('checkout.guestInfo')}</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="guest-name" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('checkout.fullName')}
              </label>
              <input
                id="guest-name"
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="h-12 w-full rounded-lg border border-gray-200 bg-white px-4 text-base focus:ring-2 focus:ring-[#1152d4]/20 focus:outline-0"
                placeholder={t('checkout.fullNamePlaceholder')}
              />
            </div>
            <div>
              <label htmlFor="guest-email" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('checkout.emailAddress')}
              </label>
              <input
                id="guest-email"
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="h-12 w-full rounded-lg border border-gray-200 bg-white px-4 text-base focus:ring-2 focus:ring-[#1152d4]/20 focus:outline-0"
                placeholder={t('checkout.emailPlaceholder')}
              />
            </div>
            <div>
              <label htmlFor="guest-phone" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('checkout.phoneNumber')}
              </label>
              <input
                id="guest-phone"
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="h-12 w-full rounded-lg border border-gray-200 bg-white px-4 text-base focus:ring-2 focus:ring-[#1152d4]/20 focus:outline-0"
                placeholder={t('checkout.phonePlaceholder')}
              />
            </div>
          </div>
        </section>

        {/* Payment Method Section */}
        <section className="px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">{t('checkout.paymentMethod')}</h2>
            <div className="flex items-center gap-2">
              <div className="w-8 h-5 bg-gray-100 rounded-sm flex items-center justify-center">
                <span className="text-[8px] font-bold text-gray-600">VISA</span>
              </div>
              <div className="w-8 h-5 bg-gray-100 rounded-sm flex items-center justify-center">
                <span className="text-[8px] font-bold text-gray-600">MC</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 p-4 bg-gray-50/50 space-y-4">
            <div>
              <label htmlFor="card-number" className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                {t('checkout.cardNumber')}
              </label>
              <div className="relative">
                <input
                  id="card-number"
                  type="text"
                  inputMode="numeric"
                  value={cardNumber}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
                    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
                    setCardNumber(formatted);
                  }}
                  className="h-12 w-full rounded-lg border border-gray-200 bg-white px-4 pe-12 text-base focus:ring-2 focus:ring-[#1152d4]/20 focus:outline-0"
                  placeholder={t('checkout.cardPlaceholder')}
                  maxLength={19}
                />
                <span className="absolute top-1/2 -translate-y-1/2 text-gray-400 end-4">
                  <MaterialIcon name="credit_card" />
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="expiry-date" className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                  {t('checkout.expiryDate')}
                </label>
                <input
                  id="expiry-date"
                  type="text"
                  inputMode="numeric"
                  value={expiryDate}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                    if (digits.length >= 3) {
                      setExpiryDate(`${digits.slice(0, 2)}/${digits.slice(2)}`);
                    } else {
                      setExpiryDate(digits);
                    }
                  }}
                  className="h-12 w-full rounded-lg border border-gray-200 bg-white px-4 text-base focus:ring-2 focus:ring-[#1152d4]/20 focus:outline-0"
                  placeholder={t('checkout.expiryPlaceholder')}
                  maxLength={5}
                />
              </div>
              <div className="flex-1">
                <label htmlFor="cvv" className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                  {t('checkout.cvv')}
                </label>
                <input
                  id="cvv"
                  type="text"
                  inputMode="numeric"
                  value={cvv}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setCvv(digits);
                  }}
                  className="h-12 w-full rounded-lg border border-gray-200 bg-white px-4 text-base focus:ring-2 focus:ring-[#1152d4]/20 focus:outline-0"
                  placeholder={t('checkout.cvvPlaceholder')}
                  maxLength={4}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Trust Badge */}
        <div className="flex items-center justify-center gap-2 px-4 py-4 text-gray-500">
          <MaterialIcon name="shield" className="text-sm" />
          <p className="text-xs">{t('checkout.securePayment')}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </main>

      {/* Sticky Footer */}
      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white p-4 border-t shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <button
          data-testid="confirm-book"
          type="button"
          onClick={handleConfirmBooking}
          disabled={loading}
          className="w-full bg-[#1152d4] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#0d3fa3] transition-colors"
        >
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <span>{t('checkout.confirmAndBook')}</span>
              <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
              <span>${totalAmount.toFixed(2)}</span>
            </>
          )}
        </button>
        <p className="text-[10px] text-gray-400 text-center mt-2">
          {t('checkout.termsAgreement')}
        </p>
      </footer>
    </div>
  );
}
