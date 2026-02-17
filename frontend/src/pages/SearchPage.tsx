import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { useDateLocale } from '../hooks/useDateLocale';
import type { DateRange } from 'react-day-picker';
import { useRoomAvailability } from '../hooks/useRoomAvailability';
import { CalendarDateRangePicker } from '../components/ui/CalendarDateRangePicker';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import type { Room } from '../types';

const ROOM_PLACEHOLDER = '/rooms/hotel-lobby.png';

const ROOM_IMAGES: Record<Room['roomType'], string> = {
  Standard: '/rooms/standard-room.png',
  Deluxe: '/rooms/deluxe-room.png',
  Suite: '/rooms/suite-room.png',
};

export function SearchPage() {
  const { t } = useTranslation();
  const dateLocale = useDateLocale();
  const navigate = useNavigate();
  const { rooms, loading, error, search, searched } = useRoomAvailability();

  const [from, setFrom] = useState<Date | undefined>();
  const [to, setTo] = useState<Date | undefined>();
  const [selectedRoomType, setSelectedRoomType] = useState<string | undefined>();
  const [selectedPriceRange, setSelectedPriceRange] = useState<{ min?: number; max?: number } | undefined>();

  useEffect(() => {
    if (from && to && from.getTime() !== to.getTime()) {
      const filters = {
        roomType: selectedRoomType,
        minPrice: selectedPriceRange?.min,
        maxPrice: selectedPriceRange?.max,
      };
      search(format(from, 'yyyy-MM-dd'), format(to, 'yyyy-MM-dd'), filters);
    }
  }, [from, to, selectedRoomType, selectedPriceRange, search]);

  const handleDateSelect = (range: DateRange | undefined) => {
    setFrom(range?.from);
    setTo(range?.to);
  };

  const handleViewRoom = (room: Room) => {
    if (!from || !to) return;
    navigate(`/rooms/${room.id}`, {
      state: { room, checkIn: format(from, 'yyyy-MM-dd'), checkOut: format(to, 'yyyy-MM-dd') },
    });
  };

  const nights =
    from && to
      ? Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

  return (
    <div data-testid="search-page" className="pb-24">
      {/* Page Header */}
      <div className="px-4 pt-4 pb-2 bg-white">
        <h2 className="text-xl font-bold">{t('search.title')}</h2>
      </div>

      {/* Date Selection Section */}
      <div className="p-4 bg-white border-b">
        <div className="flex gap-3 mb-5">
          <div className={`flex-1 p-3.5 rounded-2xl transition-all duration-200 ${from ? 'bg-primary/5 border-2 border-primary/20' : 'bg-[#f6f6f8] border-2 border-transparent'}`}>
            <div className="flex items-center gap-2 mb-1">
              <MaterialIcon name="flight_land" className="text-primary !text-base" />
              <p className="text-xs uppercase tracking-wider font-bold text-gray-400">{t('search.checkInLabel')}</p>
            </div>
            <p className={`text-sm font-semibold ${from ? 'text-gray-900' : 'text-gray-400'}`}>
              {from ? format(from, 'EEE, MMM d', { locale: dateLocale }) : t('search.addDate')}
            </p>
          </div>
          <div className="flex items-center">
            <MaterialIcon name="arrow_forward" className="text-gray-300 !text-lg rtl:scale-x-[-1]" />
          </div>
          <div className={`flex-1 p-3.5 rounded-2xl transition-all duration-200 ${
            from && !to ? 'bg-primary/5 border-2 border-primary ring-2 ring-primary/20' :
            to ? 'bg-primary/5 border-2 border-primary/20' :
            'bg-[#f6f6f8] border-2 border-transparent'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <MaterialIcon name="flight_takeoff" className="text-primary !text-base" />
              <p className="text-xs uppercase tracking-wider font-bold text-gray-400">{t('search.checkOutLabel')}</p>
            </div>
            <p className={`text-sm font-semibold ${to ? 'text-gray-900' : from && !to ? 'text-primary animate-pulse' : 'text-gray-400'}`}>
              {to ? format(to, 'EEE, MMM d', { locale: dateLocale }) : from && !to ? t('search.selectDate') : t('search.addDate')}
            </p>
          </div>
        </div>

        {nights > 0 && (
          <div className="flex items-center justify-center gap-2 mb-4 py-2 px-4 bg-primary/5 rounded-xl">
            <MaterialIcon name="dark_mode" className="text-primary !text-base" />
            <p className="text-sm font-semibold text-primary">
              {t('common.nightsStay', { count: nights })}
            </p>
          </div>
        )}

        <CalendarDateRangePicker
          from={from}
          to={to}
          onSelect={handleDateSelect}
          disabledBefore={new Date()}
        />
      </div>

      {/* Filters Section */}
      {from && to && (
        <div className="px-4 py-3 bg-white border-b">
          {/* Room Type Filter */}
          <div className="mb-3">
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">{t('filters.filterByType')}</p>
            <div className="flex gap-2 flex-wrap">
              <button
                data-testid="filter-all-types"
                onClick={() => setSelectedRoomType(undefined)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all min-h-[44px] ${
                  !selectedRoomType
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('filters.allTypes')}
              </button>
              <button
                data-testid="filter-standard"
                onClick={() => setSelectedRoomType(selectedRoomType === 'Standard' ? undefined : 'Standard')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all min-h-[44px] ${
                  selectedRoomType === 'Standard'
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('filters.standard')}
              </button>
              <button
                data-testid="filter-deluxe"
                onClick={() => setSelectedRoomType(selectedRoomType === 'Deluxe' ? undefined : 'Deluxe')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all min-h-[44px] ${
                  selectedRoomType === 'Deluxe'
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('filters.deluxe')}
              </button>
              <button
                data-testid="filter-suite"
                onClick={() => setSelectedRoomType(selectedRoomType === 'Suite' ? undefined : 'Suite')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all min-h-[44px] ${
                  selectedRoomType === 'Suite'
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('filters.suite')}
              </button>
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">{t('filters.filterByPrice')}</p>
            <div className="flex gap-2 flex-wrap">
              <button
                data-testid="filter-price-0-150"
                onClick={() => setSelectedPriceRange(
                  selectedPriceRange?.min === 0 && selectedPriceRange?.max === 150
                    ? undefined
                    : { min: 0, max: 150 }
                )}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all min-h-[44px] ${
                  selectedPriceRange?.min === 0 && selectedPriceRange?.max === 150
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                $0-150
              </button>
              <button
                data-testid="filter-price-150-250"
                onClick={() => setSelectedPriceRange(
                  selectedPriceRange?.min === 150 && selectedPriceRange?.max === 250
                    ? undefined
                    : { min: 150, max: 250 }
                )}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all min-h-[44px] ${
                  selectedPriceRange?.min === 150 && selectedPriceRange?.max === 250
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                $150-250
              </button>
              <button
                data-testid="filter-price-250-plus"
                onClick={() => setSelectedPriceRange(
                  selectedPriceRange?.min === 250
                    ? undefined
                    : { min: 250 }
                )}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all min-h-[44px] ${
                  selectedPriceRange?.min === 250 && !selectedPriceRange?.max
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                $250+
              </button>
              {(selectedRoomType || selectedPriceRange) && (
                <button
                  data-testid="clear-filters"
                  onClick={() => {
                    setSelectedRoomType(undefined);
                    setSelectedPriceRange(undefined);
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all min-h-[44px] flex items-center gap-1"
                >
                  <MaterialIcon name="close" className="!text-base" />
                  {t('filters.clearFilters')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dynamic results area - announced to screen readers */}
      <div aria-live="polite">
        {/* Error banners */}
        {error && (
          <div className="px-4 pt-4">
            <ErrorBanner
              message={error}
              onRetry={from && to ? () => search(format(from, 'yyyy-MM-dd'), format(to, 'yyyy-MM-dd')) : undefined}
            />
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner size="lg" label={t('search.loadingRooms')} />
          </div>
        )}

        {/* Info Banner */}
        {!loading && !error && from && to && rooms.length > 0 && (
          <div className="px-4 py-3 bg-primary/5 flex items-center justify-between border-b border-primary/10">
            <div className="flex items-center gap-2">
              <MaterialIcon name="info" className="text-primary text-lg" />
              <p className="text-sm font-medium text-primary">
                {t('search.showingPrice', { count: nights })}
              </p>
            </div>
            <p className="text-xs font-bold text-primary uppercase">
              {format(from, 'MMM d', { locale: dateLocale })} - {format(to, 'MMM d', { locale: dateLocale })}
            </p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && searched && rooms.length === 0 && (
          <EmptyState
            title={t('search.noRooms')}
            description={t('search.noRoomsDesc')}
          />
        )}

      {/* Room List */}
      {!loading && !error && rooms.length > 0 && (
        <div className="p-4 space-y-6">
          <h3 className="text-lg font-bold">{t('search.availableRooms', { count: rooms.length })}</h3>
          {rooms.map((room) => {
            const roomTitle = t(`enum.roomType.${room.roomType}`);
            const roomDesc = t(`enum.roomDesc.${room.roomType}`);
            const roomImage = ROOM_IMAGES[room.roomType];
            const totalPrice = room.pricePerNight * nights;
            return (
              <div
                key={room.id}
                data-testid={`room-card-${room.id}`}
                role="button"
                tabIndex={0}
                onClick={() => handleViewRoom(room)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleViewRoom(room); } }}
                aria-label={`${roomTitle} - $${Math.round(room.pricePerNight)} per night, $${Math.round(totalPrice)} total`}
                className="cursor-pointer bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md focus:ring-2 focus:ring-primary focus:outline-none transition-shadow"
              >
                <img
                  className="w-full h-48 object-cover"
                  src={roomImage}
                  alt={roomTitle}
                  onError={(e) => { (e.target as HTMLImageElement).src = ROOM_PLACEHOLDER; }}
                />
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-lg font-bold">{roomTitle}</h4>
                      <p className="text-xs text-gray-500">{roomDesc}</p>
                    </div>
                    <div className="text-end">
                      <p className="text-xl font-bold text-primary">
                        ${Math.round(room.pricePerNight).toLocaleString()}
                        <span className="text-xs text-gray-400 font-normal">{t('common.perNight')}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-bold">{t('search.totalStayPrice')}</p>
                      <p className="text-lg font-bold">${Math.round(totalPrice).toLocaleString()}</p>
                    </div>
                    <button
                      data-testid={`view-room-${room.id}`}
                      onClick={(e) => { e.stopPropagation(); handleViewRoom(room); }}
                      className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 min-h-[44px]"
                    >
                      {t('common.bookNow')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pre-search prompt */}
      {!searched && !loading && (
        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
          <MaterialIcon name="calendar_month" className="text-gray-400 !text-5xl mb-4" />
          <p className="text-gray-500 text-sm">
            {t('search.selectDates')}
          </p>
        </div>
      )}
      </div>
    </div>
  );
}
