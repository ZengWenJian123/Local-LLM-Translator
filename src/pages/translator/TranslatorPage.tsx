import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { HistoryDrawer } from '@/components/history/HistoryDrawer'
import { ProviderConfigForm } from '@/components/settings/ProviderConfigForm'
import { InputPanel } from '@/components/translator/InputPanel'
import { OutputPanel } from '@/components/translator/OutputPanel'
import { StatusBar } from '@/components/translator/StatusBar'
import { TopToolbar } from '@/components/translator/TopToolbar'
import { Drawer } from '@/components/ui/drawer'
import { normalizeErrorMessage } from '@/lib/errors'
import { exportResult } from '@/services/export-service'
import { listHistory, removeHistory, saveHistory, toggleHistoryFavorite, buildHistoryRecord } from '@/services/history-service'
import { listProviderModels, testProviderConnection } from '@/services/provider-service'
import { getAppSettings, getProviderConfig, saveAppSettings, saveProviderConfig } from '@/services/settings-service'
import { useTranslation } from '@/hooks/useTranslation'
import { useUiStore } from '@/stores/ui-store'
import type { TranslateInput } from '@/types/core'

async function notify(message: string): Promise<void> {
  window.alert(message)
}

export function TranslatorPage() {
  const queryClient = useQueryClient()
  const [historySearch, setHistorySearch] = useState('')
  const [providerConnected, setProviderConnected] = useState(true)
  const [availableModels, setAvailableModels] = useState<string[]>([])

  const ui = useUiStore()
  const translation = useTranslation()

  // Old persisted data may still contain `document`; force fallback to text mode.
  useEffect(() => {
    if (ui.inputMode === 'document') {
      ui.setInputMode('text')
    }
  }, [ui, ui.inputMode, ui.setInputMode])

  const providerQuery = useQuery({ queryKey: ['provider-config'], queryFn: getProviderConfig })
  const settingsQuery = useQuery({ queryKey: ['app-settings'], queryFn: getAppSettings })
  const historyQuery = useQuery({
    queryKey: ['history', historySearch],
    queryFn: () => listHistory(historySearch),
  })

  const connectionMutation = useMutation({
    mutationFn: testProviderConnection,
    onSuccess: async (result) => {
      setProviderConnected(result.ok)
      await notify(result.message)
    },
    onError: async (error) => {
      await notify(normalizeErrorMessage(error))
    },
  })

  const canTranslate = useMemo(() => {
    if (!providerQuery.data?.enabled) return false
    if (ui.inputMode === 'text') return ui.textDraft.trim().length > 0
    if (ui.inputMode === 'image') return ui.imageDraftBase64.length > 0
    return false
  }, [providerQuery.data?.enabled, ui.inputMode, ui.textDraft, ui.imageDraftBase64])

  async function buildTranslateInput(): Promise<TranslateInput> {
    if (ui.inputMode === 'text') {
      return {
        mode: 'text',
        sourceLanguage: ui.sourceLanguage,
        targetLanguage: ui.targetLanguage,
        text: ui.textDraft,
      }
    }

    if (ui.inputMode === 'image') {
      return {
        mode: 'image',
        sourceLanguage: ui.sourceLanguage,
        targetLanguage: ui.targetLanguage,
        imageBase64: ui.imageDraftBase64,
        imageMimeType: ui.imageDraftMimeType,
      }
    }

    throw new Error('文档翻译已禁用')
  }

  async function runTranslate(): Promise<void> {
    if (ui.sourceLanguage === ui.targetLanguage) {
      await notify('源语言和目标语言不能一致')
      return
    }
    const input = await buildTranslateInput()
    await translation.mutateAsync(input)
  }

  async function onCopyResult(): Promise<void> {
    const content = translation.result?.plainText || translation.streamedPartial
    if (!content) return
    await navigator.clipboard.writeText(content)
    await notify('已复制到剪贴板')
  }

  async function onCopyInput(): Promise<void> {
    if (ui.inputMode === 'text') {
      const content = ui.textDraft.trim()
      if (!content) return
      await navigator.clipboard.writeText(content)
      await notify('已复制输入文本')
      return
    }
    if (ui.inputMode === 'image' && ui.imageDraftBase64) {
      const dataUrl = `data:${ui.imageDraftMimeType || 'image/png'};base64,${ui.imageDraftBase64}`
      await navigator.clipboard.writeText(dataUrl)
      await notify('已复制图片数据（Data URL）')
    }
  }

  async function onClearInput(): Promise<void> {
    if (ui.inputMode === 'text') {
      ui.setTextDraft('')
      await notify('已清空输入文本')
      return
    }
    if (ui.inputMode === 'image') {
      ui.clearImageDraft()
      await notify('已清空输入图片')
    }
  }

  async function onClearOutput(): Promise<void> {
    translation.clear()
    await notify('已清空输出结果')
  }

  async function onExportResult(): Promise<void> {
    if (!translation.result) return
    await exportResult({
      content: translation.result.plainText,
      format: 'txt',
      fileName: `translation-${Date.now()}`,
    })
    await notify('导出成功')
  }

  async function onManualSaveHistory(): Promise<void> {
    if (!translation.result) return
    await saveHistory(buildHistoryRecord(translation.result))
    await queryClient.invalidateQueries({ queryKey: ['history'] })
    await notify('已保存到历史记录')
  }

  async function onLoadHistoryRecord(index: number): Promise<void> {
    const record = historyQuery.data?.[index]
    if (!record) return
    const sourceLanguage = ['auto', 'zh', 'en', 'ru'].includes(record.sourceLanguage)
      ? (record.sourceLanguage as 'auto' | 'zh' | 'en' | 'ru')
      : 'auto'
    const targetLanguage = ['zh', 'en', 'ru'].includes(record.targetLanguage)
      ? (record.targetLanguage as 'zh' | 'en' | 'ru')
      : 'zh'
    const safeMode = record.mode === 'document' ? 'text' : record.mode
    ui.setInputMode(safeMode)
    ui.setLanguages(sourceLanguage, targetLanguage)
    ui.setTextDraft(record.sourceText)
    ui.setHistoryOpen(false)
    await notify('已加载到编辑区')
  }

  return (
    <div className="grid h-screen grid-rows-[auto_1fr_auto] gap-3 bg-background p-3 text-foreground">
      <TopToolbar
        inputMode={ui.inputMode}
        sourceLanguage={ui.sourceLanguage}
        targetLanguage={ui.targetLanguage}
        modelName={providerQuery.data?.model ?? '未配置'}
        canTranslate={canTranslate && !translation.isPending}
        translating={translation.isPending}
        onInputModeChange={ui.setInputMode}
        onSourceLanguageChange={(language) => ui.setLanguages(language, ui.targetLanguage)}
        onTargetLanguageChange={(language) => ui.setLanguages(ui.sourceLanguage, language)}
        onSwapLanguages={() => {
          if (ui.sourceLanguage === 'auto') return
          ui.setLanguages(ui.targetLanguage, ui.sourceLanguage)
        }}
        onTranslate={() => {
          void runTranslate()
        }}
        onCancel={() => translation.cancel()}
        onOpenSettings={() => ui.setSettingsOpen(true)}
        onOpenHistory={() => ui.setHistoryOpen(true)}
      />

      <main className="grid min-h-0 grid-cols-2 gap-3">
        <InputPanel
          mode={ui.inputMode}
          textDraft={ui.textDraft}
          imageName={ui.imageDraftName}
          imageBase64={ui.imageDraftBase64}
          imageMimeType={ui.imageDraftMimeType}
          onTextChange={ui.setTextDraft}
          onSetImage={ui.setImageDraft}
          onCopyInput={() => {
            void onCopyInput()
          }}
          onClearInput={() => {
            void onClearInput()
          }}
        />
        <OutputPanel
          mode={ui.inputMode}
          result={translation.result}
          streamedPartial={translation.streamedPartial}
          outputViewMode={ui.outputViewMode}
          loading={translation.isPending}
          errorMessage={translation.errorMessage}
          sourceImageUrl={
            ui.inputMode === 'image' && ui.imageDraftBase64
              ? `data:${ui.imageDraftMimeType || 'image/png'};base64,${ui.imageDraftBase64}`
              : undefined
          }
          sourceImageName={ui.imageDraftName}
          onOutputViewModeChange={ui.setOutputViewMode}
          onCopy={() => {
            void onCopyResult()
          }}
          onClear={() => {
            void onClearOutput()
          }}
          onExport={() => {
            void onExportResult()
          }}
          onSaveHistory={() => {
            void onManualSaveHistory()
          }}
          onRetranslate={() => {
            void runTranslate()
          }}
        />
      </main>

      <StatusBar
        providerConnected={providerConnected}
        providerName={providerQuery.data?.name ?? 'LM Studio'}
        modelName={providerQuery.data?.model ?? '未配置'}
        elapsedMs={translation.result?.elapsedMs}
        segmentCount={translation.result?.segments.length}
        streamingEnabled={settingsQuery.data?.enableStreaming ?? true}
      />

      <HistoryDrawer
        open={ui.historyOpen}
        records={historyQuery.data ?? []}
        search={historySearch}
        onClose={() => ui.setHistoryOpen(false)}
        onSearchChange={setHistorySearch}
        onLoad={(record) => {
          const index = historyQuery.data?.findIndex((item) => item.id === record.id) ?? -1
          if (index >= 0) {
            void onLoadHistoryRecord(index)
          }
        }}
        onToggleFavorite={(id) => {
          void toggleHistoryFavorite(id).then(() => queryClient.invalidateQueries({ queryKey: ['history'] }))
        }}
        onDelete={(id) => {
          void removeHistory(id).then(() => queryClient.invalidateQueries({ queryKey: ['history'] }))
        }}
      />

      <Drawer open={ui.settingsOpen} onClose={() => ui.setSettingsOpen(false)} title="设置">
        {providerQuery.data && settingsQuery.data ? (
          <ProviderConfigForm
            provider={providerQuery.data}
            settings={settingsQuery.data}
            testingConnection={connectionMutation.isPending}
            availableModels={availableModels}
            onSaveProvider={async (input) => {
              await saveProviderConfig(input)
              await queryClient.invalidateQueries({ queryKey: ['provider-config'] })
              await notify('模型设置已保存')
            }}
            onSaveSettings={async (input) => {
              await saveAppSettings(input)
              await queryClient.invalidateQueries({ queryKey: ['app-settings'] })
              ui.setOutputViewMode(input.outputViewMode)
              await notify('翻译设置已保存')
            }}
            onTestConnection={async (input) => {
              const result = await connectionMutation.mutateAsync(input)
              let models: string[] = []
              if (result.ok) {
                try {
                  const descriptors = await listProviderModels(input)
                  models = descriptors.map((item) => item.name || item.id).filter(Boolean)
                  setAvailableModels(models)
                } catch (error) {
                  await notify(`模型列表拉取失败：${normalizeErrorMessage(error)}`)
                }
              } else {
                setAvailableModels([])
              }

              return {
                ok: result.ok,
                message: result.message,
                models,
              }
            }}
          />
        ) : (
          <p className="text-sm text-muted-foreground">加载设置中...</p>
        )}
      </Drawer>
    </div>
  )
}
