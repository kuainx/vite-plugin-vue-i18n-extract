import { generateId } from './shared.js'

import type { I18nDict, I18nEntry } from './shared.js'

export interface RuntimeConfig<
  LangList extends string = string,
  RenderList extends string = string,
> {
  displayLang: LangList
  render: {
    default?: TRenderFn<LangList>
  } & Record<RenderList, TRenderFn<LangList>>
}

export type TRenderFn<LangList extends string> = (
  cfg: RuntimeConfig<LangList>,
  dat: I18nEntry<LangList>,
) => string

type TFn = (str: string, ...args: any[]) => string
export type TFunction<RenderList extends string> = TFn & Record<RenderList, TFn>
function defaultRenderFn<LangList extends string>(
  cfg: RuntimeConfig<LangList>,
  dat: I18nEntry<LangList>,
): string {
  return dat[cfg.displayLang]
}

export function defineConfig<LangList extends string>() {
  return async function init<RenderList extends string>(
    cfg: RuntimeConfig<LangList, RenderList>,
  ): Promise<TFunction<RenderList>> {
    let DICT: I18nDict<LangList> = {}
    const { displayLang, render } = cfg
    const runtimeRender: Record<RenderList | 'default', TRenderFn<LangList>> = {
      default: defaultRenderFn<LangList>,
      ...render,
    }
    try {
      const mod = await import('virtual:vue-i18n-extract-dict')
      DICT = mod.default as I18nDict<LangList>
    } catch (error: any) {
      DICT = {}
      console.warn('i18n-dict module not found', error)
    }

    function processRender(renderFn: TRenderFn<LangList>, str: string, args: any[]): string {
      const id = generateId(str)
      const dat = DICT[id] ?? { id, [displayLang]: str }
      // 遍历args，全部转换为string
      const strArgs = convertArgsToStringArraySimple(args)
      for (const key in dat) {
        if (!Object.hasOwn(dat, key)) continue
        const value = dat[key as LangList]
        if (!(typeof value === 'string')) continue
        ;(dat[key as LangList] as string) = processTemplate(value, strArgs)
      }
      return renderFn(cfg, dat)
    }

    const tProxy = new Proxy(function () {}, {
      get(target, prop: RenderList) {
        if (Object.hasOwn(runtimeRender, prop)) {
          const renderFn = runtimeRender?.[prop] ?? runtimeRender.default
          return function (str: string, ...args: any[]) {
            return processRender(renderFn, str, args)
          }
        }
        return target[prop as keyof typeof target]
      },
      apply(target, thisArg, args: [string, ...any[]]) {
        const str = args[0]
        const restArgs = args.slice(1)
        return processRender(runtimeRender.default, str, restArgs)
      },
    })
    return tProxy as unknown as TFunction<RenderList>
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
