import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStaffRooms } from '../hooks/useStaff';
import { RoomCard } from '../components/staff/RoomCard';
import { ChangeRoomStatusModal } from '../components/staff/ChangeRoomStatusModal';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { EmptyState } from '../components/ui/EmptyState';
import type { RoomStatus, StaffRoom } from '../types';

export function StaffRoomsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { rooms, loading, error, fetchRooms, updateRoomStatus } = useStaffRooms();
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState<StaffRoom | null>(null);

  const statusFilters = [
    { key: 'all', label: t('enum.roomStatus.All'), icon: 'apps' },
    { key: 'Available', label: t('enum.roomStatus.Available'), icon: 'check_circle' },
    { key: 'Occupied', label: t('enum.roomStatus.Occupied'), icon: 'person' },
    { key: 'Maintenance', label: t('enum.roomStatus.Maintenance'), icon: 'build' },
  ];

  const loadRooms = useCallback(() => {
    fetchRooms(activeFilter === 'all' ? undefined : activeFilter);
  }, [activeFilter, fetchRooms]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const handleChangeStatus = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room) setSelectedRoom(room);
  };

  const handleSaveRoomStatus = async (roomId: string, newStatus: RoomStatus) => {
    await updateRoomStatus(roomId, newStatus);
    loadRooms();
  };

  const available = rooms.filter((r) => r.status === 'Available').length;
  const occupied = rooms.filter((r) => r.status === 'Occupied').length;
  const maintenance = rooms.filter((r) => r.status === 'Maintenance').length;

  return (
    <div data-testid="staff-rooms-page" className="pb-24 min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/staff/dashboard')}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <MaterialIcon name="arrow_back" className="text-slate-700 text-2xl rtl:scale-x-[-1]" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">{t('staff.roomManagement')}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-emerald-600 font-medium">{available} {t('staff.available')}</span>
              <span className="text-gray-300">|</span>
              <span className="text-xs text-blue-600 font-medium">{occupied} {t('staff.occupied')}</span>
              <span className="text-gray-300">|</span>
              <span className="text-xs text-orange-600 font-medium">{maintenance} {t('staff.maintenance')}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Status Filter Buttons */}
      <div className="px-4 pt-4">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                activeFilter === filter.key
                  ? 'bg-primary text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <MaterialIcon name={filter.icon} className="text-sm" />
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 pt-4">
          <ErrorBanner message={error} onRetry={loadRooms} />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Room Grid */}
      {!loading && !error && (
        <div className="px-4 pt-4">
          {rooms.length === 0 ? (
            <EmptyState
              title={t('staff.noRooms')}
              description={activeFilter !== 'all' ? t('staff.noRoomsFilter', { status: activeFilter.toLowerCase() }) : t('staff.noRoomsSystem')}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  id={room.id}
                  roomNumber={room.roomNumber}
                  roomType={room.roomType}
                  status={room.status}
                  onChangeStatus={handleChangeStatus}
                />
              ))}
            </div>
          )}
        </div>
      )}

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
