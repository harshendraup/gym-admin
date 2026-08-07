import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2, Dumbbell } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { usePublicMemberRegistration } from '@/hooks/usePublicMemberRegistration'
import { useAuthStore, buildGymContext } from '@/store/auth.store'

const schema = z.object({
  businessKey: z.string().min(1, 'Business key is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional(),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  mobile: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

/**
 * Fully public, unauthenticated member self-registration — reached via a
 * link/QR the gym shares (businessId + branchId in the URL, businessKey
 * typed in as the trust factor). Deliberately not part of AppLayout/the
 * guarded route tree: there is no `member`-role dashboard to land in, so a
 * successful registration shows an inline confirmation instead of
 * navigating anywhere.
 */
export default function PublicMemberRegisterPage() {
  const { businessId, branchId } = useParams<{ businessId: string; branchId: string }>()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [success, setSuccess] = useState<{ fullName: string } | null>(null)

  const register_ = usePublicMemberRegistration(businessId ? Number(businessId) : undefined)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (values: FormValues) => {
    if (!branchId) return
    register_.mutate(
      { ...values, branchId: Number(branchId) },
      {
        onSuccess: (result) => {
          const gymContext = buildGymContext(result.user, result.role)
          setAuth(result.user, result.token.token, null, gymContext)
          setSuccess({ fullName: result.user.fullName ?? result.user.firstName })
        },
      }
    )
  }

  if (!businessId || !branchId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">This registration link is invalid.</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg">
            <Dumbbell className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Join the gym</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign up as a member</p>
        </div>

        <Card>
          <CardContent className="p-6">
            {success ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
                <p className="text-lg font-semibold text-slate-900">You're in, {success.fullName}!</p>
                <p className="text-sm text-muted-foreground">
                  Visit the front desk to get started.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Business Key</Label>
                  <Input placeholder="Given to you by the gym" {...register('businessKey')} />
                  {errors.businessKey && <p className="text-xs text-red-600">{errors.businessKey.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>First Name</Label>
                    <Input placeholder="Jane" {...register('firstName')} />
                    {errors.firstName && <p className="text-xs text-red-600">{errors.firstName.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Last Name</Label>
                    <Input placeholder="Doe" {...register('lastName')} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input type="email" placeholder="jane@example.com" {...register('email')} />
                  {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Password</Label>
                  <Input type="password" placeholder="Min 8 characters" {...register('password')} />
                  {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Mobile</Label>
                  <Input placeholder="9876543210" {...register('mobile')} />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting || register_.isPending}>
                  {register_.isPending ? 'Joining...' : 'Join'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
