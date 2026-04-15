import Inspect from 'vite-plugin-inspect'
import { defineConfig } from 'vite-plus'

export default defineConfig({
  devtools: true,
  plugins: [Inspect()],
  pack: {
    dts: {
      tsgo: true,
    },
    exports: true,
  },
  fmt: {
    $schema: './node_modules/oxfmt/configuration_schema.json',
    singleQuote: true,
    semi: false,
    sortImports: {
      groups: [
        ['side_effect', 'side_effect_style'],
        { newlinesBetween: true },
        'external',
        'named-external',
        { newlinesBetween: true },
        'import',
        'named-import',
        { newlinesBetween: true },
        'type',
      ],
      newlinesBetween: false,
    },
    sortTailwindcss: {},
  },
})
