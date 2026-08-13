# common/css — 全局样式

项目全局 CSS/SCSS 样式文件。

## 文件说明

| 文件 | 作用 | 引入方式 |
|---|---|---|
| `app.scss` | 项目自定义全局样式（滚动条、富文本编辑器等） | `main.js` 中 `import '@/common/css/app.scss'` |
| `uni.scss` | uni-app 内置样式变量 + 菜单/布局变量 + 通用 mixin | 自动全局注入，无需手动 import |
| `main.css` | 登录页表单样式（header、form-view、login-btn、footer） | 登录页组件引用 |

## uni.scss 变量速查

### 颜色

```scss
$uni-color-primary    // #007aff  主色
$uni-color-success    // #4cd964  成功色
$uni-color-warning    // #f0ad4e  警告色
$uni-color-error      // #dd524d  错误色
$uni-text-color       // #333     文字基本色
$uni-text-color-grey  // #999     辅助灰色
$uni-bg-color         // #fff     背景色
$uni-border-color     // #e4e7ed  边框色
```

### 尺寸

```scss
$uni-font-size-sm/base/lg    // 12/14/16px  字号
$uni-border-radius-sm/base/lg // 3/5/10px   圆角
$uni-spacing-row-sm/base/lg  // 10/15/20px 水平间距
$uni-spacing-col-sm/base/lg  // 5/10/15px  垂直间距
```

### 菜单/布局

```scss
$menu-bg-color              // 菜单背景色
$menu-text-color            // 菜单文字色
$menu-text-color-actived    // 菜单激活色（#409eff）
$left-window-bg-color       // 左侧窗口背景色
$top-window-bg-color        // 顶部窗口背景色
```

### Mixin

```scss
@mixin flex_center_center     // 水平垂直居中
@mixin flex_direction_center  // 纵向居中
@mixin flex_justify_center    // 水平可换行居中
```

## 注意事项

- `uni.scss` 中的变量自动全局注入，任何 `.vue` 文件的 `<style lang="scss">` 中可直接使用，无需 import
- `app.scss` 在 `main.js` 中引入，作用于全局
- `main.css` 是登录页专用样式，仅登录组件引用
- Element UI 样式定制已移至 `common/theme/element-ui/`，不在此目录
