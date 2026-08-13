/**
 * "Locker-room scoreboard" theme — scoped to the sub-admin section only
 * (SubAdminLayout + sub-admin pages). Not wired into the shared Tailwind
 * theme so it can't bleed into superadmin/admin styling.
 */
export const T = {
  ink: '#14140F',
  inkSoft: '#1D1D15',
  inkLine: '#2C2C22',
  chalk: '#F1EFE8',
  card: '#FFFFFF',
  line: '#E4E0D3',
  dim: '#8C876F',
  signal: '#FF4620',
  signalDark: '#D8380F',
  brass: '#C9A15A',
  cobalt: '#2451FF',
  forest: '#1F7A4D',
  amber: '#C97A1F',
  text: '#191812',
} as const

export const display = { fontFamily: "'Anton', sans-serif", letterSpacing: '0.01em' }
export const mono = { fontFamily: "'JetBrains Mono', monospace" }
export const body = { fontFamily: "'Inter', sans-serif" }
