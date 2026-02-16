import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDigitalKey } from '../hooks/useDigitalKey';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorBanner } from '../components/ui/ErrorBanner';

export function DigitalKeyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { keyInfo, loading, unlocking, unlockResult, error, fetchKeyInfo, unlockRoom } = useDigitalKey();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div data-testid="digital-key-page" className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center bg-white p-4 pb-2 justify-between sticky top-0 z-10">
        <button
          data-testid="digital-key-back"
          onClick={() => navigate(-1)}
          className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <MaterialIcon name="arrow_back" className="text-slate-700 rtl:scale-x-[-1]" />
        </button>
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pe-10">
          {t('common.grandHotel')}
        </h2>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-6 pt-8 pb-12">
        {error && (
          <div className="w-full mb-4">
            <ErrorBanner message={error} onRetry={fetchKeyInfo} />
          </div>
        )}

        {/* Room Info */}
        <div className="w-full text-center mb-10">
          <p className="text-primary font-bold uppercase tracking-widest text-xs mb-2">
            {t('digitalKey.currentStay')}
          </p>
          <h1 className="text-5xl font-extrabold tracking-tight mb-2">
            {t('digitalKey.roomLabel', { number: keyInfo?.roomNumber || '---' })}
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            {keyInfo?.roomType ? t(`enum.roomType.${keyInfo.roomType}`) : t('common.room')} {keyInfo?.floor ? `\u2022 ${t('digitalKey.floor', { floor: keyInfo.floor })}` : ''}
          </p>
        </div>

        {/* Status Indicator */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-sm font-bold">
              {unlocking ? t('digitalKey.unlocking') : unlockResult?.success ? t('digitalKey.doorUnlocked') : t('digitalKey.searchingDoor')}
            </span>
          </div>
        </div>

        {/* Central Unlock Button */}
        <div className="relative flex flex-col items-center justify-center flex-1 w-full">
          {/* Background Ripple Circles */}
          <div className="absolute w-64 h-64 rounded-full border-2 border-primary/5" />
          <div className="absolute w-80 h-80 rounded-full border border-primary/5" />

          {/* Main Unlock Button */}
          <button
            data-testid="unlock-room-btn"
            onClick={unlockRoom}
            disabled={unlocking || keyInfo?.status !== 'active'}
            className={`group relative z-10 flex flex-col items-center justify-center w-56 h-56 rounded-full text-white shadow-[0_20px_50px_rgba(17,82,212,0.3)] hover:shadow-[0_25px_60px_rgba(17,82,212,0.4)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              unlockResult?.success
                ? 'bg-emerald-500'
                : 'bg-primary'
            }`}
            style={{
              animation: unlocking ? 'none' : 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          >
            {unlocking ? (
              <LoadingSpinner size="lg" className="text-white" />
            ) : (
              <>
                <MaterialIcon
                  name={unlockResult?.success ? 'lock_open' : 'lock_open'}
                  className="!text-6xl mb-2"
                />
                <span className="text-xl font-bold tracking-tight">
                  {unlockResult?.success ? t('digitalKey.unlocked') : t('digitalKey.unlockRoom')}
                </span>
              </>
            )}
          </button>

          {/* Instructions */}
          <p className="mt-12 text-gray-500 text-center max-w-[240px] leading-relaxed">
            {t('digitalKey.holdPhone')}
          </p>
        </div>

        {/* Support Actions */}
        <div className="w-full grid grid-cols-2 gap-4 mt-auto pt-10">
          <button
            data-testid="digital-key-help"
            onClick={() => navigate('/digital-key/guide')}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-200 bg-white font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            <MaterialIcon name="help" className="text-xl" />
            {t('digitalKey.help')}
          </button>
          <button
            data-testid="digital-key-front-desk"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-200 bg-white font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            <MaterialIcon name="phone_in_talk" className="text-xl" />
            {t('digitalKey.frontDesk')}
          </button>
        </div>
      </main>
    </div>
  );
}
