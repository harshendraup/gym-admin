import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Building2, MapPin, Users, Dumbbell } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/Header'
import { CategoryBarChart } from '@/components/charts/CategoryBarChart'
import { GrowthAreaChart } from '@/components/charts/GrowthAreaChart'
import { StatusDonutChart } from '@/components/charts/StatusDonutChart'
import { useRoles } from '@/hooks/useRoles'
import { useUsersByRole } from '@/hooks/useUsers'
import { useBranch } from '@/hooks/useBranches'
import { useAuthStore } from '@/store/auth.store'
import { businessRegistryApi } from '@/api/business-registry.api'
import { groupByMonth } from '@/lib/chart-utils'

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

  const roleData = [
    { name: 'Trainers', value: trainers.length, color: '#F59E0B' },
    { name: 'Members', value: members.length, color: '#22C55E' },
  ]

  const growthData = useMemo(
    () => groupByMonth(members.map((m) => m.createdAt)),
    [members]
  )

  const statusData = useMemo(() => {
    const counts = { Active: 0, Inactive: 0, Frozen: 0 } as Record<string, number>
    for (const m of members) {
      counts[m.status] = (counts[m.status] ?? 0) + 1
    }
    return [
      { name: 'Active', value: counts.Active, color: '#22C55E' },
      { name: 'Inactive', value: counts.Inactive, color: '#94A3B8' },
      { name: 'Frozen', value: counts.Frozen, color: '#3B82F6' },
    ]
  }, [members])

  return (
    <div className="flex flex-col h-full">
      {/* <Header title="Dashboard" /> */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs" style={{ color: '#64748B' }}>Business</p>
                <p className="text-lg font-bold text-slate-900">
                  {business?.businessName ?? (gymContext?.businessId ? '—' : 'No business assigned')}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs" style={{ color: '#64748B' }}>Branch</p>
                <p className="text-lg font-bold text-slate-900">
                  {branch?.branchName ?? (gymContext?.branchId ? '—' : 'No branch assigned')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs" style={{ color: '#64748B' }}>Members in your branch</p>
                <p className="text-2xl font-bold text-slate-900">
                  {isLoading ? '—' : members.length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Dumbbell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs" style={{ color: '#64748B' }}>Trainers in your branch</p>
                <p className="text-2xl font-bold text-slate-900">{trainers.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Branch Team</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryBarChart data={roleData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Member Growth (6 months)</CardTitle>
            </CardHeader>
            <CardContent>
              <GrowthAreaChart data={growthData} gradientId="subAdminGrowth" label="New Members" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Member Status</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusDonutChart data={statusData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
