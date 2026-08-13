import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

interface StatusDonutChartProps {
  data: Array<{ name: string; value: number; color: string }>
}

/** Generic status breakdown donut — member Active/Inactive/Frozen, etc. */
export function StatusDonutChart({ data }: StatusDonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  if (total === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm" style={{ color: '#94A3B8' }}>
        No data yet.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 13 }} />
        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 12, color: '#64748B' }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
