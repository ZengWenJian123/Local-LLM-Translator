import { ArrowLeftRight, History, Languages, Settings2, Play, Square } from 'lucide-react'
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
      className="rounded-lg border border-border bg-card p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/logo-translate.svg"
            alt="Local Translate Logo"
            className="h-11 w-11 rounded-xl border border-cyan-200/60 bg-white/90 p-1 shadow-sm"
          />
          <div>
            <h1 className="text-xl font-semibold">Local Translate</h1>
            <p className="text-xs text-muted-foreground">Powered by OpenAI-compatible Models</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onOpenHistory}>
            <History className="mr-1 h-4 w-4" />
            历史
          </Button>
          <Button variant="ghost" size="sm" onClick={onOpenSettings}>
            <Settings2 className="mr-1 h-4 w-4" />
            设置
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Tabs
          value={inputMode}
          onChange={onInputModeChange}
          items={[
            { value: 'text', label: '文本' },
            { value: 'image', label: '图片' },
          ]}
        />

        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4 text-muted-foreground" />
          <Select
            value={sourceLanguage}
            onChange={(event) => onSourceLanguageChange(event.target.value as Language)}
            className="w-[130px]"
          >
            <option value="auto">{languageLabel('auto')}</option>
            <option value="zh">{languageLabel('zh')}</option>
            <option value="en">{languageLabel('en')}</option>
            <option value="ru">{languageLabel('ru')}</option>
          </Select>
          <Button variant="outline" size="icon" onClick={onSwapLanguages} title="交换语言">
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
          <Select
            value={targetLanguage}
            onChange={(event) => onTargetLanguageChange(event.target.value as TargetLanguage)}
            className="w-[120px]"
          >
            <option value="zh">{languageLabel('zh')}</option>
            <option value="en">{languageLabel('en')}</option>
            <option value="ru">{languageLabel('ru')}</option>
          </Select>
        </div>

        <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm">
          模型：<span className="font-medium">{modelName}</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {translating ? (
            <Button variant="destructive" onClick={onCancel}>
              <Square className="mr-1 h-4 w-4" />
              取消
            </Button>
          ) : (
            <Button onClick={onTranslate} disabled={!canTranslate}>
              <Play className="mr-1 h-4 w-4" />
              开始翻译
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  )
}
