import { md5 } from 'js-md5'

export interface I18nEntry {
  id: string
  meta?: {
    source?: string
    deprecated?: boolean
    [key: string]: any
  }
  [lang: string]: any
}

export type I18nDict = Record<string, I18nEntry>

export function generateId(str: string): string {
  return md5(str).slice(0, 8)
}
