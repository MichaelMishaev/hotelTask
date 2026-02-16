import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface RequireRoleProps {
  allowedRoles: string[];
}

export function RequireRole({ allowedRoles }: RequireRoleProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    if (user?.role === 'Admin') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'Staff') return <Navigate to="/staff/dashboard" replace />;
    return <Navigate to="/search" replace />;
  }

  return <Outlet />;
}
