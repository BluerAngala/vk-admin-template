# common/theme — 主题配置

项目主题系统，包含 UI 框架主题色配置和 Element UI 样式定制。

## 目录结构

```
theme/
├── element-ui/             ← Element UI 样式定制（详见其 README.md）
│   ├── element-custom.scss
│   ├── README.md
│   └── src/                ← SCSS 源码
├── index.js                ← 主题入口（导出所有主题配置）
├── white.js                ← 纯白主题
├── black.js                ← 纯黑主题
└── blackWhite.js           ← 黑白主题
```

## 主题文件说明

| 文件 | 作用 |
|---|---|
| `index.js` | 主题入口，导出 `white`、`black`、`blackWhite` 三个主题配置 |
| `white.js` | 纯白主题：左菜单白底、深色文字、蓝色激活态 |
| `black.js` | 纯黑主题：左菜单深色底、白色文字、蓝色激活态 |
| `blackWhite.js` | 黑白主题：左菜单深色底、白色文字、白色激活态 |

## 主题配置结构

每个主题文件导出以下配置：

```js
export default {
  leftMenu: {
    backgroundColor,        // 菜单背景色
    subBackgroundColor,     // 子菜单背景色
    textColor,              // 文字颜色
    activeTextColor,        // 激活态文字颜色
    activeBackgroundColor,  // 激活态背景色
    hoverTextColor,         // 悬停文字颜色
    hoverBackgroundColor,   // 悬停背景色
    boxShadow,              // 阴影
    borderTop,              // 顶部边框
  },
  topMenu: {
    backgroundColor,        // 顶部菜单背景色
    textColor,              // 顶部菜单文字色
  }
}
```

## 主题切换

主题通过 `app.config.js` 中的 `theme.use` 字段指定当前使用的主题：

```js
theme: {
  use: 'white',  // 可选值：'white'、'black'、'blackWhite'
  white: { ... },
  black: { ... },
  blackWhite: { ... }
}
```

## Element UI 样式定制

Element UI 的 SCSS 源码已复制到 `element-ui/` 目录，支持直接修改组件样式。

- **改全局变量**（颜色、圆角等）→ 编辑 `element-ui/element-custom.scss` 头部
- **改组件样式**（修 bug、调布局）→ 编辑 `element-ui/src/xxx.scss`
- **详细说明** → 见 `element-ui/README.md`

## 注意事项

- 主题配置控制的是左侧菜单和顶部菜单的样式，通过 JS 动态设置
- Element UI 组件样式通过 SCSS 编译，两者是独立的系统
- 新增主题时，在 `index.js` 中添加导出，并在 `app.config.js` 中注册
