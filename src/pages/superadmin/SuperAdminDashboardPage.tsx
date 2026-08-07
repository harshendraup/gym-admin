import { Building2, ShieldCheck, UserCog, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Header } from '@/components/layout/Header'
import { businessRegistryApi } from '@/api/business-registry.api'
import { useQuery } from '@tanstack/react-query'
import { useRoles } from '@/hooks/useRoles'
import { useUsersByRole } from '@/hooks/useUsers'

export default function SuperAdminDashboardPage() {
  const { data: businesses = [], isLoading: businessesLoading } = useQuery({
    queryKey: ['businesses'],
    queryFn: () => businessRegistryApi.list(),
  })
  const { adminRole, subAdminRole, memberRole } = useRoles()
  const { data: admins = [], isLoading: adminsLoading } = useUsersByRole(adminRole?.id)
  const { data: subAdmins = [], isLoading: subAdminsLoading } = useUsersByRole(subAdminRole?.id)
  const { data: members = [], isLoading: membersLoading } = useUsersByRole(memberRole?.id)

  const stats = [
    { label: 'Businesses', value: businesses.length, isLoading: businessesLoading, icon: Building2 },
    { label: 'Admins', value: admins.length, isLoading: adminsLoading, icon: ShieldCheck },
    { label: 'Sub-Admins', value: subAdmins.length, isLoading: subAdminsLoading, icon: UserCog },
    { label: 'Members', value: members.length, isLoading: membersLoading, icon: Users },
  ]

  return (
    <div className="flex flex-col h-full">
      <Header title="Dashboard" />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-3 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs" style={{ color: '#64748B' }}>{s.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{s.isLoading ? '—' : s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
