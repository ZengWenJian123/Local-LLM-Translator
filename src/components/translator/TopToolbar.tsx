import { ArrowLeftRight, History, Languages, Play, Settings2, Square } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Tabs } from '@/components/ui/tabs'
import { languageLabel } from '@/lib/format'
import type { InputMode, Language, TargetLanguage } from '@/types/core'

interface TopToolbarProps {
  inputMode: InputMode
  sourceLanguage: Language
  targetLanguage: TargetLanguage
  modelName: string
  canTranslate: boolean
  translating: boolean
  onInputModeChange: (mode: InputMode) => void
  onSourceLanguageChange: (language: Language) => void
  onTargetLanguageChange: (language: TargetLanguage) => void
  onSwapLanguages: () => void
  onTranslate: () => void
  onCancel: () => void
  onOpenSettings: () => void
  onOpenHistory: () => void
}

export function TopToolbar(props: TopToolbarProps) {
  const {
    inputMode,
    sourceLanguage,
    targetLanguage,
    modelName,
    canTranslate,
    translating,
    onInputModeChange,
    onSourceLanguageChange,
    onTargetLanguageChange,
    onSwapLanguages,
    onTranslate,
    onCancel,
    onOpenSettings,
    onOpenHistory,
  } = props

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-border bg-card p-3 sm:p-4"
    >
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src="/logo-translate.svg"
            alt="Local Translate Logo"
            className="h-11 w-11 rounded-xl border border-cyan-200/60 bg-white/90 p-1 shadow-sm"
          />
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold sm:text-xl">Local Translate</h1>
            <p className="text-xs text-muted-foreground">OpenAI-compatible model translation</p>
          </div>
        </div>

        <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
          <Button variant="ghost" size="sm" onClick={onOpenHistory} className="flex-1 sm:flex-none">
            <History className="mr-1 h-4 w-4" />
            History
          </Button>
          <Button variant="ghost" size="sm" onClick={onOpenSettings} className="flex-1 sm:flex-none">
            <Settings2 className="mr-1 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Tabs
          value={inputMode}
          onChange={onInputModeChange}
          className="w-full sm:w-auto"
          items={[
            { value: 'text', label: 'Text' },
            { value: 'image', label: 'Image' },
          ]}
        />

        <div className="w-full sm:w-auto">
          <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground sm:hidden">
            <Languages className="h-3.5 w-3.5" />
            Language
          </div>
          <div className="grid w-full min-w-0 grid-cols-[1fr_auto_1fr] items-center gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
            <Languages className="hidden h-4 w-4 text-muted-foreground sm:block" />
            <Select
              value={sourceLanguage}
              onChange={(event) => onSourceLanguageChange(event.target.value as Language)}
              className="min-w-0 w-full sm:w-[130px] sm:flex-none"
            >
              <option value="auto">{languageLabel('auto')}</option>
              <option value="zh">{languageLabel('zh')}</option>
              <option value="en">{languageLabel('en')}</option>
              <option value="ru">{languageLabel('ru')}</option>
            </Select>
            <Button variant="outline" size="icon" onClick={onSwapLanguages} title="Swap language" className="shrink-0">
              <ArrowLeftRight className="h-4 w-4" />
            </Button>
            <Select
              value={targetLanguage}
              onChange={(event) => onTargetLanguageChange(event.target.value as TargetLanguage)}
              className="min-w-0 w-full sm:w-[120px] sm:flex-none"
            >
              <option value="zh">{languageLabel('zh')}</option>
              <option value="en">{languageLabel('en')}</option>
              <option value="ru">{languageLabel('ru')}</option>
            </Select>
          </div>
        </div>

        <div className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:w-auto">
          Model: <span className="font-medium">{modelName}</span>
        </div>

        <div className="ml-0 flex w-full items-center justify-end gap-2 sm:ml-auto sm:w-auto">
          {translating ? (
            <Button variant="destructive" onClick={onCancel} className="w-full sm:w-auto">
              <Square className="mr-1 h-4 w-4" />
              Cancel
            </Button>
          ) : (
            <Button onClick={onTranslate} disabled={!canTranslate} className="w-full sm:w-auto">
              <Play className="mr-1 h-4 w-4" />
              Translate
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  )
}
