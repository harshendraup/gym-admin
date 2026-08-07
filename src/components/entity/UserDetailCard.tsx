import { Mail, Phone, Building2, MapPin, Calendar, Trash2, ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getInitials, formatDate } from '@/lib/utils'
import type { ManagedUser } from '@/api/user-management.api'

interface UserDetailCardProps {
  user: ManagedUser
  roleLabel?: string
  businessLabel?: string
  branchLabel?: string
  onBack?: () => void
  onDelete?: () => void
  isDeleting?: boolean
}

/**
 * The one reusable detail card for every member/admin/sub-admin detail page
 * across all three dashboards.
 */
export function UserDetailCard({
  user,
  roleLabel,
  businessLabel,
  branchLabel,
  onBack,
  onDelete,
  isDeleting,
}: UserDetailCardProps) {
  const displayName = user.fullName ?? user.firstName

  return (
    <div className="space-y-4 animate-fade-in">
      {onBack && (
        <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back
        </Button>
      )}

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 shadow-md">
                <AvatarFallback className="text-lg font-bold text-white bg-gradient-to-br from-blue-500 to-blue-700">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{displayName}</h2>
                <div className="mt-1 flex items-center gap-2">
                  {roleLabel && <Badge>{roleLabel}</Badge>}
                  <Badge variant={user.status === 'Active' ? 'success' : 'secondary'}>
                    {user.status}
                  </Badge>
                </div>
              </div>
            </div>
            {onDelete && (
              <Button variant="destructive" size="sm" onClick={onDelete} disabled={isDeleting}>
                <Trash2 className="mr-1.5 h-4 w-4" />
                {isDeleting ? 'Removing...' : 'Remove'}
              </Button>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailRow icon={Mail} label="Email" value={user.email ?? '—'} />
            <DetailRow icon={Phone} label="Mobile" value={user.mobile ?? '—'} />
            {businessLabel && <DetailRow icon={Building2} label="Business" value={businessLabel} />}
            {branchLabel && <DetailRow icon={MapPin} label="Branch" value={branchLabel} />}
            <DetailRow
              icon={Calendar}
              label="Joined"
              value={user.createdAt ? formatDate(user.createdAt) : '—'}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: '#94a3b8' }} />
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>
          {label}
        </p>
        <p className="text-sm text-slate-900">{value}</p>
      </div>
    </div>
  )
}
