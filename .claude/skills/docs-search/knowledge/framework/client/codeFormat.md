---
sidebarDepth: 0
---

# 代码格式化配置（推荐）

统一的代码格式化能让团队代码风格保持一致，减少因格式差异产生的无意义 diff，提升代码可读性和协作效率。

本项目使用 [Prettier](https://prettier.io/) 作为代码格式化工具，以下是在 HBuilderX 中的配置步骤。

## 步骤一：安装 Prettier 插件@install

前往 HBuilderX 插件市场下载 Prettier 插件：[下载地址](https://ext.dcloud.net.cn/plugin?id=2025)

## 步骤二：编辑器设置@hbx-config

点击 HBuilderX 上方菜单 **【工具】→【设置】→【源码视图】**，将下方的配置项复制到右边的输入框中。

::: warning 注意
不要删除你原有的其他配置项，只需将以下内容合并进去即可。
:::

```json
{
  "defaultFomat.javascript_es6": "formator-prettier",
  "defaultFomat.json": "formator-prettier",
  "defaultFomat.markdown": "formator-prettier",
  "defaultFomat.vue": "formator-prettier",
  "prettier._enable": true,
  "prettier.useEditorIndentStyle": false,
  "prettier.scope": "**/*.vue,**/*.nvue,**/*.ux,**/*.ts,**/*.tsx,**/*.less,**/*.sass,**/*.scss,**/*.js,,**/*.json",
  "editor.formatOnSave": true
}
```

**配置项说明**

| 配置项                          | 说明                                                       |
| ------------------------------- | ---------------------------------------------------------- |
| `defaultFomat.*`                | 将 js、json、markdown、vue 的默认格式化工具设置为 Prettier |
| `prettier._enable`              | 启用 Prettier 插件                                         |
| `prettier.useEditorIndentStyle` | 不使用编辑器的缩进设置，而是使用 Prettier 自身的配置       |
| `prettier.scope`                | 指定 Prettier 格式化的文件范围                             |
| `editor.formatOnSave`           | 保存文件时自动格式化                                       |

## 步骤三：全局 Prettier 配置@global-config

在 **【插件配置】** 中按如下图点击操作：

![](https://cdn.fsq.pub/vkdoc/vk-client/e4f3875c-0aa4-43d0-8c76-27fbb210364f.png)

复制下方的配置 **替换** 原来的默认配置：

**注意**：不要修改下面的配置，这样可以和 VK 框架项目保持一致，之后更新框架插件 diff 代码时会很友好

```js
module.exports = {
  // 单行最大字符数
  printWidth: 180,
  // 缩进空格数
  tabWidth: 2,
  // false代表使用空格缩进
  useTabs: false,
  // 语句末尾添加分号
  semi: true,
  // true 使用单引号 false 使用双引号
  singleQuote: true,
  // ES5 兼容的尾逗号
  trailingComma: 'es5',
  // 对象花括号内加空格，如 { foo: bar }
  bracketSpacing: true,
  // HTML 标签属性的闭合括号放在同一行
  bracketSameLine: false,
  // 箭头函数参数始终加括号，如 (x) => x
  arrowParens: 'always',
  // 换行符使用 lf
  endOfLine: 'lf',
  // HTML 空白敏感度按 CSS display 属性决定
  htmlWhitespaceSensitivity: 'css',
  // Vue 文件中 <script> 和 <style> 内容缩进
  vueIndentScriptAndStyle: true,
  // 对象属性仅必要时加引号
  quoteProps: 'as-needed',
  // 保留Markdown/注释的手动换行
  proseWrap: 'preserve',
  // 自动格式化嵌入的代码片段（如Markdown代码块）
  embeddedLanguageFormatting: 'auto',
  // 标签多个短属性尽可能同行显示
  singleAttributePerLine: false,
  //自定义文件后缀对应的parser
  parsers: {
    '.nvue': 'vue',
    '.ux': 'vue',
    '.uvue': 'vue',
    '.uts': 'typescript',
  },
};
```

## 步骤四：项目级 Prettier 配置@project-config

推荐使用项目级 Prettier 配置，这样可以防止因不同电脑全局配置不一致导致格式不一致

在项目根目录内新增配置文件 `prettier.config.js`

**注意**：不要修改下面的配置，这样可以和 VK 框架项目保持一致，之后更新框架插件 diff 代码时会很友好

```js
module.exports = {
  // 单行最大字符数
  printWidth: 180,
  // 缩进空格数
  tabWidth: 2,
  // false代表使用空格缩进
  useTabs: false,
  // 语句末尾添加分号
  semi: true,
  // true 使用单引号 false 使用双引号
  singleQuote: true,
  // ES5 兼容的尾逗号
  trailingComma: 'es5',
  // 对象花括号内加空格，如 { foo: bar }
  bracketSpacing: true,
  // HTML 标签属性的闭合括号放在同一行
  bracketSameLine: false,
  // 箭头函数参数始终加括号，如 (x) => x
  arrowParens: 'always',
  // 换行符使用 lf
  endOfLine: 'lf',
  // HTML 空白敏感度按 CSS display 属性决定
  htmlWhitespaceSensitivity: 'css',
  // Vue 文件中 <script> 和 <style> 内容缩进
  vueIndentScriptAndStyle: true,
  // 对象属性仅必要时加引号
  quoteProps: 'as-needed',
  // 保留Markdown/注释的手动换行
  proseWrap: 'preserve',
  // 自动格式化嵌入的代码片段（如Markdown代码块）
  embeddedLanguageFormatting: 'auto',
  // 标签多个短属性尽可能同行显示
  singleAttributePerLine: false,
  // 单独覆盖特定文件的配置
  overrides: [
    {
      // 以下文件使用双引号
      files: ['**/config.js', '**/uni-config-center/**/*.js'],
      options: {
        singleQuote: false, // 使用双引号
        quoteProps: 'preserve',
      },
    },
  ],
};
```

## 批量格式化项目所有文件@format-all

**特别注意：操作前先提交 git，确保如果出错也能还原**

1. 安装全局 prettier 依赖

这里指定版本为 `2.8.4` 是为了和 `HBuilderX` 插件市场的版本对齐

```bash
npm install -g prettier@2.8.4 --registry https://registry.npmmirror.com
```

2. 添加格式化忽略文件

项目根目录下的 `.prettierignore` 文件用于指定不需要格式化的文件和目录，以下是默认配置：

```txt
# 依赖目录
node_modules/
.node_modules/

# 构建产物
unpackage/
dist/

# uni-app 插件市场模块（第三方模块不格式化）
uni_modules/

# 编辑器配置
.vscode/
.hbuilderx/
.idea/
.prettierignore
.editorconfig
.gitattributes
.gitignore

# 缓存文件
.vite/
.eslintcache

# 系统文件
.DS_Store

# 锁文件
package-lock.json
yarn.lock
pnpm-lock.yaml

# 其他
*.min.js
*.min.css
manifest.json
static/
changelog.md
```

::: tip 提示
如果你有其他不需要格式化的文件或目录，可以在 `.prettierignore` 中自行添加。
:::

3. 在项目根目录内新增配置文件 `prettier.config.js`

**注意**：不要修改下面的配置，这样可以和 VK 框架项目保持一致，之后更新框架插件 diff 代码时会很友好

```js
module.exports = {
  // 单行最大字符数
  printWidth: 180,
  // 缩进空格数
  tabWidth: 2,
  // false代表使用空格缩进
  useTabs: false,
  // 语句末尾添加分号
  semi: true,
  // true 使用单引号 false 使用双引号
  singleQuote: true,
  // ES5 兼容的尾逗号
  trailingComma: 'es5',
  // 对象花括号内加空格，如 { foo: bar }
  bracketSpacing: true,
  // HTML 标签属性的闭合括号放在同一行
  bracketSameLine: false,
  // 箭头函数参数始终加括号，如 (x) => x
  arrowParens: 'always',
  // 换行符使用 lf
  endOfLine: 'lf',
  // HTML 空白敏感度按 CSS display 属性决定
  htmlWhitespaceSensitivity: 'css',
  // Vue 文件中 <script> 和 <style> 内容缩进
  vueIndentScriptAndStyle: true,
  // 对象属性仅必要时加引号
  quoteProps: 'as-needed',
  // 保留Markdown/注释的手动换行
  proseWrap: 'preserve',
  // 自动格式化嵌入的代码片段（如Markdown代码块）
  embeddedLanguageFormatting: 'auto',
  // 标签多个短属性尽可能同行显示
  singleAttributePerLine: false,
  // 单独覆盖特定文件的配置
  overrides: [
    {
      // 以下文件使用双引号
      files: ['**/config.js', '**/uni-config-center/**/*.js'],
      options: {
        singleQuote: false, // 使用双引号
        quoteProps: 'preserve',
      },
    },
  ],
};
```

4. 执行格式化命令

在项目根目录下执行下方命令

```bash
npx prettier "**/*" --write --ignore-unknown
```

5. 还原本是压缩成一行的文件

如 `router/service/admin/system/app/util/createPublishHtml/lib/art-template.js` 这些文件原本被压缩成一行或几行的文件，最好不要格式化，所以需要还原 Ta，如下图所示

![](https://cdn.fsq.pub/vkdoc/vk-client/5feb688e-66d6-4711-bbca-320b6e786a8a.png)

提示：如需卸载全局 prettier 依赖，可执行以下命令

```bash
npm uninstall -g prettier
```

## 常见问题@q

### 保存时没有自动格式化？@q1

请检查以下几点：

1. 确认 Prettier 插件已正确安装
2. 点击 HBuilderX 上方菜单 **【工具】→【设置】→【源码视图】**，确认 `editor.formatOnSave` 已设置为 `true`
3. 确认当前文件类型在 `prettier.scope` 的范围内

### 如何取消保存时自动格式化？@q2

点击 HBuilderX 上方菜单 **【工具】→【设置】→【源码视图】**

将 `editor.formatOnSave` 已设置为 `false`

### 格式化后代码风格和团队不一致？@q3

请确保你使用的是上述统一的 Prettier 配置，不要使用个人自定义的配置覆盖项目配置。

### 格式化后部分条件编译格式错乱，导致无法运行项目？@q4

什么情况下会出现条件编译格式错乱？`vk-uview-ui` 的 `u-input` 组件就碰到了这个问题，具体问题如下

**格式化前**

```vue
<template>
  <!-- prettier-ignore -->
  <view
    class="u-input"

    <!-- #ifndef MP-HARMONY -->
    @tap.stop="inputClick"
    <!-- #endif -->

    <!-- #ifdef MP-HARMONY -->
    @tap="inputClick"
    <!-- #endif -->
  >
  </view
</template>
```

是因为在 `template` 内的 `view` 标签内使用了条件编译，此时可能格式化后会变成下面这样

**格式化后**

```vue
<template>
  <!-- prettier-ignore -->
  <view
    class="u-input"

    <!--
    #ifndef
    MP-HARMONY
    --
  >
    @tap.stop="inputClick"
    <!-- #endif -->

    <!-- #ifdef MP-HARMONY -->
    @tap="inputClick"
    <!-- #endif -->
  >
  </view>
</template>
```

即 `<!-- #ifndef MP-HARMONY -->` 会被拆成多行，导致条件编译失效，进而格式错乱导致无法正常编译，因此，尽量不要在组件标签内部使用 条件编译，而应该在组件标签外写条件编译，如下这样写就没问题

```vue
<template>
  <!-- #ifndef MP-HARMONY -->
  <view class="u-input" @tap.stop="inputClick"></view>
  <!-- #endif -->
  <!-- #ifdef MP-HARMONY -->
  <view class="u-input" @tap="inputClick"></view>
  <!-- #endif -->
</template>
```

当然，如果代码较多，不想重构，可以直接使用 `<!-- prettier-ignore -->` 来忽略该组件的格式化，如下写法也没问题

```vue
<template>
  <!-- prettier-ignore -->
  <view
    class="u-input"

    <!-- #ifndef MP-HARMONY -->
    @tap.stop="inputClick"
    <!-- #endif -->

    <!-- #ifdef MP-HARMONY -->
    @tap="inputClick"
    <!-- #endif -->
  >
  </view
</template>
```
