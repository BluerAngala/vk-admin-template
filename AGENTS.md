# Repository Guidelines

> vk-unicloud-admin 项目 AI 协作指南。框架 API 细节见 `vk-unicloud-docs/docs/`，本文聚焦**本仓库独有的**架构、模块、禁区。

## 1. Project Overview

**vk-unicloud-admin v1.21.0** — uni-app (Vue2) + uniCloud + uni-id + element-ui 的 **PC 后台管理框架**。

- 核心卖点：万能表格/万能表单 JSON 配置驱动 CRUD；内置用户/角色/权限/菜单等 12 项模块
- PC-only：`topWindow`+`leftWindow` 自绘布局，宽屏 ≥1280
- 运行时：HBuilderX ^3.1.11（必须，无 CLI）、Vue 2、H5 hash 路由 base `/admin/`
- 包管理：npm（无 yarn/pnpm lock）

## 2. Architecture

### 调用链路

```
Vue Page → vk.callFunction({ url, data })
  → POST /http/router (单云函数)
    → middleware → service/<group>/<sub>/<action>.js → vk.baseDao / database()
```

### 权限分层（service/ 子目录命名）

| 后缀 | 含义 | 前置 |
|---|---|---|
| `sys` | 管理员侧 | role=admin + permissions 匹配 |
| `kh` | 已登录用户 | token 有效，仅读改自己的数据 |
| `pub` | 公开接口 | 无 token |

### 状态管理

- Vuex 单 store，模块 `$app`/`$user`/`$error`，自动注册
- **只走** `vk.setVuex('updateStore', { name, value })` 和 `vk.getVuex('$user.userInfo')`
- 不要 `this.$store.commit` / `mapState`

### RBAC

角色 → 分配权限 + 菜单，用户 → 分配角色。运行时 `$hasRole()`/`$hasPermission()`。页面级 checkTokenPages + checkPermissionPages（mode 2 = 除白名单外全部检查）。

### 业务模块映射

| 业务域 | 前端页面 | 云函数入口 | 数据表 |
|---|---|---|---|
| 卡密授权 | `pages/card-manage/` | `admin/card/{pub,kh,sys}/*` | `vk-card-key` |
| 积分 | `pages/points-shop/`, `pages/user-center/` | `admin/points/{kh,sys}/*` | `vk-user-points` + `vk-points-log` |
| 产品 | `pages/my-products/`, `pages/system/product/` | `admin/product/{kh,sys}/*` | `vk-products` + `vk-user-products` |
| 工单 | `pages/ticket/{list,detail,create}.vue` | `admin/ticket/{kh,sys}/*` | `vk-tickets` + `vk-ticket-replies` |
| 邀请返利 | `pages/invite-center/` | `invite/{pub,util}/*` + `admin/rebate/sys/*` | `vk-invite-rebate-log` + `vk-global-data` |
| 系统设置 | `pages_plugs/system/*` | `admin/system/*/sys/*` | `uni-id-*` + `opendb-*` |

## 3. Key Directories

| 路径 | 用途 |
|---|---|
| `pages/` | 前台业务（首页/登录/卡密/积分/工单/邀请等） |
| `pages_plugs/` | 管理员系统管理 + 运营页 + 错误页 |
| `pages_template/` | **仅 dev 演示**，生产被剥离，不要在 `pages.json` 直接注册 |
| `components/` | 全局组件，自动注册（`main.js:26-36`） |
| `common/theme/` | 主题配置，由 `app.config.js theme.use` 切换 |
| `uni_modules/` | 23+ 插件，**不要手动改**，按规范升级 |
| `store/modules/` | Vuex 模块（`$app`/`$user`/`$error`） |
| `static_menu/` | `menu.json`（生产）+ `menu-dev.json`（演示），按 NODE_ENV 合并 |
| `uniCloud-alipay/cloudfunctions/router/` | **单云函数入口**，`service/admin/*` 业务、`util/*` 工具、`middleware/*` 拦截器 |
| `uniCloud-alipay/database/` | schema + init_data + jql 脚本 |
| `script/` | 一次性数据修复脚本，需手动 `node script/xxx.js` |
| `windows/` | `topWindow.vue`（顶栏 100px）+ `leftWindow.vue`（侧栏 280px） |
| `md/` | 业务文档（卡密对接、迁移指南），改动业务请同步更新 |

## 4. Development Commands

| 动作 | 方式 |
|---|---|
| 安装依赖 | `npm i`（仅 3 个 vendor，无 devDeps） |
| 启动开发 | HBuilderX 打开项目 → 运行到浏览器 |
| 云函数本地调试 | HBX 右键 `router` → 本地运行云函数 |
| 数据库初始化 | HBX 右键 `db_init.jql`/`db_init.json`（**一次性，不可重入**） |
| 调试查询 | `JQL查询.jql` 写查询 + HBX 右键运行 |
| 接口调试 | `router.param.json` 改默认 url + HBX 本地运行 |
| 数据修复 | `node script/xxx.js`（看脚本顶部注释） |
| 发布 H5 | HBX → 发行 → 网站(PC Web)，记得 base `/admin/` |

## 5. Key Conventions

### 命名

- 页面：kebab-case（`card-manage.vue`）
- 云函数：flat `<action>.js`（`getList.js`），首行 `@url admin/.../...`
- Store 模块：`$<scope>` 前缀
- 数据库表：`vk-<domain>[-<entity>]`，标准表保留 `uni-id-*`/`opendb-*`

### 业务逻辑边界

- 数据库访问**只走后端**，前端不可直连 clientDB
- 积分变动必须先写 `vk-points-log`（`order_id` 唯一），幂等保护
- 续费/扣减必须 `transaction.rollback()` 包裹，参考 `service/admin/card/kh/renew.js`
- 加密通道 AES-256-GCM，**生产应改 env `ENCRYPTION_KEY`**（`util/card.js`）

### 样式

- 全局 SCSS：`common/css/app.scss`
- 主题：`theme.use = 'blackWhite'`（默认），改主题同步 `common/theme/{black,white,blackWhite}.js`
- **不要**在子页面覆盖 `window` 字段，**不要**新增 vendor UI 库

### H5 外部资源

`template.h5.html` 加载：Element UI CSS、Quill、TinyMCE、ExcelJS

## 6. Testing & QA

**无测试框架、无 CI/CD。** `npm test` 是空桩（exit 1）。

**验证方式**：JQL 查询验数据 → `router.param.json` 验接口 → HBX 浏览器手工冒烟

## 7. Common Pitfalls（AI 必读）

1. **`service/template/test/*` ≠ 测试** — 是 vk-router 云函数调用模板，被前端示例页引用
2. **`vk-test` 表 ≠ 单元测试目标** — 是框架 CRUD 演示表
3. **`db_init.*` ≠ 迁移工具** — 改它会污染现有数据，新初始化写独立文件
4. **`pages_template/` 仅 dev** — 不要在 `pages.json` 直接注册
5. **Vuex 不要直接 commit** — 用 `vk.setVuex`/`vk.getVuex`
6. **不要新增 vendor UI 库** — 已有 element-ui + umy-ui + vk-unicloud-admin-ui
7. **H5 部署 base `/admin/`** — `manifest.json:74`
8. **PC-only** — 不要把页面改成移动端
9. **appid 隔离** — 每个部署修改 `manifest.json:3` 并在 `opendb-app-list` 注册
10. **改页面后同步菜单** — `app.config.menu.js` 或 `static_menu/menu.json`，静态+动态双轨
11. **database/ 不要放与 uni_modules 同名 schema** — 会冲突报错，需定制直接改 uni_modules 源文件

## 8. Quick Recipe：新增 CRUD 页面

```js
// 1. 后端 service/admin/<module>/sys/<action>.js
module.exports.main = async (event) => {
  let { data = {}, userInfo, util, originalParam } = event;
  let { vk } = util;
  let res = { code: 0, msg: '' };
  try {
    res.data = await vk.baseDao.getTableData({
      dbName: 'vk-<entity>',
      data,
      whereJson: data.whereJson,
      sortArr: [{ name: '_add_time', type: 'desc' }],
      pageIndex: data.pageIndex || 1,
      pageSize: data.pageSize || 20,
    });
  } catch (err) { res.code = -1; res.msg = err.message; }
  return res;
};

// 2. 前端 pages/<domain>/list.vue → vk.callFunction({ url: 'admin/<module>/kh/getList', ... })

// 3. 菜单 app.config.menu.js / static_menu/menu.json

// 4. 权限 uni-id-permissions.init_data.json 加 permission_id
```

## 9. 安全规则

- **必须用中文回答**
- 大改动先说明方案，等用户确认后再执行
- 前端表单校验 + 后端参数校验必须做

## 文档

`vk-unicloud-docs/docs/` 是完整开发文档库（发布到 vkdoc.fsq.pub），涵盖：

- `admin/` — 万能表格、万能表单、组件用法、自定义组件、常见问题
- `client/` — vk.userCenter API、callFunction、页面拦截器、Vuex、上传、i18n
- `client/uniCloud/cloudfunctions/` — 云函数、云对象、DAO、中间件、定时器、缓存、加密、WebSocket、SSE
- `client/uniCloud/db/` — 数据库 API、schema、联表查询、事务
- `client/uniCloud/config/` — uni-id、uni-pay、vk-unicloud 配置
- `vk-uni-pay/` — 支付集成

**查阅方式**：遇到具体组件/API/配置问题时，先读对应目录下的 md 文件再动手。不要凭记忆猜测框架 API。

---

**TL;DR**: HBX + npm，无测试/CI。唯一通信 `vk.callFunction({ url })` 走单云函数 `router`。状态只走 `vk.setVuex`/`vk.getVuex`。禁区：`template/test/*` 演示、`vk-test` 表、`db_init.*` 一次性脚本。
