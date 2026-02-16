import { useState } from 'react';
import { MaterialIcon } from '../ui/MaterialIcon';
import { Button } from '../ui/Button';
import type { RoomStatus, StaffRoom } from '../../types';

interface ChangeRoomStatusModalProps {
  room: StaffRoom;
  isOpen: boolean;
  onClose: () => void;
  onSave: (roomId: string, newStatus: RoomStatus) => Promise<void>;
}

export function ChangeRoomStatusModal({ room, isOpen, onClose, onSave }: ChangeRoomStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<RoomStatus>(room.status === 'Occupied' ? 'Available' : room.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      await onSave(room.id, selectedStatus);
      onClose();
    } catch (err) {
      setError((err as { title?: string })?.title || 'Failed to update room status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Change Room Status</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
            <MaterialIcon name="close" className="text-gray-500" />
          </button>
        </div>

        <div className="mb-4 rounded-lg bg-gray-50 p-3">
          <p className="text-sm font-semibold text-slate-900">Room {room.roomNumber}</p>
          <p className="text-xs text-gray-500">{room.roomType}</p>
        </div>

        {room.status === 'Occupied' && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
            <MaterialIcon name="info" className="text-amber-600 text-lg shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              Room status "Occupied" is managed automatically by check-in/check-out operations.
            </p>
          </div>
        )}

        <div className="mb-4">
          <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-2">
            New Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as RoomStatus)}
            disabled={room.status === 'Occupied'}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          >
            <option value="Available">Available</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            loading={loading}
            disabled={room.status === 'Occupied' || selectedStatus === room.status}
          >
            Update Status
          </Button>
        </div>
      </div>
    </div>
  );
}
