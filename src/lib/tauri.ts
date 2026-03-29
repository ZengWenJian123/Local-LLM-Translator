import { invoke } from '@tauri-apps/api/core'

export const isTauriRuntime = (): boolean =>
  Boolean(typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window)

export async function invokeIfTauri<T>(
  command: string,
  args?: Record<string, unknown>,
): Promise<T | null> {
  if (!isTauriRuntime()) return null
  return invoke<T>(command, args)
}
