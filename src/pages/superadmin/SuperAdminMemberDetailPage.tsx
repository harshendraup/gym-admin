import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/Header'
import { UserDetailCard } from '@/components/entity/UserDetailCard'
import { EditUserDialog } from '@/components/entity/EditUserDialog'
import { AssignTrainerDialog } from '@/components/entity/AssignTrainerDialog'
import { MemberDietsDialog } from '@/components/entity/MemberDietsDialog'
import { useUser, useDeleteUser, useUsersByRole } from '@/hooks/useUsers'
import { useBranches } from '@/hooks/useBranches'
import { useRoles } from '@/hooks/useRoles'
import { useDietsForClient } from '@/hooks/useDiets'
import { businessRegistryApi } from '@/api/business-registry.api'

export default function SuperAdminMemberDetailPage() {
  const { branchId, id } = useParams<{ branchId?: string; id: string }>()
  const navigate = useNavigate()
  const { data: user, isLoading } = useUser(id!)
  const deleteUser = useDeleteUser()
  const [editOpen, setEditOpen] = useState(false)
  const [assignTrainerOpen, setAssignTrainerOpen] = useState(false)
  const [dietsOpen, setDietsOpen] = useState(false)

  const { data: businesses = [] } = useQuery({
    queryKey: ['businesses'],
    queryFn: () => businessRegistryApi.list(),
  })
  const { data: branches = [] } = useBranches()
  const { trainerRole } = useRoles()
  const { data: trainers = [] } = useUsersByRole(trainerRole?.id)
  const { data: diets = [] } = useDietsForClient(id)

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

  // Reachable both from the branch drill-down (Businesses → Branches → View
  // Members) and from the flat Members sidebar page — go back to whichever
  // one linked here.
  const backTo = branchId ? `/superadmin/branches/${branchId}/members` : '/superadmin/members'

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

  const businessName = businesses.find((b) => b.id === user.businessId)?.businessName
  const branchName = branches.find((b) => b.id === user.branchId)?.branchName

  return (
    <div className="flex flex-col h-full">
      <Header title={user.fullName ?? user.firstName} />
      <div className="flex-1 overflow-auto p-6">
        <UserDetailCard
          user={user}
          roleLabel="Member"
          businessLabel={businessName}
          branchLabel={branchName}
          onBack={() => navigate(backTo)}
          onEdit={() => setEditOpen(true)}
          onDelete={() =>
            deleteUser.mutate(user.id, {
              onSuccess: () => navigate(backTo),
            })
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
        diets={diets}
        trainerOptions={branchTrainers}
        trainerName={trainerName}
      />
    </div>
  )
}
