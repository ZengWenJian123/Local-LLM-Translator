import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, PlugZap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { DEFAULT_BASE_URL_OPTIONS, FIXED_MODEL_NAME } from '@/lib/defaults'
import { appSettingsSchema, providerConfigSchema } from '@/schemas/settings'
import type { AppSettings, ProviderConfig } from '@/types/core'

interface ProviderConnectionFeedback {
  ok: boolean
  message: string
  models: string[]
}

interface ProviderConfigFormProps {
  provider: ProviderConfig
  settings: AppSettings
  testingConnection: boolean
  onSaveProvider: (input: ProviderConfig) => Promise<void>
  onSaveSettings: (input: AppSettings) => Promise<void>
  onTestConnection: (input: ProviderConfig) => Promise<ProviderConnectionFeedback>
}

export function ProviderConfigForm(props: ProviderConfigFormProps) {
  const {
    provider,
    settings,
    testingConnection,
    onSaveProvider,
    onSaveSettings,
    onTestConnection,
  } = props

  const [connectionFeedback, setConnectionFeedback] = useState<ProviderConnectionFeedback | null>(null)
  const [baseUrlOptionsOpen, setBaseUrlOptionsOpen] = useState(false)

  const providerForm = useForm<ProviderConfig>({
    resolver: zodResolver(providerConfigSchema),
    defaultValues: provider,
  })

  const settingsForm = useForm<AppSettings>({
    resolver: zodResolver(appSettingsSchema),
    defaultValues: settings,
  })

  useEffect(() => {
    providerForm.reset({
      ...provider,
      model: FIXED_MODEL_NAME,
    })
  }, [provider, providerForm])

  useEffect(() => {
    settingsForm.reset(settings)
  }, [settings, settingsForm])

  const baseUrlField = providerForm.register('baseURL')

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>模型设置</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-3"
            onSubmit={providerForm.handleSubmit(async (values) => {
              await onSaveProvider({
                ...values,
                model: FIXED_MODEL_NAME,
              })
            })}
          >
            <div className="grid grid-cols-1 gap-3">
              <label className="text-sm">
                Provider 名称
                <Input {...providerForm.register('name')} />
              </label>

              <label className="text-sm">
                Provider 类型
                <Select
                  value={providerForm.watch('providerType')}
                  onChange={(event) =>
                    providerForm.setValue('providerType', event.target.value as ProviderConfig['providerType'])
                  }
                >
                  <option value="lmstudio">lmstudio</option>
                  <option value="openai-compatible">openai-compatible</option>
                </Select>
              </label>

              <label className="text-sm">
                Base URL
                <div className="relative">
                  <Input
                    {...baseUrlField}
                    placeholder={DEFAULT_BASE_URL_OPTIONS[0]}
                    onFocus={() => setBaseUrlOptionsOpen(true)}
                    onClick={() => setBaseUrlOptionsOpen(true)}
                    onBlur={(event) => {
                      baseUrlField.onBlur(event)
                      window.setTimeout(() => setBaseUrlOptionsOpen(false), 120)
                    }}
                  />
                  {baseUrlOptionsOpen ? (
                    <div className="absolute z-20 mt-1 w-full rounded-md border border-input bg-background p-1 shadow-md">
                      {DEFAULT_BASE_URL_OPTIONS.map((url) => (
                        <button
                          key={url}
                          type="button"
                          className="block w-full rounded-sm px-2 py-1 text-left text-sm hover:bg-muted"
                          onMouseDown={(event) => {
                            event.preventDefault()
                            providerForm.setValue('baseURL', url, { shouldDirty: true, shouldValidate: true })
                            setBaseUrlOptionsOpen(false)
                          }}
                        >
                          {url}
                        </button>
                      ))}
                      <button
                        type="button"
                        className="block w-full rounded-sm px-2 py-1 text-left text-sm hover:bg-muted"
                        onMouseDown={(event) => {
                          event.preventDefault()
                          setBaseUrlOptionsOpen(false)
                        }}
                      >
                        自定义（可以输入）
                      </button>
                    </div>
                  ) : null}
                </div>
              </label>

              <label className="text-sm">
                API Key
                <Input {...providerForm.register('apiKey')} type="password" placeholder="可选" />
              </label>

              <label className="text-sm">
                模型名称
                <Input value={FIXED_MODEL_NAME} readOnly />
              </label>

              <label className="text-sm">
                超时（毫秒）
                <Input
                  type="number"
                  value={providerForm.watch('timeoutMs')}
                  onChange={(event) => providerForm.setValue('timeoutMs', Number(event.target.value))}
                />
              </label>

              <Switch
                label="启用 Provider"
                checked={providerForm.watch('enabled')}
                onChange={(event) => providerForm.setValue('enabled', event.target.checked)}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit">保存模型配置</Button>
              <Button
                type="button"
                variant="outline"
                onClick={providerForm.handleSubmit(async (values) => {
                  const feedback = await onTestConnection({
                    ...values,
                    model: FIXED_MODEL_NAME,
                  })
                  setConnectionFeedback(feedback)
                })}
                disabled={testingConnection}
              >
                {testingConnection ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <PlugZap className="mr-1 h-4 w-4" />
                )}
                测试连接
              </Button>
            </div>

            {connectionFeedback ? (
              <div
                className={`rounded-md border p-3 text-sm ${
                  connectionFeedback.ok
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-destructive/40 bg-destructive/10 text-destructive'
                }`}
              >
                <div>{connectionFeedback.message}</div>
                {connectionFeedback.models.length > 0 ? (
                  <div className="mt-1 text-xs">可用模型：{connectionFeedback.models.join('、')}</div>
                ) : null}
              </div>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>翻译设置</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-3"
            onSubmit={settingsForm.handleSubmit(async (values) => {
              await onSaveSettings(values)
            })}
          >
            <label className="text-sm">
              默认目标语言
              <Select
                value={settingsForm.watch('defaultTargetLanguage')}
                onChange={(event) =>
                  settingsForm.setValue('defaultTargetLanguage', event.target.value as AppSettings['defaultTargetLanguage'])
                }
              >
                <option value="zh">中文</option>
                <option value="en">英文</option>
                <option value="ru">俄语</option>
              </Select>
            </label>

            <label className="text-sm">
              默认输出模式
              <Select
                value={settingsForm.watch('outputViewMode')}
                onChange={(event) =>
                  settingsForm.setValue('outputViewMode', event.target.value as AppSettings['outputViewMode'])
                }
              >
                <option value="translated-only">仅译文</option>
                <option value="bilingual">双语对照</option>
              </Select>
            </label>

            <label className="text-sm">
              历史记录条数
              <Input
                type="number"
                value={settingsForm.watch('historyLimit')}
                onChange={(event) => settingsForm.setValue('historyLimit', Number(event.target.value))}
              />
            </label>

            <div className="grid grid-cols-1 gap-2">
              <Switch
                label="自动检测源语言"
                checked={settingsForm.watch('autoDetectSourceLanguage')}
                onChange={(event) => settingsForm.setValue('autoDetectSourceLanguage', event.target.checked)}
              />
              <Switch
                label="启用流式输出"
                checked={settingsForm.watch('enableStreaming')}
                onChange={(event) => settingsForm.setValue('enableStreaming', event.target.checked)}
              />
              <Switch
                label="启用 Ctrl+Enter 翻译"
                checked={settingsForm.watch('enableCtrlEnterTranslate')}
                onChange={(event) => settingsForm.setValue('enableCtrlEnterTranslate', event.target.checked)}
              />
              <Switch
                label="保持术语一致性"
                checked={settingsForm.watch('keepTerminologyConsistency')}
                onChange={(event) => settingsForm.setValue('keepTerminologyConsistency', event.target.checked)}
              />
            </div>
            <Button type="submit">保存翻译设置</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
