import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export interface CategoryBarDatum {
  name: string
  value: number
  color?: string
}

interface CategoryBarChartProps {
  data: CategoryBarDatum[]
  color?: string
}

/** Generic labeled-category bar chart — role counts, per-branch counts, etc. */
export function CategoryBarChart({ data, color = '#3B82F6' }: CategoryBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} tickLine={false} axisLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 13 }}
          labelStyle={{ color: '#1e293b', fontWeight: 600 }}
          cursor={{ fill: 'rgba(59,130,246,0.06)' }}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color ?? color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
