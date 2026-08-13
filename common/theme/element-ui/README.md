# Element UI 样式定制

## 目录结构

```
element-ui/
├── element-custom.scss   ← 入口文件：变量覆盖 + 引入源码
├── src/                  ← Element UI SCSS 源码（可直接修改）
│   ├── index.scss        ← 组件样式汇总
│   ├── common/
│   │   ├── var.scss      ← 513 个变量（全部带 !default）
│   │   ├── popup.scss
│   │   └── transition.scss
│   ├── mixins/           ← BEM mixin 工具函数
│   ├── card.scss         ← 单个组件样式
│   ├── button.scss
│   ├── table.scss
│   ├── dialog.scss
│   ├── ...
│   └── date-picker/      ← 复杂组件子目录
└── README.md             ← 本文件
```

## 工作原理

Element UI 的所有 SCSS 变量都带 `!default` 标记。SCSS 的 `!default` 规则是：
**如果变量已经定义过，就用已有的值；否则才用默认值。**

所以只要在 `element-custom.scss` 头部定义同名变量（不带 `!default`），
后面 `@import` 的源码中同名变量就不会生效。

## 使用方式

### 1. 改全局变量（颜色、圆角、间距、阴影等）

编辑 `element-custom.scss` 头部，取消注释想要修改的变量：

```scss
$--color-primary: #6366f1;
$--border-radius-base: 8px;
$--box-shadow-light: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
```

完整变量列表见 `src/common/var.scss`（513 个变量）。

### 2. 改组件样式（修 bug、调布局、改结构）

直接编辑 `src/` 下对应的组件文件：

```
想改 card 的 header？   → 编辑 src/card.scss
想改 button 的尺寸？    → 编辑 src/button.scss
想改 table 的边框？     → 编辑 src/table.scss
想改 dialog 的位置？    → 编辑 src/dialog.scss
想改 date-picker？      → 编辑 src/date-picker/ 下的文件
```

不需要 `::v-deep`，不需要 `!important`，直接改源码。

### 3. 查看组件结构

每个组件的 SCSS 使用 BEM mixin 语法：

```scss
@include b(card) { ... }        → .el-card { ... }
@include e(header) { ... }      → .el-card__header { ... }
@include m(always-shadow) { ... } → .el-card--always-shadow { ... }
@include when(hover) { ... }    → &.is-hover { ... }
```

对应关系：
- `@include b(组件名)` → `.el-组件名`
- `@include e(元素)` → `__元素`
- `@include m(修饰符)` → `--修饰符`
- `@include when(状态)` → `.is-状态`

## 依赖关系

```
element-custom.scss
  └── @import "./src/index.scss"
        └── @import "./card.scss" (等每个组件)
              └── @import "mixins/mixins"
              │     └── @import "../common/var"
              └── @import "common/var"
```

## 注意事项

- **不要改 `node_modules/element-ui/`**：改了也没用，npm install 会覆盖
- **不要删 src/ 下的文件**：组件之间有依赖，删了可能编译报错
- **改完后在 HBuilderX 重新编译**：保存后自动编译，不需要手动操作
- **Element UI 版本锁定 2.15.14**：已停更，不存在上游更新需要合并的问题
