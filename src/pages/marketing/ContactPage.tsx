import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Mail, Phone, MapPin, Clock, MessageCircle, Send, Loader2,
  AlertTriangle, Copy, Check, ArrowRight, LifeBuoy, Sparkles,
} from 'lucide-react'
import { MarketingNav, MarketingFooter } from '@/components/marketing/MarketingShell'
import { siteContact, contactTopics, responsePromise } from '@/data/siteContent'

const schema = z.object({
  name: z.string().min(2, 'Please enter your full name'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  gym: z.string().optional(),
  phone: z
    .string()
    .optional()
    .refine((v) => !v || v.replace(/\D/g, '').length >= 7, 'Enter a valid phone number'),
  topic: z.string().min(1, 'Pick what this is about'),
  message: z.string().min(20, 'Tell us a little more — 20 characters minimum').max(2000, 'Please keep it under 2000 characters'),
})

type FormValues = z.infer<typeof schema>

const faqs = [
  {
    q: 'I cannot sign in to the admin console.',
    a: 'Password resets are handled by your business admin. If you are the business admin — or nobody can get in — email us from the address on the account and we will verify and unlock it.',
  },
  {
    q: 'Can the platform handle more than one branch?',
    a: 'Yes. A business can hold any number of branches, each with its own manager, trainers and members, while the owner keeps a single consolidated view.',
  },
  {
    q: 'Can we migrate members from our current system?',
    a: 'Send us an export — CSV or a database dump — and we will map members, memberships and payment history before you go live.',
  },
  {
    q: 'Do members get their own app?',
    a: 'A white-label mobile app ships with the platform, branded as your gym, backed by the same plans and check-in data your staff work with.',
  },
]

export default function ContactPage() {
  const [copied, setCopied] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    mode: 'onTouched',
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', gym: '', phone: '', topic: '', message: '' },
  })

  const messageLength = watch('message')?.length ?? 0

  const copy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(key)
      setTimeout(() => setCopied(null), 1800)
    } catch {
      toast.error('Could not copy — please select the text manually.')
    }
  }

  /**
   * No /contact endpoint exists on the API yet, so the form composes the
   * enquiry and hands it to the visitor's mail client. Swap this for an
   * `api.post('/support/contact', values)` the day the endpoint lands.
   */
  const onSubmit = async (values: FormValues) => {
    const topicLabel = contactTopics.find((t) => t.value === values.topic)?.label ?? values.topic
    const body = [
      `Name: ${values.name}`,
      `Email: ${values.email}`,
      values.gym ? `Gym / business: ${values.gym}` : null,
      values.phone ? `Phone: ${values.phone}` : null,
      `Topic: ${topicLabel}`,
      '',
      values.message,
    ]
      .filter(Boolean)
      .join('\n')

    const href =
      `mailto:${siteContact.supportEmail}` +
      `?subject=${encodeURIComponent(`[${topicLabel}] ${values.name}`)}` +
      `&body=${encodeURIComponent(body)}`

    window.location.href = href
    setSent(true)
    toast.success('Opening your email app with the message ready to send.')
    reset()
  }

  const channels = [
    {
      icon: Mail,
      label: 'Email us',
      value: siteContact.supportEmail,
      href: `mailto:${siteContact.supportEmail}`,
      note: `First reply ${responsePromise.first}`,
      copyKey: 'email',
      accent: '#3B82F6',
    },
    {
      icon: Phone,
      label: 'Call us',
      value: siteContact.phone,
      href: siteContact.phoneHref,
      note: 'Mon–Fri, 9:00 AM – 7:00 PM IST',
      copyKey: 'phone',
      accent: '#BF7335',
    },
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      value: siteContact.whatsapp,
      href: siteContact.whatsappHref,
      note: 'Fastest for quick operational questions',
      copyKey: 'whatsapp',
      accent: '#22C55E',
    },
  ]

  return (
    <div className="min-h-screen text-white" style={{ background: '#0B0F1A' }}>
      <MarketingNav />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20">
        <div className="absolute inset-0" aria-hidden>
          <img src="/images/hero-gym.jpeg" alt="" className="h-full w-full object-cover" style={{ animation: 'kenburns 22s ease-out both' }} />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, rgba(11,15,26,0.84) 0%, rgba(11,15,26,0.92) 55%, #0B0F1A 100%)' }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 25% 15%, rgba(59,130,246,0.3) 0%, transparent 55%)',
              animation: 'auroraDrift 20s ease-in-out infinite',
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold animate-fade-in"
            style={{ background: 'rgba(191,115,53,0.28)', color: '#F3DDC6', backdropFilter: 'blur(8px)' }}
          >
            <LifeBuoy className="h-3.5 w-3.5" />
            We reply {responsePromise.first}
          </div>
          <h1 className="mt-6 max-w-3xl text-4xl sm:text-5xl lg:text-[3.4rem] font-bold leading-[1.1] animate-fade-in-up">
            Talk to a human who knows gyms.
          </h1>
          <p className="mt-6 max-w-2xl text-base sm:text-lg leading-8 animate-fade-in-up stagger-2" style={{ color: '#C9D3DF' }}>
            Onboarding a new location, chasing a bug, or just want to see the console against your own
            numbers — pick whichever channel suits you.
          </p>
        </div>
      </section>

      {/* ── Channel cards ─────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 -mt-4">
        <div className="grid gap-4 sm:grid-cols-3">
          {channels.map((c) => (
            <div
              key={c.label}
              className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover-lift"
              style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: `linear-gradient(90deg, ${c.accent}, transparent)` }} />
              <div className="flex items-start justify-between">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${c.accent}26` }}
                >
                  <c.icon className="h-5 w-5" style={{ color: c.accent }} />
                </div>
                <button
                  type="button"
                  onClick={() => copy(c.value, c.copyKey)}
                  aria-label={`Copy ${c.label}`}
                  className="rounded-lg p-2 transition-colors"
                  style={{ color: copied === c.copyKey ? '#22C55E' : '#6B7787' }}
                >
                  {copied === c.copyKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <h3 className="mt-4 text-[13px] font-semibold uppercase tracking-wider" style={{ color: '#8A93A3' }}>
                {c.label}
              </h3>
              <a
                href={c.href}
                target={c.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer noopener"
                className="mt-1.5 block text-lg font-semibold transition-colors hover:opacity-80"
              >
                {c.value}
              </a>
              <p className="mt-2 text-xs leading-5" style={{ color: '#7C8798' }}>{c.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Form + details ────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 py-20 sm:py-24">
        <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr]">
          {/* Form */}
          <div
            className="rounded-3xl p-7 sm:p-10"
            style={{
              background:
                'linear-gradient(148deg, rgba(191,115,53,0.09) 0%, rgba(191,115,53,0.03) 38%, transparent 68%), rgba(14,19,32,0.72)',
              backdropFilter: 'blur(44px) saturate(190%)',
              WebkitBackdropFilter: 'blur(44px) saturate(190%)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 32px 90px rgba(0,0,0,0.45)',
            }}
          >
            <h2 className="text-2xl font-bold">Send us a message</h2>
            <p className="mt-2 text-sm leading-6" style={{ color: '#93A0B4' }}>
              Fill this in and we will open your email app with everything already written out — no
              account, no sign-up.
            </p>

            {sent && (
              <div
                className="mt-6 flex items-start gap-3 rounded-xl p-4 text-sm animate-fade-in"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#86EFAC' }}
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  Your email app should be open with the message drafted. If nothing happened, write to{' '}
                  <a href={`mailto:${siteContact.supportEmail}`} className="underline underline-offset-2">
                    {siteContact.supportEmail}
                  </a>{' '}
                  directly.
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5" noValidate>
              <div className="grid gap-5 sm:grid-cols-2">
                <ContactField label="Full name" error={errors.name?.message} required>
                  {(cls, style) => (
                    <input className={cls} style={style} placeholder="Priya Sharma" autoComplete="name" {...register('name')} />
                  )}
                </ContactField>

                <ContactField label="Work email" error={errors.email?.message} required>
                  {(cls, style) => (
                    <input className={cls} style={style} type="email" placeholder="you@yourgym.com" autoComplete="email" {...register('email')} />
                  )}
                </ContactField>

                <ContactField label="Gym / business" error={errors.gym?.message} hint="Optional">
                  {(cls, style) => (
                    <input className={cls} style={style} placeholder="Iron House Fitness" autoComplete="organization" {...register('gym')} />
                  )}
                </ContactField>

                <ContactField label="Phone" error={errors.phone?.message} hint="Optional">
                  {(cls, style) => (
                    <input className={cls} style={style} type="tel" placeholder="+91 98765 43210" autoComplete="tel" {...register('phone')} />
                  )}
                </ContactField>
              </div>

              <ContactField label="What is this about?" error={errors.topic?.message} required>
                {(cls, style) => (
                  <select className={`${cls} cursor-pointer`} style={style} defaultValue="" {...register('topic')}>
                    <option value="" disabled style={{ background: '#0F1524' }}>
                      Choose a topic…
                    </option>
                    {contactTopics.map((t) => (
                      <option key={t.value} value={t.value} style={{ background: '#0F1524' }}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                )}
              </ContactField>

              <ContactField
                label="Message"
                error={errors.message?.message}
                required
                hint={`${messageLength}/2000`}
              >
                {(cls, style) => (
                  <textarea
                    rows={6}
                    className={`${cls} resize-y leading-7`}
                    style={style}
                    placeholder="Tell us how many branches you run, what you use today, and what you would like to fix."
                    {...register('message')}
                  />
                )}
              </ContactField>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full overflow-hidden rounded-xl py-3.5 text-[15px] font-semibold text-white transition-all duration-200 disabled:opacity-70 sm:w-auto sm:px-8"
                style={{
                  background: 'linear-gradient(135deg, #8B1E3F 0%, #A04D3A 100%)',
                  boxShadow: '0 10px 30px rgba(139,30,63,0.38)',
                }}
                onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <span
                  className="pointer-events-none absolute inset-0 -translate-x-full transition-transform duration-700 group-hover:translate-x-full"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)' }}
                />
                <span className="relative flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {isSubmitting ? 'Preparing…' : 'Send message'}
                </span>
              </button>

              <p className="text-xs leading-6" style={{ color: '#6B7787' }}>
                We only use what you send here to answer your enquiry.
              </p>
            </form>
          </div>

          {/* Details column */}
          <div className="space-y-5">
            <div
              className="rounded-2xl p-7"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4" style={{ color: '#E7A66C' }} />
                <h3 className="text-[13px] font-semibold uppercase tracking-wider" style={{ color: '#8A93A3' }}>
                  Office
                </h3>
              </div>
              <address className="mt-4 not-italic text-sm leading-7" style={{ color: '#C9D3DF' }}>
                {siteContact.address.line1}<br />
                {siteContact.address.line2}<br />
                {siteContact.address.city}<br />
                {siteContact.address.country}
              </address>
            </div>

            <div
              className="rounded-2xl p-7"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4" style={{ color: '#E7A66C' }} />
                <h3 className="text-[13px] font-semibold uppercase tracking-wider" style={{ color: '#8A93A3' }}>
                  Support hours
                </h3>
              </div>
              <ul className="mt-4 space-y-3 text-sm">
                {siteContact.hours.map((h) => (
                  <li key={h.days} className="flex items-baseline justify-between gap-4">
                    <span style={{ color: '#C9D3DF' }}>{h.days}</span>
                    <span className="text-right text-[13px]" style={{ color: '#8A93A3' }}>{h.time}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs leading-6" style={{ color: '#7C8798' }}>
                Critical issues are targeted for {responsePromise.resolution}.
              </p>
            </div>

            <div
              className="relative overflow-hidden rounded-2xl p-7"
              style={{
                background: 'linear-gradient(135deg, rgba(139,30,63,0.34) 0%, rgba(59,130,246,0.18) 100%)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <Sparkles className="h-5 w-5" style={{ color: '#F3DDC6' }} />
              <h3 className="mt-4 text-lg font-semibold">Already a customer?</h3>
              <p className="mt-2 text-sm leading-6" style={{ color: '#D7DEE8' }}>
                Sign in and raise it from inside your console — we will already have your branch context.
              </p>
              <a
                href="/auth/login"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold"
                style={{ color: '#F3DDC6' }}
              >
                Go to sign in
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 pb-24" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <h2 className="pt-20 text-2xl sm:text-3xl font-bold">Before you write in.</h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-7" style={{ color: '#C9D3DF' }}>
          The four questions we get most often.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl p-6 transition-all duration-300"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                {f.q}
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-lg leading-none transition-transform duration-300 group-open:rotate-45"
                  style={{ background: 'rgba(191,115,53,0.2)', color: '#E7A66C' }}
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-7" style={{ color: '#A6B0C0' }}>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   ContactField — label + focus ring + error slot, shared by every control on
   the form so inputs, selects and the textarea all behave identically.
───────────────────────────────────────────────────────────────────────────── */
function ContactField({
  label,
  error,
  hint,
  required,
  children,
}: {
  label: string
  error?: string
  hint?: string
  required?: boolean
  children: (cls: string, style: React.CSSProperties) => React.ReactNode
}) {
  const [focused, setFocused] = useState(false)

  const cls =
    'w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition-all duration-200 placeholder:text-[#5A6474]'
  const style: React.CSSProperties = {
    background: focused ? 'rgba(191,115,53,0.10)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${error ? 'rgba(239,68,68,0.55)' : focused ? 'rgba(191,115,53,0.68)' : 'rgba(255,255,255,0.10)'}`,
    boxShadow: error
      ? '0 0 0 3px rgba(239,68,68,0.14)'
      : focused
        ? '0 0 0 3px rgba(191,115,53,0.16)'
        : 'none',
  }

  return (
    <div className="space-y-1.5" onFocusCapture={() => setFocused(true)} onBlurCapture={() => setFocused(false)}>
      <div className="flex items-baseline justify-between gap-3">
        <label className="block text-[12.5px] font-medium tracking-wide" style={{ color: error ? '#F0A5A5' : '#B9C2D0' }}>
          {label}
          {required && <span style={{ color: '#BF7335' }}> *</span>}
        </label>
        {hint && <span className="text-[11px]" style={{ color: '#6B7787' }}>{hint}</span>}
      </div>
      {children(cls, style)}
      {error && (
        <p className="flex items-center gap-1.5 text-[11.5px] animate-fade-in" style={{ color: '#F87171' }}>
          <AlertTriangle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}
