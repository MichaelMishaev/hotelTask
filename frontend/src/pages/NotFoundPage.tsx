import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MaterialIcon } from '../components/ui/MaterialIcon';

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="relative flex min-h-screen flex-col bg-background-light overflow-hidden">
      {/* Decorative blurred circles */}
      <div className="pointer-events-none fixed -top-32 h-64 w-64 rounded-full bg-primary/10 blur-3xl" style={{ insetInlineStart: '-8rem' }} />
      <div className="pointer-events-none fixed -bottom-32 h-64 w-64 rounded-full bg-primary/5 blur-3xl" style={{ insetInlineEnd: '-8rem' }} />

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3">
        <Link
          to="/search"
          data-testid="not-found-back"
          className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
        >
          <MaterialIcon name="arrow_back" className="text-gray-700 text-xl rtl:scale-x-[-1]" />
        </Link>
        <span className="text-xs font-bold tracking-[0.2em] text-gray-500 uppercase">
          {t('common.grandHotel')}
        </span>
        <div className="w-10" />
      </header>

      {/* Content */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-20">
        {/* Decorative visual */}
        <div className="relative mb-8">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white shadow-lg">
            <MaterialIcon name="hotel_class" className="text-primary text-7xl" />
          </div>
          <div className="absolute -bottom-1" style={{ insetInlineEnd: '-0.25rem' }}>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-md">
              <MaterialIcon name="search_off" className="text-white text-xl" />
            </div>
          </div>
        </div>

        {/* 404 text */}
        <p className="text-7xl font-extrabold text-primary opacity-20 leading-none">404</p>

        {/* Heading */}
        <h1 className="mt-3 text-2xl font-bold text-gray-900">{t('notFound.title')}</h1>

        {/* Description */}
        <p className="mt-3 max-w-sm text-center text-sm leading-relaxed text-gray-500">
          {t('notFound.description')}
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
          <Link
            to="/search"
            data-testid="not-found-search"
            className="flex h-12 items-center justify-center gap-2 rounded-lg bg-primary text-white font-semibold shadow-md hover:bg-primary/90 active:scale-[0.98] transition-all min-h-[44px]"
          >
            <MaterialIcon name="search" className="text-xl" />
            {t('notFound.backToSearch')}
          </Link>
          <Link
            to="/search"
            data-testid="not-found-home"
            className="flex h-12 items-center justify-center gap-2 rounded-lg border-2 border-primary text-primary font-semibold hover:bg-primary/5 active:scale-[0.98] transition-all min-h-[44px]"
          >
            <MaterialIcon name="home" className="text-xl" />
            {t('notFound.returnHome')}
          </Link>
        </div>

        {/* Concierge link */}
        <button
          type="button"
          className="mt-6 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          {t('notFound.needAssistance')}{' '}
          <span className="font-medium text-primary">{t('notFound.contactConcierge')}</span>
        </button>
      </div>
    </div>
  );
}
