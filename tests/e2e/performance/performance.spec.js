/* eslint-disable capitalized-comments */
import { test, expect } from 'playwright-test-coverage'

test.describe('Performance Benchmarking', () => {
  test('Search page load time is less than 2 second', async ({ page, browserName }) => {
    if (['chromium'].includes(browserName)) {
      await page.goto('/')
      const requestFinishedPromise = page.waitForEvent('requestfinished')
      const request = await requestFinishedPromise

      const requestTime = request.timing().responseEnd
      console.log('[performance] Request time,', browserName.concat(':'), Math.round(requestTime), 'ms')
      expect(requestTime < 2000).toBe(true)
    }
  })

  test('Search page LCP start time is less than 2 second', async ({ page, browserName }) => {
    if (browserName === 'chromium') {
      await page.goto('/')
      const paintTimingJson = await page.evaluate(async () => new Promise((resolve) => {
        new PerformanceObserver((entryList) => {
          const largestPaintEntry = entryList.getEntries().find(
            (entry) => entry.entryType === 'largest-contentful-paint'
          )
          resolve(largestPaintEntry.startTime)
        }).observe({
          type: 'largest-contentful-paint',
          buffered: true
        })
      }))

      const paintTiming = JSON.parse(paintTimingJson)
      console.log('[performance] LCP,', browserName.concat(':'), Math.round(paintTiming), 'ms')

      expect(paintTiming).toBeLessThan(2000)
    }
  })

  // These tests run the performance metrics in the CI environment.
  // They do not have performance-related failure conditions.
  test.describe('Performance metrics logging', () => {
    test('Run the collections load timer', async ({ page, browserName }) => {
      await page.route('**/*.{png,jpg,jpeg}', (route) => route.abort())
      const logs = []
      page.on('console', (msg) => logs.push(msg.text()))
      await page.goto('/')

      await expect(page.getByTestId('collection-results-item').first()).toBeVisible()

      const filteredLogs = logs.filter((value) => /^\[performance] Collections load time/.test(value))
      const collectionsLoadTime = Number(filteredLogs.at(-1).split(': ')[1])
      console.log('[performance] Collections load time,', browserName.concat(':'), collectionsLoadTime, 'ms')
    })
  })
})
