import { Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Header } from '@/components/layout/Header'
import { useRoles } from '@/hooks/useRoles'
import { useUsersByRole } from '@/hooks/useUsers'

export default function SubAdminDashboardPage() {
  const { memberRole } = useRoles()
  const { data: members = [], isLoading } = useUsersByRole(memberRole?.id)

  return (
    <div className="flex flex-col h-full">
      <Header title="Dashboard" />
      <div className="flex-1 overflow-auto p-6 space-y-6">
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
        </div>
      </div>
    </div>
  )
}
