import { useState, useEffect, useRef, useMemo, forwardRef } from 'react'
import { createPortal } from 'react-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { type ColumnDef } from '@tanstack/react-table'
import {
  Building2, Plus, Search, MoreVertical, Edit2, Trash2,
  CheckCircle2, XCircle, Clock, Phone, MapPin, Mail,
  AlertTriangle, RefreshCw,
} from 'lucide-react'
import DataTable from '@/components/data-table/DataTable'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import {
  businessRegistryApi,
  type BusinessRecord,
  type BusinessRecordPayload,
} from '@/api/business-registry.api'
import { cn } from '@/lib/utils'

type BusinessStatus = 'active' | 'pending' | 'suspended'

// ─── Badges ───────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status?: string | null }) {
  const map: Record<string, { label: string; Icon: typeof CheckCircle2; color: string; bg: string; border: string }> = {
    active: { label: 'Active', Icon: CheckCircle2, color: '#059669', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.35)' },
    pending: { label: 'Pending', Icon: Clock, color: '#D97706', bg: 'rgba(217,119,6,0.15)', border: 'rgba(217,119,6,0.35)' },
    suspended: { label: 'Suspended', Icon: XCircle, color: '#DC2626', bg: 'rgba(220,38,38,0.15)', border: 'rgba(220,38,38,0.35)' },
  }
  const cfg = map[status ?? ''] ?? { label: status || 'Unknown', Icon: Clock, color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.25)' }
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold"
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <cfg.Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  )
}

// ─── Action Dropdown ──────────────────────────────────────────────────────────

function ActionMenu({
  business,
  onEdit,
  onDelete,
  onStatusChange,
  isPending,
}: {
  business: BusinessRecord
  onEdit: () => void
  onDelete: () => void
  onStatusChange: (s: BusinessStatus) => void
  isPending: boolean
}) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, right: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const ref = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (!buttonRef.current?.contains(target) && !ref.current?.contains(target) && !menuRef.current?.contains(target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPosition({ top: rect.bottom + 8, right: window.innerWidth - rect.right })
    }
  }, [open])

  const statusOpts = (
    [
      { status: 'active' as BusinessStatus, label: 'Mark Active', color: '#059669' },
      { status: 'pending' as BusinessStatus, label: 'Mark Pending', color: '#D97706' },
      { status: 'suspended' as BusinessStatus, label: 'Suspend', color: '#DC2626' },
    ] as const
  ).filter((o) => o.status !== business.status)

  return (
    <div ref={ref}>
      <button
        ref={buttonRef}
        onClick={() => setOpen((p) => !p)}
        disabled={isPending}
        className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150 disabled:opacity-40"
        style={{
          background: open ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.04)',
          border: '1px solid rgba(59,130,246,0.1)',
          color: '#64748b',
        }}
      >
        {isPending
          ? <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          : <MoreVertical className="h-4 w-4" />
        }
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          className="fixed z-[9999] min-w-[172px] overflow-hidden rounded-xl py-1"
          style={{
            top: `${position.top}px`,
            right: `${position.right}px`,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(59,130,246,0.15)',
            boxShadow: '0 24px 48px rgba(0,0,0,0.1)',
          }}
        >
          <button
            onClick={() => { onEdit(); setOpen(false) }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-900 transition-colors"
          >
            <Edit2 className="h-3.5 w-3.5" />
            Edit Details
          </button>

          <div className="my-1 mx-3" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }} />

          {statusOpts.map(({ status, label, color }) => (
            <button
              key={status}
              onClick={() => { onStatusChange(status); setOpen(false) }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors"
              style={{ color }}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}

          <div className="my-1 mx-3" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }} />

          <button
            onClick={() => { onDelete(); setOpen(false) }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-red-50 transition-colors"
            style={{ color: '#DC2626' }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>,
        document.body
      )}
    </div>
  )
}

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────

function DeleteDialog({
  open,
  business,
  onClose,
  onConfirm,
  isPending,
}: {
  open: boolean
  business: BusinessRecord | null
  onClose: () => void
  onConfirm: () => void
  isPending: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="sm:max-w-sm"
        style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(220,38,38,0.2)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.1)',
        }}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0"
              style={{ background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.2)' }}
            >
              <AlertTriangle className="h-5 w-5" style={{ color: '#DC2626' }} />
            </div>
            <DialogTitle className="text-slate-900">Delete Business</DialogTitle>
          </div>
        </DialogHeader>
        <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>
          Are you sure you want to delete{' '}
          <span className="font-semibold text-slate-900">{business?.businessName}</span>?
          This is a soft delete and can be reviewed later.
        </p>
        <div className="flex justify-end gap-2.5 mt-2">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-medium transition-all duration-150"
            style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)', color: '#64748B' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all duration-150 disabled:opacity-50"
            style={{ background: 'rgba(220,38,38,0.8)', border: '1px solid rgba(220,38,38,0.4)' }}
          >
            {isPending
              ? <><div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />Deleting...</>
              : 'Delete Business'
            }
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Business Key Helper ──────────────────────────────────────────────────────

function generateBusinessKey(): string {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `BIZ-${ts}-${rand}`
}

// ─── Form ─────────────────────────────────────────────────────────────────────

const businessSchema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  email: z.string().email('Valid email required').optional().or(z.literal('')),
  mobileNumber: z.string().optional(),
  phoneNumber: z.string().optional(),
  gstNo: z.string().optional(),
  address: z.string().optional(),
  businessLogo: z.string().url('Enter a valid URL').optional().or(z.literal('')),
})
type BusinessFormValues = z.infer<typeof businessSchema>

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <p className="text-[10px] font-bold uppercase tracking-widest flex-shrink-0" style={{ color: '#2563EB' }}>
        {label}
      </p>
      <div className="flex-1" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }} />
    </div>
  )
}

const GlassInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, onFocus, onBlur, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all duration-200 placeholder:text-slate-400',
        className,
      )}
      style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(59,130,246,0.15)', color: '#1e293b' }}
      onFocus={(e) => {
        e.target.style.border = '1px solid rgba(59,130,246,0.5)'
        e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'
        onFocus?.(e)
      }}
      onBlur={(e) => {
        e.target.style.border = '1px solid rgba(59,130,246,0.15)'
        e.target.style.boxShadow = 'none'
        onBlur?.(e)
      }}
      {...props}
    />
  )
)
GlassInput.displayName = 'GlassInput'

const GlassTextarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, onFocus, onBlur, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={2}
      className={cn(
        'w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 resize-none',
        className,
      )}
      style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(59,130,246,0.15)', color: '#1e293b' }}
      onFocus={(e) => {
        e.target.style.border = '1px solid rgba(59,130,246,0.5)'
        e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'
        onFocus?.(e)
      }}
      onBlur={(e) => {
        e.target.style.border = '1px solid rgba(59,130,246,0.15)'
        e.target.style.boxShadow = 'none'
        onBlur?.(e)
      }}
      {...props}
    />
  )
)
GlassTextarea.displayName = 'GlassTextarea'

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="mt-1 text-xs" style={{ color: '#DC2626' }}>{msg}</p>
}

function FormField({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label className="block mb-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#64748B' }}>
        {label}{required && <span className="ml-0.5" style={{ color: '#2563EB' }}>*</span>}
      </label>
      {children}
      <FieldError msg={error} />
    </div>
  )
}

export function BusinessFormDialog({
  open,
  onClose,
  editBusiness,
}: {
  open: boolean
  onClose: () => void
  editBusiness: BusinessRecord | null
}) {
  const qc = useQueryClient()
  const isEdit = !!editBusiness

  const [businessKey, setBusinessKey] = useState('')
  const [showKeyWarning, setShowKeyWarning] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema),
  })

  useEffect(() => {
    if (open && editBusiness) {
      setBusinessKey(editBusiness.businessKey)
      reset({
        businessName: editBusiness.businessName,
        email: editBusiness.email ?? '',
        mobileNumber: editBusiness.mobileNumber ?? '',
        phoneNumber: editBusiness.phoneNumber ?? '',
        gstNo: editBusiness.gstNo ?? '',
        address: editBusiness.address ?? '',
        businessLogo: editBusiness.businessLogo ?? '',
      })
    } else if (open && !editBusiness) {
      setBusinessKey(generateBusinessKey())
      reset({ businessName: '', email: '', mobileNumber: '', phoneNumber: '', gstNo: '', address: '', businessLogo: '' })
    }
  }, [open, editBusiness, reset])

  const createMutation = useMutation({
    mutationFn: (d: BusinessRecordPayload) => businessRegistryApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['businesses'] }); toast({ title: 'Business created' }); onClose() },
    onError: (err: any) => toast({
      title: 'Failed to create business',
      description: err?.response?.data?.errors?.[0]?.message ?? err?.response?.data?.message,
      variant: 'destructive',
    }),
  })

  const updateMutation = useMutation({
    mutationFn: (d: Partial<BusinessRecordPayload>) => businessRegistryApi.update(editBusiness!.id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['businesses'] }); toast({ title: 'Business updated' }); onClose() },
    onError: (err: any) => toast({
      title: 'Failed to update business',
      description: err?.response?.data?.errors?.[0]?.message ?? err?.response?.data?.message,
      variant: 'destructive',
    }),
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  const onSubmit = (data: BusinessFormValues) => {
    const payload: BusinessRecordPayload = {
      businessKey,
      businessName: data.businessName,
      ...(data.email && { email: data.email }),
      ...(data.mobileNumber && { mobileNumber: data.mobileNumber }),
      ...(data.phoneNumber && { phoneNumber: data.phoneNumber }),
      ...(data.gstNo && { gstNo: data.gstNo }),
      ...(data.address && { address: data.address }),
      ...(data.businessLogo && { businessLogo: data.businessLogo }),
    }

    isEdit ? updateMutation.mutate(payload) : createMutation.mutate(payload)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="sm:max-w-xl max-h-[90vh] overflow-hidden flex flex-col p-0"
        style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(28px)',
          border: '1px solid rgba(59,130,246,0.15)',
          boxShadow: '0 40px 80px rgba(0,0,0,0.1)',
        }}
      >
        {/* Dialog Header */}
        <div
          className="flex items-center gap-3 px-6 pt-6 pb-5 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0"
            style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.2)' }}
          >
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <DialogTitle className="text-[17px] font-semibold text-slate-900">
              {isEdit ? 'Edit Business' : 'New Business'}
            </DialogTitle>
            <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>
              {isEdit ? `Editing ${editBusiness?.businessName}` : 'Register a new business on the platform'}
            </p>
          </div>
        </div>

        {/* Scrollable Form */}
        <form id="biz-form" onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-7">

            {/* ── Identity ── */}
            <div className="space-y-4">
              <SectionLabel label="Identity" />
              <FormField label="Business Name" required error={errors.businessName?.message}>
                <GlassInput placeholder="e.g. FitLife Studios" {...register('businessName')} />
              </FormField>
              <FormField label="Business Key">
                <div className="relative">
                  <GlassInput
                    value={businessKey}
                    readOnly
                    className="font-mono cursor-not-allowed"
                    style={{
                      background: 'rgba(59,130,246,0.08)',
                      border: '1px solid rgba(59,130,246,0.2)',
                      color: '#1e293b',
                      paddingRight: '110px',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => (isEdit ? setShowKeyWarning(true) : setBusinessKey(generateBusinessKey()))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all duration-150"
                    style={{
                      background: isEdit ? 'rgba(220,38,38,0.08)' : 'rgba(59,130,246,0.08)',
                      border: `1px solid ${isEdit ? 'rgba(220,38,38,0.25)' : 'rgba(59,130,246,0.25)'}`,
                      color: isEdit ? '#DC2626' : '#2563EB',
                    }}
                  >
                    <RefreshCw className="h-3 w-3" />
                    Regenerate
                  </button>
                </div>
              </FormField>
            </div>

            {/* ── Contact ── */}
            <div className="space-y-4">
              <SectionLabel label="Contact" />
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Email" error={errors.email?.message}>
                  <GlassInput type="email" placeholder="admin@business.com" {...register('email')} />
                </FormField>
                <FormField label="Mobile Number" error={errors.mobileNumber?.message}>
                  <GlassInput placeholder="+91 98765 43210" {...register('mobileNumber')} />
                </FormField>
              </div>
              <FormField label="Phone Number" error={errors.phoneNumber?.message}>
                <GlassInput placeholder="Landline / office number" {...register('phoneNumber')} />
              </FormField>
              <FormField label="GST No." error={errors.gstNo?.message}>
                <GlassInput placeholder="27ABCDE1234F1Z5" {...register('gstNo')} />
              </FormField>
            </div>

            {/* ── Address & Branding ── */}
            <div className="space-y-4">
              <SectionLabel label="Address & Branding" />
              <FormField label="Address" error={errors.address?.message}>
                <GlassTextarea placeholder="Street, city, state, pincode" {...register('address')} />
              </FormField>
              <FormField label="Business Logo URL" error={errors.businessLogo?.message}>
                <GlassInput type="url" placeholder="https://example.com/logo.png" {...register('businessLogo')} />
              </FormField>
            </div>

          </div>
        </form>

        {/* Dialog Footer */}
        <div
          className="flex items-center justify-end gap-3 px-6 py-4 flex-shrink-0"
          style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
        >
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150"
            style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)', color: '#64748B' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="biz-form"
            disabled={isPending}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', boxShadow: '0 4px 16px rgba(59,130,246,0.3)' }}
          >
            {isPending
              ? <><div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />Saving...</>
              : isEdit ? 'Save Changes' : 'Create Business'
            }
          </button>
        </div>
      </DialogContent>

      {/* ── Key Regenerate Warning ── */}
      <Dialog open={showKeyWarning} onOpenChange={(o) => !o && setShowKeyWarning(false)}>
        <DialogContent
          className="sm:max-w-sm"
          style={{
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(220,38,38,0.2)',
            boxShadow: '0 32px 64px rgba(0,0,0,0.12)',
          }}
        >
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0"
                style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)' }}
              >
                <AlertTriangle className="h-5 w-5" style={{ color: '#DC2626' }} />
              </div>
              <DialogTitle className="text-slate-900">Regenerate Business Key?</DialogTitle>
            </div>
          </DialogHeader>
          <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>
            This will replace the current business key with a new one.
            Any integrations or API clients using the old key will <span className="font-semibold text-red-600">stop working immediately</span>.
          </p>
          <p className="text-xs mt-1 font-medium" style={{ color: '#94a3b8' }}>
            The new key will only be saved when you click Save Changes.
          </p>
          <div className="flex justify-end gap-2.5 mt-2">
            <button
              onClick={() => setShowKeyWarning(false)}
              className="rounded-xl px-4 py-2 text-sm font-medium transition-all duration-150"
              style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)', color: '#64748B' }}
            >
              Cancel
            </button>
            <button
              onClick={() => { setBusinessKey(generateBusinessKey()); setShowKeyWarning(false) }}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all duration-150"
              style={{ background: 'rgba(220,38,38,0.85)', border: '1px solid rgba(220,38,38,0.4)' }}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Yes, Regenerate
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}

// ─── Table Columns ────────────────────────────────────────────────────────────

function getColumns(
  onEdit: (b: BusinessRecord) => void,
  onDelete: (b: BusinessRecord) => void,
  onStatusChange: (b: BusinessRecord, s: BusinessStatus) => void,
  pendingId: number | null,
): ColumnDef<BusinessRecord>[] {
  return [
    {
      id: 'business',
      header: 'Business',
      cell: ({ row }) => {
        const b = row.original
        return (
          <div className="flex items-center gap-3">
            {b.businessLogo
              ? <img src={b.businessLogo} alt={b.businessName} className="h-9 w-9 rounded-xl object-cover flex-shrink-0" />
              : (
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }}
                >
                  <Building2 className="h-4 w-4 text-white" />
                </div>
              )
            }
            <div>
              <p className="text-sm font-semibold text-slate-900 leading-tight">{b.businessName}</p>
              <p className="text-xs font-mono mt-0.5" style={{ color: '#94a3b8' }}>{b.businessKey}</p>
            </div>
          </div>
        )
      },
    },
    {
      header: 'Contact',
      cell: ({ row }) => {
        const b = row.original
        return (
          <div className="space-y-1 text-sm">
            {b.email && (
              <div className="flex items-center gap-1.5" style={{ color: '#64748B' }}>
                <Mail className="h-3 w-3 flex-shrink-0" />
                <span className="truncate max-w-[160px]">{b.email}</span>
              </div>
            )}
            {(b.mobileNumber || b.phoneNumber) && (
              <div className="flex items-center gap-1.5" style={{ color: '#94a3b8' }}>
                <Phone className="h-3 w-3 flex-shrink-0" />
                {b.mobileNumber || b.phoneNumber}
              </div>
            )}
          </div>
        )
      },
    },
    {
      header: 'Address',
      cell: ({ row }) => {
        const address = row.original.address
        if (!address) return <span style={{ color: '#cbd5e1' }}>—</span>
        return (
          <div className="flex items-center gap-1.5 text-sm max-w-[220px]" style={{ color: '#64748B' }}>
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{address}</span>
          </div>
        )
      },
    },
    {
      header: 'GST No.',
      cell: ({ row }) => row.original.gstNo || <span style={{ color: '#cbd5e1' }}>—</span>,
    },
    {
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const b = row.original
        return (
          <div className="flex items-center justify-end gap-2">
            <ActionMenu
              business={b}
              onEdit={() => onEdit(b)}
              onDelete={() => onDelete(b)}
              onStatusChange={(s) => onStatusChange(b, s)}
              isPending={pendingId === b.id}
            />
          </div>
        )
      },
    },
  ]
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BusinessesPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [editBusiness, setEditBusiness] = useState<BusinessRecord | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BusinessRecord | null>(null)
  const [pendingId, setPendingId] = useState<number | null>(null)

  const { data: businesses, isLoading } = useQuery({
    queryKey: ['businesses'],
    queryFn: () => businessRegistryApi.list(),
  })

  const filtered = useMemo(() => {
    let list = businesses ?? []
    if (statusFilter) list = list.filter((b) => b.status === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (b) =>
          b.businessName.toLowerCase().includes(q) ||
          b.businessKey.toLowerCase().includes(q) ||
          (b.email ?? '').toLowerCase().includes(q)
      )
    }
    return list
  }, [businesses, search, statusFilter])

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: BusinessStatus }) =>
      businessRegistryApi.update(id, { status }),
    onMutate: ({ id }) => setPendingId(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['businesses'] }); toast({ title: 'Status updated' }) },
    onError: () => toast({ title: 'Failed to update status', variant: 'destructive' }),
    onSettled: () => setPendingId(null),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => businessRegistryApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['businesses'] })
      toast({ title: 'Business deleted' })
      setDeleteTarget(null)
    },
    onError: () => toast({ title: 'Failed to delete business', variant: 'destructive' }),
  })

  const columns = getColumns(
    (b) => { setEditBusiness(b); setFormOpen(true) },
    (b) => setDeleteTarget(b),
    (b, s) => statusMutation.mutate({ id: b.id, status: s }),
    pendingId,
  )

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Businesses</h1>
          <p className="mt-1 text-sm" style={{ color: '#64748B' }}>
            {businesses?.length ?? 0} total businesses registered on the platform
          </p>
        </div>
        <button
          onClick={() => { setEditBusiness(null); setFormOpen(true) }}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[15px] font-semibold text-white transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
            boxShadow: '0 4px 16px rgba(59,130,246,0.3)',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
        >
          <Plus className="h-4 w-4" />
          New Business
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search
            className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 pointer-events-none"
            style={{ color: '#94a3b8' }}
          />
          <input
            placeholder="Search by name, key, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none transition-all duration-200 placeholder:text-slate-400"
            style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(59,130,246,0.15)', color: '#1e293b' }}
            onFocus={(e) => { e.target.style.border = '1px solid rgba(59,130,246,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)' }}
            onBlur={(e) => { e.target.style.border = '1px solid rgba(59,130,246,0.15)'; e.target.style.boxShadow = 'none' }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl px-3 py-2.5 text-sm outline-none cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(59,130,246,0.15)', color: statusFilter ? '#1e293b' : '#64748B' }}
          onFocus={(e) => { e.target.style.border = '1px solid rgba(59,130,246,0.5)' }}
          onBlur={(e) => { e.target.style.border = '1px solid rgba(59,130,246,0.15)' }}
        >
          <option value="" style={{ background: '#ffffff' }}>All Status</option>
          <option value="pending" style={{ background: '#ffffff' }}>Pending</option>
          <option value="active" style={{ background: '#ffffff' }}>Active</option>
          <option value="suspended" style={{ background: '#ffffff' }}>Suspended</option>
        </select>
      </div>

      {/* ── Table ── */}
      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        emptyMessage="No businesses found. Add the first one."
      />

      {/* ── Dialogs ── */}
      <BusinessFormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditBusiness(null) }}
        editBusiness={editBusiness}
      />
      <DeleteDialog
        open={!!deleteTarget}
        business={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
