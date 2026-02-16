import { MaterialIcon } from '../ui/MaterialIcon';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { RoomCard } from './RoomCard';
import type { StaffRoom } from '../../types';

interface RoomStatusCardProps {
  rooms: StaffRoom[];
  loading: boolean;
  onChangeStatus: (roomId: string) => void;
}

export function RoomStatusCard({ rooms, loading, onChangeStatus }: RoomStatusCardProps) {
  const available = rooms.filter((r) => r.status === 'Available').length;
  const occupied = rooms.filter((r) => r.status === 'Occupied').length;
  const maintenance = rooms.filter((r) => r.status === 'Maintenance').length;

  return (
    <div className="rounded-xl bg-white border border-gray-100 p-4 overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5">
          <MaterialIcon name="meeting_room" className="text-primary text-lg" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Room Status</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-emerald-600 font-medium">{available} Available</span>
            <span className="text-gray-300">|</span>
            <span className="text-xs text-blue-600 font-medium">{occupied} Occupied</span>
            <span className="text-gray-300">|</span>
            <span className="text-xs text-orange-600 font-medium">{maintenance} Maintenance</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <LoadingSpinner size="sm" />
        </div>
      ) : rooms.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-center">
          <MaterialIcon name="door_front" className="text-gray-300 text-3xl mb-2" />
          <p className="text-sm text-gray-400">No rooms found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rooms.slice(0, 6).map((room) => (
            <RoomCard
              key={room.id}
              id={room.id}
              roomNumber={room.roomNumber}
              roomType={room.roomType}
              status={room.status}
              onChangeStatus={onChangeStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}
