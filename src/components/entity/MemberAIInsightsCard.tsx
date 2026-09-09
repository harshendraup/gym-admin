import { useState } from 'react'
import {
  Sparkles,
  Send,
  Dumbbell,
  Salad,
  UserCog,
  MessageCircleWarning,
  TrendingDown,
  CalendarClock,
  Gift,
  ClipboardCheck,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import type { ManagedUser } from '@/api/user-management.api'

type Priority = 'high' | 'medium' | 'low'

interface Suggestion {
  icon: typeof Sparkles
  title: string
  detail: string
  priority: Priority
}

interface ActionItem {
  label: string
  icon: typeof Sparkles
}

const priorityStyles: Record<Priority, string> = {
  high: 'bg-red-500/15 text-red-400',
  medium: 'bg-amber-500/15 text-amber-400',
  low: 'bg-blue-500/15 text-blue-400',
}

function buildMemberSuggestions(user: ManagedUser, dietCount: number, hasTrainer: boolean): Suggestion[] {
  const name = user.fullName ?? user.firstName ?? 'this member'
  const suggestions: Suggestion[] = []

  if (!hasTrainer) {
    suggestions.push({
      icon: UserCog,
      title: 'Pair with a trainer',
      detail: `${name} hasn't been matched with a trainer yet. Members with an assigned trainer are ~2x more likely to stay active past month 2.`,
      priority: 'high',
    })
  }

  if (dietCount === 0) {
    suggestions.push({
      icon: Salad,
      title: 'Start a diet plan',
      detail: 'No diet plan on file. A simple starter plan tends to boost engagement and gives the trainer a reason to check in weekly.',
      priority: 'medium',
    })
  }

  suggestions.push({
    icon: Dumbbell,
    title: 'Suggest a beginner strength routine',
    detail: '3-day full-body split recommended based on typical onboarding patterns for new members at this branch.',
    priority: 'medium',
  })

  suggestions.push({
    icon: CalendarClock,
    title: 'Set a weekly check-in reminder',
    detail: 'Nudge to log workouts every Monday morning — helps build a consistent habit in the first 30 days.',
    priority: 'low',
  })

  suggestions.push({
    icon: Gift,
    title: 'Welcome offer',
    detail: 'Consider a free personal-training session voucher to encourage first-week engagement.',
    priority: 'low',
  })

  return suggestions
}

function buildAdminSuggestions(user: ManagedUser, dietCount: number, hasTrainer: boolean): { suggestions: Suggestion[]; actions: ActionItem[] } {
  const name = user.fullName ?? user.firstName ?? 'this member'
  const suggestions: Suggestion[] = []
  const actions: ActionItem[] = []

  if (!hasTrainer) {
    suggestions.push({
      icon: UserCog,
      title: 'Unassigned member risk',
      detail: `${name} has no trainer assigned. Unassigned members show a 35% higher drop-off rate in the first 60 days.`,
      priority: 'high',
    })
    actions.push({ label: 'Assign Trainer', icon: UserCog })
  }

  if (dietCount === 0) {
    suggestions.push({
      icon: Salad,
      title: 'No diet plan created',
      detail: 'Create a diet plan to increase touchpoints with this member and improve retention likelihood.',
      priority: 'medium',
    })
    actions.push({ label: 'Create Diet Plan', icon: Salad })
  }

  suggestions.push({
    icon: TrendingDown,
    title: 'Engagement monitoring',
    detail: 'No usage signal yet for this member — recommend a check-in call within the first week of joining.',
    priority: 'medium',
  })

  suggestions.push({
    icon: MessageCircleWarning,
    title: 'Retention watch',
    detail: 'Flag this member for a follow-up in 30 days to review satisfaction and renewal likelihood.',
    priority: 'low',
  })

  actions.push({ label: 'Schedule Follow-up', icon: CalendarClock })
  actions.push({ label: 'Log Note', icon: ClipboardCheck })

  return { suggestions, actions }
}

interface MemberAIInsightsCardProps {
  user: ManagedUser
  dietCount?: number
  hasTrainer?: boolean
}

export function MemberAIInsightsCard({ user, dietCount = 0, hasTrainer = false }: MemberAIInsightsCardProps) {
  const [sending, setSending] = useState(false)
  const memberSuggestions = buildMemberSuggestions(user, dietCount, hasTrainer)
  const { suggestions: adminSuggestions, actions: adminActions } = buildAdminSuggestions(user, dietCount, hasTrainer)
  const name = user.fullName ?? user.firstName ?? 'member'

  const handleSendToMember = () => {
    setSending(true)
    // Mock only — wire up to a real notification/email endpoint later.
    setTimeout(() => {
      setSending(false)
      toast({ title: 'Sent to member (mock)', description: `Recommendations shared with ${name}.` })
    }, 500)
  }

  const handleAdminAction = (label: string) => {
    // Mock only — no backend call yet.
    toast({ title: `${label} (mock)`, description: 'This action is not wired up yet.' })
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-600">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">AI Insights</h3>
            <p className="text-[11px] text-slate-500">Mock recommendations — not yet backed by a real model</p>
          </div>
        </div>

        <Tabs defaultValue="member">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="member">For Member</TabsTrigger>
            <TabsTrigger value="admin">For Admin</TabsTrigger>
          </TabsList>

          <TabsContent value="member" className="space-y-3">
            <SuggestionList suggestions={memberSuggestions} />
            <Button size="sm" className="w-full" onClick={handleSendToMember} disabled={sending}>
              <Send className="mr-1.5 h-3.5 w-3.5" />
              {sending ? 'Sending…' : 'Send to Member'}
            </Button>
          </TabsContent>

          <TabsContent value="admin" className="space-y-3">
            <SuggestionList suggestions={adminSuggestions} />
            <div className="flex flex-wrap gap-2 pt-1">
              {adminActions.map((action) => (
                <Button
                  key={action.label}
                  size="sm"
                  variant="outline"
                  onClick={() => handleAdminAction(action.label)}
                >
                  <action.icon className="mr-1.5 h-3.5 w-3.5" />
                  {action.label}
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function SuggestionList({ suggestions }: { suggestions: Suggestion[] }) {
  return (
    <div className="space-y-2.5">
      {suggestions.map((s) => (
        <div key={s.title} className="flex items-start gap-2.5 rounded-lg border border-slate-100 p-2.5">
          <s.icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-slate-900">{s.title}</p>
              <Badge variant="outline" className={cn('shrink-0 border-none px-1.5 py-0 text-[10px] capitalize', priorityStyles[s.priority])}>
                {s.priority}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{s.detail}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
