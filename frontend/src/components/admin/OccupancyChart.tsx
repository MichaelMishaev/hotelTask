import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import type { OccupancyDataPoint } from '../../types';

interface OccupancyChartProps {
  data: OccupancyDataPoint[];
  loading: boolean;
}

export function OccupancyChart({ data, loading }: OccupancyChartProps) {
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
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="period"
          tick={{ fontSize: 12, fill: '#6b7280' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#6b7280' }}
          tickLine={false}
          tickFormatter={(value) => `${value.toFixed(0)}%`}
          domain={[0, 100]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          formatter={(value: number | undefined) => [`${(value ?? 0).toFixed(1)}%`, 'Occupancy']}
        />
        <Area
          type="monotone"
          dataKey="occupancyRate"
          stroke="#10b981"
          strokeWidth={2}
          fill="url(#occupancyGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
