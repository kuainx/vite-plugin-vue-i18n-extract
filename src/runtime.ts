import { generateId } from './shared.js'

import type { I18nDict, I18nEntry } from './shared.js'

export interface RuntimeConfig {
  displayLang: string
  render?: Record<string, TRenderFn>
}
export type TRenderFn = (cfg: RuntimeConfig, dat: I18nEntry) => string
const defaultRenderFn: TRenderFn = (cfg, dat) => dat[cfg.displayLang] as string

let config: RuntimeConfig = {
  displayLang: 'en',
  render: {
    default: defaultRenderFn,
  },
}

let DICT: I18nDict = {}

export async function defineConfig(cfg: RuntimeConfig): Promise<void> {
  let render = config.render
  if (cfg.render) {
    render = { ...render, ...cfg.render }
  }
  config = { ...config, ...cfg, render }
  try {
    const mod = await import('virtual:vue-i18n-extract-dict')
    DICT = mod.default as I18nDict
  } catch (error: any) {
    DICT = {}
    console.warn('i18n-dict module not found', error)
  }
}

function convertArgsToStringArraySimple(args: any[]): string[] {
  return args.map((arg) => {
    try {
      // 尝试将参数转换为JSON字符串
      if (arg === null || arg === undefined) {
        return String(arg)
      }
      if (typeof arg === 'object' || typeof arg === 'function') {
        return JSON.stringify(arg, null, 0) || String(arg)
      }
      return String(arg)
    } catch {
      // 如果转换失败，返回一个安全的字符串表示
      return `[${typeof arg}]`
    }
  })
}

function processTemplate(str: string, args: string[]): string {
  if (!str) return str
  return str.replaceAll(/\$(\d+)/g, (match, index: string) => {
    const i = Number.parseInt(index)
    return args[i] ?? match
  })
}

export interface TFunction {
  (str: string, ...args: any[]): string
  [key: string]: (str: string, ...args: any[]) => string
}

function processRender(renderFn: TRenderFn, str: string, args: any[]): string {
  const id = generateId(str)
  let dat = DICT[id]
  dat ??= { id, [config.displayLang]: str, zh: str }
  // 遍历args，全部转换为string
  const strArgs = convertArgsToStringArraySimple(args)
  for (const key in dat) {
    if (Object.hasOwn(dat, key) && typeof dat[key] === 'string') {
      dat[key] = processTemplate(dat[key], strArgs)
    }
  }
  return renderFn(config, dat)
}

const tProxy = new Proxy(function () {} as unknown as TFunction, {
  get(target, prop: string) {
    if (prop === 'name' || prop === 'length' || typeof prop !== 'string') {
      return target[prop as keyof typeof target]
    }
    const renderFn = config.render?.[prop] ?? config.render?.default ?? defaultRenderFn
    return function (str: string, ...args: any[]) {
      return processRender(renderFn, str, args)
    }
  },
  apply(target, thisArg, args: [string, ...any[]]) {
    const str = args[0]
    const restArgs = args.slice(1)
    const renderFn = config.render?.default ?? defaultRenderFn
    return processRender(renderFn, str, restArgs)
  },
})

export { tProxy as $t }
