import { md5 } from 'js-md5'

export type I18nEntry<LangList extends string> = {
  id: string
  meta?: {
    source?: string
    deprecated?: boolean
  } & Record<string, any>
} & Record<LangList, string>

export type I18nDict<LangList extends string> = Record<string, I18nEntry<LangList>>

export function generateId(str: string): string {
  return md5(str).slice(0, 8)
}
