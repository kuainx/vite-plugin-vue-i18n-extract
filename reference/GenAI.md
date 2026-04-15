# vite-plugin-vue-i18n-extract

## 项目说明

- 本项目实现自动提取指定格式中文字符，并翻译的功能
- 以vite插件的形式生成，使用ts编写代码
- 关于Vite插件的API详见`vite-plugin-api.md`
- 关于Rolldown插件的API详见`rolldown-plugin-api.md`

## 项目要求

- 导出一个函数`$t()`供使用，使用示例如下`$t('欢迎$0使用本系统', username)`
- 注意：在不同语言中模板字符串顺序可能发生颠倒，在处理模板字符串时应当以编号顺序而非位置顺序处理
- 作为Vue项目的插件使用，插件配置需要包含以下属性
  - exportFilename: 'i18n.json'
  - exportLocation: './i18n'
  - sourceLang: 'zh'
  - targetLang: ['en', 'ja']
  - exportMeta: true
  - originTrans: null | string
- 每一个条目需要包含以下内容
  - 唯一ID，通过源文字生成
  - 源语言和目标语言列表展开
  - meta
    示例如下：

```js
{
  '3ceabd': {
    'id': '3ceabd',
    'zh': '欢迎$0使用本系统，现在时间是$1',
    'en': 'Time: $1, Welcome $0 use this system.',
    'ja': 'Time: $1, 本システムをご利用いただくご案内 $0',
    'meta': {
      'source': 'components/welcome.vue'
    }
  }
}
```

- 运行步骤
  - 对现有文件中存在的所有条目填充deprecated:true的meta
  - 在生成条目之前，应当检查现有的文件中是否存在该条目，如果存在则复用，并删除deprecated属性。
  - 如果条目不存在，根据要求生成条目，对于翻译的内容，根据originTrans配置项，如果为null，则填充源内容，如果为string，则填充originTrans的内容。

- 工具函数
  - 提供defineConfig工具函数使用，包含以下设置
  - displayLang: 'en'
  - render: { } 允许用户传入不同的渲染函数，默认渲染函数为default
  - 要求不同渲染函数这样调用`$t.l('欢迎使用本系统')`默认渲染函数`$t('欢迎使用本系统')`
    示例：

```js
defineConfig({
  displayLang: 'en',
  render: {
    default: (cfg, dat) => {
      // 注意：传入渲染函数中的dat格式与条目相同，但是模板字符串应当已经处理完成
      return dat[cfg.displayLang]
    },
    l: (cfg, dat) => {
      return dat['zh'] + ' -> ' + dat[cfg.displayLang]
    },
  },
})
```
