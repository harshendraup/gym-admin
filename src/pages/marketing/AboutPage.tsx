import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles, ArrowRight, Building2, Users, Dumbbell, Salad,
  BarChart3, ShieldCheck, Smartphone, Layers, MapPin, ChevronRight,
} from 'lucide-react'
import { MarketingNav, MarketingFooter } from '@/components/marketing/MarketingShell'
import {
  aboutStats, aboutPrinciples, aboutTimeline, aboutCities, aboutWhyUs, siteContact,
} from '@/data/siteContent'

/** Reveals children once they scroll into view — used for the section stagger. */
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setShown(true); io.disconnect() } },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'translateY(0)' : 'translateY(22px)',
        transition: `opacity 700ms cubic-bezier(0.4,0,0.2,1) ${delay}ms, transform 700ms cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

/**
 * Counts up to `to` the first time it scrolls into view, then stops.
 *
 * A number that animates is read; a number that is simply printed is skimmed
 * past — and these two are the whole point of the section they sit in.
 */
function CountUp({ to, duration = 1100 }: { to: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [value, setValue] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let frame = 0
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        const start = performance.now()
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1)
          // Ease-out: the number decelerates into its final value instead of
          // stopping dead, which is what makes it read as a count rather than
          // a flicker.
          setValue(Math.round(to * (1 - Math.pow(1 - progress, 3))))
          if (progress < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
      },
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [to, duration])

  return <span ref={ref}>{value}</span>
}

/**
 * The notch: a diagonal cut out of the bottom-left corner, which is what
 * gives these cards their shape.
 *
 * `clip-path` squares off the remaining corners — a rounded polygon would
 * need dozens of points — so these cards are deliberately sharp-cornered
 * while the rest of the site is rounded. That is the trade for the notch,
 * and it reads as a deliberate accent rather than an inconsistency because
 * every card in the block shares it.
 */
const NOTCH = 'polygon(0 0, 100% 0, 100% 100%, 46px 100%, 0 calc(100% - 46px))'

/** Photo card: image fill, gradient scrim, copy pinned to the bottom. */
function WhyCard({ item }: { item: (typeof aboutWhyUs)[number] }) {
  return (
    <Link
      to={item.href}
      className="group relative block h-full min-h-[260px] overflow-hidden"
      style={{ clipPath: NOTCH, background: '#111726' }}
    >
      <img
        src={item.image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
      />
      {/* Two stops, not one: the copy needs near-solid ground under it while
          the top of the photo stays legible as a photo. */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, rgba(11,15,26,0.12) 25%, rgba(11,15,26,0.72) 62%, rgba(11,15,26,0.94) 100%)' }}
      />
      <div className="relative flex h-full flex-col justify-end p-6 sm:p-7">
        <h3 className="text-xl sm:text-2xl font-bold leading-tight text-white drop-shadow">
          {item.title}
        </h3>
        <p className="mt-2.5 max-w-md text-sm leading-6" style={{ color: '#D7DEE8' }}>
          {item.body}
        </p>
        <span
          className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold transition-colors duration-200"
          style={{ color: '#E7A66C' }}
        >
          {item.cta}
          <ChevronRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  )
}

/** Distinct states/UTs across the city list — derived so it can never drift. */
const REGION_COUNT = new Set(aboutCities.map((entry) => entry.region)).size

/**
 * The three things a gym actually gets, named the way its own people would
 * name them. The platform's internal tiers are deliberately not on this page:
 * a prospective owner reading about a role that sits above their own reads it
 * as someone else holding the keys to their business.
 */
const surfaces = [
  {
    icon: Building2,
    title: 'For the business owner',
    scope: 'Every branch, side by side',
    body: 'Revenue, retention and headcount across the whole business in one view — open a branch, add a plan or compare two locations without leaving the screen.',
    color: '#3B82F6',
  },
  {
    icon: Layers,
    title: 'For the gym manager',
    scope: 'One branch, end to end',
    body: 'The day-to-day console: sign members up, take payments, mark attendance, assign trainers and keep plans current — scoped to their branch and nothing beyond it.',
    color: '#BF7335',
  },
  {
    icon: Smartphone,
    title: 'For the member',
    scope: 'A mobile app, in your brand',
    body: 'Their plan, workouts, diet, attendance and payment history in an app that carries the gym’s name and colours — not ours.',
    color: '#22C55E',
  },
]

const capabilities = [
  { icon: Users, title: 'Member lifecycle', body: 'Sign-up, onboarding, attendance, renewal and churn signals in one profile.' },
  { icon: Layers, title: 'Memberships & plans', body: 'Flexible tiers, billing cycles and upgrades that survive real-world edge cases.' },
  { icon: Dumbbell, title: 'Training programs', body: 'Build once, assign at scale, and track how each member actually performs.' },
  { icon: Salad, title: 'Diet & nutrition', body: 'Food libraries, assessments and per-member plans coaches can adjust weekly.' },
  { icon: BarChart3, title: 'Analytics', body: 'Retention, revenue and engagement — sliced by branch, plan or trainer.' },
  { icon: Smartphone, title: 'White-label mobile app', body: 'Members get the gym’s brand in their pocket, backed by the same data.' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen text-white" style={{ background: '#0B0F1A' }}>
      <MarketingNav />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="absolute inset-0" aria-hidden>
          <img
            src="/images/hero-ai.jpeg"
            alt=""
            className="h-full w-full object-cover"
            style={{ animation: 'kenburns 20s ease-out both' }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, rgba(11,15,26,0.82) 0%, rgba(11,15,26,0.9) 60%, #0B0F1A 100%)' }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 75% 20%, rgba(139,30,63,0.42) 0%, transparent 55%)',
              animation: 'auroraDrift 18s ease-in-out infinite',
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10">
          <Reveal>
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: 'rgba(191,115,53,0.28)', color: '#F3DDC6', backdropFilter: 'blur(8px)' }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              About {siteContact.brand}
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-6 max-w-3xl text-4xl sm:text-5xl lg:text-[3.4rem] font-bold leading-[1.1]">
              We build the console gym owners actually run their business from.
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 max-w-2xl text-base sm:text-lg leading-8" style={{ color: '#C9D3DF' }}>
              {siteContact.brand} replaces the spreadsheet, the paper register and the three half-used apps
              with one role-aware platform — memberships, coaching, payments and analytics, across every
              branch you operate.
            </p>
          </Reveal>

          {/* Stats strip */}
          <Reveal delay={240}>
            <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4">
              {aboutStats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl p-5 hover-lift"
                  style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <div className="text-3xl font-bold" style={{ color: '#E7A66C' }}>
                    {s.value}<span className="text-xl">{s.suffix}</span>
                  </div>
                  <div className="mt-1.5 text-sm font-semibold">{s.label}</div>
                  <div className="mt-1 text-xs leading-5" style={{ color: '#8A93A3' }}>{s.hint}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Where we operate ──────────────────────────────────── */}
      <section
        className="relative z-10 overflow-hidden py-20 sm:py-24"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background: 'radial-gradient(circle at 82% 30%, rgba(191,115,53,0.22) 0%, transparent 58%)',
            animation: 'auroraDrift 20s ease-in-out infinite',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 sm:px-10">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center">
            {/* Claim + the two numbers behind it */}
            <div>
              <Reveal>
                <div
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ background: 'rgba(34,197,94,0.16)', color: '#86EFAC' }}
                >
                  <span className="relative flex h-2 w-2">
                    {/* Tailwind's ping: scale + fade outward. floatY would
                        bob it up and down, which reads as decoration, not as
                        a live indicator. */}
                    <span
                      className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                      style={{ background: '#22C55E' }}
                    />
                    <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: '#22C55E' }} />
                  </span>
                  Live across India
                </div>
              </Reveal>

              <Reveal delay={80}>
                <h2 className="mt-6 text-2xl sm:text-3xl lg:text-[2.4rem] font-bold leading-[1.15]">
                  Gyms in {aboutCities.length} cities already run on {siteContact.brand}.
                </h2>
              </Reveal>

              <Reveal delay={160}>
                <p className="mt-4 max-w-xl text-[15px] leading-7" style={{ color: '#C9D3DF' }}>
                  From a single studio in Jaipur to multi-branch operators in Mumbai and Bangalore —
                  the same console runs them all. Different cities, different scales, one platform
                  that has already been proven on the floor.
                </p>
              </Reveal>

              <Reveal delay={240}>
                <div className="mt-9 flex flex-wrap gap-4">
                  {[
                    { value: aboutCities.length, label: 'Cities served' },
                    { value: REGION_COUNT, label: 'States & UTs' },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="flex-1 min-w-[150px] rounded-2xl px-5 py-4"
                      style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <div className="text-4xl font-bold" style={{ color: '#E7A66C' }}>
                        <CountUp to={stat.value} />
                      </div>
                      <div className="mt-1 text-sm font-semibold">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            {/* The cities themselves */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {aboutCities.map((entry, i) => (
                <Reveal key={entry.city} delay={i * 55}>
                  <div
                    className="group relative h-full overflow-hidden rounded-2xl px-4 py-4 hover-lift transition-all duration-300"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(191,115,53,0.1)'
                      e.currentTarget.style.borderColor = 'rgba(191,115,53,0.4)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                    }}
                  >
                    <MapPin
                      className="h-4 w-4 transition-transform duration-300 group-hover:scale-125"
                      style={{ color: '#E7A66C' }}
                    />
                    <div className="mt-2.5 text-[15px] font-semibold leading-tight">{entry.city}</div>
                    <div className="mt-1 text-[11px] leading-4" style={{ color: '#8A93A3' }}>
                      {entry.region}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        {/* Ticker — full-bleed, so the reach reads as motion before it is read
            as a list. Pauses on hover so a name can actually be caught. */}
        <Reveal delay={200}>
          <div
            className="relative mt-14 overflow-hidden py-4"
            style={{
              borderTop: '1px solid rgba(255,255,255,0.08)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              maskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
              WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
            }}
          >
            <div className="marquee-track flex w-max items-center gap-8">
              {/* Rendered twice: the track shifts by exactly -50%, so the
                  second copy is already in place when the first scrolls out. */}
              {[...aboutCities, ...aboutCities].map((entry, i) => (
                <div key={`${entry.city}-${i}`} className="flex items-center gap-8">
                  <span
                    className="text-lg sm:text-xl font-bold uppercase tracking-wider"
                    style={{ color: i % 2 === 0 ? '#E7A66C' : '#6B7686' }}
                  >
                    {entry.city}
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'rgba(191,115,53,0.5)' }} />
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Principles ────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 py-20 sm:py-24" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <Reveal>
          <h2 className="max-w-2xl text-2xl sm:text-3xl font-bold">What the platform is built around.</h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-7" style={{ color: '#C9D3DF' }}>
            Four decisions shaped everything else — they are the reason the product looks the way it does.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {aboutPrinciples.map((p, i) => (
            <Reveal key={p.title} delay={i * 70}>
              <div
                className="group h-full rounded-2xl p-7 transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(191,115,53,0.08)'
                  e.currentTarget.style.borderColor = 'rgba(191,115,53,0.32)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                }}
              >
                <div
                  className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold"
                  style={{ background: 'rgba(191,115,53,0.2)', color: '#E7A66C' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="text-lg font-semibold">{p.title}</h3>
                <p className="mt-2.5 text-sm leading-7" style={{ color: '#A6B0C0' }}>{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Why choose us ─────────────────────────────────────── */}
      <section
        className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 py-20 sm:py-24"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-[2.4rem] font-bold leading-[1.15]">
              Why choose {siteContact.brand}?
            </h2>
            <p className="mt-4 text-[15px] sm:text-base leading-7" style={{ color: '#C9D3DF' }}>
              Memberships, coaching, payments, analytics and a branded member app — the whole gym
              in one platform, not five tools that never quite agree with each other.
            </p>
          </div>
        </Reveal>

        {/*
          Bento: the headline card holds the full height of the right-hand
          column on desktop, with the four supporting cards stacked beside it.
          Fixed auto-rows are what make the tall card exactly two rows high
          instead of whatever its own copy happens to need.
        */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:auto-rows-[268px]">
          {aboutWhyUs.map((item, i) => (
            <Reveal
              key={item.id}
              delay={i * 80}
              className={item.span === 'large' ? 'sm:col-span-2 lg:col-span-1 lg:row-span-2' : ''}
            >
              <WhyCard item={item} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Three surfaces ────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 py-20 sm:py-24" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <Reveal>
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: 'rgba(59,130,246,0.18)', color: '#93C5FD' }}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Built around who is using it
          </div>
          <h2 className="mt-4 max-w-2xl text-2xl sm:text-3xl font-bold">Three ways in, one set of numbers.</h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-7" style={{ color: '#C9D3DF' }}>
            An owner, a manager and a member want completely different things from the same data —
            so each gets their own way in, and nobody has to learn a screen built for somebody else.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {surfaces.map((surface, i) => (
            <Reveal key={surface.title} delay={i * 80}>
              <div
                className="relative h-full overflow-hidden rounded-2xl p-7 hover-lift transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${surface.color}66` }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
              >
                <div
                  className="absolute inset-x-0 top-0 h-[3px]"
                  style={{ background: `linear-gradient(90deg, ${surface.color}, transparent)` }}
                />
                <div
                  className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ background: `${surface.color}26` }}
                >
                  <surface.icon className="h-5 w-5" style={{ color: surface.color }} />
                </div>
                <h3 className="text-[17px] font-semibold">{surface.title}</h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider" style={{ color: surface.color }}>
                  {surface.scope}
                </p>
                <p className="mt-3 text-sm leading-7" style={{ color: '#A6B0C0' }}>{surface.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Timeline ──────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 py-20 sm:py-24" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <Reveal>
          <h2 className="max-w-2xl text-2xl sm:text-3xl font-bold">How we got here.</h2>
        </Reveal>

        <div className="relative mt-12 pl-8 sm:pl-0">
          {/* Spine */}
          <div
            className="absolute left-[7px] sm:left-1/2 top-2 bottom-2 w-px sm:-translate-x-1/2"
            style={{ background: 'linear-gradient(180deg, rgba(191,115,53,0.5), rgba(191,115,53,0.06))' }}
          />
          <div className="space-y-10 sm:space-y-14">
            {aboutTimeline.map((t, i) => (
              <Reveal key={t.period} delay={i * 60}>
                <div className={`relative sm:grid sm:grid-cols-2 sm:gap-12 ${i % 2 === 1 ? 'sm:[&>*]:col-start-2' : ''}`}>
                  {/* Node */}
                  <span
                    className="absolute -left-8 top-1.5 h-3.5 w-3.5 rounded-full sm:left-1/2 sm:-translate-x-1/2"
                    style={{ background: '#BF7335', boxShadow: '0 0 0 5px rgba(191,115,53,0.16)' }}
                  />
                  <div className={i % 2 === 1 ? 'sm:pl-4' : 'sm:pr-4 sm:text-right'}>
                    <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#E7A66C' }}>
                      {t.period}
                    </div>
                    <h3 className="mt-2 text-lg font-semibold">{t.title}</h3>
                    <p className="mt-2 text-sm leading-7" style={{ color: '#A6B0C0' }}>{t.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Capabilities ──────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 py-20 sm:py-24" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <Reveal>
          <h2 className="max-w-2xl text-2xl sm:text-3xl font-bold">What lives inside the console.</h2>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c, i) => (
            <Reveal key={c.title} delay={i * 60}>
              <div
                className="h-full rounded-2xl p-6 hover-lift"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: 'rgba(191,115,53,0.2)' }}
                >
                  <c.icon className="h-5 w-5" style={{ color: '#E7A66C' }} />
                </div>
                <h3 className="font-semibold text-[15px]">{c.title}</h3>
                <p className="mt-1.5 text-sm leading-6" style={{ color: '#A6B0C0' }}>{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 pb-24">
        <Reveal>
          <div
            className="relative overflow-hidden rounded-3xl p-10 sm:p-14 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(139,30,63,0.38) 0%, rgba(59,130,246,0.2) 100%)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <div
              className="pointer-events-none absolute inset-0"
              aria-hidden
              style={{
                background: 'radial-gradient(circle at 20% 120%, rgba(191,115,53,0.35) 0%, transparent 55%)',
                animation: 'auroraDrift 16s ease-in-out infinite',
              }}
            />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold">Want to see it against your own numbers?</h2>
              <p className="mt-3 text-[15px]" style={{ color: '#D7DEE8' }}>
                Tell us how many branches you run and we will walk you through the console that fits.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-[15px] font-semibold transition-transform duration-200 hover:scale-[1.03]"
                  style={{ background: 'linear-gradient(135deg, #8B1E3F 0%, #A04D3A 100%)', boxShadow: '0 8px 22px rgba(139,30,63,0.4)' }}
                >
                  Talk to us
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/auth/login"
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-[15px] font-semibold transition-colors duration-200"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.16)' }}
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <MarketingFooter />
    </div>
  )
}
