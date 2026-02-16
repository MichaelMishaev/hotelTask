import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { ROOM_DETAILS } from '../lib/roomData';
import type { Room } from '../types';

interface LocationState {
  room: Room;
  checkIn: string;
  checkOut: string;
}

export function RoomDetailsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  // Redirect to search if no state
  if (!state?.room || !state?.checkIn || !state?.checkOut) {
    return <Navigate to="/search" replace />;
  }

  const { room, checkIn, checkOut } = state;
  const roomDetails = ROOM_DETAILS[room.roomType];

  const handleBookNow = () => {
    navigate('/checkout', {
      state: { room, checkIn, checkOut }
    });
  };

  return (
    <div data-testid="room-details-page" className="min-h-screen bg-background-light pb-32">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-md mx-auto flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 transition-colors"
              aria-label={t('common.goBack')}
            >
              <MaterialIcon name="arrow_back" className="text-slate-700 rtl:scale-x-[-1]" />
            </button>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">{t('common.grandHotel')}</h2>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto">
        {/* Hero Image */}
        <div className="relative w-full aspect-[16/10] overflow-hidden">
          <img
            src={roomDetails.image}
            alt={roomDetails.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
            <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30">
              <p className="text-white text-xs font-medium flex items-center gap-1">
                <MaterialIcon name="photo_camera" size={14} />
                {t('roomDetails.photos')}
              </p>
            </div>
          </div>
        </div>

        {/* Gallery Thumbnails */}
        <div className="flex gap-3 px-4 mt-4 overflow-x-auto hide-scrollbar">
          {/* First thumbnail - selected */}
          <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 border-primary">
            <img
              src={roomDetails.image}
              alt="Room View 1"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Other thumbnails */}
          {[2, 3, 4].map((num) => (
            <div key={num} className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-slate-200">
              <img
                src={roomDetails.image}
                alt={`Room View ${num}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {/* Last thumbnail with "+8" overlay */}
          <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden relative">
            <img
              src={roomDetails.image}
              alt="Room View 5"
              className="w-full h-full object-cover blur-[1px]"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white font-bold text-sm">+8</span>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="px-4 mt-8">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                  {t('roomDetails.popularChoice')}
                </span>
                <div className="flex items-center text-yellow-500">
                  <MaterialIcon name="star" filled className="fill-current" size={16} />
                  <span className="text-xs font-bold ms-1 text-slate-900">
                    {roomDetails.rating} ({t('roomDetails.reviews', { count: roomDetails.reviewCount })})
                  </span>
                </div>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
                {roomDetails.title}
              </h1>
              <p className="text-slate-500 mt-2 flex items-center gap-1">
                <MaterialIcon name="location_on" size={18} />
                {roomDetails.location}
              </p>
            </div>
            <div className="text-start">
              <p className="text-slate-500 text-sm font-medium">{t('roomDetails.startingFrom')}</p>
              <p className="text-3xl font-extrabold text-primary">
                ${room.pricePerNight}
                <span className="text-lg font-normal text-slate-500">{t('common.perNight')}</span>
              </p>
            </div>
          </div>

          {/* Description Section */}
          <section className="mt-8">
            <h3 className="text-xl font-bold text-slate-900 mb-4">{t('roomDetails.description')}</h3>
            <p className="text-slate-600 leading-relaxed">
              {roomDetails.description}
            </p>
          </section>

          {/* Amenities Grid */}
          <section className="mt-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6">{t('roomDetails.amenities')}</h3>
            <div className="grid grid-cols-2 gap-4">
              {roomDetails.amenities.map((amenity) => (
                <div
                  key={amenity.label}
                  className="flex flex-col items-center p-4 rounded-xl bg-white border border-slate-100 transition-all hover:shadow-sm"
                >
                  <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <MaterialIcon name={amenity.icon} className="text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 text-center">
                    {amenity.label}
                  </span>
                </div>
              ))}
            </div>
            <button className="mt-6 text-sm font-bold text-primary flex items-center gap-1 hover:underline">
              {t('roomDetails.viewAllAmenities')}
              <MaterialIcon name="chevron_right" size={18} />
            </button>
          </section>
        </div>
      </main>

      {/* Sticky Bottom Bar (Mobile) */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 py-4 z-50">
        <div className="max-w-md mx-auto flex items-center justify-between gap-6">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
              {t('common.totalPrice')}
            </span>
            <p className="text-xl font-extrabold text-slate-900">
              ${room.pricePerNight}
              <span className="text-sm font-medium text-slate-500">{t('common.perNight')}</span>
            </p>
          </div>
          <button
            data-testid="book-now"
            onClick={handleBookNow}
            className="flex-1 max-w-[200px] bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/25"
          >
            {t('common.bookNow')}
          </button>
        </div>
      </div>
    </div>
  );
}
