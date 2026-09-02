import { History, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppConfigVersions, useRestoreAppConfigVersion } from '@/hooks/useAppConfig'
import { SectionNotice } from './section-shell'
import type { AppConfigRecord } from '@/api/app-config.api'

/**
 * Every save snapshots the whole configuration, so a bad push can be undone.
 * Restoring re-applies an old revision as a *new* one — the history is
 * append-only, so what actually shipped is never rewritten.
 */
export default function VersionsPanel({
  businessId,
  config,
}: {
  businessId: number
  config: AppConfigRecord
}) {
  const { data: versions, isLoading } = useAppConfigVersions(businessId)
  const restore = useRestoreAppConfigVersion(businessId)

  return (
    <div className="space-y-4">
      <SectionNotice>
        Restoring re-applies an old revision as a new one — nothing in this history is ever
        overwritten. Uploaded assets are <strong>not</strong> brought back: they'd duplicate stored
        files and un-delete artwork someone removed on purpose.
      </SectionNotice>

      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.92) 100%)',
          border: '1px solid rgba(59,130,246,0.18)',
        }}
      >
        <div
          className="flex items-center gap-2 px-6 py-4"
          style={{ borderBottom: '1px solid rgba(59,130,246,0.12)' }}
        >
          <History className="h-4 w-4 text-slate-500" />
          <h2 className="text-base font-semibold text-slate-900">Revision history</h2>
        </div>

        <div className="divide-y divide-slate-100">
          {isLoading && <p className="p-6 text-sm text-slate-400">Loading history…</p>}

          {!isLoading && (versions ?? []).length === 0 && (
            <p className="p-6 text-sm text-slate-400">
              No revisions yet — this business hasn't been configured.
            </p>
          )}

          {(versions ?? []).map((version) => {
            const isCurrent = version.revision === config.revision
            return (
              <div key={version.id} className="flex items-center justify-between gap-4 px-6 py-3.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-slate-800">
                      r{version.revision}
                    </span>
                    {isCurrent && (
                      <span
                        className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
                        style={{ background: 'rgba(16,185,129,0.15)', color: '#059669' }}
                      >
                        Live
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-sm text-slate-600">{version.note ?? '—'}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(version.createdAt).toLocaleString()}
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={isCurrent || restore.isPending}
                  onClick={() =>
                    restore.mutate({
                      revision: version.revision,
                      note: `Restored revision ${version.revision}`,
                    })
                  }
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  Restore
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
