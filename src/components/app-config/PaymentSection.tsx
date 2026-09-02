import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Field, SectionNotice, SectionShell, TextField, useSectionDraft } from './section-shell'
import { useResetAppConfigSection, useSaveAppConfigSection } from '@/hooks/useAppConfig'
import { validatePayment } from './validation'
import type { AppConfigRecord } from '@/api/app-config.api'

const SIGNUP_MODES = [
  { value: 'gym_code', label: 'Gym code', hint: 'Member types the join code at signup' },
  { value: 'invite', label: 'Invite only', hint: 'Member needs an invite from the gym' },
  { value: 'open', label: 'Open', hint: 'Anyone can sign up' },
] as const

/**
 * Currency, tax and how members join.
 *
 * Gateway credentials are deliberately absent — Razorpay/Stripe keys live on
 * the business record, and the API rejects any secret-shaped field sent
 * through this section rather than letting it reach the client payload.
 */
export default function PaymentSection({
  businessId,
  config,
}: {
  businessId: number
  config: AppConfigRecord
}) {
  const payment = useSectionDraft(config, 'payment')
  const signup = useSectionDraft(config, 'signup_flow')
  const save = useSaveAppConfigSection(businessId)
  const reset = useResetAppConfigSection(businessId)

  if (!payment.draft || !signup.draft) return null

  return (
    <div className="space-y-5">
      <SectionShell
        title="Payment"
        description="Currency and tax shown on plans and invoices in the app."
        isDirty={payment.isDirty}
        isUsingDefaults={payment.isUsingDefaults}
        isSaving={save.isPending}
        isResetting={reset.isPending}
        onDiscard={payment.discard}
        onSave={() => save.mutate({ section: 'payment', value: payment.draft! })}
        onReset={() => reset.mutate('payment')}
        errors={validatePayment(payment.draft)}
        notice={
          <SectionNotice>
            <strong>Gateway keys don't go here.</strong> Razorpay and Stripe credentials live on the
            business record — the app only ever receives the publishable key, stripped out
            server-side. Sending <code>key_id</code> or any secret through this section is rejected.
          </SectionNotice>
        }
      >
        <div className="grid gap-4 md:grid-cols-4">
          <TextField
            label="Currency code"
            hint="Three uppercase letters, e.g. INR"
            draft={payment.draft}
            setDraft={payment.setDraft}
            field="currency_code"
            placeholder="INR"
          />
          <TextField
            label="Currency symbol"
            draft={payment.draft}
            setDraft={payment.setDraft}
            field="currency_symbol"
            placeholder="₹"
          />
          <Field label="Tax percent" hint="0–100. Applied to plan prices in the app.">
            <Input
              type="number"
              min={0}
              max={100}
              value={payment.draft.tax_percent ?? 0}
              onChange={(e) =>
                payment.setDraft({ ...payment.draft!, tax_percent: Number(e.target.value) })
              }
            />
          </Field>
          <Field label="Gateway" hint="Auto-detected from the business record when left as Auto.">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={payment.draft.provider ?? ''}
              onChange={(e) =>
                payment.setDraft({
                  ...payment.draft!,
                  provider: (e.target.value || null) as typeof payment.draft.provider,
                })
              }
            >
              <option value="">Auto</option>
              <option value="razorpay">Razorpay</option>
              <option value="stripe">Stripe</option>
              <option value="none">None</option>
            </select>
          </Field>
        </div>
      </SectionShell>

      <SectionShell
        title="Signup Flow"
        description="How a new member joins this gym from the app."
        isDirty={signup.isDirty}
        isUsingDefaults={signup.isUsingDefaults}
        isSaving={save.isPending}
        isResetting={reset.isPending}
        onDiscard={signup.discard}
        onSave={() => save.mutate({ section: 'signup_flow', value: signup.draft! })}
        onReset={() => reset.mutate('signup_flow')}
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Mode">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={signup.draft.mode}
              onChange={(e) =>
                signup.setDraft({ ...signup.draft!, mode: e.target.value as typeof signup.draft.mode })
              }
            >
              {SIGNUP_MODES.map((mode) => (
                <option key={mode.value} value={mode.value}>{mode.label}</option>
              ))}
            </select>
            <p className="text-xs text-slate-400">
              {SIGNUP_MODES.find((mode) => mode.value === signup.draft!.mode)?.hint}
            </p>
          </Field>

          <TextField
            label="Gym code"
            hint="Falls back to the join code from the Gym Profile tab."
            draft={signup.draft}
            setDraft={signup.setDraft}
            field="gym_code"
            placeholder="PREMIUM01"
          />

          <Field label="Invite required" hint="Blocks self-signup even in Gym code mode.">
            <div className="flex h-10 items-center">
              <Switch
                checked={Boolean(signup.draft.invite_required)}
                onCheckedChange={(next) =>
                  signup.setDraft({ ...signup.draft!, invite_required: next })
                }
              />
            </div>
          </Field>
        </div>
      </SectionShell>
    </div>
  )
}
