import { expect, test } from 'claude-code/testing'
import { bucketOf } from './register'

const H = 60 * 60 * 1000

test('ages map to the right section', () => {
  expect(bucketOf(1 * H)).toBe('last day')
  expect(bucketOf(30 * H)).toBe('last 3 days')
  expect(bucketOf(5 * 24 * H)).toBe('last week')
  expect(bucketOf(40 * 24 * H)).toBe('more than a week')
})
