import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Field, SectionNotice, SectionShell, TextField, useSectionDraft } from './section-shell'
import { useResetAppConfigSection, useSaveAppConfigSection } from '@/hooks/useAppConfig'
import { validateRelease } from './validation'
import type { AppConfigRecord, PlatformRelease } from '@/api/app-config.api'

const PLATFORMS: Array<{ key: 'android' | 'ios'; label: string }> = [
  { key: 'android', label: 'Android' },
  { key: 'ios', label: 'iOS' },
]

/**
 * Release gating and third-party keys.
 *
 * Release settings are per platform because Android needing a forced update
 * while an iOS build is still in App Store review is the normal case, and a
 * single shared block can't express it.
 */
export default function ReleaseSection({
  businessId,
  config,
}: {
  businessId: number
  config: AppConfigRecord
}) {
  const release = useSectionDraft(config, 'app_config')
  const integrations = useSectionDraft(config, 'integrations')
  const save = useSaveAppConfigSection(businessId)
  const reset = useResetAppConfigSection(businessId)

  if (!release.draft || !integrations.draft) return null

  const patchPlatform = (platform: 'android' | 'ios', changes: Partial<PlatformRelease>) =>
    release.setDraft({
      ...release.draft!,
      [platform]: { ...release.draft![platform], ...changes },
    })

  return (
    <div className="space-y-5">
      <SectionShell
        title="App Release"
        description="Which app versions are still allowed to run, and where to send members who need to update."
        isDirty={release.isDirty}
        isUsingDefaults={release.isUsingDefaults}
        isSaving={save.isPending}
        isResetting={reset.isPending}
        onDiscard={release.discard}
        onSave={() => save.mutate({ section: 'app_config', value: release.draft! })}
        onReset={() => reset.mutate('app_config')}
        errors={validateRelease(release.draft)}
        notice={
          <SectionNotice>
            Turning on <strong>force update</strong> blocks the app until the member installs a new
            build, so an update URL is required — the API rejects the save without one. Set each
            platform separately.
          </SectionNotice>
        }
      >
        <div className="grid gap-5 md:grid-cols-2">
          {PLATFORMS.map(({ key, label }) => {
            const platform = release.draft![key]
            return (
              <div
                key={key}
                className="space-y-3 rounded-xl p-4"
                style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(59,130,246,0.12)' }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800">{label}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Force update</span>
                    <Switch
                      checked={Boolean(platform.force_update)}
                      onCheckedChange={(next) => patchPlatform(key, { force_update: next })}
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Minimum supported" hint="Older builds are blocked.">
                    <Input
                      className="font-mono"
                      placeholder="1.0.0"
                      value={platform.min_supported_version ?? ''}
                      onChange={(e) => patchPlatform(key, { min_supported_version: e.target.value })}
                    />
                  </Field>
                  <Field label="Latest version">
                    <Input
                      className="font-mono"
                      placeholder="1.2.0"
                      value={platform.latest_version ?? ''}
                      onChange={(e) => patchPlatform(key, { latest_version: e.target.value })}
                    />
                  </Field>
                </div>

                <Field
                  label="Update URL"
                  hint={key === 'android' ? 'Play Store listing' : 'App Store listing'}
                >
                  <Input
                    placeholder="https://play.google.com/store/apps/details?id=…"
                    value={platform.update_url ?? ''}
                    onChange={(e) => patchPlatform(key, { update_url: e.target.value || null })}
                  />
                </Field>
              </div>
            )
          })}
        </div>
      </SectionShell>

      <SectionShell
        title="Integrations"
        description="Third-party keys the app itself uses at runtime."
        isDirty={integrations.isDirty}
        isUsingDefaults={integrations.isUsingDefaults}
        isSaving={save.isPending}
        isResetting={reset.isPending}
        onDiscard={integrations.discard}
        onSave={() => save.mutate({ section: 'integrations', value: integrations.draft! })}
        onReset={() => reset.mutate('integrations')}
        notice={
          <SectionNotice>
            Everything here is <strong>shipped to every member's phone in plaintext</strong>. Only
            put publishable or domain-restricted keys in these fields — never a server secret. The
            Firebase sender ID isn't here on purpose: the app derives it from the business record.
          </SectionNotice>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <TextField
            label="Maps key"
            hint="Restrict it to your app's bundle ID / SHA-1 in the provider console."
            draft={integrations.draft}
            setDraft={integrations.setDraft}
            field="maps_key"
          />
          <TextField
            label="Video service"
            hint="e.g. mux, cloudflare"
            draft={integrations.draft}
            setDraft={integrations.setDraft}
            field="video_service"
          />
          <TextField
            label="Video service key"
            hint="Publishable/player key only."
            draft={integrations.draft}
            setDraft={integrations.setDraft}
            field="video_service_key"
          />
        </div>
      </SectionShell>
    </div>
  )
}
