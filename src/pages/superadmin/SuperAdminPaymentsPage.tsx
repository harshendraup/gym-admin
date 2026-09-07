import { useState } from 'react'
import { usePayments } from '@/hooks/usePayments'
import { Card, CardContent } from '@/components/ui/card'

export default function SuperAdminPaymentsPage() {
  const [businessId, setBusinessId] = useState<number | undefined>()
  const { data: payments = [], isLoading, isError, refetch } = usePayments(
    businessId ? { businessId } : undefined
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
            <p className="mt-1 text-sm" style={{ color: '#64748B' }}>
              Every payment across every business. Leave the filter empty to see all.
            </p>
          </div>

          {/* Optional: wire a business dropdown here, calling setBusinessId(id) —
              omitted for brevity, reuse the same Select pattern as
              AdminMembershipsPage's branch filter, sourced from businessRegistryApi. */}

          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <p className="p-6 text-sm text-slate-500">Loading payments…</p>
              ) : isError ? (
                <div className="p-6 text-sm text-red-600">
                  Failed to load payments.{' '}
                  <button className="underline" onClick={() => refetch()}>Retry</button>
                </div>
              ) : payments.length === 0 ? (
                <p className="p-6 text-sm text-slate-500">No payments recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs uppercase text-slate-500">
                        <th className="p-3">Date</th>
                        <th className="p-3">Business</th>
                        <th className="p-3">Branch</th>
                        <th className="p-3">Member</th>
                        <th className="p-3">Purpose</th>
                        <th className="p-3">Method</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p) => (
                        <tr key={p.id} className="border-b last:border-0">
                          <td className="p-3">{new Date(p.createdAt).toLocaleDateString()}</td>
                          <td className="p-3">#{p.businessId}</td>
                          <td className="p-3">{p.branchId ? `#${p.branchId}` : '—'}</td>
                          <td className="p-3">#{p.userId}</td>
                          <td className="p-3 capitalize">{p.purpose.replace('_', ' ')}</td>
                          <td className="p-3 capitalize">{p.paymentMethod}</td>
                          <td className="p-3">{p.currency} {p.totalAmount}</td>
                          <td className="p-3 capitalize">{p.status.replace('_', ' ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
