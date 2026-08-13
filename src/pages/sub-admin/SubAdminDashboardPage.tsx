import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Building2, MapPin, Users, Dumbbell, Trophy } from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area, PieChart, Pie, Cell, Tooltip,
} from 'recharts'
import { useRoles } from '@/hooks/useRoles'
import { useUsersByRole } from '@/hooks/useUsers'
import { useBranch } from '@/hooks/useBranches'
import { useAuthStore } from '@/store/auth.store'
import { businessRegistryApi } from '@/api/business-registry.api'
import { groupByMonth } from '@/lib/chart-utils'
import { T, display, mono } from '@/components/scoreboard/tokens'
import { Hero, HeroChip, InfoPlate, StatPlate, ScoreCard } from '@/components/scoreboard/primitives'

// Swap in a real gym-floor photo here once available — see Hero's
// placeholder fallback in the meantime.
const HERO_IMAGE: string | null = null

export default function SubAdminDashboardPage() {
  const { trainerRole, memberRole } = useRoles()
  const { data: members = [], isLoading } = useUsersByRole(memberRole?.id)
  const { data: trainers = [] } = useUsersByRole(trainerRole?.id)
  const gymContext = useAuthStore((s) => s.gymContext)

  const { data: business } = useQuery({
    queryKey: ['businesses', 'detail', gymContext?.businessId],
    queryFn: () => businessRegistryApi.get(Number(gymContext!.businessId)),
    enabled: !!gymContext?.businessId,
  })
  const { data: branch } = useBranch(Number(gymContext?.branchId))

  const teamData = [
    { label: 'Trainers', value: trainers.length, color: T.amber },
    { label: 'Members', value: members.length, color: T.forest },
  ]

  const growthData = useMemo(
    () => groupByMonth(members.map((m) => m.createdAt)),
    [members]
  )

  const statusCounts = useMemo(() => {
    const counts = { Active: 0, Inactive: 0, Frozen: 0 } as Record<string, number>
    for (const m of members) {
      counts[m.status] = (counts[m.status] ?? 0) + 1
    }
    return counts
  }, [members])

  const statusData = [
    // Recharts drops zero-value pie slices from the ring entirely; a hair
    // of value keeps every legend entry visible even at 0.
    { name: 'Active', value: statusCounts.Active || 0.0001, color: T.forest },
    { name: 'Inactive', value: statusCounts.Inactive || 0.0001, color: '#D8D4C4' },
    { name: 'Frozen', value: statusCounts.Frozen || 0.0001, color: T.cobalt },
  ]

  return (
    <>
      <Hero
        image={HERO_IMAGE}
        placeholderLabel="gym floor"
        eyebrow="Branch Overview"
        title={business?.businessName ?? 'Your Branch'}
        subtitle={`${branch?.branchName ?? 'Your branch'} — tracking trainers, members and growth in real time.`}
        chips={
          <>
            {branch?.address && (
              <HeroChip icon={MapPin}>{branch.address}</HeroChip>
            )}
            {gymContext?.branchId && (
              <HeroChip icon={Trophy}>Gym ID #{gymContext.branchId}</HeroChip>
            )}
          </>
        }
      />

      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <InfoPlate
          icon={Building2}
          label="Business"
          value={business?.businessName ?? (gymContext?.businessId ? '—' : 'No business assigned')}
        />
        <InfoPlate
          icon={MapPin}
          label="Branch"
          value={branch?.branchName ?? (gymContext?.branchId ? '—' : 'No branch assigned')}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
        <StatPlate icon={Users} label="Members in your branch" value={isLoading ? '—' : members.length} accent={T.forest} />
        <StatPlate icon={Dumbbell} label="Trainers in your branch" value={trainers.length} accent={T.amber} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_0.85fr] gap-4">
        <ScoreCard title="Branch Team" subtitle="Headcount by role">
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={teamData} barCategoryGap="45%">
              <CartesianGrid vertical={false} stroke={T.line} />
              <XAxis dataKey="label" tick={{ fill: T.dim, fontSize: 12, fontFamily: 'Inter' }} axisLine={{ stroke: T.line }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: T.dim, fontSize: 12, fontFamily: 'Inter' }} axisLine={false} tickLine={false} width={22} />
              <Tooltip cursor={{ fill: 'rgba(20,20,15,0.04)' }} contentStyle={{ borderRadius: 10, border: `1px solid ${T.line}`, fontFamily: 'Inter', fontSize: 12 }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {teamData.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ScoreCard>

        <ScoreCard title="Member Growth" subtitle="Last 6 months">
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="subAdminGrowthFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.forest} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={T.forest} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={T.line} />
              <XAxis dataKey="month" tick={{ fill: T.dim, fontSize: 12, fontFamily: 'Inter' }} axisLine={{ stroke: T.line }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: T.dim, fontSize: 12, fontFamily: 'Inter' }} axisLine={false} tickLine={false} width={22} />
              <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${T.line}`, fontFamily: 'Inter', fontSize: 12 }} />
              <Area type="monotone" dataKey="count" stroke={T.forest} strokeWidth={2.5} fill="url(#subAdminGrowthFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </ScoreCard>

        <ScoreCard title="Member Status" subtitle="Live split">
          <div style={{ position: 'relative' }}>
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={statusData} dataKey="value" innerRadius={55} outerRadius={78} paddingAngle={4} stroke="none">
                  {statusData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -60%)', textAlign: 'center' }}>
              <div style={{ ...display, fontSize: 26, color: T.text }}>{statusCounts.Active}</div>
              <div style={{ ...mono, fontSize: 9, color: T.dim, textTransform: 'uppercase' }}>Active</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: 6 }}>
            {statusData.map((d) => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: d.color, display: 'inline-block' }} />
                <span style={{ fontSize: 12, color: T.dim }}>{d.name}</span>
              </div>
            ))}
          </div>
        </ScoreCard>
      </div>
    </>
  )
}
