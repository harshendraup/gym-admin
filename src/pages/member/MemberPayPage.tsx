import { useEffect, useState } from 'react'
import { Loader2, CheckCircle2, XCircle, Wallet, LogOut } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCheckoutPayment, useVerifyPayment, usePayments } from '@/hooks/usePayments'
import { useAuthStore } from '@/store/auth.store'

const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void }
  }
}

/** Loads the Razorpay Checkout script once and resolves when it's ready. */
function useRazorpayScript() {
  const [loaded, setLoaded] = useState(!!window.Razorpay)

  useEffect(() => {
    if (window.Razorpay) {
      setLoaded(true)
      return
    }
    const script = document.createElement('script')
    script.src = RAZORPAY_SCRIPT_SRC
    script.async = true
    script.onload = () => setLoaded(true)
    document.body.appendChild(script)
  }, [])

  return loaded
}

type Status = 'idle' | 'processing' | 'success' | 'failed'

export default function MemberPayPage() {
  const scriptLoaded = useRazorpayScript()
  const checkout = useCheckoutPayment()
  const verify = useVerifyPayment()
  const { data: payments = [] } = usePayments()
  const logout = useAuthStore((s) => s.logout)
  const userName = useAuthStore((s) => s.user?.fullName ?? s.user?.firstName ?? 'Member')

  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handlePayNow = async () => {
    setStatus('processing')
    setErrorMessage(null)

    try {
      const result = await checkout.mutateAsync({ purpose: 'membership_renewal' })

      if (!result.keyId || !scriptLoaded || !window.Razorpay) {
        setStatus('failed')
        setErrorMessage(
          !result.keyId
            ? 'Payment gateway is not configured yet. Ask your gym to set up Razorpay keys.'
            : 'Payment gateway is still loading — please try again in a moment.'
        )
        return
      }

      const razorpay = new window.Razorpay({
        key: result.keyId,
        amount: result.amount,
        currency: result.currency,
        order_id: result.razorpayOrderId,
        name: 'GymOS',
        description: 'Membership Payment',
        handler: async (response: {
          razorpay_order_id: string
          razorpay_payment_id: string
          razorpay_signature: string
        }) => {
          try {
            await verify.mutateAsync({
              id: result.paymentId,
              data: {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
            })
            setStatus('success')
          } catch (err: any) {
            setStatus('failed')
            setErrorMessage(err?.response?.data?.error?.message ?? 'Payment verification failed')
          }
        },
        modal: {
          ondismiss: () => setStatus('idle'),
        },
      })

      razorpay.open()
      // Modal is open — leave status as 'processing' until the handler or
      // ondismiss above resolves it; the button stays disabled meanwhile.
    } catch (err: any) {
      setStatus('failed')
      setErrorMessage(err?.response?.data?.error?.message ?? 'Could not start checkout')
    }
  }

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Signed in as {userName}</p>
        <Button variant="ghost" size="sm" onClick={logout}>
          <LogOut className="mr-1.5 h-3.5 w-3.5" /> Log out
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wallet className="h-5 w-5 text-primary" /> Membership Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl bg-slate-50 p-4 text-center">
            <p className="text-xs text-slate-500">Amount Due</p>
            <p className="text-3xl font-bold text-slate-900">₹100</p>
          </div>

          {status === 'success' ? (
            <div className="flex flex-col items-center gap-2 py-2 text-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
              <p className="font-medium text-slate-900">Payment Successful</p>
              <p className="text-sm text-slate-500">Your membership has been updated.</p>
            </div>
          ) : (
            <>
              <Button
                className="w-full"
                size="lg"
                disabled={status === 'processing' || checkout.isPending || verify.isPending}
                onClick={handlePayNow}
              >
                {status === 'processing' || checkout.isPending || verify.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…</>
                ) : (
                  'Pay Now'
                )}
              </Button>

              {status === 'failed' && errorMessage && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Payment History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</span>
                <span className="capitalize text-slate-700">{p.status.replace('_', ' ')}</span>
                <span className="font-medium text-slate-900">{p.currency} {p.totalAmount}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
