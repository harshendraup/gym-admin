import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Header } from '@/components/layout/Header'
import { toast } from '@/hooks/use-toast'
import { useRoles } from '@/hooks/useRoles'
import { businessRegistryApi } from '@/api/business-registry.api'
import { userManagementApi, type ManagedUser } from '@/api/user-management.api'
import { Plus, Trash2, ShieldCheck, UserCog } from 'lucide-react'

type CreateKind = 'admin' | 'sub_admin'

function CreateUserDialog({
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
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', mobile: '', businessId: '' })

  const { data: businesses = [] } = useQuery({
    queryKey: ['businesses'],
    queryFn: () => businessRegistryApi.list(),
    enabled: open,
  })

  const create = useMutation({
    mutationFn: () =>
      userManagementApi.create({
        firstName: form.firstName,
        lastName: form.lastName || undefined,
        email: form.email,
        password: form.password,
        mobile: form.mobile || undefined,
        businessId: form.businessId ? Number(form.businessId) : undefined,
        roleId,
        status: 'Active',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['platform-users'] })
      toast({ title: kind === 'admin' ? 'Admin created' : 'Sub-admin created' })
      setForm({ firstName: '', lastName: '', email: '', password: '', mobile: '', businessId: '' })
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

  const canSubmit = form.firstName && form.email && form.password && form.businessId && !create.isPending

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{kind === 'admin' ? 'Create Admin' : 'Create Sub-Admin'}</DialogTitle>
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
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="jane@business.com" />
          </div>
          <div className="space-y-1.5">
            <Label>Password</Label>
            <Input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Min 8 characters" />
          </div>
          <div className="space-y-1.5">
            <Label>Mobile</Label>
            <Input value={form.mobile} onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))} placeholder="9876543210" />
          </div>
          <div className="space-y-1.5">
            <Label>Business</Label>
            <Select value={form.businessId} onValueChange={(v) => setForm((f) => ({ ...f, businessId: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a business..." />
              </SelectTrigger>
              <SelectContent>
                {businesses.map((b) => (
                  <SelectItem key={b.id} value={String(b.id)}>{b.businessName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={!canSubmit} onClick={() => create.mutate()}>
            {create.isPending ? 'Creating...' : kind === 'admin' ? 'Create Admin' : 'Create Sub-Admin'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function RoleBadge({ roleId, adminRoleId, subAdminRoleId }: { roleId: number | null; adminRoleId?: number; subAdminRoleId?: number }) {
  if (roleId === adminRoleId) return <Badge>Admin</Badge>
  if (roleId === subAdminRoleId) return <Badge variant="secondary">Sub Admin</Badge>
  return <Badge variant="outline">—</Badge>
}

export default function AdminPage() {
  const qc = useQueryClient()
  const { adminRole, subAdminRole } = useRoles()
  const [createKind, setCreateKind] = useState<CreateKind | null>(null)

  const { data: businesses = [] } = useQuery({
    queryKey: ['businesses'],
    queryFn: () => businessRegistryApi.list(),
  })
  const businessName = (id: number | null) => businesses.find((b) => b.id === id)?.businessName ?? '—'

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['platform-users'],
    queryFn: () => userManagementApi.list(),
  })

  const privilegedUsers = users.filter(
    (u) => u.roleId === adminRole?.id || u.roleId === subAdminRole?.id
  )

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userManagementApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['platform-users'] })
      toast({ title: 'User removed' })
    },
    onError: (err: any) => toast({
      title: 'Failed to remove user',
      description: err?.response?.data?.message,
      variant: 'destructive',
    }),
  })

  return (
    <div className="flex flex-col h-full">
      <Header title="Platform Admin" />
      <div className="flex-1 overflow-auto p-6 space-y-6">

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Admins</p>
                  <p className="text-xs text-muted-foreground">One per business — manages that business's team</p>
                </div>
              </div>
              <Button size="sm" onClick={() => setCreateKind('admin')}>
                <Plus className="h-4 w-4 mr-1" /> Create Admin
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <UserCog className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Sub-Admins</p>
                  <p className="text-xs text-muted-foreground">Assist an admin within a single business</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => setCreateKind('sub_admin')}>
                <Plus className="h-4 w-4 mr-1" /> Create Sub-Admin
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Admins &amp; Sub-Admins</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="h-32 animate-pulse bg-muted" />
            ) : privilegedUsers.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground text-center">
                No admins or sub-admins yet. Create one to get started.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {privilegedUsers.map((u: ManagedUser) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.fullName ?? u.firstName}</TableCell>
                      <TableCell>{u.email ?? '—'}</TableCell>
                      <TableCell>{businessName(u.businessId)}</TableCell>
                      <TableCell>
                        <RoleBadge roleId={u.roleId} adminRoleId={adminRole?.id} subAdminRoleId={subAdminRole?.id} />
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
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateUserDialog
        open={createKind !== null}
        kind={createKind ?? 'admin'}
        roleId={createKind === 'admin' ? adminRole?.id : subAdminRole?.id}
        onClose={() => setCreateKind(null)}
      />
    </div>
  )
}
