import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../lib/api-client';
import type { AuthUser, LoginResponse, MockUser } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';

// DEMO ONLY - Hardcoded credentials for demonstration. Production must use proper authentication.
const demoPasswords: Record<string, string> = {
  'john@example.com': 'guest123',
  'jane@example.com': 'staff123',
  'admin@example.com': 'admin123',
};

const roleIcons: Record<string, string> = {
  Guest: 'person',
  Staff: 'badge',
  Admin: 'admin_panel_settings',
};

const roleColors: Record<string, { bg: string; text: string; border: string }> = {
  Guest: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Staff: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  Admin: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
};

const getRedirectPath = (role: string) => {
  if (role === 'Admin') return '/admin/dashboard';
  if (role === 'Staff') return '/staff/dashboard';
  return '/search';
};

export function LoginPage() {
  const { t } = useTranslation();
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<MockUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [videoMuted, setVideoMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Force play on mobile - iOS Safari blocks autoPlay even when muted
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(getRedirectPath(user?.role ?? 'Guest'), { replace: true });
    }
  }, [isAuthenticated, navigate, user]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const result = await apiClient.get<MockUser[]>('/auth/users');
        setUsers(result);
      } catch {
        setUsers([
          { id: '11111111-1111-1111-1111-111111111111', name: 'John Doe', email: 'john@example.com', role: 'Guest', password: 'guest123' },
          { id: '22222222-2222-2222-2222-222222222222', name: 'Jane Smith', email: 'jane@example.com', role: 'Staff', password: 'staff123' },
          { id: '33333333-3333-3333-3333-333333333333', name: 'Admin User', email: 'admin@example.com', role: 'Admin', password: 'admin123' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleLogin = async (user: MockUser) => {
    setLoginLoading(user.id);
    setError(null);
    try {
      const pw = user.password || demoPasswords[user.email] || 'guest123';
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        email: user.email,
        password: pw,
      });
      const authUser: AuthUser = {
        id: response.userId,
        name: response.name,
        email: response.email,
        role: response.role,
        token: response.token,
      };
      login(authUser);
      navigate(getRedirectPath(authUser.role));
    } catch {
      setError(t('login.errorServer'));
    } finally {
      setLoginLoading(null);
    }
  };

  const handleSignIn = () => {
    const matchedUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (matchedUser) {
      handleLogin({ ...matchedUser, password: password || matchedUser.password });
    } else {
      setError(t('login.errorNoUser'));
    }
  };

  const handleDemoLogin = (role: string) => {
    const user = users.find((u) => u.role === role);
    if (user) {
      const pw = user.password || demoPasswords[user.email] || 'guest123';
      setEmail(user.email);
      setPassword(pw);
      handleLogin(user);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSignIn();
  };

  return (
    <div className="flex min-h-screen flex-col bg-background-light">
      {/* Hero Section */}
      <div
        className="relative flex h-[35vh] min-h-[220px] flex-col items-center justify-center overflow-hidden"
        style={{
          backgroundImage: 'url(/rooms/hotel-lobby.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background-light" />
        <div className="absolute top-4 z-20" style={{ insetInlineEnd: '1rem' }}>
          <LanguageSwitcher className="text-white bg-white/20 backdrop-blur-sm hover:bg-white/30" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-3 text-center px-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary shadow-lg">
            <MaterialIcon name="apartment" className="text-white text-3xl" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{t('login.title')}</h1>
          <p className="max-w-xs text-sm text-white/80">
            {t('login.welcomeBack')}
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex flex-1 flex-col items-center px-4 -mt-4">
        <div className="w-full max-w-md space-y-5">
          {error && <ErrorBanner message={error} />}

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                  {t('login.emailLabel')}
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 flex items-center ps-3" style={{ insetInlineStart: 0 }}>
                    <MaterialIcon name="mail" className="text-gray-400 text-xl" />
                  </div>
                  <input
                    id="email"
                    data-testid="login-email"
                    type="email"
                    placeholder={t('login.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 w-full rounded-lg border border-gray-300 bg-white ps-10 pe-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
                  {t('login.passwordLabel')}
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 flex items-center ps-3" style={{ insetInlineStart: 0 }}>
                    <MaterialIcon name="lock" className="text-gray-400 text-xl" />
                  </div>
                  <input
                    id="password"
                    data-testid="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('login.passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 w-full rounded-lg border border-gray-300 bg-white ps-10 pe-12 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    data-testid="toggle-password"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 flex items-center pe-3 text-gray-400 hover:text-gray-600"
                    style={{ insetInlineEnd: 0 }}
                  >
                    <MaterialIcon name={showPassword ? 'visibility_off' : 'visibility'} className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Remember Me + Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    data-testid="remember-me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                  />
                  <span className="text-sm text-gray-600">{t('login.rememberMe')}</span>
                </label>
                <button type="button" className="text-sm font-medium text-primary hover:text-primary/80">
                  {t('login.forgotPassword')}
                </button>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                data-testid="login-submit"
                disabled={loginLoading !== null || !email}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-white font-semibold shadow-md hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[44px]"
              >
                {loginLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="text-white" />
                    <span>{t('login.signingIn')}</span>
                  </>
                ) : (
                  t('login.signIn')
                )}
              </button>
            </form>
          )}

          {/* Divider */}
          {!loading && (
            <>
              <div className="relative flex items-center">
                <div className="flex-1 border-t border-gray-200" />
                <span className="mx-4 text-xs font-medium text-gray-400 uppercase tracking-wider">{t('login.demoAccess')}</span>
                <div className="flex-1 border-t border-gray-200" />
              </div>

              {/* Demo Role Cards */}
              <div className="grid grid-cols-3 gap-3">
                {(['Guest', 'Staff', 'Admin'] as const).map((role) => {
                  const colors = roleColors[role];
                  const user = users.find((u) => u.role === role);
                  const isLoggingIn = user && loginLoading === user.id;
                  return (
                    <button
                      key={role}
                      data-testid={`demo-${role.toLowerCase()}`}
                      onClick={() => handleDemoLogin(role)}
                      disabled={loginLoading !== null}
                      className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all hover:shadow-md active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed ${colors.bg} ${colors.border}`}
                    >
                      {isLoggingIn ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <MaterialIcon name={roleIcons[role]} className={`text-2xl ${colors.text}`} />
                      )}
                      <span className={`text-sm font-semibold ${colors.text}`}>{t(`enum.role.${role}`)}</span>
                    </button>
                  );
                })}
              </div>

              <p className="text-center text-xs text-gray-400">
                {t('login.clickToAutofill')}
              </p>

              {/* Create Account Footer */}
              <p className="pb-4 text-center text-sm text-gray-500">
                {t('login.noAccount')}{' '}
                <button type="button" className="font-semibold text-primary hover:text-primary/80">
                  {t('login.createAccount')}
                </button>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Video Showcase */}
      <div className="w-full px-4 pb-8 pt-2">
        <div className="mx-auto max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
          <div className="bg-gradient-to-r from-primary to-primary/80 px-4 py-2.5 flex items-center gap-2">
            <MaterialIcon name="play_circle" className="text-white text-xl" />
            <span className="text-sm font-semibold text-white">{t('login.title')} — Full-Stack Demo</span>
          </div>
          <div className="relative bg-black">
            {/* eslint-disable-next-line */}
            <video
              ref={videoRef}
              autoPlay
              loop
              muted={videoMuted}
              playsInline
              controls
              // @ts-expect-error webkit vendor attr for older iOS
              webkit-playsinline="true"
              preload="auto"
              className="w-full aspect-video object-contain"
            >
              <source src="/hotel-hero.mp4" type="video/mp4" />
            </video>
            <button
              type="button"
              onClick={() => {
                const v = videoRef.current;
                if (v) {
                  v.muted = !v.muted;
                  setVideoMuted(v.muted);
                }
              }}
              className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm hover:bg-black/80 transition-colors z-10"
            >
              <MaterialIcon name={videoMuted ? 'volume_off' : 'volume_up'} className="text-xl" />
            </button>
          </div>
          <div className="bg-gray-50 px-4 py-2 flex items-center justify-center gap-1.5">
            <MaterialIcon name="info" className="text-gray-400 text-sm" />
            <span className="text-xs text-gray-400">Grand Hotel Booking Platform</span>
          </div>
        </div>
      </div>
    </div>
  );
}
