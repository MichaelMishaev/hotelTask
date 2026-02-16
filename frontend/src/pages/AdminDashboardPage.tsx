import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useAdminDashboard } from '../hooks/useAdmin';
import { useStaffDashboard, useStaffRooms, useStaffBookings } from '../hooks/useStaff';
import { useAnalytics } from '../hooks/useAnalytics';
import { StatsCard } from '../components/admin/StatsCard';
import { UserManagementCard } from '../components/admin/UserManagementCard';
import { AuditLogWidget } from '../components/admin/AuditLogWidget';
import { PeriodSelector } from '../components/admin/PeriodSelector';
import { RevenueChart } from '../components/admin/RevenueChart';
import { OccupancyChart } from '../components/admin/OccupancyChart';
import { RoomTypeChart } from '../components/admin/RoomTypeChart';
import { TodayCheckInsCard } from '../components/staff/TodayCheckInsCard';
import { TodayCheckOutsCard } from '../components/staff/TodayCheckOutsCard';
import { RoomStatusCard } from '../components/staff/RoomStatusCard';
import { ActiveBookingsTable } from '../components/staff/ActiveBookingsTable';
import { ChangeRoomStatusModal } from '../components/staff/ChangeRoomStatusModal';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import type { RoomStatus, StaffRoom } from '../types';

export function AdminDashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { stats, userCounts, auditLog, loading: adminLoading, error: adminError, fetchStats, fetchUserCounts, fetchAuditLog } = useAdminDashboard();
  const { checkIns, checkOuts, loading: dashLoading, fetchTodayCheckIns, fetchTodayCheckOuts } = useStaffDashboard();
  const { rooms, loading: roomsLoading, fetchRooms, updateRoomStatus } = useStaffRooms();
  const { bookings, loading: bookingsLoading, fetchStaffBookings, checkInBooking, checkOutBooking } = useStaffBookings();
  const {
    revenueData,
    occupancyData,
    bookingsByTypeData,
    revenueLoading,
    occupancyLoading,
    bookingsByTypeLoading,
    fetchRevenue,
    fetchOccupancy,
    fetchBookingsByType,
  } = useAnalytics();

  const [selectedRoom, setSelectedRoom] = useState<StaffRoom | null>(null);
  const [showStaffWidgets, setShowStaffWidgets] = useState(false);
  const [period, setPeriod] = useState('monthly');

  const loadAll = useCallback(() => {
    fetchStats();
    fetchUserCounts();
    fetchAuditLog(10);
    fetchTodayCheckIns();
    fetchTodayCheckOuts();
    fetchRooms();
    fetchStaffBookings({ status: 'active' });
    fetchRevenue(period);
    fetchOccupancy(period);
    fetchBookingsByType();
  }, [fetchStats, fetchUserCounts, fetchAuditLog, fetchTodayCheckIns, fetchTodayCheckOuts, fetchRooms, fetchStaffBookings, fetchRevenue, fetchOccupancy, fetchBookingsByType, period]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    fetchRevenue(newPeriod);
    fetchOccupancy(newPeriod);
  };

  const handleCheckIn = async (bookingId: string) => {
    await checkInBooking(bookingId);
    fetchTodayCheckIns();
    fetchRooms();
    fetchStats();
  };

  const handleCheckOut = async (bookingId: string) => {
    await checkOutBooking(bookingId);
    fetchTodayCheckOuts();
    fetchRooms();
    fetchStats();
  };

  const handleChangeRoomStatus = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room) setSelectedRoom(room);
  };

  const handleSaveRoomStatus = async (roomId: string, newStatus: RoomStatus) => {
    await updateRoomStatus(roomId, newStatus);
    fetchRooms();
  };

  const formatRevenue = (amount: number) => {
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount.toFixed(0)}`;
  };

  return (
    <div data-testid="admin-dashboard-page" className="pb-24 min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">{t('admin.adminDashboard')}</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {format(new Date(), 'EEEE, MMM dd, yyyy')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-50">
              <MaterialIcon name="admin_panel_settings" className="text-purple-600 text-lg" />
            </div>
            <span className="text-sm font-medium text-slate-700">{user?.name}</span>
          </div>
        </div>
      </header>

      {/* System Status */}
      <div className="px-4 pt-4">
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-xs font-semibold text-emerald-700">{t('admin.allSystemsOp')}</p>
        </div>
      </div>

      {/* Error */}
      {adminError && (
        <div className="px-4 pt-4">
          <ErrorBanner message={adminError} onRetry={loadAll} />
        </div>
      )}

      {/* System Stats Cards */}
      <div className="px-4 pt-4">
        {adminLoading && !stats ? (
          <div className="flex justify-center py-6">
            <LoadingSpinner size="md" />
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 gap-3">
            <StatsCard title={t('admin.totalBookings')} value={stats.totalBookings} icon="book_online" color="blue" />
            <StatsCard title={t('admin.activeBookings')} value={stats.activeBookings} icon="event_available" color="green" />
            <StatsCard title={t('admin.totalRevenue')} value={formatRevenue(stats.totalRevenue)} icon="payments" color="purple" />
            <StatsCard title={t('admin.totalUsers')} value={stats.totalUsers} icon="group" color="amber" />
          </div>
        ) : null}
      </div>

      {/* Dashboard Widgets */}
      <div className="px-4 pt-4 space-y-4">
        {/* Analytics Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">{t('analytics.analytics')}</h2>
          </div>

          {/* Period Selector */}
          <PeriodSelector value={period} onChange={handlePeriodChange} />

          {/* Revenue Chart */}
          <div className="rounded-xl bg-white border border-gray-100 p-4">
            <h3 className="text-sm font-bold text-slate-900 mb-4">{t('analytics.revenue')}</h3>
            <RevenueChart
              data={revenueData?.data || []}
              loading={revenueLoading}
            />
            {revenueData && (
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">{t('analytics.totalRevenue')}</p>
                <p className="text-xl font-bold text-slate-900">
                  ${revenueData.totalRevenue.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {/* Occupancy Chart */}
          <div className="rounded-xl bg-white border border-gray-100 p-4">
            <h3 className="text-sm font-bold text-slate-900 mb-4">{t('analytics.occupancy')}</h3>
            <OccupancyChart
              data={occupancyData?.data || []}
              loading={occupancyLoading}
            />
            {occupancyData && (
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">{t('analytics.averageOccupancy')}</p>
                <p className="text-xl font-bold text-slate-900">
                  {occupancyData.averageOccupancy.toFixed(1)}%
                </p>
              </div>
            )}
          </div>

          {/* Bookings by Type Chart */}
          <div className="rounded-xl bg-white border border-gray-100 p-4">
            <h3 className="text-sm font-bold text-slate-900 mb-4">{t('analytics.bookingsByType')}</h3>
            <RoomTypeChart
              data={bookingsByTypeData?.data || []}
              loading={bookingsByTypeLoading}
            />
          </div>
        </div>

        {/* User Management Card */}
        <UserManagementCard counts={userCounts} loading={adminLoading} />

        {/* Audit Log */}
        <AuditLogWidget entries={auditLog} loading={adminLoading} />

        {/* Staff Widgets Toggle */}
        <button
          onClick={() => setShowStaffWidgets(!showStaffWidgets)}
          className="w-full flex items-center justify-between rounded-xl bg-white border border-gray-100 p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <MaterialIcon name="dashboard_customize" className="text-primary text-lg" />
            <span className="text-sm font-bold text-slate-900">{t('staff.frontDeskOps')}</span>
          </div>
          <MaterialIcon
            name={showStaffWidgets ? 'expand_less' : 'expand_more'}
            className="text-gray-400"
          />
        </button>

        {/* Inherited Staff Widgets (collapsed by default) */}
        {showStaffWidgets && (
          <div className="space-y-4">
            <TodayCheckInsCard items={checkIns} loading={dashLoading} onCheckIn={handleCheckIn} />
            <TodayCheckOutsCard items={checkOuts} loading={dashLoading} onCheckOut={handleCheckOut} />
            <RoomStatusCard rooms={rooms} loading={roomsLoading} onChangeStatus={handleChangeRoomStatus} />
            <ActiveBookingsTable bookings={bookings} loading={bookingsLoading} collapsed />
          </div>
        )}
      </div>

      {/* Change Room Status Modal */}
      {selectedRoom && (
        <ChangeRoomStatusModal
          room={selectedRoom}
          isOpen={!!selectedRoom}
          onClose={() => setSelectedRoom(null)}
          onSave={handleSaveRoomStatus}
        />
      )}
    </div>
  );
}
