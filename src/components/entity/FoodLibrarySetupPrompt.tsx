import { ListChecks } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FoodLibrarySetupPromptProps {
  onConfigure: () => void
}

/**
 * Shown instead of the food list until a business has set up its food
 * library — "Add Food" only appears once that's done, so this is the only
 * action available here.
 */
export function FoodLibrarySetupPrompt({ onConfigure }: FoodLibrarySetupPromptProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 py-16 px-6 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
        <ListChecks className="h-5 w-5 text-slate-500" />
      </div>
      <h2 className="text-base font-semibold text-slate-900">Let's set up your food library</h2>
      <p className="max-w-sm text-sm text-slate-500">
        Before you can add foods or build diet plans, pick which food groups and items your gym actually
        recommends. Choose from our built-in list, add your own, or both — it only takes a few minutes, and it
        means everyone only ever sees foods relevant to your gym.
      </p>
      <Button size="sm" onClick={onConfigure} className="mt-1">
        Set Up Food Library
      </Button>
    </div>
  )
}
