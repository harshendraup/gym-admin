import {
  Beef, Wheat, Milk, Apple, Carrot, Nut, Droplet, CupSoda, Cookie, Layers, type LucideIcon,
} from 'lucide-react'

// Keyed by the master catalog's category_id — purely decorative, falls back
// to a generic icon for any category this map hasn't been extended for.
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  cat_protein: Beef,
  cat_grains: Wheat,
  cat_dairy: Milk,
  cat_fruits: Apple,
  cat_vegetables: Carrot,
  cat_nuts_seeds: Nut,
  cat_fats_oils: Droplet,
  cat_beverages: CupSoda,
  cat_snacks_sweets: Cookie,
}

export function categoryIcon(id: string): LucideIcon {
  return CATEGORY_ICONS[id] ?? Layers
}
