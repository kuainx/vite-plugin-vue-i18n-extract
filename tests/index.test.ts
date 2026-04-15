import { expect, test } from 'vite-plus/test'

import { $t, defineConfig, generateId } from '../src/index.ts'

test('generateId', () => {
  const id1 = generateId('欢迎$0使用本系统, 现在时间是$1')
  const id2 = generateId('欢迎$0使用本系统, 现在时间是$1')
  expect(id1).toBe(id2)
  expect(id1.length).toBe(8)
})

test('runtime $t formatting', async () => {
  await defineConfig({
    displayLang: 'en',
    render: {
      // oxlint-disable-next-line jest/no-conditional-in-test
      default: (cfg, dat) => dat[cfg.displayLang] ?? dat['zh'],
    },
  })

  // Mock DICT behavior through fallback dat
  const res = $t('Welcome $1 to $0', 'System', 'Admin')
  expect(res).toBe('Welcome Admin to System')
})

test('runtime $t.l formatting', async () => {
  await defineConfig({
    displayLang: 'en',
    render: {
      // oxlint-disable-next-line jest/no-conditional-in-test
      default: (cfg, dat) => dat[cfg.displayLang] ?? dat['zh'],
      // oxlint-disable-next-line jest/no-conditional-in-test
      l: (cfg, dat) => `${dat['zh']} -> ${dat[cfg.displayLang] ?? dat['zh']}`,
    },
  })

  const res = $t.l('欢迎使用本系统')
  expect(res).toBe('欢迎使用本系统 -> 欢迎使用本系统')
})
