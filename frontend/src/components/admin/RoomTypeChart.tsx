import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import type { BookingsByType } from '../../types';

interface RoomTypeChartProps {
  data: BookingsByType[];
  loading: boolean;
}

const COLORS: Record<string, string> = {
  Standard: '#3b82f6',
  Deluxe: '#f59e0b',
  Suite: '#8b5cf6',
};

export function RoomTypeChart({ data, loading }: RoomTypeChartProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={5}
          dataKey="count"
          label={({ payload }: { payload?: BookingsByType }) => payload ? `${payload.roomType}: ${payload.count}` : ''}
        >
          {data.map((entry) => (
            <Cell key={entry.roomType} fill={COLORS[entry.roomType] || '#94a3b8'} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          formatter={((value: number | undefined, _name: string | undefined, props: any) => [
            `${value ?? 0} bookings ($${props.payload.revenue.toFixed(2)})`,
            props.payload.roomType,
          ]) as any}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          formatter={(_value, entry: any) => (
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              {entry.payload.roomType}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
