import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { InputMode, Language, OutputViewMode, TargetLanguage } from '@/types/core'

interface UiState {
  inputMode: InputMode
  sourceLanguage: Language
  targetLanguage: TargetLanguage
  outputViewMode: OutputViewMode
  inputMarkdownPreviewEnabled: boolean
  outputMarkdownEnabled: boolean
  historyOpen: boolean
  settingsOpen: boolean
  textDraft: string
  imageDraftBase64: string
  imageDraftMimeType: string
  imageDraftName: string
  setInputMode: (inputMode: InputMode) => void
  setLanguages: (sourceLanguage: Language, targetLanguage: TargetLanguage) => void
  setOutputViewMode: (outputViewMode: OutputViewMode) => void
  setInputMarkdownPreviewEnabled: (enabled: boolean) => void
  setOutputMarkdownEnabled: (enabled: boolean) => void
  setHistoryOpen: (historyOpen: boolean) => void
  setSettingsOpen: (settingsOpen: boolean) => void
  setTextDraft: (textDraft: string) => void
  setImageDraft: (input: {
    base64: string
    mimeType: string
    name: string
  }) => void
  clearImageDraft: () => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      inputMode: 'text',
      sourceLanguage: 'auto',
      targetLanguage: 'zh',
      outputViewMode: 'translated-only',
      inputMarkdownPreviewEnabled: false,
      outputMarkdownEnabled: false,
      historyOpen: false,
      settingsOpen: false,
      textDraft: '',
      imageDraftBase64: '',
      imageDraftMimeType: '',
      imageDraftName: '',
      setInputMode: (inputMode) => set({ inputMode: inputMode === 'document' ? 'text' : inputMode }),
      setLanguages: (sourceLanguage, targetLanguage) => set({ sourceLanguage, targetLanguage }),
      setOutputViewMode: (outputViewMode) => set({ outputViewMode }),
      setInputMarkdownPreviewEnabled: (inputMarkdownPreviewEnabled) => set({ inputMarkdownPreviewEnabled }),
      setOutputMarkdownEnabled: (outputMarkdownEnabled) => set({ outputMarkdownEnabled }),
      setHistoryOpen: (historyOpen) => set({ historyOpen }),
      setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
      setTextDraft: (textDraft) => set({ textDraft }),
      setImageDraft: (input) =>
        set({
          imageDraftBase64: input.base64,
          imageDraftMimeType: input.mimeType,
          imageDraftName: input.name,
        }),
      clearImageDraft: () =>
        set({
          imageDraftBase64: '',
          imageDraftMimeType: '',
          imageDraftName: '',
        }),
    }),
    {
      name: 'local-translate-ui',
      partialize: (state) => ({
        inputMode: state.inputMode === 'document' ? 'text' : state.inputMode,
        sourceLanguage: state.sourceLanguage,
        targetLanguage: state.targetLanguage,
        outputViewMode: state.outputViewMode,
        inputMarkdownPreviewEnabled: state.inputMarkdownPreviewEnabled,
        outputMarkdownEnabled: state.outputMarkdownEnabled,
        textDraft: state.textDraft,
        imageDraftBase64: state.imageDraftBase64,
        imageDraftMimeType: state.imageDraftMimeType,
        imageDraftName: state.imageDraftName,
      }),
    },
  ),
)
