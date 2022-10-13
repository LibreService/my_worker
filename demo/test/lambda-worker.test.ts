import { expect, test } from '@playwright/test'

const expectedLogs = [
  { type: 'log', text: '1' },
  { type: 'log', text: 'true' },
  { type: 'error', text: 'Error: x is falsy' },
  { type: 'log', text: '1' },
  { type: 'log', text: '1' }
]

test('LambdaWorker', async ({ page }) => {
  let i = 0
  page.on('console', msg => {
    expect({ type: msg.type(), text: msg.text()}).toEqual(expectedLogs[i++])
  })
  await page.goto(`http://localhost:4173`)
})
