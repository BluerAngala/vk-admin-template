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

### 4. 关键配置文件

| 文件 | 作用 | 修改风险 |
|---|---|---|
| `app.config.js` | 登录页、首页、权限白名单 | 改错导致登录死循环 |
| `app.config.menu.js` | 菜单数据 | 改错导致菜单丢失 |
| `pages.json` | 页面路由，第一个页面是首页 | 改错影响启动 |

**重要经验**：
- `pages.json` 第一个页面 = 框架首页，**不受 `checkTokenPages` 白名单控制**
- 落地页**不能放第一位**，应把首页放第一位，在 `onLoad` 里判断 token 后跳转

### 5. 响应规范

```js
// 成功
{ code: 0, msg: '', data: {} }

// 失败
{ code: -1, msg: '错误描述' }

// 列表
{ code: 0, msg: '', rows: [], total: 0 }
```

### 6. 安全规则

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
| 样式/CSS | `knowledge/project/style-guide.md` |
| 组件化拆分 | `knowledge/project/component-guide.md` |
| API 用法 | `knowledge/project/api-reference.md` 或 framework |
| 架构/配置/权限 | `knowledge/project/architecture.md` |
| 代码规范/命名 | `knowledge/project/code-standards.md` |
