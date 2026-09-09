import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight, Plus, Trash2, Sparkles } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getCatalogCategories, getCatalogGroups, getCatalogFoods } from '@/data/foodLibrary'
import { categoryIcon } from '@/data/foodLibraryIcons'
import { useSaveFoodLibraryConfig } from '@/hooks/useFoodLibraryConfig'
import type { FoodLibraryConfigRecord, GymLibraryFoodCategory, GymLibraryFoodGroup } from '@/api/food-library-config.api'

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

interface ConfigureFoodLibraryDialogProps {
  open: boolean
  onClose: () => void
  existingConfig?: FoodLibraryConfigRecord | null
}

export function ConfigureFoodLibraryDialog({ open, onClose, existingConfig }: ConfigureFoodLibraryDialogProps) {
  const save = useSaveFoodLibraryConfig()
  const [categories, setCategories] = useState<GymLibraryFoodCategory[]>([])
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (open) {
      setCategories(existingConfig ? structuredClone(existingConfig.config.categories) : [])
      setExpandedCategories(new Set())
      setExpandedGroups(new Set())
    }
  }, [open, existingConfig])

  const findCategory = (catId: string) => categories.find((c) => c.id === catId)
  const findGroup = (catId: string, groupId: string) => findCategory(catId)?.groups.find((g) => g.id === groupId)

  function toggleExpanded(set: Set<string>, setSet: (s: Set<string>) => void, key: string) {
    const next = new Set(set)
    next.has(key) ? next.delete(key) : next.add(key)
    setSet(next)
  }

  // ─── System (master-catalog) toggles ────────────────────────────────────
  /** The category header's "select all" checkbox — adds every catalog group in this category that isn't already in, or removes every system group if they're all already in (custom groups are left untouched either way). */
  function toggleAllGroupsInCategory(catId: string, catName: string, groups: { id: string; name: string }[]) {
    const currentCat = findCategory(catId)
    const allIncluded = groups.length > 0 && groups.every((g) => currentCat?.groups.some((cg) => cg.id === g.id))

    if (allIncluded) {
      setCategories((prev) =>
        prev
          .map((c) => (c.id === catId ? { ...c, groups: c.groups.filter((g) => g.source !== 'system') } : c))
          .filter((c) => c.groups.length > 0 || c.source === 'custom')
      )
      return
    }

    setCategories((prev) => {
      const existingCat = prev.find((c) => c.id === catId)
      const existingGroupIds = new Set((existingCat?.groups ?? []).map((g) => g.id))
      const newGroups: GymLibraryFoodGroup[] = groups
        .filter((g) => !existingGroupIds.has(g.id))
        .map((g) => {
          const masterFoods = getCatalogFoods(catId, g.id)
          return {
            id: g.id,
            name: g.name,
            source: 'system',
            foods: masterFoods.map((f) => ({
              name: f.name,
              servingSize: f.serving_size,
              servingUnit: f.serving_unit,
              calories: f.calories,
              protein: f.protein,
              carbs: f.carbs,
              fat: f.fat,
              fiber: f.fiber,
            })),
          }
        })
      if (existingCat) {
        return prev.map((c) => (c.id === catId ? { ...c, groups: [...c.groups, ...newGroups] } : c))
      }
      return [...prev, { id: catId, name: catName, source: 'system', groups: newGroups }]
    })
  }

  function toggleSystemGroup(catId: string, catName: string, groupId: string, groupName: string) {
    setCategories((prev) => {
      const existingGroup = prev.find((c) => c.id === catId)?.groups.find((g) => g.id === groupId)
      if (existingGroup) {
        return prev
          .map((c) => (c.id === catId ? { ...c, groups: c.groups.filter((g) => g.id !== groupId) } : c))
          .filter((c) => c.source !== 'system' || c.groups.length > 0)
      }
      const masterFoods = getCatalogFoods(catId, groupId)
      const newGroup: GymLibraryFoodGroup = {
        id: groupId,
        name: groupName,
        source: 'system',
        foods: masterFoods.map((f) => ({
          name: f.name,
          servingSize: f.serving_size,
          servingUnit: f.serving_unit,
          calories: f.calories,
          protein: f.protein,
          carbs: f.carbs,
          fat: f.fat,
          fiber: f.fiber,
        })),
      }
      const existingCat = prev.find((c) => c.id === catId)
      if (existingCat) {
        return prev.map((c) => (c.id === catId ? { ...c, groups: [...c.groups, newGroup] } : c))
      }
      return [...prev, { id: catId, name: catName, source: 'system', groups: [newGroup] }]
    })
  }

  function toggleSystemFood(catId: string, groupId: string, name: string) {
    setCategories((prev) =>
      prev.map((c) =>
        c.id !== catId
          ? c
          : {
              ...c,
              groups: c.groups.map((g) => {
                if (g.id !== groupId) return g
                const has = g.foods.some((f) => f.name === name)
                if (has) return { ...g, foods: g.foods.filter((f) => f.name !== name) }
                const master = getCatalogFoods(catId, groupId).find((f) => f.name === name)
                if (!master) return g
                return {
                  ...g,
                  foods: [
                    ...g.foods,
                    {
                      name: master.name,
                      servingSize: master.serving_size,
                      servingUnit: master.serving_unit,
                      calories: master.calories,
                      protein: master.protein,
                      carbs: master.carbs,
                      fat: master.fat,
                      fiber: master.fiber,
                    },
                  ],
                }
              }),
            }
      )
    )
  }

  // ─── Custom entries ──────────────────────────────────────────────────────
  // A custom group can be added under EITHER a system category (browsed from
  // the master catalog) or a from-scratch custom category — either way the
  // group itself is source:'custom' and gets rendered/managed the same way.
  function addCustomCategory(name: string) {
    if (!name.trim()) return
    setCategories((prev) => [...prev, { id: newId('custom-cat'), name: name.trim(), source: 'custom', groups: [] }])
  }

  function removeCustomCategory(catId: string) {
    setCategories((prev) => prev.filter((c) => c.id !== catId))
  }

  function addGroup(catId: string, catName: string, catSource: 'system' | 'custom', name: string) {
    if (!name.trim()) return
    const newGroup: GymLibraryFoodGroup = { id: newId('custom-grp'), name: name.trim(), source: 'custom', foods: [] }
    setCategories((prev) => {
      const exists = prev.find((c) => c.id === catId)
      if (exists) return prev.map((c) => (c.id === catId ? { ...c, groups: [...c.groups, newGroup] } : c))
      return [...prev, { id: catId, name: catName, source: catSource, groups: [newGroup] }]
    })
    setExpandedCategories((prev) => new Set(prev).add(catId))
  }

  // Only ever called on source:'custom' groups (system groups are removed by
  // unchecking them) — safe to always keep the parent category even if it's
  // now empty, since a system category re-derives its presence from
  // toggleSystemGroup and a custom category is user-owned either way.
  function removeGroup(catId: string, groupId: string) {
    setCategories((prev) =>
      prev
        .map((c) => (c.id === catId ? { ...c, groups: c.groups.filter((g) => g.id !== groupId) } : c))
        .filter((c) => c.groups.length > 0 || c.source === 'custom')
    )
  }

  function addFood(
    catId: string,
    groupId: string,
    name: string,
    servingSize: string,
    servingUnit: string,
    calories: string,
    protein: string,
    carbs: string,
    fat: string
  ) {
    if (!name.trim() || !calories) return
    setCategories((prev) =>
      prev.map((c) =>
        c.id !== catId
          ? c
          : {
              ...c,
              groups: c.groups.map((g) =>
                g.id !== groupId
                  ? g
                  : {
                      ...g,
                      foods: [
                        ...g.foods,
                        {
                          name: name.trim(),
                          servingSize: Number(servingSize || 100),
                          servingUnit: servingUnit.trim() || 'g',
                          calories: Number(calories || 0),
                          protein: Number(protein || 0),
                          carbs: Number(carbs || 0),
                          fat: Number(fat || 0),
                        },
                      ],
                    }
              ),
            }
      )
    )
  }

  function removeCustomFood(catId: string, groupId: string, name: string) {
    setCategories((prev) =>
      prev.map((c) => (c.id !== catId ? c : { ...c, groups: c.groups.map((g) => (g.id !== groupId ? g : { ...g, foods: g.foods.filter((f) => f.name !== name) })) }))
    )
  }

  function handleSave() {
    save.mutate(categories, { onSuccess: onClose })
  }

  const totalGroups = categories.reduce((sum, c) => sum + c.groups.length, 0)
  const customCategories = categories.filter((c) => c.source === 'custom')

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Set Up Food Library</DialogTitle>
        </DialogHeader>
        <p className="-mt-1 text-sm text-muted-foreground">
          Pick which food groups your gym recommends. Add Food and Create Diet Plan will only ever show what you choose here.
        </p>

        <div className="space-y-7">
          <div>
            <h3 className="mb-1 text-sm font-semibold text-slate-900">Choose from our built-in list</h3>
            <p className="mb-3 text-xs text-muted-foreground">
              Check a group to include all of its foods — expand it to fine-tune which ones, or add a food group of your own underneath.
            </p>
            <div className="space-y-2.5">
              {getCatalogCategories().map((cat) => {
                const catExpanded = expandedCategories.has(cat.id)
                const groups = getCatalogGroups(cat.id)
                const customGroupsHere = findCategory(cat.id)?.groups.filter((g) => g.source === 'custom') ?? []
                const includedCount = findCategory(cat.id)?.groups.length ?? 0
                const systemIncludedCount = groups.filter((g) => !!findGroup(cat.id, g.id)).length
                const allSystemIncluded = groups.length > 0 && systemIncludedCount === groups.length
                const Icon = categoryIcon(cat.id)
                return (
                  <div key={cat.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div
                      role="button"
                      tabIndex={0}
                      className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                      onClick={() => toggleExpanded(expandedCategories, setExpandedCategories, cat.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') toggleExpanded(expandedCategories, setExpandedCategories, cat.id)
                      }}
                    >
                      <input
                        type="checkbox"
                        title="Select all groups in this category"
                        className="h-4 w-4 shrink-0 rounded border-slate-300 accent-primary"
                        checked={allSystemIncluded}
                        ref={(el) => {
                          if (el) el.indeterminate = systemIncludedCount > 0 && !allSystemIncluded
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggleAllGroupsInCategory(cat.id, cat.name, groups)}
                      />
                      <div
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                          includedCount > 0 ? 'bg-primary/15 text-primary' : 'bg-slate-100 text-slate-400'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="flex-1 text-sm font-semibold text-slate-900">{cat.name}</span>
                      {includedCount > 0 ? (
                        <Badge variant="default">{includedCount} group{includedCount === 1 ? '' : 's'}</Badge>
                      ) : (
                        <span className="text-xs text-slate-400">Not added</span>
                      )}
                      {catExpanded ? (
                        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                      )}
                    </div>

                    {catExpanded && (
                      <div className="space-y-2 border-t border-slate-100 bg-slate-50/60 px-4 py-3">
                        {groups.map((group) => {
                          const included = !!findGroup(cat.id, group.id)
                          const groupKey = `${cat.id}/${group.id}`
                          const groupExpanded = expandedGroups.has(groupKey)
                          const masterFoods = getCatalogFoods(cat.id, group.id)
                          return (
                            <div
                              key={group.id}
                              className={cn(
                                'overflow-hidden rounded-lg border transition-colors',
                                included ? 'border-primary/30 bg-primary/5' : 'border-slate-200 bg-white'
                              )}
                            >
                              <div className="flex items-center gap-2.5 px-3 py-2">
                                <label className="flex flex-1 cursor-pointer items-center gap-2.5 text-sm">
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-300 accent-primary"
                                    checked={included}
                                    onChange={() => toggleSystemGroup(cat.id, cat.name, group.id, group.name)}
                                  />
                                  <span className={included ? 'font-medium text-slate-900' : 'text-slate-700'}>{group.name}</span>
                                </label>
                                {included && (
                                  <button
                                    type="button"
                                    className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80"
                                    onClick={() => toggleExpanded(expandedGroups, setExpandedGroups, groupKey)}
                                  >
                                    {groupExpanded ? 'Hide details' : 'Fine-tune'}
                                    <ChevronDown className={cn('h-3 w-3 transition-transform', groupExpanded && 'rotate-180')} />
                                  </button>
                                )}
                              </div>

                              {included && groupExpanded && (
                                <div className="border-t border-primary/15 bg-white px-3 py-3">
                                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Foods</p>
                                  <div className="space-y-0.5">
                                    {masterFoods.map((f) => (
                                      <label key={f.name} className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-1 py-1 text-xs hover:bg-slate-50">
                                        <span className="flex items-center gap-2">
                                          <input
                                            type="checkbox"
                                            className="h-3.5 w-3.5 rounded border-slate-300 accent-primary"
                                            checked={findGroup(cat.id, group.id)?.foods.some((ex) => ex.name === f.name) ?? false}
                                            onChange={() => toggleSystemFood(cat.id, group.id, f.name)}
                                          />
                                          {f.name}
                                        </span>
                                        <span className="text-slate-400">{f.calories} kcal / {f.serving_size}{f.serving_unit}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}

                        {customGroupsHere.map((group) => (
                          <CustomGroupCard
                            key={group.id}
                            group={group}
                            onRemoveGroup={() => removeGroup(cat.id, group.id)}
                            onAddFood={(name, size, unit, cal, protein, carbs, fat) => addFood(cat.id, group.id, name, size, unit, cal, protein, carbs, fat)}
                            onRemoveFood={(name) => removeCustomFood(cat.id, group.id, name)}
                          />
                        ))}

                        <AddGroupForm onAdd={(name) => addGroup(cat.id, cat.name, 'system', name)} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-slate-900">Add your own</h3>
              </div>
              <Badge variant="default">{totalGroups} group{totalGroups === 1 ? '' : 's'} selected</Badge>
            </div>

            <div className="space-y-2.5">
              {customCategories.map((cat) => (
                <div key={cat.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Sparkles className="h-3.5 w-3.5 text-primary" /> {cat.name}
                    </span>
                    <Button type="button" size="icon" variant="ghost" onClick={() => removeCustomCategory(cat.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                  <div className="space-y-2 border-t border-slate-100 bg-slate-50/60 px-4 py-3">
                    {cat.groups.map((group) => (
                      <CustomGroupCard
                        key={group.id}
                        group={group}
                        onRemoveGroup={() => removeGroup(cat.id, group.id)}
                        onAddFood={(name, size, unit, cal, protein, carbs, fat) => addFood(cat.id, group.id, name, size, unit, cal, protein, carbs, fat)}
                        onRemoveFood={(name) => removeCustomFood(cat.id, group.id, name)}
                      />
                    ))}
                    <AddGroupForm onAdd={(name) => addGroup(cat.id, cat.name, 'custom', name)} />
                  </div>
                </div>
              ))}
            </div>

            <AddCategoryForm onAdd={addCustomCategory} />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={handleSave} disabled={save.isPending || totalGroups === 0}>
            {save.isPending ? 'Saving...' : 'Save & Finish'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CustomGroupCard({
  group,
  onRemoveGroup,
  onAddFood,
  onRemoveFood,
}: {
  group: GymLibraryFoodGroup
  onRemoveGroup: () => void
  onAddFood: (name: string, servingSize: string, servingUnit: string, calories: string, protein: string, carbs: string, fat: string) => void
  onRemoveFood: (name: string) => void
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-primary/30 bg-primary/5">
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-xs font-medium text-slate-900">
          {group.name} <span className="font-normal text-muted-foreground">· custom</span>
        </span>
        <Button type="button" size="icon" variant="ghost" onClick={onRemoveGroup}>
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>
      <div className="border-t border-primary/15 bg-white px-3 py-3">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Foods</p>
        {group.foods.map((f) => (
          <div key={f.name} className="flex items-center justify-between rounded-md px-1 py-1 text-xs hover:bg-slate-50">
            <span>{f.name} <span className="text-slate-400">· {f.calories} kcal / {f.servingSize}{f.servingUnit}</span></span>
            <button type="button" onClick={() => onRemoveFood(f.name)}>
              <Trash2 className="h-3 w-3 text-destructive" />
            </button>
          </div>
        ))}
        <AddFoodForm onAdd={onAddFood} />
      </div>
    </div>
  )
}

function AddCategoryForm({ onAdd }: { onAdd: (name: string) => void }) {
  const [name, setName] = useState('')
  return (
    <div className="mt-3 flex gap-2">
      <Input placeholder="New custom category name" value={name} onChange={(e) => setName(e.target.value)} className="h-8 bg-white text-xs" />
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => {
          onAdd(name)
          setName('')
        }}
      >
        <Plus className="mr-1 h-3.5 w-3.5" /> Add Category
      </Button>
    </div>
  )
}

function AddGroupForm({ onAdd }: { onAdd: (name: string) => void }) {
  const [name, setName] = useState('')
  return (
    <div className="flex gap-2 pt-1">
      <Input placeholder="New custom group name" value={name} onChange={(e) => setName(e.target.value)} className="h-8 flex-1 bg-white text-xs" />
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => {
          onAdd(name)
          setName('')
        }}
      >
        <Plus className="mr-1 h-3.5 w-3.5" /> Add Group
      </Button>
    </div>
  )
}

function AddFoodForm({ onAdd }: { onAdd: (name: string, servingSize: string, servingUnit: string, calories: string, protein: string, carbs: string, fat: string) => void }) {
  const [name, setName] = useState('')
  const [servingSize, setServingSize] = useState('100')
  const [servingUnit, setServingUnit] = useState('g')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  return (
    <div className="mt-1 space-y-1">
      <Input placeholder="Food name" value={name} onChange={(e) => setName(e.target.value)} className="h-7 text-xs" />
      <div className="grid grid-cols-2 gap-1.5">
        <Input placeholder="Serving size" type="number" value={servingSize} onChange={(e) => setServingSize(e.target.value)} className="h-7 text-xs" />
        <Input placeholder="Unit (g/ml/pc)" value={servingUnit} onChange={(e) => setServingUnit(e.target.value)} className="h-7 text-xs" />
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        <Input placeholder="Calories" type="number" value={calories} onChange={(e) => setCalories(e.target.value)} className="h-7 text-xs" />
        <Input placeholder="Protein (g)" type="number" value={protein} onChange={(e) => setProtein(e.target.value)} className="h-7 text-xs" />
        <Input placeholder="Carbs (g)" type="number" value={carbs} onChange={(e) => setCarbs(e.target.value)} className="h-7 text-xs" />
      </div>
      <div className="flex gap-1.5">
        <Input placeholder="Fat (g)" type="number" value={fat} onChange={(e) => setFat(e.target.value)} className="h-7 flex-1 text-xs" />
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 px-2 text-xs"
          onClick={() => {
            onAdd(name, servingSize, servingUnit, calories, protein, carbs, fat)
            setName('')
            setCalories('')
            setProtein('')
            setCarbs('')
            setFat('')
          }}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
