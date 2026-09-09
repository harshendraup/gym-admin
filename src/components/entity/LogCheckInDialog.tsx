import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateAttendanceLog } from '@/hooks/useAttendanceLogs'
import type { ManagedUser } from '@/api/user-management.api'

const schema = z.object({
  checkInDate: z.string().min(1, 'Date is required'),
  checkInTime: z.string().min(1, 'Time is required'),
})
type FormValues = z.infer<typeof schema>

function nowDateTimeParts() {
  const now = new Date()
  return {
    date: now.toISOString().slice(0, 10),
    time: now.toTimeString().slice(0, 5),
  }
}

/** Manual front-desk/trainer check-in — v1 has no member-facing self check-in, see attendance_log_service.ts. */
export function LogCheckInDialog({ open, onClose, member }: { open: boolean; onClose: () => void; member: ManagedUser }) {
  const create = useCreateAttendanceLog()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (open) {
      const { date, time } = nowDateTimeParts()
      reset({ checkInDate: date, checkInTime: time })
    }
  }, [open, reset])

  const onSubmit = (values: FormValues) => {
    create.mutate(
      {
        memberId: Number(member.id),
        checkInAt: new Date(`${values.checkInDate}T${values.checkInTime}`).toISOString(),
        method: 'manual',
      },
      { onSuccess: onClose }
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Log Check-in — {member.fullName ?? member.firstName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" {...register('checkInDate')} />
              {errors.checkInDate && <p className="text-xs text-red-600">{errors.checkInDate.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Time</Label>
              <Input type="time" {...register('checkInTime')} />
              {errors.checkInTime && <p className="text-xs text-red-600">{errors.checkInTime.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? 'Logging...' : 'Log Check-in'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
