import { ColorField, Field, SectionShell, TextField, useSectionDraft } from './section-shell'
import {
  useResetAppConfigSection,
  useSaveAppConfigSection,
  useUploadAppConfigMedia,
  useAppConfigPreview,
} from '@/hooks/useAppConfig'
import { useState } from 'react'
import { validateTheme } from './validation'
import { PhoneMock } from './PhoneMock'
import { StagedImageField, preloadImage, useStagedImages } from './StagedImageField'
import type { AppConfigRecord, ThemeSection as ThemeShape } from '@/api/app-config.api'

const BRANDING_FIELDS = [
  {
    key: 'logo_url',
    kind: 'logo' as const,
    label: 'App logo',
    hint: 'Falls back to the business logo when empty.',
    maxSizeMb: 5,
  },
  {
    key: 'app_icon_url',
    kind: 'app_icon' as const,
    label: 'App icon',
    hint: 'Square, used on the device home screen.',
    maxSizeMb: 2,
  },
  {
    key: 'splash_logo_url',
    kind: 'logo' as const,
    label: 'Splash logo',
    hint: 'Shown on the launch screen.',
    maxSizeMb: 5,
  },
]

/** Every colour the mobile app reads, in the order it uses them. */
const THEME_TOKENS: Array<{
  key: keyof ThemeShape
  label: string
  hint?: string
}> = [
  { key: 'primaryColor', label: 'Primary' },
  { key: 'secondaryColor', label: 'Secondary' },
  { key: 'appBackground', label: 'App background' },
  { key: 'darkTextColor', label: 'Body text' },
  // Misspelled in the mobile app's contract; renaming the key would drop the
  // colour on every build already reading it.
  {
    key: 'disaleColor',
    label: 'Disabled',
    hint: 'Key is "disaleColor" — the app\'s contract, kept as-is',
  },
  { key: 'gray', label: 'Gray' },
  { key: 'gray_dark', label: 'Gray (dark)' },
]

export default function BrandingThemeSection({
  businessId,
  config,
}: {
  businessId: number
  config: AppConfigRecord
}) {
  const branding = useSectionDraft(config, 'branding')
  const theme = useSectionDraft(config, 'theme')
  const save = useSaveAppConfigSection(businessId)
  const reset = useResetAppConfigSection(businessId)
  const upload = useUploadAppConfigMedia(businessId)
  const images = useStagedImages()
  const [isPublishing, setIsPublishing] = useState(false)

  /**
   * Uploads whatever is staged, then saves the section with the resulting
   * URLs. Doing it in this order means a failed upload leaves the saved
   * configuration untouched rather than pointing at a file that never landed.
   */
  const publishBranding = async () => {
    setIsPublishing(true)
    try {
      const payload = { ...branding.draft! }
      const uploaded: string[] = []

      for (const field of BRANDING_FIELDS) {
        const pick = images.staged[field.key]
        if (!pick) continue
        const media = await upload.mutateAsync({ file: pick.file, kind: field.kind })
        ;(payload as any)[field.key] = media.url
        uploaded.push(media.url)
      }

      await save.mutateAsync({ section: 'branding', value: payload })
      // Clearing the picks swaps each local preview for its S3 URL, so warm
      // those first — otherwise the fields blank out until the fetch lands.
      await Promise.all(uploaded.map((url) => preloadImage(url)))
      images.clear()
    } catch {
      // Surfaced by the mutation's own handler; the picks stay staged so the
      // save can be retried without choosing the files again.
    } finally {
      setIsPublishing(false)
    }
  }

  // The real `/meta` payload gives the mock genuine tiles, plans and copy;
  // the unsaved drafts are layered on top so a colour shows in context the
  // moment it's typed, rather than only after a save round-trip.
  const { data: preview } = useAppConfigPreview(businessId)
  const previewApp = {
    ...((preview as any)?.data ?? {}),
    theme: theme.draft,
    branding: {
      ...branding.draft,
      logo_url: images.staged.logo_url?.previewUrl ?? branding.draft?.logo_url,
    },
  }

  if (!branding.draft || !theme.draft) return null

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        <SectionShell
          title="Branding"
          description="Images only — every colour lives under Theme, so the app has one source for style tokens."
          // A picked-but-unsaved image is an unsaved change like any other —
          // without it, choosing a logo and nothing else left Save disabled.
          isDirty={branding.isDirty || images.hasAny}
          isUsingDefaults={branding.isUsingDefaults}
          isSaving={save.isPending || isPublishing}
          isResetting={reset.isPending}
          onDiscard={() => {
            images.clear()
            branding.discard()
          }}
          onSave={publishBranding}
          onReset={() => reset.mutate('branding')}
        >
          <div className="grid gap-5 md:grid-cols-3">
            {BRANDING_FIELDS.map((field) => (
              <StagedImageField
                key={field.key}
                label={field.label}
                hint={field.hint}
                kind={field.kind}
                fieldKey={field.key}
                maxSizeMb={field.maxSizeMb}
                currentUrl={(branding.draft as any)[field.key] ?? null}
                staged={images.staged[field.key]}
                error={images.errors[field.key]}
                isPreparing={images.preparing === field.key}
                onPick={images.pick}
                onDropStaged={images.drop}
                onClearCurrent={() =>
                  branding.setDraft({ ...branding.draft!, [field.key]: null } as any)
                }
              />
            ))}
          </div>
        </SectionShell>

        <SectionShell
          title="Theme"
          description="The colour tokens the app applies verbatim as style values. Every field must be a hex code."
          isDirty={theme.isDirty}
          isUsingDefaults={theme.isUsingDefaults}
          isSaving={save.isPending}
          isResetting={reset.isPending}
          onDiscard={theme.discard}
          onSave={() => save.mutate({ section: 'theme', value: theme.draft! })}
          onReset={() => reset.mutate('theme')}
          errors={validateTheme(theme.draft)}
        >
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {THEME_TOKENS.map((token) => (
                <div key={token.key}>
                  <ColorField
                    label={token.label}
                    value={(theme.draft![token.key] as string) ?? ''}
                    onChange={(value) => theme.setDraft({ ...theme.draft!, [token.key]: value })}
                  />
                  {token.hint && <p className="text-xs text-slate-400 mt-1">{token.hint}</p>}
                </div>
              ))}
            </div>

            <TextField
              label="Font family"
              hint="Leave empty to use the app's bundled font. The font must already ship in the build."
              draft={theme.draft}
              setDraft={theme.setDraft}
              field="font_family"
              placeholder="Inter"
              className="max-w-sm"
            />
          </div>
        </SectionShell>
      </div>

      <div className="xl:sticky xl:top-4 xl:h-fit">
        <PhoneMock
          app={previewApp}
          note={
            branding.isDirty || theme.isDirty || images.hasAny
              ? 'Showing your unsaved changes — Save to publish them.'
              : undefined
          }
        />
      </div>
    </div>
  )
}
