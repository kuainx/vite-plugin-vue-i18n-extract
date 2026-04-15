# vite-plugin-vue-i18n-extract

一款用于自动提取和翻译 Vue 项目中国际化文本的 Vite 插件。

## 项目说明

本项目实现自动提取指定格式中文字符，并翻译的功能。以 Vite 插件的形式生成，使用 TypeScript 编写代码。

### 核心功能

- 自动提取代码中的国际化文本
- 支持模板字符串参数替换（`$0`, `$1`, `$2` 等）
- 多语言翻译支持
- 自动生成唯一 ID
- 智能去重和复用已有翻译

## 安装

```bash
pnpm add vite-plugin-vue-i18n-extract
```

## 快速开始

### 1. 基础配置

在 `vite.config.ts` 中配置插件：

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueI18nExtract from 'vite-plugin-vue-i18n-extract'

export default defineConfig({
  plugins: [
    vue(),
    vueI18nExtract({
      exportFilename: 'i18n.json',
      exportLocation: './i18n',
      sourceLang: 'zh',
      targetLang: ['en', 'ja'],
      exportMeta: true,
      originTrans: null,
    }),
  ],
})
```

### 2. 使用 $t() 函数

在组件中使用 `$t()` 函数：

```vue
<template>
  <div>
    <h1>{{ $t('欢迎$0使用本系统', username) }}</h1>
    <p>{{ $t('当前时间：$0', currentTime) }}</p>
  </div>
</template>
```

### 3. 生成的 i18n 文件结构

插件会生成类似以下结构的 JSON 文件：

```json
{
  "3ceabd24": {
    "id": "3ceabd24",
    "zh": "欢迎$0使用本系统，现在时间是$1",
    "en": "Time: $1, Welcome $0 use this system.",
    "ja": "Time: $1, 本システムをご利用いただくご案内 $0",
    "meta": {
      "source": "components/welcome.vue"
    }
  }
}
```

## 配置选项

### 插件配置

| 选项 | 类型 | 描述 |
|------|------|------|
| `exportFilename` | `string` | 导出文件名，默认 `'i18n.json'` |
| `exportLocation` | `string` | 导出目录路径，默认 `'./i18n'` |
| `sourceLang` | `string` | 源语言代码，默认 `'zh'` |
| `targetLang` | `string[]` | 目标语言代码列表，默认 `['en', 'ja']` |
| `exportMeta` | `boolean` | 是否导出元数据，默认 `true` |
| `originTrans` | `null \| string` | 翻译来源，为 `null` 时使用源语言内容 |

### defineConfig 配置

使用 `defineConfig` 工具函数自定义运行时行为：

```typescript
import { defineConfig } from 'vite-plugin-vue-i18n-extract'

const $t = await defineConfig<'en' | 'zh'>()({
  displayLang: 'en',
  render: {
    default: (cfg, dat) => {
      return dat[cfg.displayLang] ?? dat['zh']
    },
    l: (cfg, dat) => {
      return `${dat['zh']} -> ${dat[cfg.displayLang] ?? dat['zh']}`
    },
  },
})
```

**配置说明：**

- `displayLang`: 显示语言
- `render`: 渲染函数集合
  - `default`: 默认渲染函数，通过 `$t()` 调用
  - `l`: 额外渲染函数，名称可以自定义，通过 `$t.l()` 调用

## API 参考

### $t()

格式化模板字符串。

```typescript
$t('欢迎$0使用本系统', '用户名')
// 输出: "欢迎用户名使用本系统"
```

**参数：**

- `template`: 模板字符串，支持 `$0`, `$1`, `$2` 等占位符
- `...args`: 对应占位符的参数

**注意：** 在不同语言中模板字符串顺序可能发生颠倒，处理时以编号顺序而非位置顺序为准。

### $t.l()

使用自定义渲染函数的方法。

```typescript
$t.l('欢迎使用本系统')
// 根据配置的渲染函数输出
```

## 模板字符串说明

### 占位符规则

- 使用 `$0`, `$1`, `$2` 等表示参数位置
- 参数按编号顺序替换，与实际位置无关
- 这确保了不同语言间语序变化时的正确翻译

### 示例

```typescript
// 中文原文
$t('欢迎$0使用本系统, 现在时间是$1', 'Admin', '2024-01-01')

// 英文翻译
// "Time: 2024-01-01, Welcome Admin use this system."
```

## 开发

### 安装依赖

```bash
vp install
```

### 运行测试

```bash
vp test
```

### 类型检查

```bash
vp check
```

### 代码格式化

```bash
vp fmt
```

## 工作流程

1. **初始化**：扫描项目中所有 `$t()` 调用
2. **生成 ID**：为每个唯一文本生成固定长度的哈希 ID
3. **合并翻译**：
   - 对现有条目标记 `deprecated: true`
   - 复用已存在的翻译并移除 deprecated 标记
   - 创建新条目
4. **导出文件**：生成包含所有翻译的 JSON 文件

## 相关文档

- [Vite 插件 API](reference/vite-plugin-api.md)
- [Rolldown 插件 API](reference/rolldown-plugin-api.md)

## License

MIT
