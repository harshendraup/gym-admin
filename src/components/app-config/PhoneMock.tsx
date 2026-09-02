import { Smartphone } from 'lucide-react'

/**
 * The gym's home screen, drawn from a `/meta` payload.
 *
 * Shared between the Preview tab (which shows exactly what the server
 * returned) and the Branding & Theme tab (which passes the unsaved draft on
 * top), so a colour can be judged in context before it's committed rather
 * than as seven hex fields.
 */
export function PhoneMock({
  app,
  title = 'Home screen',
  note,
}: {
  app: any
  title?: string
  /** Small caption under the header — used to flag unsaved values. */
  note?: string
}) {
  const theme = app?.theme ?? {}
  const banner = app?.assets?.home_banners?.[0]

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.92) 100%)',
        border: '1px solid rgba(59,130,246,0.18)',
      }}
    >
      <div className="mb-3 flex items-center gap-2">
        <Smartphone className="h-4 w-4 text-slate-500" />
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
      </div>
      {note && <p className="-mt-2 mb-3 text-[11px] text-slate-400">{note}</p>}

      <div
        className="overflow-hidden rounded-[26px] p-4"
        style={{ background: theme.appBackground, border: '6px solid #0F172A', minHeight: 460 }}
      >
        <div className="flex items-center gap-2">
          {app?.branding?.logo_url ? (
            <img src={app.branding.logo_url} alt="" className="h-8 w-8 rounded-lg object-cover" />
          ) : (
            <div className="h-8 w-8 rounded-lg" style={{ background: theme.primaryColor }} />
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-bold" style={{ color: theme.darkTextColor }}>
              {app?.content?.app_name}
            </p>
            <p className="truncate text-[10px]" style={{ color: theme.gray_dark }}>
              {app?.gym?.tagline ?? app?.gym?.code}
            </p>
          </div>
        </div>

        <div
          className="mt-3 h-24 overflow-hidden rounded-xl"
          style={{ background: theme.secondaryColor }}
        >
          {banner ? (
            <img src={banner} alt="" className="h-full w-full object-cover" />
          ) : (
            <div
              className="flex h-full items-center justify-center text-[10px]"
              style={{ color: theme.gray_dark }}
            >
              No home banner
            </div>
          )}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {(app?.quick_access ?? [])
            .filter((tile: any) => !tile.feature_flag || app?.feature_flags?.[tile.feature_flag])
            .slice(0, 6)
            .map((tile: any) => (
              <div
                key={tile.id}
                className="rounded-xl p-2 text-center"
                style={{ background: 'rgba(255,255,255,0.85)' }}
              >
                <div className="mx-auto h-7 w-7 rounded-lg" style={{ background: tile.color }} />
                <p
                  className="mt-1 truncate text-[9px] font-semibold"
                  style={{ color: theme.darkTextColor }}
                >
                  {tile.label}
                </p>
              </div>
            ))}
        </div>

        <div className="mt-3 space-y-1.5">
          {(app?.membership?.plans ?? []).slice(0, 2).map((plan: any) => (
            <div
              key={plan.id}
              className="flex items-center justify-between rounded-xl px-3 py-2"
              style={{ background: 'rgba(255,255,255,0.85)' }}
            >
              <span className="text-[10px] font-semibold" style={{ color: theme.darkTextColor }}>
                {plan.name}
              </span>
              <span className="text-[10px] font-bold" style={{ color: theme.primaryColor }}>
                {app?.payment?.currency_symbol}
                {plan.price_amount}/{plan.billing_period}
              </span>
            </div>
          ))}
        </div>

        {/* The two states a button has, so `disaleColor` is visible too — the
            mock is the only place the disabled token can be judged. */}
        <div className="mt-3 space-y-1.5">
          <div
            className="rounded-xl py-2 text-center text-[11px] font-bold text-white"
            style={{ background: theme.primaryColor }}
          >
            {app?.content?.labels?.get_started ?? 'Get Started'}
          </div>
          <div
            className="rounded-xl py-2 text-center text-[11px] font-bold"
            style={{ background: theme.disaleColor, color: theme.gray_dark }}
          >
            {app?.content?.labels?.renew_membership ?? 'Renew Membership'}
          </div>
        </div>

        {(app?.gym?.facilities ?? []).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {app.gym.facilities.slice(0, 4).map((facility: string) => (
              <span
                key={facility}
                className="rounded-md px-1.5 py-0.5 text-[9px]"
                style={{ background: theme.gray, color: theme.darkTextColor }}
              >
                {facility}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
