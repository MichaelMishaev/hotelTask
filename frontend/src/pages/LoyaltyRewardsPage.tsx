import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLoyalty } from '../hooks/useLoyalty';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import type { EarnMethod } from '../types';

export function LoyaltyRewardsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loyalty, rewards, transactions, loading, error, fetchLoyalty } = useLoyalty();

  const QUICK_ACTIONS = [
    { icon: 'redeem', label: t('loyalty.redeem') },
    { icon: 'receipt_long', label: t('loyalty.history') },
    { icon: 'card_membership', label: t('loyalty.benefits') },
    { icon: 'help', label: t('loyalty.support') },
  ];

  const EARN_METHODS: EarnMethod[] = [
    { icon: 'bed', title: t('loyalty.bookStay'), description: t('loyalty.bookStayDesc') },
    { icon: 'restaurant', title: t('loyalty.dineWithUs'), description: t('loyalty.dineDesc') },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div data-testid="loyalty-rewards-page" className="min-h-screen bg-[#f6f6f8] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center bg-white/80 backdrop-blur-md px-4 py-4 justify-between border-b border-gray-100">
        <button
          data-testid="loyalty-back"
          onClick={() => navigate(-1)}
          className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer"
        >
          <MaterialIcon name="arrow_back" className="rtl:scale-x-[-1]" />
        </button>
        <h1 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center">
          {t('loyalty.title')}
        </h1>
        <div className="flex size-10 items-center justify-end">
          <button className="relative flex items-center justify-center p-2 hover:bg-gray-100 rounded-full">
            <MaterialIcon name="notifications" />
            <span className="absolute top-2" style={{ insetInlineEnd: '0.5rem' }}>
              <span className="flex h-2 w-2 rounded-full bg-primary" />
            </span>
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4 pt-4">
          <ErrorBanner message={error} onRetry={fetchLoyalty} />
        </div>
      )}

      {/* Membership Hero */}
      <div className="p-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1152d4] to-[#0a3a9c] p-6 text-white shadow-xl">
          <div className="absolute top-0" style={{ insetInlineEnd: '0', marginInlineEnd: '-4rem', marginTop: '-4rem' }}>
            <div className="h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          </div>
          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-widest text-white/70">
                  {t('loyalty.membershipTier')}
                </span>
                <h2 className="text-2xl font-bold">
                  {t('loyalty.memberLabel', { tier: loyalty?.tier || 'Gold' })}
                </h2>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <MaterialIcon
                  name="stars"
                  filled
                  className="text-3xl text-yellow-400"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-3xl font-bold tracking-tight">
                {loyalty?.points?.toLocaleString() || '0'}{' '}
                <span className="text-sm font-medium text-white/80">{t('common.pts')}</span>
              </p>
              <p className="text-xs text-white/70">
                {t('loyalty.memberSince', { date: loyalty?.memberSince || 'recently' })}
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex justify-between text-xs font-medium">
                <span>{t('loyalty.progressTo', { tier: loyalty?.nextTier || 'Platinum' })}</span>
                <span>{loyalty?.pointsToNextTier?.toLocaleString() || '0'} {t('common.ptsLeft')}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full bg-white transition-all duration-1000"
                  style={{ width: `${loyalty?.progressPercent ?? 75}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2 px-6 pb-6">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.icon}
            data-testid={`loyalty-action-${action.label.toLowerCase()}`}
            className="flex flex-col items-center gap-2"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm border border-gray-100">
              <MaterialIcon name={action.icon} className="text-primary" />
            </div>
            <span className="text-[10px] font-bold uppercase text-gray-500">{action.label}</span>
          </button>
        ))}
      </div>

      {/* My Rewards */}
      <div className="flex flex-col gap-4 pb-6">
        <div className="flex items-center justify-between px-6">
          <h3 className="text-lg font-bold tracking-tight">{t('loyalty.myRewards')}</h3>
          <button className="text-xs font-bold text-primary">{t('common.viewAll')}</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-6">
          {rewards.length > 0 ? (
            rewards.map((reward) => (
              <div
                key={reward.id}
                data-testid={`reward-card-${reward.id}`}
                className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="h-28 w-full bg-primary/5 flex items-center justify-center">
                  {reward.imageUrl ? (
                    <img
                      src={reward.imageUrl}
                      alt={reward.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <MaterialIcon name="card_giftcard" className="text-primary !text-4xl" />
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-sm">{reward.title}</h4>
                  <p className="text-xs text-gray-500 mb-3">{reward.description}</p>
                  <button className="w-full rounded-lg bg-primary py-2 text-xs font-bold text-white transition-opacity active:opacity-80">
                    {t('loyalty.useVoucher')}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
              <div className="h-28 w-full bg-primary/5 flex items-center justify-center">
                <MaterialIcon name="spa" className="text-primary !text-4xl" />
              </div>
              <div className="p-4">
                <h4 className="font-bold text-sm">{t('loyalty.freeSpa')}</h4>
                <p className="text-xs text-gray-500 mb-3">{t('loyalty.freeSpaSub')}</p>
                <button className="w-full rounded-lg bg-primary py-2 text-xs font-bold text-white">
                  {t('loyalty.useVoucher')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* How to Earn */}
      <div className="bg-white p-6 mb-4">
        <h3 className="text-lg font-bold tracking-tight mb-4">{t('loyalty.howToEarn')}</h3>
        <div className="space-y-4">
          {EARN_METHODS.map((method) => (
            <div
              key={method.icon}
              className="flex items-center gap-4 rounded-xl border border-gray-50 p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MaterialIcon name={method.icon} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">{method.title}</p>
                <p className="text-xs text-gray-500">{method.description}</p>
              </div>
              <MaterialIcon name="chevron_right" className="text-gray-400 rtl:scale-x-[-1]" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-6 pb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold tracking-tight">{t('loyalty.recentTransactions')}</h3>
        </div>
        <div className="space-y-2">
          {transactions.length > 0 ? (
            transactions.map((txn) => (
              <div
                key={txn.id}
                data-testid={`transaction-${txn.id}`}
                className="flex items-center justify-between py-3 border-b border-gray-100"
              >
                <div className="flex flex-col">
                  <p className="text-sm font-semibold">{txn.description}</p>
                  <p className="text-[10px] text-gray-400 uppercase font-medium">{txn.date}</p>
                </div>
                <p className={`text-sm font-bold ${txn.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {txn.points > 0 ? '+' : ''}{txn.points.toLocaleString()} {t('common.pts')}
                </p>
              </div>
            ))
          ) : (
            <>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex flex-col">
                  <p className="text-sm font-semibold">{t('loyalty.stayGrandOcean')}</p>
                  <p className="text-[10px] text-gray-400 uppercase font-medium">Oct 24, 2023</p>
                </div>
                <p className="text-sm font-bold text-green-600">+500 {t('common.pts')}</p>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex flex-col">
                  <p className="text-sm font-semibold">{t('loyalty.dinnerAzure')}</p>
                  <p className="text-[10px] text-gray-400 uppercase font-medium">Oct 22, 2023</p>
                </div>
                <p className="text-sm font-bold text-green-600">+120 {t('common.pts')}</p>
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex flex-col">
                  <p className="text-sm font-semibold">{t('loyalty.welcomeBonus')}</p>
                  <p className="text-[10px] text-gray-400 uppercase font-medium">Oct 15, 2023</p>
                </div>
                <p className="text-sm font-bold text-green-600">+1,000 {t('common.pts')}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
