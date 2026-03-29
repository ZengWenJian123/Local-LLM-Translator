import { expect, test } from '@playwright/test'

test('text translation flow renders output', async ({ page }) => {
  await page.goto('/')
  await page.getByPlaceholder('在这里输入待翻译文本，支持 Ctrl+V / Ctrl+Enter').fill('hello world')
  await page.getByRole('button', { name: '开始翻译' }).click()
  await expect(page.getByText('输出区')).toBeVisible()
})

test('settings drawer can open', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '设置' }).click()
  await expect(page.getByText('模型设置')).toBeVisible()
})
