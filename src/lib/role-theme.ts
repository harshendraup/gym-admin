/**
 * Per-role accent color, applied as CSS custom properties at the app shell
 * root (see AppLayout.tsx). Values are HSL triplets matching index.css's
 * `--primary`/`--ring` format, so every component already built on
 * `bg-primary`/`text-primary`/`border-primary` (Button, Badge, stat-card
 * icons, focus rings, ...) re-themes automatically — no per-component edits.
 */
export interface RoleTheme {
  primary: string
  primaryForeground: string
  label: string
}

export const ROLE_THEMES: Record<string, RoleTheme> = {
  superadmin: { primary: '217 91% 60%', primaryForeground: '0 0% 100%', label: 'Blue' },
  admin: { primary: '262 83% 58%', primaryForeground: '0 0% 100%', label: 'Violet' },
  sub_admin: { primary: '160 84% 39%', primaryForeground: '0 0% 100%', label: 'Emerald' },
}

export function getRoleTheme(role: string | null | undefined): RoleTheme {
  return ROLE_THEMES[role ?? ''] ?? ROLE_THEMES.superadmin
}
