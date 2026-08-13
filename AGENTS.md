# 仓库指南

## 项目概述

vk-unicloud-admin — Vue 2 + uni-app + uniCloud 管理后台框架。

- 前端：`pages/`（自定义页面）+ `pages_plugs/`（框架内置，不要动）
- 后端：单云函数 `router`，URL 路径 = service 文件路径
- 数据库：uniCloud，通过 `vk.baseDao` 操作
- 环境变量：见 `.claude/rules/env.md`



## 绝对禁忌

- **无 npm scripts** — 只能通过 HBuilderX 运行/调试/部署
- **uni-app ≠ Web** — 不用 vue-router / axios / DOM API / HTML 标签，详见各场景文档

---

## ⚠️ 不遵守必出错的规则

### 1. 页面文件命名必须跟文件夹同名

`pages/` 下的页面文件名必须跟文件夹同名（如 `statistics/statistics.vue`），或用 `index.vue`。

**不要用 `list.vue`** — `list.vue` 是 `pages_plugs/` 子包的命名约定，在 `pages/` 主包中 VK 框架会把 `/index` 转成 `/文件夹名`，导致路径不匹配。

```text
✅ pages/system/statistics/statistics.vue
✅ pages/system/product/product.vue
❌ pages/system/statistics/list.vue        ← 会报 page not found
```

### 2. uni_modules 自带的 schema 不要复制到 database 目录

`uniCloud-alipay/database/` 只放项目自定义的表。如果 `uni_modules/*/uniCloud/database/` 下已有同名 schema，就不要重复放，HBuilderX 会自动链接。

```text
✅ uniCloud-alipay/database/vk-products.schema.json         ← 项目自定义
❌ uniCloud-alipay/database/opendb-verify-codes.schema.json  ← uni-captcha 已有
❌ uniCloud-alipay/database/uni-id-roles.schema.json          ← uni-id-pages 已有
```

常见归属速查：

| 表名 | 来源 | database 需要放？ |
|---|---|---|
| `opendb-verify-codes` | uni-captcha | ❌ |
| `opendb-tempdata`、`opendb-open-data` | uni-id-pages | ❌ |
| `uni-id-users`、`uni-id-roles`、`uni-id-permissions` | uni-id | ✅ schema + init_data |
| `opendb-admin-menus`、`vk-*` | vk-unicloud-admin | ✅ |

### 3. pages_plugs/ 不要放自定义页面

`pages_plugs/` 是框架内置页面目录，VK 框架升级时会覆盖。自定义页面必须放 `pages/`。

```text
✅ pages/system/ticket/ticket.vue
❌ pages_plugs/system/ticket/list.vue     ← 框架升级会丢失
```

### 4. API 请求的 fail 回调必须有错误提示

所有 `vk.callFunction`、`vk.userCenter.login`、`vk.userCenter.register` 等调用，`fail` 回调必须 `vk.toast` 显示错误，不能静默吞掉。

```js
// ✅ 正确
fail: (err) => {
    this.loading = false;
    vk.toast(err.msg || err.message || "操作失败", "none");
}

// ❌ 错误 — 用户看不到任何提示
fail: (err) => {
    this.loading = false;
}
```

### 5. 禁止使用原生 HTML 标签

uni-app ≠ Vue Web，必须用 uni-app 组件：

| ❌ 错误 | ✅ 正确 |
|---|---|
| `<div>` | `<view>` |
| `<span>`、`<p>`、`<h1>` | `<text>` |
| `<img>` | `<image>` |
| `<a href>` | `<view @click="navigateTo">` |

### 6. 禁止使用 Vue Web 特性

| ❌ 错误 | ✅ 正确 |
|---|---|
| `this.$router.push()` | `uni.navigateTo()` |
| `localStorage` | `uni.setStorageSync()` |
| `created()`、`mounted()` | `onLoad()`、`onShow()` |
| `var()`、`rem`、`vh` | 固定值、`rpx` |

### 7. 关键配置文件不能乱改

| 文件 | 作用 | 改错后果 |
|---|---|---|
| `app.config.js` | 登录页、首页、权限白名单 | 登录死循环 |
| `pages.json` | 页面路由 | 启动失败、页面 404 |
| `app.config.menu.js` | 菜单数据 | 菜单丢失 |

**重要经验**：`pages.json` 第一个页面 = 框架首页，不受 `checkTokenPages` 控制。落地页不能放第一位。

---

## 代码规范

### 命名

| 类型 | 规范 | 示例 |
|---|---|---|
| JS 变量/函数 | 驼峰 | `userInfo`、`getUserList()` |
| 数据库字段 | 全小写蛇形 | `user_id`、`add_time` |
| 数据库表名 | kebab-case | `uni-id-users`、`vk-card-key` |
| 页面目录 | kebab-case | `pages/user-center/` |
| Vue 组件文件 | PascalCase | `UserCenterHeader.vue` |

### 组件化

- 单文件不超过 300 行，超过就拆子组件
- 页面只做布局和编排，业务逻辑放子组件
- 通过 props/events 通信

### Element UI 样式

源码在 `common/theme/element-ui/src/`，可直接修改：

- 改全局变量（颜色、圆角）→ 编辑 `element-custom.scss` 头部
- 改组件样式（修 bug、调布局）→ 直接编辑 `src/xxx.scss`
- ❌ 禁止 `::v-deep .el-xxx { !important }` 覆盖
- ❌ 禁止改 `node_modules/element-ui/`
- 详见 `common/theme/element-ui/README.md`

### 安全与校验

- 前端表单校验 + 后端参数校验必须做
- 响应规范：成功 `{ code: 0, msg: '', data: {} }`，失败 `{ code: -1, msg: '错误描述' }`

### 通用

- 必须用中文回答
- 大改动先说明方案，等用户确认后再执行

---

## 文档查询

```bash
# 搜索项目知识库
bash .claude/skills/docs-search/scripts/search.sh --search "关键词" --kb project

# 搜索框架知识库
bash .claude/skills/docs-search/scripts/search.sh --search "关键词" --kb framework
```

| 场景 | 查什么 |
|---|---|
| 开发新页面 | `knowledge/project/page-dev.md` |
| 管理后台 CRUD | `knowledge/project/admin-crud.md` |
| 云函数/后端 | `knowledge/project/cloud-function.md` |
| 组件化拆分 | `knowledge/project/component-guide.md` |
| 架构/配置/权限 | `knowledge/project/architecture.md` |
| Element UI 定制 | `common/theme/element-ui/README.md` |
