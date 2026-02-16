import { MaterialIcon } from '../ui/MaterialIcon';
import type { RoomStatus } from '../../types';

const statusConfig: Record<RoomStatus, { bg: string; text: string; dot: string; icon: string }> = {
  Available: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', icon: 'check_circle' },
  Occupied: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', icon: 'person' },
  Maintenance: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500', icon: 'build' },
};

const roomTypeIcons: Record<string, string> = {
  Standard: 'single_bed',
  Deluxe: 'king_bed',
  Suite: 'villa',
};

interface RoomCardProps {
  id: string;
  roomNumber: string;
  roomType: string;
  status: RoomStatus;
  onChangeStatus: (roomId: string) => void;
}

export function RoomCard({ id, roomNumber, roomType, status, onChangeStatus }: RoomCardProps) {
  const config = statusConfig[status];

  return (
    <div className="rounded-xl bg-white border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-wrap items-start gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/5">
            <MaterialIcon name={roomTypeIcons[roomType] ?? 'bed'} className="text-primary text-xl" />
          </div>
          <div>
            <p className="text-base font-bold text-slate-900">Room {roomNumber}</p>
            <p className="text-xs text-gray-500">{roomType}</p>
          </div>
        </div>
        <span className={`ml-auto inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.text}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
          {status}
        </span>
      </div>

      <button
        onClick={() => onChangeStatus(id)}
        disabled={status === 'Occupied'}
        className="w-full flex items-center justify-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <MaterialIcon name="swap_horiz" className="text-sm" />
        {status === 'Occupied' ? 'Auto-managed' : 'Change Status'}
      </button>
    </div>
  );
}
