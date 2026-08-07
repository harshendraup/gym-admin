import { useNavigate, useParams } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { UserDetailCard } from '@/components/entity/UserDetailCard'
import { useUser, useDeleteUser } from '@/hooks/useUsers'
import { useBranches } from '@/hooks/useBranches'
import { useAuthStore } from '@/store/auth.store'

export default function AdminMemberDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: user, isLoading } = useUser(id!)
  const deleteUser = useDeleteUser()
  const gymContext = useAuthStore((s) => s.gymContext)
  const { data: branches = [] } = useBranches(gymContext?.businessId)

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Member" />
        <div className="flex-1 overflow-auto p-6">
          <div className="h-32 animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Member" />
        <div className="flex-1 overflow-auto p-6">
          <p className="text-sm text-muted-foreground">Member not found.</p>
        </div>
      </div>
    )
  }

  const branchName = branches.find((b) => b.id === user.branchId)?.branchName

  return (
    <div className="flex flex-col h-full">
      <Header title={user.fullName ?? user.firstName} />
      <div className="flex-1 overflow-auto p-6">
        <UserDetailCard
          user={user}
          roleLabel="Member"
          branchLabel={branchName}
          onBack={() => navigate('/admin/members')}
          onDelete={() =>
            deleteUser.mutate(user.id, { onSuccess: () => navigate('/admin/members') })
          }
          isDeleting={deleteUser.isPending}
        />
      </div>
    </div>
  )
}
