'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  Plus,
  Trash2,
  Save,
  Undo,
  Type,
  FileText,
  Hash,
  Box,
  MoreVertical,
  ChevronUp,
  ChevronDown,
  Info
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { TiptapEditor } from '@/components/admin/editor'

interface Step {
  id: string
  step_number: string
  title: string
  description: string
  icon: string
  order_index: number
}

interface Section {
  title: string
  subtitle: string
}

interface HowItWorksClientProps {
  initialSection: Section
  initialSteps: Step[]
}

export function HowItWorksClient({ initialSection, initialSteps }: HowItWorksClientProps) {
  const [section, setSection] = useState<Section>(initialSection)
  const [steps, setSteps] = useState<Step[]>(initialSteps)
  const [savingSection, setSavingSection] = useState(false)
  const [savingSteps, setSavingSteps] = useState(false)
  const [editingStep, setEditingStep] = useState<string | null>(null)
  
  const supabase = createClient()

  const handleSaveSection = async () => {
    setSavingSection(true)
    try {
      const { error } = await (supabase.from('site_sections') as any).upsert({
        section_key: 'how_it_works',
        title: section.title,
        subtitle: section.subtitle,
        updated_at: new Date().toISOString()
      }, { onConflict: 'section_key' })

      if (error) throw error
      toast.success('Hlavička sekce uložena')
    } catch (err) {
      toast.error('Nepodařilo se uložit hlavičku')
      console.error(err)
    } finally {
      setSavingSection(false)
    }
  }

  const handleAddStep = () => {
    const newStep: Step = {
      id: `new-${Date.now()}`,
      step_number: `0${steps.length + 1}`,
      title: 'Nový krok',
      description: '',
      icon: 'ArrowRight',
      order_index: steps.length
    }
    setSteps([...steps, newStep])
    setEditingStep(newStep.id)
  }

  const handleDeleteStep = async (id: string) => {
    if (id.startsWith('new-')) {
      setSteps(steps.filter(s => s.id !== id))
      return
    }

    if (!confirm('Opravdu chcete tento krok smazat?')) return

    try {
      const { error } = await supabase.from('how_it_works_steps').delete().eq('id', id)
      if (error) throw error
      setSteps(steps.filter(s => s.id !== id))
      toast.success('Krok smazán')
    } catch (err) {
      toast.error('Nepodařilo se smazat krok')
      console.error(err)
    }
  }

  const handleSaveSteps = async () => {
    setSavingSteps(true)
    try {
      // Upsert all steps
      const stepsToSave = steps.map((s, idx) => ({
        ...s,
        id: s.id.startsWith('new-') ? undefined : s.id,
        order_index: idx
      }))

      for (const step of stepsToSave) {
        if (!step.id) {
          const { error } = await supabase.from('how_it_works_steps').insert(step)
          if (error) throw error
        } else {
          const { error } = await supabase.from('how_it_works_steps').update(step).eq('id', step.id)
          if (error) throw error
        }
      }

      toast.success('Kroky uloženy')
      window.location.reload()
    } catch (err) {
      toast.error('Nepodařilo se uložit kroky')
      console.error(err)
    } finally {
      setSavingSteps(false)
    }
  }

  const moveStep = (idx: number, direction: 'up' | 'down') => {
    const newSteps = [...steps]
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= steps.length) return
    
    const [moved] = newSteps.splice(idx, 1)
    newSteps.splice(targetIdx, 0, moved)
    setSteps(newSteps)
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Section Header Editor */}
      <div className="rounded-2xl p-6 border border-border bg-card shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Type size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Hlavička sekce</h2>
              <p className="text-sm text-muted-foreground">Hlavní nadpis a podnadpis sekce</p>
            </div>
          </div>
          <button
            onClick={handleSaveSection}
            disabled={savingSection}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all"
          >
            <Save size={18} />
            {savingSection ? 'Ukládám...' : 'Uložit hlavičku'}
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-border">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sekce (malý nadpis)</label>
            <input
              type="text"
              value={section.title}
              onChange={(e) => setSection({ ...section, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="Např. Jak to funguje"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Hlavní nadpis</label>
            <input
              type="text"
              value={section.subtitle}
              onChange={(e) => setSection({ ...section, subtitle: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="Např. 3 jednoduché kroky ke změně"
            />
          </div>
        </div>
      </div>

      {/* Steps Editor */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Box size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Jednotlivé kroky</h2>
              <p className="text-sm text-muted-foreground">Správa kroků procesu</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAddStep}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card font-semibold hover:bg-accent transition-all"
            >
              <Plus size={18} />
              Přidat krok
            </button>
            <button
              onClick={handleSaveSteps}
              disabled={savingSteps}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 disabled:opacity-50 shadow-md shadow-primary/20 transition-all"
            >
              <Save size={18} />
              {savingSteps ? 'Ukládám...' : 'Uložit všechny kroky'}
            </button>
          </div>
        </div>

        <div className="grid gap-4">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              className="group rounded-2xl border border-border bg-card shadow-sm overflow-hidden transition-all hover:border-primary/30"
            >
              <div className="flex items-center p-4 bg-muted/30 border-b border-border">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </div>
                  <h3 className="font-bold">{step.title || 'Nový krok'}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => moveStep(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg hover:bg-accent disabled:opacity-30"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    onClick={() => moveStep(idx, 'down')}
                    disabled={idx === steps.length - 1}
                    className="p-1.5 rounded-lg hover:bg-accent disabled:opacity-30"
                  >
                    <ChevronDown size={16} />
                  </button>
                  <button
                    onClick={() => setEditingStep(editingStep === step.id ? null : step.id)}
                    className="p-1.5 rounded-lg hover:bg-accent text-primary"
                  >
                    <MoreVertical size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteStep(step.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {editingStep === step.id && (
                <div className="p-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Číslo kroku</label>
                      <input
                        type="text"
                        value={step.step_number}
                        onChange={(e) => {
                          const newSteps = [...steps]
                          newSteps[idx].step_number = e.target.value
                          setSteps(newSteps)
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background outline-none"
                        placeholder="Např. 01"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Název kroku</label>
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => {
                          const newSteps = [...steps]
                          newSteps[idx].title = e.target.value
                          setSteps(newSteps)
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background outline-none"
                        placeholder="Např. Kontaktujte nás"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ikona (Lucide)</label>
                      <input
                        type="text"
                        value={step.icon}
                        onChange={(e) => {
                          const newSteps = [...steps]
                          newSteps[idx].icon = e.target.value
                          setSteps(newSteps)
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background outline-none"
                        placeholder="Phone, ClipboardCheck, ShieldCheck..."
                      />
                      <p className="text-[10px] text-muted-foreground italic flex items-center gap-1">
                        <Info size={10} /> Používejte názvy z lucide-react (např. Phone)
                      </p>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Popis kroku</label>
                      <TiptapEditor
                        content={step.description}
                        onChange={(html) => {
                          const newSteps = [...steps]
                          newSteps[idx].description = html
                          setSteps(newSteps)
                        }}
                        placeholder="Popište, co se v tomto kroku děje..."
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {steps.length === 0 && (
            <div className="text-center py-20 rounded-2xl border-2 border-dashed border-border bg-muted/10">
              <p className="text-muted-foreground">Zatím nebyly přidány žádné kroky.</p>
              <button onClick={handleAddStep} className="mt-4 text-primary font-bold hover:underline">
                Přidat první krok
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
