import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { MaterialIcon } from '../ui/MaterialIcon';

interface Tab {
  path: string;
  icon: string;
  labelKey: string;
}

const guestTabs: Tab[] = [
  { path: '/search', icon: 'search', labelKey: 'search' },
  { path: '/bookings', icon: 'calendar_month', labelKey: 'bookings' },
  { path: '/rewards', icon: 'stars', labelKey: 'rewards' },
  { path: '/profile', icon: 'person', labelKey: 'profile' },
];

const staffTabs: Tab[] = [
  { path: '/staff/dashboard', icon: 'dashboard', labelKey: 'dashboard' },
  { path: '/staff/bookings', icon: 'calendar_month', labelKey: 'bookings' },
  { path: '/staff/rooms', icon: 'meeting_room', labelKey: 'rooms' },
  { path: '/profile', icon: 'person', labelKey: 'profile' },
];

const adminTabs: Tab[] = [
  { path: '/admin/dashboard', icon: 'dashboard', labelKey: 'dashboard' },
  { path: '/staff/bookings', icon: 'calendar_month', labelKey: 'bookings' },
  { path: '/staff/rooms', icon: 'meeting_room', labelKey: 'rooms' },
  { path: '/admin/users', icon: 'group', labelKey: 'users' },
  { path: '/profile', icon: 'person', labelKey: 'profile' },
];

const HIDDEN_PATHS = ['/checkout', '/confirmation', '/rooms/', '/digital-key/guide'];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  // Hide on pages with their own sticky footer
  if (HIDDEN_PATHS.some((p) => location.pathname.startsWith(p))) {
    return null;
  }

  const tabs = user?.role === 'Admin' ? adminTabs : user?.role === 'Staff' ? staffTabs : guestTabs;

  const handleTabClick = (path: string) => {
    if (path === '#logout') {
      logout();
      navigate('/login');
    } else {
      navigate(path);
    }
  };

  const isActive = (path: string) => {
    if (path === '/search') return location.pathname === '/search' || location.pathname === '/';
    if (path === '/bookings') return location.pathname.startsWith('/bookings');
    if (path === '/rewards') return location.pathname === '/rewards';
    if (path === '/profile') return location.pathname === '/profile';
    if (path === '/staff/dashboard') return location.pathname === '/staff/dashboard';
    if (path === '/staff/bookings') return location.pathname === '/staff/bookings';
    if (path === '/staff/rooms') return location.pathname === '/staff/rooms';
    if (path === '/admin/dashboard') return location.pathname === '/admin/dashboard';
    if (path === '/admin/users') return location.pathname === '/admin/users';
    return location.pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 mx-auto max-w-md border-t border-gray-100 bg-white px-4 pb-4 pt-2 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          return (
            <button
              key={tab.path}
              onClick={() => handleTabClick(tab.path)}
              className={`flex flex-1 flex-col items-center justify-center gap-1 ${
                active ? 'text-primary' : 'text-gray-400'
              }`}
            >
              <div className="flex h-8 items-center justify-center">
                <MaterialIcon name={tab.icon} filled={active} className="text-2xl" />
              </div>
              <span className={`text-[10px] uppercase tracking-wide ${active ? 'font-bold' : 'font-medium'}`}>
                {t(`nav.${tab.labelKey}`)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
