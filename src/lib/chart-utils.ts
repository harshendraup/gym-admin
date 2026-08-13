import { format, isSameMonth, parseISO, startOfMonth, subMonths } from 'date-fns'

/**
 * Buckets a list of ISO timestamps into month-over-month counts, covering
 * the last `monthsBack` months (oldest first) — the shape recharts area/bar
 * charts expect. Dates older than the window are dropped, same as any
 * fixed-range trend chart.
 */
export function groupByMonth(dates: Array<string | null | undefined>, monthsBack = 6) {
  const now = new Date()
  const buckets = Array.from({ length: monthsBack }, (_, i) => {
    const date = startOfMonth(subMonths(now, monthsBack - 1 - i))
    return { date, month: format(date, 'MMM'), count: 0 }
  })

  for (const raw of dates) {
    if (!raw) continue
    const parsed = parseISO(raw)
    const bucket = buckets.find((b) => isSameMonth(b.date, parsed))
    if (bucket) bucket.count += 1
  }

  return buckets.map(({ month, count }) => ({ month, count }))
}
