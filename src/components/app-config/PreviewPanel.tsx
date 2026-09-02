import { useState } from 'react'
import { Copy, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useAppConfigPreview } from '@/hooks/useAppConfig'
import { cn } from '@/lib/utils'
import { PhoneMock } from './PhoneMock'

/**
 * The exact `POST /meta` payload this gym's app receives — served by the API
 * from the same code path the app hits, not rebuilt here. Without it,
 * checking a change means saving, opening the app, and waiting out its 300s
 * cache TTL.
 */
export default function PreviewPanel({ businessId }: { businessId: number }) {
  const [platform, setPlatform] = useState<'android' | 'ios'>('android')
  const { data, isLoading, isError, isFetching, refetch } = useAppConfigPreview(businessId, platform)

  const payload = data as any
  const app = payload?.data

  return (
    <div className="space-y-5">
      <div
        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl px-6 py-4"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.92) 100%)',
          border: '1px solid rgba(59,130,246,0.18)',
        }}
      >
        <div>
          <h2 className="text-base font-semibold text-slate-900">Live meta response</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Byte-for-byte what the app fetches on launch. Release settings differ per platform.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg p-0.5" style={{ background: 'rgba(59,130,246,0.08)' }}>
            {(['android', 'ios'] as const).map((option) => (
              <button
                key={option}
                onClick={() => setPlatform(option)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-colors',
                  platform === option ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                )}
              >
                {option}
              </button>
            ))}
          </div>
          <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={cn('mr-1.5 h-3.5 w-3.5', isFetching && 'animate-spin')} />
            Refresh
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
              toast.success('Meta response copied')
            }}
            disabled={!payload}
          >
            <Copy className="mr-1.5 h-3.5 w-3.5" />
            Copy JSON
          </Button>
        </div>
      </div>

      {app && (
        <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
          <PhoneMock app={app} />
          <pre
            className="overflow-auto rounded-2xl p-5 text-xs leading-relaxed"
            style={{
              maxHeight: '70vh',
              background: '#0F172A',
              color: '#E2E8F0',
              border: '1px solid rgba(59,130,246,0.2)',
            }}
          >
            {JSON.stringify(payload, null, 2)}
          </pre>
        </div>
      )}

      {isLoading && <p className="text-sm text-slate-400">Loading preview…</p>}

      {/* Without this the panel sits on an empty frame with no explanation
          when the preview call fails. */}
      {isError && (
        <p className="text-sm" style={{ color: '#B91C1C' }}>
          Couldn't load the preview. Use Refresh to try again.
        </p>
      )}

      {!isLoading && !isError && !app && (
        <p className="text-sm text-slate-400">This business has no app payload to preview.</p>
      )}
    </div>
  )
}
