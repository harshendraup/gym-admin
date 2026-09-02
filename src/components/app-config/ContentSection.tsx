import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field, SectionShell, TextField, useSectionDraft } from './section-shell'
import {
  useResetAppConfigSection,
  useSaveAppConfigSection,
  useUploadAppConfigMedia,
} from '@/hooks/useAppConfig'
import { validateContent } from './validation'
import { StagedImageField, preloadImage, useStagedImages } from './StagedImageField'
import type { AppConfigRecord } from '@/api/app-config.api'

/**
 * Every string the app renders that isn't data: splash and welcome copy,
 * onboarding slides, legal links, support details and button labels.
 */
export default function ContentSection({
  businessId,
  config,
}: {
  businessId: number
  config: AppConfigRecord
}) {
  const { draft, setDraft, discard, isDirty, isUsingDefaults } = useSectionDraft(config, 'content')
  const save = useSaveAppConfigSection(businessId)
  const reset = useResetAppConfigSection(businessId)
  const upload = useUploadAppConfigMedia(businessId)
  const images = useStagedImages()
  const [isPublishing, setIsPublishing] = useState(false)

  const slideKey = (index: number) => `slide-${index}`

  /**
   * Uploads the slide artwork that's still local, writes the resulting URLs
   * into their slides, then saves. Upload-first means a failure leaves the
   * saved content pointing at what it already had.
   */
  const publishContent = async () => {
    setIsPublishing(true)
    try {
      const slides = [...(draft!.intro_slides ?? [])]
      const uploaded: string[] = []

      for (const [key, pick] of Object.entries(images.staged)) {
        const index = Number(key.replace('slide-', ''))
        if (!slides[index]) continue
        const media = await upload.mutateAsync({ file: pick.file, kind: 'intro_slide' })
        slides[index] = { ...slides[index], image: media.url }
        uploaded.push(media.url)
      }

      await save.mutateAsync({ section: 'content', value: { ...draft!, intro_slides: slides } })
      // Warm the new URLs before the local previews are dropped, or each
      // slide blanks out for the length of its first fetch.
      await Promise.all(uploaded.map((url) => preloadImage(url)))
      images.clear()
    } catch {
      // Surfaced by the mutation; picks stay staged so Save can be retried.
    } finally {
      setIsPublishing(false)
    }
  }

  if (!draft) return null

  const labelKeys = Object.keys(draft.labels ?? {})

  return (
    <SectionShell
      title="Content"
      description="Splash and welcome copy, onboarding slides, legal links, support details and button labels."
      isDirty={isDirty || images.hasAny}
      isUsingDefaults={isUsingDefaults}
      isSaving={save.isPending || isPublishing}
      isResetting={reset.isPending}
      onDiscard={() => {
        images.clear()
        discard()
      }}
      onSave={publishContent}
      onReset={() => reset.mutate('content')}
      errors={validateContent(draft)}
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="App name"
            hint="Falls back to the business name when empty."
            draft={draft}
            setDraft={setDraft}
            field="app_name"
            placeholder="Premium Fitness"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Splash title" hint="Use a line break for a two-line title.">
            <Textarea
              rows={2}
              value={draft.splash_title ?? ''}
              onChange={(e) => setDraft({ ...draft, splash_title: e.target.value || null })}
            />
          </Field>
          <TextField
            label="Splash subtitle"
            draft={draft}
            setDraft={setDraft}
            field="splash_subtitle"
          />
          <Field label="Welcome title">
            <Textarea
              rows={2}
              value={draft.welcome_title ?? ''}
              onChange={(e) => setDraft({ ...draft, welcome_title: e.target.value || null })}
            />
          </Field>
          <TextField
            label="Welcome subtitle"
            draft={draft}
            setDraft={setDraft}
            field="welcome_subtitle"
          />
        </div>

        <Field label="About us" hint="Falls back to the gym description from the Gym Profile tab.">
          <Textarea
            rows={3}
            value={draft.about_us ?? ''}
            onChange={(e) => setDraft({ ...draft, about_us: e.target.value || null })}
          />
        </Field>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Onboarding slides</p>
              <p className="text-xs text-slate-400">
                Up to 10, shown in this order on first launch.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={(draft.intro_slides ?? []).length >= 10}
              onClick={() =>
                setDraft({
                  ...draft,
                  intro_slides: [
                    ...(draft.intro_slides ?? []),
                    { image: null, title: '', subtitle: '' },
                  ],
                })
              }
            >
              <Plus className="mr-1 h-3.5 w-3.5" /> Add slide
            </Button>
          </div>

          <div className="space-y-3">
            {(draft.intro_slides ?? []).map((slide, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-xl p-3 md:grid-cols-[220px_1fr_auto]"
                style={{
                  background: 'rgba(255,255,255,0.7)',
                  border: '1px solid rgba(59,130,246,0.12)',
                }}
              >
                <StagedImageField
                  label={`Slide ${index + 1} image`}
                  kind="intro_slide"
                  fieldKey={slideKey(index)}
                  currentUrl={slide.image ?? null}
                  staged={images.staged[slideKey(index)]}
                  error={images.errors[slideKey(index)]}
                  isPreparing={images.preparing === slideKey(index)}
                  onPick={images.pick}
                  onDropStaged={images.drop}
                  onClearCurrent={() => {
                    const next = [...(draft.intro_slides ?? [])]
                    next[index] = { ...slide, image: null }
                    setDraft({ ...draft, intro_slides: next })
                  }}
                />
                <div className="space-y-2">
                  <Input
                    value={slide.title}
                    placeholder="FREE WEIGHT ZONE"
                    onChange={(e) => {
                      const next = [...draft.intro_slides]
                      next[index] = { ...slide, title: e.target.value }
                      setDraft({ ...draft, intro_slides: next })
                    }}
                  />
                  <Textarea
                    rows={2}
                    value={slide.subtitle}
                    placeholder="Build strength and power in our dedicated free weight zone."
                    onChange={(e) => {
                      const next = [...draft.intro_slides]
                      next[index] = { ...slide, subtitle: e.target.value }
                      setDraft({ ...draft, intro_slides: next })
                    }}
                  />
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50 self-start"
                  onClick={() => {
                    // Pending picks are keyed by position, so they shift too.
                    images.remap((key) => {
                      const at = Number(key.replace('slide-', ''))
                      if (at === index) return null
                      return at > index ? slideKey(at - 1) : key
                    })
                    setDraft({
                      ...draft,
                      intro_slides: (draft.intro_slides ?? []).filter((_, i) => i !== index),
                    })
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <TextField
            label="Terms URL"
            draft={draft}
            setDraft={setDraft}
            field="terms_url"
            placeholder="https://…/terms"
          />
          <TextField
            label="Privacy URL"
            draft={draft}
            setDraft={setDraft}
            field="privacy_url"
            placeholder="https://…/privacy"
          />
          <TextField
            label="Help URL"
            draft={draft}
            setDraft={setDraft}
            field="help_url"
            placeholder="https://…/contact"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Support phone" hint="Falls back to the business phone number.">
            <Input
              value={draft.support?.phone ?? ''}
              onChange={(e) =>
                setDraft({ ...draft, support: { ...draft.support, phone: e.target.value || null } })
              }
            />
          </Field>
          <Field label="Support email" hint="Falls back to the business email.">
            <Input
              type="email"
              value={draft.support?.email ?? ''}
              onChange={(e) =>
                setDraft({ ...draft, support: { ...draft.support, email: e.target.value || null } })
              }
            />
          </Field>
          <Field label="Support hours">
            <Input
              value={draft.support?.hours ?? ''}
              placeholder="Mon-Sat, 9am-7pm"
              onChange={(e) =>
                setDraft({ ...draft, support: { ...draft.support, hours: e.target.value || null } })
              }
            />
          </Field>
        </div>

        {/* Fixed key set — the app looks each label up by name, so adding a
            new key here would have nothing reading it. */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Button labels</p>
          <div className="grid gap-3 md:grid-cols-2">
            {labelKeys.map((key) => (
              <Field key={key} label={key.replace(/_/g, ' ')}>
                <Input
                  value={draft.labels[key] ?? ''}
                  onChange={(e) =>
                    setDraft({ ...draft, labels: { ...draft.labels, [key]: e.target.value } })
                  }
                />
              </Field>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  )
}
