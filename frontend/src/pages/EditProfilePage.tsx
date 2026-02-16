import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorBanner } from '../components/ui/ErrorBanner';

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English (US)',
  he: '\u05E2\u05D1\u05E8\u05D9\u05EA',
};

export function EditProfilePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { profile, loading, saving, error, fetchProfile, updateProfile } = useProfile();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pushNotifications, setPushNotifications] = useState(true);
  const [currency, setCurrency] = useState('USD ($)');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const currentLanguageName = LANGUAGE_NAMES[i18n.language] || LANGUAGE_NAMES['en'];

  const handleLanguageToggle = () => {
    const nextLang = i18n.language === 'he' ? 'en' : 'he';
    i18n.changeLanguage(nextLang);
  };

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName ?? '');
      setEmail(profile.email ?? '');
      setPhone(profile.phone ?? '');
      setAddress(profile.address ?? '');
      setPushNotifications(profile.pushNotifications ?? true);
      setCurrency(profile.currency ?? 'USD ($)');
    } else if (user) {
      setFullName(user.name ?? '');
      setEmail(user.email ?? '');
    }
  }, [profile, user]);

  const handleSave = useCallback(async () => {
    try {
      await updateProfile({
        fullName,
        phone,
        address,
        pushNotifications,
        language: currentLanguageName,
        currency,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      // error handled in hook
    }
  }, [fullName, phone, address, pushNotifications, currentLanguageName, currency, updateProfile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div data-testid="edit-profile-page" className="pb-24 min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center bg-white/80 backdrop-blur-md p-4 border-b border-gray-100 justify-between">
        <button
          data-testid="profile-back"
          onClick={() => navigate(-1)}
          className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <MaterialIcon name="arrow_back" className="text-slate-700 rtl:scale-x-[-1]" />
        </button>
        <h1 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center">
          {t('profile.editProfile')}
        </h1>
        <button
          data-testid="profile-save"
          onClick={handleSave}
          disabled={saving}
          className="flex w-12 items-center justify-end"
        >
          {saving ? (
            <LoadingSpinner size="sm" />
          ) : (
            <p className="text-primary text-sm font-bold leading-normal">{t('common.save')}</p>
          )}
        </button>
      </header>

      <main className="flex-1 overflow-y-auto">
        {error && (
          <div className="px-4 pt-4">
            <ErrorBanner message={error} onRetry={fetchProfile} />
          </div>
        )}

        {saveSuccess && (
          <div className="mx-4 mt-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
            <p className="text-sm font-medium text-emerald-700">{t('profile.profileUpdated')}</p>
          </div>
        )}

        {/* Profile Picture Section */}
        <section className="flex flex-col items-center py-8 px-4">
          <div className="relative group">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-32 w-32 border-4 border-white shadow-lg bg-primary/10 flex items-center justify-center"
            >
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={fullName}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <MaterialIcon name="person" className="text-primary !text-5xl" />
              )}
            </div>
            <button
              data-testid="change-avatar"
              className="absolute bottom-0 bg-primary text-white p-2 rounded-full shadow-lg border-2 border-white flex items-center justify-center hover:scale-105 transition-transform"
              style={{ insetInlineEnd: 0 }}
            >
              <MaterialIcon name="photo_camera" className="text-sm" />
            </button>
          </div>
          <div className="mt-4 text-center">
            <h2 className="text-xl font-bold">{fullName || user?.name || t('common.guest')}</h2>
            <p className="text-gray-500 text-sm">
              {profile?.membershipTier || t('common.member')} {profile?.joinedDate ? `\u2022 ${t('common.joined')} ${profile.joinedDate}` : ''}
            </p>
          </div>
        </section>

        {/* Personal Information */}
        <section className="px-4 py-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-1">
            {t('profile.personalInfo')}
          </h3>
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold px-1">{t('profile.fullName')}</label>
              <input
                data-testid="profile-fullname"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t('profile.fullNamePlaceholder')}
                className="w-full rounded-xl border-gray-200 bg-white p-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold px-1">{t('profile.emailAddress')}</label>
              <div className="relative">
                <input
                  data-testid="profile-email"
                  type="email"
                  value={email}
                  readOnly
                  className="w-full rounded-xl border-gray-200 bg-gray-50 p-4 text-sm pe-24 text-gray-500"
                />
                {profile?.emailVerified && (
                  <span className="absolute top-1/2 -translate-y-1/2 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase flex items-center gap-1" style={{ insetInlineEnd: '0.75rem' }}>
                    <MaterialIcon name="verified" className="text-xs" /> {t('profile.verified')}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold px-1">{t('profile.phoneNumber')}</label>
              <input
                data-testid="profile-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('profile.phonePlaceholder')}
                className="w-full rounded-xl border-gray-200 bg-white p-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold px-1">{t('profile.physicalAddress')}</label>
              <textarea
                data-testid="profile-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t('profile.addressPlaceholder')}
                rows={3}
                className="w-full rounded-xl border-gray-200 bg-white p-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary resize-none"
              />
            </div>
          </div>
        </section>

        {/* Account Security */}
        <section className="mt-8 px-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
            {t('profile.accountSecurity')}
          </h3>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <button
              data-testid="change-password"
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <MaterialIcon name="lock" className="text-gray-400" />
                <span className="text-sm font-medium">{t('profile.changePassword')}</span>
              </div>
              <MaterialIcon name="chevron_right" className="text-gray-400 rtl:scale-x-[-1]" />
            </button>
            <button
              data-testid="two-factor-auth"
              className="w-full flex items-center justify-between p-4 border-t border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <MaterialIcon name="fingerprint" className="text-gray-400" />
                <span className="text-sm font-medium">{t('profile.twoFactorAuth')}</span>
              </div>
              <MaterialIcon name="chevron_right" className="text-gray-400 rtl:scale-x-[-1]" />
            </button>
            <button
              data-testid="sign-out"
              onClick={() => { logout(); navigate('/login'); }}
              className="w-full flex items-center justify-between p-4 border-t border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <MaterialIcon name="logout" className="text-red-500" />
                <span className="text-sm font-medium text-red-500">{t('profile.signOut')}</span>
              </div>
              <MaterialIcon name="chevron_right" className="text-gray-400 rtl:scale-x-[-1]" />
            </button>
          </div>
        </section>

        {/* Preferences */}
        <section className="mt-8 px-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
            {t('profile.preferences')}
          </h3>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="w-full flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <MaterialIcon name="notifications" className="text-gray-400" />
                <span className="text-sm font-medium">{t('profile.pushNotifications')}</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  data-testid="push-notifications-toggle"
                  type="checkbox"
                  checked={pushNotifications}
                  onChange={(e) => setPushNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>

            <button
              onClick={handleLanguageToggle}
              className="w-full flex items-center justify-between p-4 border-t border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <MaterialIcon name="language" className="text-gray-400" />
                <span className="text-sm font-medium">{t('profile.language')}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <span className="text-xs font-medium">{currentLanguageName}</span>
                <MaterialIcon name="chevron_right" className="text-sm rtl:scale-x-[-1]" />
              </div>
            </button>

            <button className="w-full flex items-center justify-between p-4 border-t border-gray-100 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <MaterialIcon name="payments" className="text-gray-400" />
                <span className="text-sm font-medium">{t('profile.defaultCurrency')}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <span className="text-xs font-medium">{currency}</span>
                <MaterialIcon name="chevron_right" className="text-sm rtl:scale-x-[-1]" />
              </div>
            </button>
          </div>
        </section>

        {/* Delete Account */}
        <section className="mt-8 px-4 pb-8">
          <button
            data-testid="delete-account"
            className="w-full p-4 rounded-xl text-red-500 text-sm font-semibold bg-red-50 border border-red-100 hover:bg-red-100 transition-colors"
          >
            {t('profile.deleteAccount')}
          </button>
          <p className="mt-4 text-[10px] text-center text-gray-400 uppercase tracking-widest px-4">
            {t('profile.gdprNotice')}
          </p>
        </section>
      </main>
    </div>
  );
}
