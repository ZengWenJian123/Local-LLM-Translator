export class AppError extends Error {
  code: string

  constructor(message: string, code = 'APP_ERROR') {
    super(message)
    this.name = 'AppError'
    this.code = code
  }
}

export function normalizeErrorMessage(error: unknown): string {
  if (!error) return '发生未知错误'
  if (error instanceof AppError) return error.message
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return '请求失败，请稍后重试'
}
