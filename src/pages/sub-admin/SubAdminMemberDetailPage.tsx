import { useNavigate, useParams } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { MemberProfileTabs } from '@/components/entity/MemberProfileTabs'
import { useUser, useDeleteUser, useUsersByRole } from '@/hooks/useUsers'
import { useRoles } from '@/hooks/useRoles'
import { useDietAssignmentsForMember } from '@/hooks/useDietAssignments'

export default function SubAdminMemberDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: user, isLoading } = useUser(id!)
  const deleteUser = useDeleteUser()
  const { trainerRole } = useRoles()
  // Backend already scopes a sub-admin's /users list to their own branch,
  // so every trainer here is already in the same branch as this member.
  const { data: trainers = [] } = useUsersByRole(trainerRole?.id)
  const { data: diets = [] } = useDietAssignmentsForMember(id)
  const currentTrainer = trainers.find((t) => t.id === String(user?.trainerId))
  const trainerName = (trainerId: number | null) => {
    if (!trainerId) return 'Unassigned'
    const t = trainers.find((tr) => tr.id === String(trainerId))
    return t ? (t.fullName ?? t.firstName) : `#${trainerId}`
  }

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
        <MemberProfileTabs
          member={user}
          roleLabel="Member"
          onBack={() => navigate('/sub-admin/members')}
          onDelete={() =>
            deleteUser.mutate(user.id, { onSuccess: () => navigate('/sub-admin/members') })
          }
          isDeleting={deleteUser.isPending}
          trainerOptions={trainers}
          currentTrainerName={currentTrainer?.fullName ?? currentTrainer?.firstName}
          dietAssignments={diets}
          dietTrainerName={trainerName}
        />
      </div>
    </div>
  )
}
