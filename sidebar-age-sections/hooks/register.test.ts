import { expect, test } from 'claude-code/testing'
import { bucketOf } from './register'

const H = 60 * 60 * 1000
const now = new Date(2026, 10, 1, 9, 0).getTime() // 09:00 local

test('since local midnight is today', () => {
  expect(bucketOf(now - 1 * H, now)).toBe('today')
  expect(bucketOf(now - 9 * H, now)).toBe('today')
})

test('older ages map to the right section', () => {
  expect(bucketOf(now - 10 * H, now)).toBe('last day')
  expect(bucketOf(now - 30 * H, now)).toBe('last 3 days')
  expect(bucketOf(now - 5 * 24 * H, now)).toBe('last week')
  expect(bucketOf(now - 40 * 24 * H, now)).toBe('more than a week')
})
