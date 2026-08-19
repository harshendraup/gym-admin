import {
  Dumbbell, HeartPulse, Waves, Flower2, Zap, Trophy, CircleDot, Users, HeartHandshake, Layers, type LucideIcon,
} from 'lucide-react'

// Keyed by the master catalog's category_id — purely decorative, falls back
// to a generic icon for any category this map hasn't been extended for.
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  cat_01: Dumbbell,
  cat_02: HeartPulse,
  cat_03: Waves,
  cat_04: Zap,
  cat_05: Trophy,
  cat_06: CircleDot,
  cat_07: Users,
  cat_09: HeartHandshake,
  cat_10: Flower2,
}

export function categoryIcon(id: string): LucideIcon {
  return CATEGORY_ICONS[id] ?? Layers
}
