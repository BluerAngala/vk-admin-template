# 仓库指南

## 项目概述

vk-unicloud-admin — Vue 2 + uni-app + uniCloud 管理后台框架。

- 前端：`pages/` + `pages_plugs/`，使用 uni-app 组件（非 HTML）
- 后端：单云函数 `router`，URL 路径 = service 文件路径
- 数据库：uniCloud，通过 `vk.baseDao` 操作

---

## ⚠️ 必读规则（开发前必须看）

### 1. 禁止使用原生 HTML 标签

**uni-app ≠ Vue Web**，必须用 uni-app 组件：

| ❌ 错误 | ✅ 正确 |
|---|---|
| `<div>` | `<view>` |
| `<span>`、`<p>`、`<h1>` | `<text>` |
| `<img>` | `<image>` |
| `<a href>` | `<view @click="navigateTo">` |
| `<input type="checkbox">` | `<checkbox-group>` + `<checkbox>` |
| `<select>` | `<picker>` |

### 2. 禁止使用 Vue Web 特性

| ❌ 错误 | ✅ 正确 |
|---|---|
| `this.$router.push()` | `uni.navigateTo()` |
| `localStorage` | `uni.setStorageSync()` |
| `created()`、`mounted()` | `onLoad()`、`onShow()` |
| `var()`、`rem`、`vh` | 固定值、`rpx` |

### 3. 组件化开发

- 单文件不超过 300 行
- 页面只做布局和编排
- 业务逻辑放在子组件
- 通过 props/events 通信

### 4. Element UI 样式开发规范

**架构**：Element UI 的 SCSS 源码已复制到项目内，可直接修改。

```
common/theme/element-ui/
├── element-custom.scss        ← 入口文件（变量覆盖 + 引入源码）
├── README.md                  ← 详细说明文档
└── src/                       ← Element UI SCSS 源码（可直接改）
    ├── index.scss             ← 组件样式汇总
    ├── common/var.scss        ← 513 个变量（带 !default）
    ├── mixins/                ← BEM mixin 工具
    ├── card.scss              ← 单个组件样式
    ├── button.scss
    ├── ...
    └── date-picker/           ← 复杂组件子目录
```

**改全局变量**（颜色、圆角、间距、阴影等）：
- 在 `common/theme/element-ui/element-custom.scss` 头部定义变量，不带 `!default`
- 源码中的 `!default` 变量会被你的值覆盖

```scss
// common/theme/element-ui/element-custom.scss
$--color-primary: #6366f1;      ← 你的值
$--border-radius-base: 8px;
@import "./src/index.scss";     ← 源码中同名变量不再生效
```

**改组件样式**（修 bug、调布局、改结构）：
- 直接编辑 `common/theme/element-ui/src/xxx.scss`
- 不需要 `::v-deep`、不需要 `!important`、不需要在外面覆盖

```scss
// 直接改 element-ui/src/card.scss
@include e(header) {
  padding: 12px 16px;  ← 直接改，权重就是最终值
}
```

**禁止的行为**：
- ❌ 在页面 SCSS 中用 `::v-deep .el-xxx { ... !important }` 覆盖 Element UI 样式
- ❌ 用内联 `style="margin-left: 10px"` 代替修改源码
- ❌ 修改 `node_modules/element-ui/` 下的任何文件（改了也没用，会被 npm 覆盖）

**正确的行为**：
- ✅ 改全局变量 → 编辑 `element-ui/element-custom.scss` 头部
- ✅ 改组件样式 → 编辑 `element-ui/src/xxx.scss`
- ✅ 修组件 bug → 编辑 `element-ui/src/xxx.scss`
- ✅ 页面级微调 → 用 scoped SCSS，不用 `::v-deep`

### 5. 关键配置文件

| 文件 | 作用 | 修改风险 |
|---|---|---|
| `app.config.js` | 登录页、首页、权限白名单 | 改错导致登录死循环 |
| `app.config.menu.js` | 菜单数据 | 改错导致菜单丢失 |
| `pages.json` | 页面路由，第一个页面是首页 | 改错影响启动 |
| `common/theme/element-ui/element-custom.scss` | Element UI 变量覆盖入口 | 改错影响全局样式 |
| `common/theme/element-ui/src/` | Element UI 组件 SCSS 源码 | 改错影响对应组件 |

**重要经验**：
- `pages.json` 第一个页面 = 框架首页，**不受 `checkTokenPages` 白名单控制**
- 落地页**不能放第一位**，应把首页放第一位，在 `onLoad` 里判断 token 后跳转

### 6. 响应规范

```js
// 成功
{ code: 0, msg: '', data: {} }

// 失败
{ code: -1, msg: '错误描述' }

// 列表
{ code: 0, msg: '', rows: [], total: 0 }
```

### 7. 安全规则

- **必须用中文回答**
- 大改动先说明方案，等用户确认后再执行
- 前端表单校验 + 后端参数校验必须做

---

## 开发流程

```
1. 理解需求 → 分析要做什么
2. 设计方案 → 前端、后端、数据、边界
3. 查文档   → 不确定的 API、模板、规范
4. 动手开发 → 按方案写代码
5. 验证     → 测试、检查
```

## 文档查询

使用 `.claude/skills/docs-search/` 查文档：

```bash
# 搜索项目知识库（开发规范）
bash .claude/skills/docs-search/scripts/search.sh --search "关键词" --kb project

# 搜索框架知识库（API 文档）
bash .claude/skills/docs-search/scripts/search.sh --search "关键词" --kb framework

# 按主题查找
bash .claude/skills/docs-search/scripts/search.sh --topic "页面开发"

# 读取指定文档
bash .claude/skills/docs-search/scripts/search.sh --read "knowledge/project/page-dev.md"
```

**按场景查文档：**

| 场景 | 查什么 |
|---|---|
| 开发新页面 | `knowledge/project/page-dev.md` |
| 管理后台 CRUD | `knowledge/project/admin-crud.md` |
| 云函数/后端 | `knowledge/project/cloud-function.md` |
| 样式/CSS | `knowledge/project/style-guide.md` 或本文件 §4 |
| Element UI 定制 | 本文件 §4 + `common/theme/element-ui/element-custom.scss` |
| 组件化拆分 | `knowledge/project/component-guide.md` |
| API 用法 | `knowledge/project/api-reference.md` 或 framework |
| 架构/配置/权限 | `knowledge/project/architecture.md` |
| 代码规范/命名 | `knowledge/project/code-standards.md` |
