import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { UserDetailCard } from '@/components/entity/UserDetailCard'
import { AssignTrainerDialog } from '@/components/entity/AssignTrainerDialog'
import { MemberDietsDialog } from '@/components/entity/MemberDietsDialog'
import { EditUserDialog } from '@/components/entity/EditUserDialog'
import { useUser, useDeleteUser, useUsersByRole } from '@/hooks/useUsers'
import { useBranches } from '@/hooks/useBranches'
import { useRoles } from '@/hooks/useRoles'
import { useDietAssignmentsForMember } from '@/hooks/useDietAssignments'
import { useAuthStore } from '@/store/auth.store'

export default function AdminMemberDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: user, isLoading } = useUser(id!)
  const deleteUser = useDeleteUser()
  const gymContext = useAuthStore((s) => s.gymContext)
  const { data: branches = [] } = useBranches(gymContext?.businessId)
  const { trainerRole } = useRoles()
  const { data: trainers = [] } = useUsersByRole(trainerRole?.id)
  const { data: diets = [] } = useDietAssignmentsForMember(id)
  const [assignTrainerOpen, setAssignTrainerOpen] = useState(false)
  const [dietsOpen, setDietsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  // A trainer can only be assigned within the member's own branch — narrow
  // the picker up front so the request can never fail on a mismatch.
  const branchTrainers = useMemo(
    () => trainers.filter((t) => t.branchId === user?.branchId),
    [trainers, user?.branchId]
  )
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
          onEdit={() => setEditOpen(true)}
          onDelete={() =>
            deleteUser.mutate(user.id, { onSuccess: () => navigate('/admin/members') })
          }
          isDeleting={deleteUser.isPending}
          trainerName={currentTrainer?.fullName ?? currentTrainer?.firstName}
          onAssignTrainer={() => setAssignTrainerOpen(true)}
          dietCount={diets.length}
          onViewDiets={() => setDietsOpen(true)}
        />
      </div>

      <EditUserDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        user={user}
        roleLabel="Member"
      />

      <AssignTrainerDialog
        open={assignTrainerOpen}
        onClose={() => setAssignTrainerOpen(false)}
        member={user}
        trainerOptions={branchTrainers}
      />

      <MemberDietsDialog
        open={dietsOpen}
        onClose={() => setDietsOpen(false)}
        member={user}
        assignments={diets}
        trainerOptions={branchTrainers}
        trainerName={trainerName}
      />
    </div>
  )
}
