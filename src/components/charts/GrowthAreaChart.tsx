import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface GrowthAreaChartProps {
  data: Array<{ month: string; count: number }>
  label?: string
  color?: string
  /** Unique per chart instance — SVG gradient defs collide if two charts on the same page share an id. */
  gradientId: string
}

/** Generic month-over-month trend line — member growth, sign-ups, etc. */
export function GrowthAreaChart({ data, label = 'New', color = '#22C55E', gradientId }: GrowthAreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} tickLine={false} axisLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 13 }}
          labelStyle={{ color: '#1e293b', fontWeight: 600 }}
          formatter={(v: number) => [v, label]}
          cursor={{ stroke: color, strokeOpacity: 0.2 }}
        />
        <Area
          type="monotone"
          dataKey="count"
          name={label}
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
