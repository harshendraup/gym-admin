import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { useRoles } from '@/hooks/useRoles'
import { userManagementApi, type ManagedUser } from '@/api/user-management.api'
import { Plus, Trash2, UserCog, Users } from 'lucide-react'

type CreateKind = 'sub_admin' | 'member'

function CreateTeamMemberDialog({
  open,
  kind,
  roleId,
  onClose,
}: {
  open: boolean
  kind: CreateKind
  roleId: number | undefined
  onClose: () => void
}) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', mobile: '' })

  const create = useMutation({
    mutationFn: () =>
      userManagementApi.create({
        firstName: form.firstName,
        lastName: form.lastName || undefined,
        email: form.email || undefined,
        password: form.password || undefined,
        mobile: form.mobile || undefined,
        roleId,
        status: 'Active',
        // businessId is intentionally omitted — the API always scopes a
        // created user to the acting admin's own business.
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team-users'] })
      toast({ title: kind === 'sub_admin' ? 'Sub-admin created' : 'Member created' })
      setForm({ firstName: '', lastName: '', email: '', password: '', mobile: '' })
      onClose()
    },
    onError: (err: any) => {
      toast({
        title: 'Failed to create user',
        description: err?.response?.data?.errors?.[0]?.message ?? err?.response?.data?.message,
        variant: 'destructive',
      })
    },
  })

  const canSubmit = form.firstName && !create.isPending

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{kind === 'sub_admin' ? 'Create Sub-Admin' : 'Create Member'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>First Name</Label>
              <Input value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} placeholder="Jane" />
            </div>
            <div className="space-y-1.5">
              <Label>Last Name</Label>
              <Input value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} placeholder="Doe" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Email{kind === 'sub_admin' && ' (required to log in)'}</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="jane@business.com" />
          </div>
          <div className="space-y-1.5">
            <Label>Password{kind === 'sub_admin' && ' (required to log in)'}</Label>
            <Input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Min 8 characters" />
          </div>
          <div className="space-y-1.5">
            <Label>Mobile</Label>
            <Input value={form.mobile} onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))} placeholder="9876543210" />
          </div>
          {kind === 'member' && (
            <p className="text-xs text-muted-foreground">
              Email/password are optional for a member — leave blank for a front-desk-only profile with no login.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={!canSubmit} onClick={() => create.mutate()}>
            {create.isPending ? 'Creating...' : kind === 'sub_admin' ? 'Create Sub-Admin' : 'Create Member'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function RoleBadge({ roleId, subAdminRoleId, memberRoleId }: { roleId: number | null; subAdminRoleId?: number; memberRoleId?: number }) {
  if (roleId === subAdminRoleId) return <Badge>Sub Admin</Badge>
  if (roleId === memberRoleId) return <Badge variant="secondary">Member</Badge>
  return <Badge variant="outline">—</Badge>
}

export default function UsersPage() {
  const qc = useQueryClient()
  const { subAdminRole, memberRole } = useRoles()
  const [createKind, setCreateKind] = useState<CreateKind | null>(null)

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['team-users'],
    queryFn: () => userManagementApi.list(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userManagementApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team-users'] })
      toast({ title: 'User removed' })
    },
    onError: (err: any) => toast({
      title: 'Failed to remove user',
      description: err?.response?.data?.message,
      variant: 'destructive',
    }),
  })

  return (
    <div className="flex h-full flex-col">
      <Header title="My Team" />
      <div className="flex-1 overflow-auto p-6 space-y-6">

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <UserCog className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Sub-Admins</p>
                  <p className="text-xs text-muted-foreground">Can help manage your business</p>
                </div>
              </div>
              <Button size="sm" onClick={() => setCreateKind('sub_admin')}>
                <Plus className="h-4 w-4 mr-1" /> Create Sub-Admin
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Members</p>
                  <p className="text-xs text-muted-foreground">Gym members in your business</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => setCreateKind('member')}>
                <Plus className="h-4 w-4 mr-1" /> Create Member
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Team</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-44 rounded-lg bg-muted animate-pulse" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u: ManagedUser) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.fullName ?? u.firstName}</TableCell>
                      <TableCell>{u.email ?? '—'}</TableCell>
                      <TableCell>{u.mobile ?? '—'}</TableCell>
                      <TableCell>
                        <RoleBadge roleId={u.roleId} subAdminRoleId={subAdminRole?.id} memberRoleId={memberRole?.id} />
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.status === 'Active' ? 'success' : 'secondary'}>{u.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteMutation.mutate(u.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!users.length && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No team members yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateTeamMemberDialog
        open={createKind !== null}
        kind={createKind ?? 'member'}
        roleId={createKind === 'sub_admin' ? subAdminRole?.id : memberRole?.id}
        onClose={() => setCreateKind(null)}
      />
    </div>
  )
}
