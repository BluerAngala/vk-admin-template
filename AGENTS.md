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

**⚠️ 涉及 database 的任务，必须先检查 `uni_modules/*/uniCloud/database/` 是否已有同名 schema，不要只盯着 `uniCloud-alipay/database/`。**

`uniCloud-alipay/database/` 只放项目自定义的表。如果 `uni_modules/*/uniCloud/database/` 下已有同名 schema，就不要重复放，HBuilderX 会自动链接。

```text
✅ uniCloud-alipay/database/vk-products.schema.json         ← 项目自定义
❌ uniCloud-alipay/database/opendb-verify-codes.schema.json  ← uni-captcha 已有
❌ uniCloud-alipay/database/uni-id-roles.schema.json          ← uni-id-pages 已有
```

**发现重复文件时的处理方法：**

1. 先对比内容差异：`diff uniCloud-alipay/database/xxx.schema.json uni_modules/*/uniCloud/database/xxx.schema.json`
2. 以 `uni_modules` 版本为准（权限配置更完整、字段名更规范）
3. 删除 `uniCloud-alipay/database/` 中的重复文件

**常见需要删除的重复文件（如果存在于 uniCloud-alipay/database）：**

```bash
# uni-open-bridge-common 已有
rm uniCloud-alipay/database/opendb-open-data.*

# uni-id-pages 已有
rm uniCloud-alipay/database/opendb-tempdata.*
rm uniCloud-alipay/database/uni-id-log.*
rm uniCloud-alipay/database/uni-id-permissions.*
rm uniCloud-alipay/database/uni-id-roles.*

# uni-captcha 已有
rm uniCloud-alipay/database/opendb-verify-codes.*
```

**完整归属速查：**

| 表名 | 来源 | database 需要放？ | db_init.json 需要放？ |
|---|---|---|---|
| `opendb-verify-codes` | uni-captcha | ❌ | ❌ |
| `opendb-tempdata`、`opendb-open-data` | uni-id-pages / uni-open-bridge-common | ❌ | ❌ |
| `uni-id-log` | uni-id-pages | ❌ | ❌ |
| `uni-id-users` | uni-id | ✅ schema + init_data | ✅ 初始管理员 |
| `uni-id-roles` | uni-id-pages | ❌ | ✅ 初始角色数据 |
| `uni-id-permissions` | uni-id-pages | ❌ | ✅ 初始权限数据 |
| `opendb-admin-menus`、`opendb-admin-log` | vk-unicloud-admin | ✅ | ✅ |
| `vk-*` | 项目自定义 | ✅ | ✅ |

**⚠️ db_init.json 同样不能包含 uni_modules 已有的表定义，否则部署时会重复创建 schema 文件。**

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

### 8. 本地临时修改数据库用云函数，不用 JQL

开发调试中需要临时修改数据库时，禁止在 JQL 执行器里手动跑命令或写 `.jql` 文件。统一放在 `uniCloud-alipay/cloudfunctions/` 下新建云函数，方便复现和复用。

**⚠️ 云函数目录必须直接在 `cloudfunctions/` 下，不要嵌套子目录！**

```text
✅ cloudfunctions/fix-menu-sort/index.js          ← 可复现、可复用
❌ cloudfunctions/mytest/fix-menu-sort/index.js   ← 目录嵌套，HBuilderX 无法识别
❌ database/fix-menu.jql                          ← 不可追溯、不可重复执行
❌ 直接告诉用户在 JQL 执行器跑命令                 ← 过后就忘了，无法复现
```

### 9. 项目初始化必须修改密码密钥

**文件位置：** `uni_modules/uni-config-center/uniCloud/cloudfunctions/common/uni-config-center/uni-id/config.json`

```json
{
    "passwordSecret": "passwordSecret-demo",  // ← 必须修改
    "tokenSecret": "tokenSecret-demo"         // ← 必须修改
}
```

**为什么必须修改：**
- 默认值是公开的示例密钥，任何人都能知道
- 不修改会导致账号密码可被伪造，安全完全失效

**如何修改：**
1. 将 `passwordSecret` 改为项目专属的随机字符串（建议 32 位以上）
2. 将 `tokenSecret` 改为另一个随机字符串
3. 根据项目名称生成，例如：`"passwordSecret": "your-project-name-2024-secret-key"`
4. 修改后必须重新部署 router 云函数

**注意事项：**
- 修改密钥后，已有的用户密码会失效，需要用户重置密码
- 不同项目使用不同的密钥，避免一个项目被攻破影响其他项目
- 不要将密钥提交到公开的代码仓库

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

## 图片处理规则

当用户发送图片或提到图片相关内容时，**必须先调用 `llm-vision-mcp` 工具**读取和分析图片，然后再回答。

### 调用方式

使用 `llm-vision-mcp` 的 `analyze_image` 工具：
- 参数：`image_path`（图片绝对路径）
- 可选参数：`prompt`（自定义问题）

### 示例场景

1. **用户发送图片** → 先调用 `llm-vision-mcp` 分析图片内容
2. **用户提到截图/报错图** → 先调用 `llm-vision-mcp` 提取错误信息
3. **用户提到 UI 设计图** → 先调用 `llm-vision-mcp` 描述 UI 布局

### 注意事项

- 不要假设图片内容，必须先调用工具获取准确信息
- 如果图片路径不明确，先询问用户提供图片路径
- 分析完成后，用中文回复用户

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
