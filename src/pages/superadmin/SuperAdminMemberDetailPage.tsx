import { useNavigate, useParams } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { UserDetailCard } from '@/components/entity/UserDetailCard'
import { useUser, useDeleteUser } from '@/hooks/useUsers'

export default function SuperAdminMemberDetailPage() {
  const { branchId, id } = useParams<{ branchId: string; id: string }>()
  const navigate = useNavigate()
  const { data: user, isLoading } = useUser(id!)
  const deleteUser = useDeleteUser()

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

  return (
    <div className="flex flex-col h-full">
      <Header title={user.fullName ?? user.firstName} />
      <div className="flex-1 overflow-auto p-6">
        <UserDetailCard
          user={user}
          roleLabel="Member"
          onBack={() => navigate(`/superadmin/branches/${branchId}/members`)}
          onDelete={() =>
            deleteUser.mutate(user.id, {
              onSuccess: () => navigate(`/superadmin/branches/${branchId}/members`),
            })
          }
          isDeleting={deleteUser.isPending}
        />
      </div>
    </div>
  )
}
