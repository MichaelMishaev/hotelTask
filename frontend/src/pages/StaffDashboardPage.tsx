import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useStaffDashboard, useStaffRooms, useStaffBookings } from '../hooks/useStaff';
import { TodayCheckInsCard } from '../components/staff/TodayCheckInsCard';
import { TodayCheckOutsCard } from '../components/staff/TodayCheckOutsCard';
import { RoomStatusCard } from '../components/staff/RoomStatusCard';
import { ActiveBookingsTable } from '../components/staff/ActiveBookingsTable';
import { ChangeRoomStatusModal } from '../components/staff/ChangeRoomStatusModal';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import type { RoomStatus, StaffRoom } from '../types';

export function StaffDashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { checkIns, checkOuts, loading: dashLoading, error: dashError, fetchTodayCheckIns, fetchTodayCheckOuts } = useStaffDashboard();
  const { rooms, loading: roomsLoading, error: roomsError, fetchRooms, updateRoomStatus } = useStaffRooms();
  const { bookings, loading: bookingsLoading, error: bookingsError, fetchStaffBookings, checkInBooking, checkOutBooking } = useStaffBookings();

  const [selectedRoom, setSelectedRoom] = useState<StaffRoom | null>(null);

  const loadAll = useCallback(() => {
    fetchTodayCheckIns();
    fetchTodayCheckOuts();
    fetchRooms();
    fetchStaffBookings({ status: 'active' });
  }, [fetchTodayCheckIns, fetchTodayCheckOuts, fetchRooms, fetchStaffBookings]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleCheckIn = async (bookingId: string) => {
    await checkInBooking(bookingId);
    fetchTodayCheckIns();
    fetchRooms();
    fetchStaffBookings({ status: 'active' });
  };

  const handleCheckOut = async (bookingId: string) => {
    await checkOutBooking(bookingId);
    fetchTodayCheckOuts();
    fetchRooms();
    fetchStaffBookings({ status: 'active' });
  };

  const handleChangeRoomStatus = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room) setSelectedRoom(room);
  };

  const handleSaveRoomStatus = async (roomId: string, newStatus: RoomStatus) => {
    await updateRoomStatus(roomId, newStatus);
    fetchRooms();
  };

  const error = dashError || roomsError || bookingsError;

  return (
    <div data-testid="staff-dashboard-page" className="pb-24 min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">{t('staff.staffDashboard')}</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {format(new Date(), 'EEEE, MMM dd, yyyy')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50">
              <MaterialIcon name="badge" className="text-green-600 text-lg" />
            </div>
            <span className="text-sm font-medium text-slate-700">{user?.name}</span>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="px-4 pt-4">
          <ErrorBanner message={error} onRetry={loadAll} />
        </div>
      )}

      {/* Dashboard Widgets */}
      <div className="px-4 pt-4 space-y-4">
        {/* Today's Check-Ins */}
        <TodayCheckInsCard
          items={checkIns}
          loading={dashLoading}
          onCheckIn={handleCheckIn}
        />

        {/* Today's Check-Outs */}
        <TodayCheckOutsCard
          items={checkOuts}
          loading={dashLoading}
          onCheckOut={handleCheckOut}
        />

        {/* Room Status Overview */}
        <RoomStatusCard
          rooms={rooms}
          loading={roomsLoading}
          onChangeStatus={handleChangeRoomStatus}
        />

        {/* Active Bookings */}
        <ActiveBookingsTable
          bookings={bookings}
          loading={bookingsLoading}
          collapsed
        />
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
