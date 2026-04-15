/* eslint-disable unicorn/no-abusive-eslint-disable */
/* eslint-disable */
import fs from 'node:fs'
import path from 'node:path'
import { generateId, type I18nDict, type I18nEntry } from './shared.js'

import type { Plugin } from 'vite'

export * from './shared.js'
export * from './runtime.js'

export interface I18nExtractOptions {
  exportFilename?: string
  exportLocation?: string
  sourceLang?: string
  targetLang?: string[]
  exportMeta?: boolean
  originTrans?: null | string
}

export default function vueI18nExtractPlugin(options: I18nExtractOptions = {}): Plugin {
  const {
    exportFilename = 'i18n.json',
    exportLocation = './i18n',
    sourceLang = 'zh',
    targetLang = ['en', 'ja'],
    exportMeta = true,
    originTrans = null,
  } = options

  let dict: I18nDict = {}
  let root = process.cwd()
  let exportPath = ''

  const loadDict = () => {
    exportPath = path.resolve(root, exportLocation, exportFilename)
    if (fs.existsSync(exportPath)) {
      try {
        dict = JSON.parse(fs.readFileSync(exportPath, 'utf8'))
        for (const key in dict) {
          dict[key].meta ??= {}
          dict[key].meta.deprecated = true
        }
      } catch {
        dict = {}
      }
    } else {
      dict = {}
    }
  }

  const saveDict = () => {
    if (!fs.existsSync(path.dirname(exportPath))) {
      fs.mkdirSync(path.dirname(exportPath), { recursive: true })
    }
    fs.writeFileSync(exportPath, JSON.stringify(dict, null, 2), 'utf8')
  }

  return {
    name: 'vite-plugin-vue-i18n-extract',
    enforce: 'pre',
    configResolved(config) {
      root = config.root
      loadDict()
    },
    transform(code, id) {
      if (id.includes('node_modules') ?? id.startsWith('\0')) return

      const regex = /\$t(?:\.[a-zA-Z0-9_]+)?\s*\(\s*(['"`])((?:(?!\1)[^\\]|\\.)*)\1/g
      let match
      let changed = false
      while ((match = regex.exec(code)) !== null) {
        // Handle escaped quotes in string
        const sourceStr = match[2].replaceAll(/\\(['"`])/g, '$1')
        const entryId = generateId(sourceStr)
        if (dict[entryId]) {
          if (dict[entryId].meta) {
            delete dict[entryId].meta.deprecated
          }
        } else {
          const entry: I18nEntry = {
            id: entryId,
            [sourceLang]: sourceStr,
          }
          for (const lang of targetLang) {
            entry[lang] = originTrans ?? sourceStr
          }
          if (exportMeta) {
            entry.meta = {
              source: path.relative(root, id).replaceAll(/\\/g, '/'),
            }
          }
          dict[entryId] = entry
        }
        changed = true
      }

      if (changed) {
        saveDict()
      }

      return null
    },
    buildEnd() {
      saveDict()
    },
    resolveId(id) {
      if (id === 'virtual:vue-i18n-extract-dict') {
        return '\0virtual:vue-i18n-extract-dict'
      }
    },
    load(id) {
      if (id === '\0virtual:vue-i18n-extract-dict') {
        return `export default ${JSON.stringify(dict)}`
      }
    },
  }
}
