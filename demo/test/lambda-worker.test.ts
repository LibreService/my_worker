import { expect, test } from '@playwright/test'

const expectedLogs = [
  { type: 'log', text: '1' },
  { type: 'log', text: '0' },
  { type: 'log', text: 'true' },
  { type: 'log', text: 'Something wrong may happen' },
  { type: 'warning', text: 'No handler for command predictErrorUnknown' },
  { type: 'error', text: 'Error: x is falsy' },
  { type: 'log', text: 'true' },
  { type: 'log', text: '1' },
  { type: 'log', text: 'true' },
  { type: 'log', text: 'true' },
  { type: 'log', text: '1' },
  { type: 'log', text: '0' },
  { type: 'log', text: '4' },
  { type: 'log', text: '3, 3, 3, 3' },
  { type: 'log', text: '#' },
  { type: 'log', text: 'true' }
]

test('LambdaWorker', async ({ page }) => {
  const promise = new Promise(resolve => {
    let i = 0
    page.on('console', msg => {
      expect({ type: msg.type(), text: msg.text() }).toEqual(expectedLogs[i++])
      if (i === expectedLogs.length) {
        resolve(null)
      }
    })
  })
  await page.goto('http://localhost:4173')
  await promise
})
