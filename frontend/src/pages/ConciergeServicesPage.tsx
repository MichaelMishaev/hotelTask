import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useConcierge } from '../hooks/useConcierge';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import type { ConciergeCategory } from '../types';

export function ConciergeServicesPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    services,
    suggestions,
    loading,
    reserving,
    error,
    selectedCategory,
    setSelectedCategory,
    fetchServices,
    makeReservation,
  } = useConcierge();
  const [bookingServiceId, setBookingServiceId] = useState<string | null>(null);

  const CATEGORIES: { value: ConciergeCategory; label: string; icon: string }[] = [
    { value: 'spa', label: t('concierge.spaWellness'), icon: 'spa' },
    { value: 'dining', label: t('concierge.fineDining'), icon: 'restaurant' },
    { value: 'tours', label: t('concierge.localTours'), icon: 'map' },
    { value: 'transport', label: t('concierge.transport'), icon: 'directions_car' },
  ];

  const handleBookService = async (serviceId: string) => {
    setBookingServiceId(serviceId);
    try {
      await makeReservation({
        serviceId,
        date: new Date().toISOString().split('T')[0],
        time: '19:00',
        guests: 2,
      });
      setBookingServiceId(null);
    } catch {
      setBookingServiceId(null);
    }
  };

  const guestLastName = user?.name?.split(' ').pop();
  const welcomeName = guestLastName ? `Mr. ${guestLastName}` : undefined;

  return (
    <div data-testid="concierge-services-page" className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="flex items-center bg-white p-4 pb-2 justify-between sticky top-0 z-10 border-b border-gray-50">
        <div className="flex size-12 shrink-0 items-center">
          <div className="bg-primary/10 rounded-full size-10 flex items-center justify-center">
            <MaterialIcon name="person" className="text-primary" />
          </div>
        </div>
        <div className="flex-1 ms-3">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
            {t('concierge.guestPortfolio')}
          </p>
          <h2 className="text-lg font-bold leading-tight tracking-tight">
            {welcomeName
              ? t('concierge.welcomeGuest', { name: welcomeName })
              : t('concierge.welcomeGuest', { name: t('common.guest') })}
          </h2>
        </div>
        <div className="flex w-12 items-center justify-end">
          <button className="relative flex items-center justify-center rounded-full h-10 w-10 hover:bg-gray-100 transition-colors">
            <MaterialIcon name="notifications" className="text-gray-700" />
            <span className="absolute top-2" style={{ insetInlineEnd: '0.5rem' }}>
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
            </span>
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div
        className="flex gap-3 p-4 overflow-x-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.value;
          return (
            <button
              key={cat.value}
              data-testid={`category-${cat.value}`}
              onClick={() => setSelectedCategory(isActive ? null : cat.value)}
              className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-xl px-4 cursor-pointer transition-colors ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-[#f0f2f4] text-[#111318] hover:bg-gray-200'
              }`}
            >
              <MaterialIcon name={cat.icon} className="text-[20px]" />
              <p className={`text-sm leading-normal ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {cat.label}
              </p>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="px-4">
          <ErrorBanner
            message={error}
            onRetry={() => fetchServices(selectedCategory ?? undefined)}
          />
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {!loading && (
        <>
          {/* Signature Experiences Header */}
          <div className="px-4 pt-4 flex justify-between items-end">
            <div>
              <h2 className="text-xl font-bold leading-tight tracking-tight">
                {t('concierge.signatureExperiences')}
              </h2>
              <p className="text-gray-500 text-sm">{t('concierge.curatedForYou')}</p>
            </div>
            <button className="text-primary text-xs font-bold uppercase tracking-widest">
              {t('common.viewAll')}
            </button>
          </div>

          {/* Service Cards */}
          {services.map((service) => (
            <div key={service.id} className="p-4">
              <div
                data-testid={`service-card-${service.id}`}
                className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="relative w-full aspect-[16/9] bg-primary/5 flex items-center justify-center overflow-hidden">
                  {service.imageUrl ? (
                    <img
                      src={service.imageUrl}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <MaterialIcon name="spa" className="text-primary !text-6xl" />
                  )}
                  {service.badge && (
                    <div className="absolute top-3" style={{ insetInlineStart: '0.75rem' }}>
                      <span className="bg-white/90 backdrop-blur-sm text-primary text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter shadow-sm">
                        {service.badge}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col p-4 gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-primary text-[10px] font-bold uppercase tracking-[0.1em]">
                        {CATEGORIES.find((c) => c.value === service.category)?.label ||
                          service.category}
                      </p>
                      <h3 className="text-lg font-bold">{service.title}</h3>
                    </div>
                    <div className="text-end">
                      {service.price > 0 && (
                        <>
                          <p className="text-lg font-bold text-gray-900">
                            ${service.price.toFixed(0)}
                          </p>
                          <p className="text-[10px] text-gray-500 font-medium uppercase">
                            {service.duration}
                          </p>
                        </>
                      )}
                      {service.rating > 0 && (
                        <span className="flex items-center text-amber-500">
                          {Array.from({ length: service.rating }, (_, i) => (
                            <MaterialIcon key={i} name="star" className="text-sm" />
                          ))}
                        </span>
                      )}
                    </div>
                  </div>
                  {service.location && (
                    <div className="flex gap-2 text-[11px] font-semibold text-gray-500">
                      {service.duration && (
                        <span className="flex items-center gap-1">
                          <MaterialIcon name="schedule" className="text-sm" />
                          {service.duration}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <MaterialIcon name="location_on" className="text-sm" />
                        {service.location}
                      </span>
                    </div>
                  )}
                  <p className="text-gray-600 text-sm line-clamp-2">{service.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <button
                      data-testid={`book-service-${service.id}`}
                      onClick={() => handleBookService(service.id)}
                      disabled={reserving && bookingServiceId === service.id}
                      className="flex-1 h-10 bg-primary text-white rounded-lg text-sm font-bold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {reserving && bookingServiceId === service.id ? (
                        <>
                          <LoadingSpinner size="sm" className="text-white" />
                          {t('concierge.booking')}
                        </>
                      ) : (
                        service.price > 0 ? t('common.bookNow') : t('concierge.reserveTable')
                      )}
                    </button>
                    <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
                      <MaterialIcon name="favorite" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Empty state */}
          {services.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <MaterialIcon name="room_service" className="text-gray-300 !text-5xl mb-4" />
              <p className="text-gray-500 text-sm">
                {t('concierge.noServices')}
              </p>
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="px-4 py-2">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">
                {t('concierge.suggestedForYou')}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {suggestions.map((sug) => (
                  <div
                    key={sug.id}
                    data-testid={`suggestion-${sug.id}`}
                    className="bg-gray-50 rounded-xl p-3 flex flex-col gap-2"
                  >
                    <div className="w-full aspect-square rounded-lg bg-primary/5 mb-1 overflow-hidden flex items-center justify-center">
                      {sug.imageUrl ? (
                        <img
                          src={sug.imageUrl}
                          alt={sug.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <MaterialIcon
                          name={
                            CATEGORIES.find((c) => c.value === sug.category)?.icon || 'explore'
                          }
                          className="text-primary !text-4xl"
                        />
                      )}
                    </div>
                    <p className="text-primary text-[9px] font-bold uppercase tracking-wider">
                      {CATEGORIES.find((c) => c.value === sug.category)?.label || sug.category}
                    </p>
                    <h4 className="text-xs font-bold leading-tight">{sug.title}</h4>
                    <p className="text-[10px] text-gray-500 italic">{sug.subtitle}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
