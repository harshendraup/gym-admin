import { Check } from 'lucide-react'

/** Small "① Exercise Library" style tab label — fills in with a checkmark once that stage has content, making a numbered step sequence visible at a glance. */
export function StepLabel({ step, label, done }: { step: number; label: string; done: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={
          done
            ? 'flex h-[18px] w-[18px] items-center justify-center rounded-full bg-primary text-white'
            : 'flex h-[18px] w-[18px] items-center justify-center rounded-full border border-slate-300 text-[10px] font-semibold text-slate-500'
        }
      >
        {done ? <Check className="h-3 w-3" /> : step}
      </span>
      {label}
    </span>
  )
}
