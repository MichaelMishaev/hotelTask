import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStayPreferences } from '../hooks/useStayPreferences';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import type { MinibarPreference, PillowType } from '../types';

export function EnhanceStayPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { preferences, loading, saving, error, fetchPreferences, updatePreferences } = useStayPreferences(id);

  const PILLOW_OPTIONS: { value: PillowType; label: string; desc: string }[] = [
    { value: 'firm', label: t('enhance.firm'), desc: t('enhance.firmDesc') },
    { value: 'soft', label: t('enhance.soft'), desc: t('enhance.softDesc') },
    { value: 'memory_foam', label: t('enhance.memoryFoam'), desc: t('enhance.memoryFoamDesc') },
  ];

  const MINIBAR_OPTIONS: { value: MinibarPreference; label: string; desc: string }[] = [
    { value: 'healthy', label: t('enhance.healthy'), desc: t('enhance.healthyDesc') },
    { value: 'indulgent', label: t('enhance.indulgent'), desc: t('enhance.indulgentDesc') },
    { value: 'beverage', label: t('enhance.beverageFocused'), desc: t('enhance.beverageDesc') },
  ];

  const [pillowType, setPillowType] = useState<PillowType>('firm');
  const [minibarPref, setMinibarPref] = useState<MinibarPreference>('indulgent');
  const [selectedAmenities, setSelectedAmenities] = useState<Set<string>>(new Set());
  const [arrivalTime, setArrivalTime] = useState('15:00');

  useEffect(() => {
    if (preferences) {
      setPillowType(preferences.pillowType);
      setMinibarPref(preferences.minibarPreference);
      setSelectedAmenities(
        new Set(preferences.amenities.filter((a) => a.added).map((a) => a.id))
      );
      setArrivalTime(preferences.arrivalTime);
    }
  }, [preferences]);

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities((prev) => {
      const next = new Set(prev);
      if (next.has(amenityId)) {
        next.delete(amenityId);
      } else {
        next.add(amenityId);
      }
      return next;
    });
  };

  const totalCharges =
    preferences?.amenities
      .filter((a) => selectedAmenities.has(a.id))
      .reduce((sum, a) => sum + a.price, 0) ?? 0;

  const handleConfirm = useCallback(async () => {
    if (!id) return;
    try {
      await updatePreferences(id, {
        pillowType,
        minibarPreference: minibarPref,
        amenityIds: Array.from(selectedAmenities),
        arrivalTime,
      });
      navigate(`/bookings/${id}`);
    } catch {
      // error handled in hook
    }
  }, [id, pillowType, minibarPref, selectedAmenities, arrivalTime, updatePreferences, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div data-testid="enhance-stay-page" className="min-h-screen bg-[#f6f6f8]">
      {/* Header */}
      <nav className="sticky top-0 z-50 flex items-center bg-white/80 backdrop-blur-md p-4 justify-between border-b border-gray-200">
        <button
          data-testid="enhance-back"
          onClick={() => navigate(-1)}
          className="text-primary flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <MaterialIcon name="arrow_back" className="rtl:scale-x-[-1]" />
        </button>
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pe-10">
          {t('enhance.personalizeStay')}
        </h2>
      </nav>

      <main className="pb-32">
        {error && (
          <div className="px-4 pt-4">
            <ErrorBanner message={error} onRetry={id ? () => fetchPreferences(id) : undefined} />
          </div>
        )}

        {/* Hero */}
        <div className="p-4">
          <div
            className="relative h-48 w-full overflow-hidden rounded-xl bg-cover bg-center"
            style={{
              backgroundImage:
                'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6)), url(/rooms/suite-room.png)',
            }}
          >
            <div className="absolute bottom-4" style={{ insetInlineStart: '1rem' }}>
              <p className="text-white text-2xl font-bold tracking-tight">{t('enhance.tailorComfort')}</p>
              <p className="text-white/90 text-sm">{t('common.grandHotel')}</p>
            </div>
          </div>
        </div>

        {/* Pillow Selection */}
        <section className="mt-4 px-4">
          <div className="flex items-center gap-2 mb-4">
            <MaterialIcon name="bed" className="text-primary" />
            <h3 className="text-lg font-bold">{t('enhance.selectPillow')}</h3>
          </div>
          <div className="grid gap-3">
            {PILLOW_OPTIONS.map((option) => (
              <label
                key={option.value}
                data-testid={`pillow-${option.value}`}
                className={`flex items-center gap-4 rounded-xl border bg-white p-4 cursor-pointer hover:border-primary/50 transition-all ${
                  pillowType === option.value
                    ? 'border-primary'
                    : 'border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name="pillow"
                  checked={pillowType === option.value}
                  onChange={() => setPillowType(option.value)}
                  className="h-5 w-5 border-2 border-gray-300 text-primary focus:ring-primary"
                />
                <div className="flex grow flex-col">
                  <p className="text-base font-semibold">{option.label}</p>
                  <p className="text-gray-500 text-sm">{option.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Minibar Preferences */}
        <section className="mt-8 px-4">
          <div className="flex items-center gap-2 mb-4">
            <MaterialIcon name="kitchen" className="text-primary" />
            <h3 className="text-lg font-bold">{t('enhance.minibarPreferences')}</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
            {MINIBAR_OPTIONS.map((option) => (
              <button
                key={option.value}
                data-testid={`minibar-${option.value}`}
                onClick={() => setMinibarPref(option.value)}
                className={`flex-none w-48 rounded-xl border overflow-hidden ${
                  minibarPref === option.value ? 'border-primary' : 'border-gray-200'
                }`}
              >
                <div className="h-28 bg-primary/5 flex items-center justify-center">
                  <MaterialIcon
                    name={
                      option.value === 'healthy'
                        ? 'nutrition'
                        : option.value === 'indulgent'
                          ? 'cake'
                          : 'local_bar'
                    }
                    className="text-primary !text-4xl"
                  />
                </div>
                <div className="p-3 bg-white">
                  <p className="font-bold text-sm">{option.label}</p>
                  <p className="text-xs text-gray-500 mb-2">{option.desc}</p>
                  <div
                    className={`w-full py-1.5 rounded-lg text-xs font-bold text-center ${
                      minibarPref === option.value
                        ? 'bg-primary text-white'
                        : 'border border-primary text-primary'
                    }`}
                  >
                    {minibarPref === option.value ? t('enhance.selected') : t('enhance.select')}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Welcome Amenities */}
        <section className="mt-6 px-4">
          <div className="flex items-center gap-2 mb-4">
            <MaterialIcon name="redeem" className="text-primary" />
            <h3 className="text-lg font-bold">{t('enhance.welcomeAmenities')}</h3>
          </div>
          <div className="space-y-4">
            {(preferences?.amenities ?? []).map((amenity) => {
              const isAdded = selectedAmenities.has(amenity.id);
              return (
                <div
                  key={amenity.id}
                  className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-200"
                >
                  <div className="size-20 rounded-lg overflow-hidden bg-primary/5 shrink-0 flex items-center justify-center">
                    {amenity.imageUrl ? (
                      <img
                        src={amenity.imageUrl}
                        alt={amenity.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <MaterialIcon name="redeem" className="text-primary !text-3xl" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{amenity.name}</p>
                    <p className="text-xs text-gray-500">{amenity.description}</p>
                    <p className="text-primary font-bold text-sm mt-1">
                      ${amenity.price.toFixed(2)}
                    </p>
                  </div>
                  <button
                    data-testid={`amenity-${amenity.id}`}
                    onClick={() => toggleAmenity(amenity.id)}
                    className={`px-4 py-2 rounded-lg font-bold text-sm ${
                      isAdded
                        ? 'bg-primary text-white'
                        : 'bg-primary/10 text-primary hover:bg-primary/20'
                    }`}
                  >
                    {isAdded ? t('enhance.added') : t('enhance.add')}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Arrival Time */}
        <section className="mt-8 px-4 mb-10">
          <div className="flex items-center gap-2 mb-3">
            <MaterialIcon name="schedule" className="text-primary" />
            <h3 className="text-lg font-bold">{t('enhance.arrivalDetails')}</h3>
          </div>
          <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('enhance.estimatedArrival')}
            </label>
            <input
              data-testid="arrival-time"
              type="time"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg p-3 focus:ring-primary focus:border-primary"
            />
            <p className="mt-2 text-xs text-gray-500 italic">
              {t('enhance.itemsPrepared')}
            </p>
          </div>
        </section>
      </main>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 inset-inline-start-0 inset-inline-end-0 bg-white/90 backdrop-blur-md border-t border-gray-200 p-4 z-50">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">{t('enhance.additionalCharges')}</span>
            <span className="text-lg font-bold">${totalCharges.toFixed(2)}</span>
          </div>
          <button
            data-testid="confirm-selection"
            onClick={handleConfirm}
            disabled={saving}
            className="flex-1 bg-primary text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-primary/30 active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <LoadingSpinner size="sm" className="text-white" />
                {t('enhance.saving')}
              </>
            ) : (
              t('enhance.confirmSelection')
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
