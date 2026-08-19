import { ListChecks } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ExerciseLibrarySetupPromptProps {
  onConfigure: () => void
}

/**
 * Shown instead of the exercise list until a business has set up its
 * exercise library — "Add Exercise" only appears once that's done, so this
 * is the only action available here.
 */
export function ExerciseLibrarySetupPrompt({ onConfigure }: ExerciseLibrarySetupPromptProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 py-16 px-6 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
        <ListChecks className="h-5 w-5 text-slate-500" />
      </div>
      <h2 className="text-base font-semibold text-slate-900">Let's set up your exercise library</h2>
      <p className="max-w-sm text-sm text-slate-500">
        Before you can add exercises or build training programs, pick which exercise types, equipment, and moves
        your gym actually uses. Choose from our built-in list, add your own, or both — it only takes a few minutes,
        and it means everyone only ever sees exercises relevant to your gym.
      </p>
      <Button size="sm" onClick={onConfigure} className="mt-1">
        Set Up Exercise Library
      </Button>
    </div>
  )
}
