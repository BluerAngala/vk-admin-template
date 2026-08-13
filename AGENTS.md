# 仓库指南

> **两个文件分工**：
> - `AGENTS.md`（本文件）— 通用开发规则，适用于所有基于 vk-unicloud-admin 的项目
> - `PROJECT.md` — 当前项目的实际业务状态（模块、页面、数据表、配置），换模板时只改这个

## 项目概述

vk-unicloud-admin — 基于 Vue 2 + uni-app + uniCloud + Element UI 的管理后台快速开发框架。JSON 驱动的万能表格/表单组件，RBAC 权限管理，三语 i18n，主题切换。

## 架构

前端 H5/App/MP → 单云函数 `router` → uniCloud 数据库。URL 路径 = 文件路径（`admin/system/user/sys/getList` → `service/admin/system/user/sys/getList.js`）。

App.vue 启动流程：checkToken → `vk.userCenter.getMenu()` 从云端拉菜单 → 与 `static_menu/` 静态菜单合并 → 存入 Vuex（`$app.navMenu`、`$app.menuList`）→ leftWindow 渲染。

## ⚠️ 关键配置文件（修改前必须理解）

### .claude

必须读取 .claude 下的开发规范和技能。

### app.config.js — 前端运行时配置

控制整个前端的行为，**改错会导致页面跳转异常、登录失效、菜单丢失**。

| 配置项 | 作用 | 踩坑点 |
|---|---|---|
| `login.url` | 登录页路径，未登录时框架跳转到这里 | 改错会导致登录死循环 |
| `index.url` | 首页路径（仪表盘），登录成功后跳转这里 | 不是落地页，是登录后的主页面 |
| `checkTokenPages` | 哪些页面需要登录。mode=2 时 list 内的页面**不需要**登录 | **pages.json 的第一个页面不受此白名单控制**，框架会强制检查登录 |
| `checkPermissionPages` | 哪些页面需要菜单权限。mode=2 时 list 内的页面**不需要**权限 | 不在菜单里的页面必须加白名单，否则 403 |
| `sideBar.staticMenu` | 静态菜单数据来源 | 来自 `app.config.menu.js` |
| `theme.use` | 主题选择：white/black/blackWhite | 改了要刷新才生效 |

**⚠️ 重要规则**：
1. `pages.json` 的第一个页面 = 框架首页，**不受 `checkTokenPages` 白名单控制**，框架会强制检查登录
2. 想让未登录用户看到落地页：落地页**不能放第一位**，应把首页放第一位，在首页 `onLoad` 里手动判断 token 后跳转
3. `checkTokenPages` 和 `checkPermissionPages` 是独立的，一个页面可能通过了登录检查但被权限检查拦住

### app.config.menu.js — 菜单数据

控制左侧菜单显示哪些项。**改错会导致菜单重复、空白、或显示不该显示的页面**。

- 开发环境：`menu.json` + `menu-dev.json` 合并
- 生产环境：只用 `menu.json`
- 合并规则：按 `menu_id` 去重，动态菜单（云端）优先级高于静态菜单

### pages.json — 页面路由

定义所有页面路径和窗口布局。**第一个页面是框架首页**，修改顺序会影响启动行为。

- `subPackages`：子包，按需加载
- `topWindow` / `leftWindow`：全局布局窗口
- `pages-dev.json`：开发环境额外页面，通过 `pages.js` 合并

### 三者关系

```
pages.json（路由定义）
    ↓ 第一个页面 = 启动页
app.config.js（行为控制）
    ↓ checkTokenPages 判断是否需要登录
    ↓ checkPermissionPages 判断是否需要权限
    ↓ login.url = 登录页跳转目标
    ↓ index.url = 首页跳转目标
app.config.menu.js（菜单数据）
    ↓ 静态菜单 + 云端动态菜单 → 左侧菜单栏
```

## 目录结构

| 目录 | 说明 |
|---|---|
| `pages/` | 主页面：首页、登录、vk-stats 统计 |
| `pages_plugs/system/` | 管理 CRUD：user、role、permission、menu、app |
| `pages_plugs/system_uni/` | uni 专属：全局数据、日志、文件管理 |
| `pages_template/` | 开发环境组件/Element UI 演示页 |
| `uni_modules/vk-unicloud/` | **核心框架**：router、userCenter、pubfn、navigate、storage |
| `uni_modules/uni-id/` | 用户认证模块 |
| `uni_modules/uni-config-center/` | 云端集中配置 |
| `uniCloud-alipay/cloudfunctions/router/` | **全部后端代码** |
| `store/modules/` | Vuex：`$app`（菜单/UI）、`$user`（认证）、`$error`（日志） |
| `components/` | 全局组件（require.context 自动注册） |
| `common/theme/` | 主题预设：white、black、blackWhite |
| `windows/` | 布局：topWindow（顶栏）、leftWindow（侧边栏） |
| `static_menu/` | JSON 菜单：menu.json（生产）、menu-dev.json（开发） |
| `locale/lang/` | i18n：en.json、zh-Hans.json、zh-Hant.json |

## 后端结构（router/）

```
router/
├── dao/config.js          # 数据库表名常量（25+ 张表）
├── dao/base.js            # BaseDao 类（CRUD、聚合、事务）
├── dao/modules/           # 自动发现 *Dao.js
├── middleware/modules/    # URL 正则匹配，index 10→999 排序执行
├── service/admin/system/  # 核心 CRUD：user/、role/、menu/、permission/
├── service/user/          # 用户中心：pub/（公开）、kh/（自助）、sys/（管理）
└── util/formRules.js      # 按实体的表单校验类
```

**两种 Service 格式**：
- 旧版：`module.exports = { main: async (event) => {} }`（admin/system/ 主要用这个）
- Cloud Object：`isCloudObject: true`，有 `_before`/`_after` 钩子（新服务用）

**响应规范**：成功 `{ code: 0, msg: '' }`，失败 `{ code: -1, msg: '错误描述' }`

## ⚠️ HBuilderX 快捷方式机制（VSCode/OMP 中不可见）

HBuilderX 会把 uni_modules 里的云函数和数据库 schema **以快捷方式**显示在项目目录中，但这些文件**不是物理文件**，在 VSCode/OMP 中看不到。

### 云函数快捷方式

uni_modules 通过 `package.json` 的 `uni_modules` 字段声明暴露的云函数，HBuilderX 自动链接到 `cloudfunctions/` 目录：

| uni_module | 暴露内容 | 说明 |
|---|---|---|
| `uni-captcha` | `uni-captcha-co`（云对象）、`common/uni-captcha`（公共模块） | 验证码生成/校验 |
| `uni-id` | `common/uni-id`（公共模块） | 用户认证，router 通过 file: 引用 |
| `uni-config-center` | `common/uni-config-center`（公共模块） | 集中配置管理 |
| `vk-unicloud` | `common/vk-unicloud`（公共模块） | 框架核心，router 通过 file: 引用 |

**router 的依赖方式**（package.json）：
```json
"dependencies": {
    "uni-config-center": "file:../../../uni_modules/uni-config-center/uniCloud/cloudfunctions/common/uni-config-center",
    "uni-id": "file:../../../uni_modules/uni-id/uniCloud/cloudfunctions/common/uni-id",
    "vk-unicloud": "file:../../../uni_modules/vk-unicloud/uniCloud/cloudfunctions/common/vk-unicloud"
}
```

### 数据库 Schema 快捷方式

uni_modules 的 `uniCloud/database/` 下的 schema 也会被链接到 `uniCloud-alipay/database/`。

**已知快捷方式**：
- `opendb-verify-codes` → 来自 `uni-captcha`，不要在 `uniCloud-alipay/database/` 里重复放

### 开发规范

1. **不要在 `uniCloud-alipay/cloudfunctions/` 里创建与 uni_modules 同名的云函数**（如 `uni-captcha-co`）
2. **不要在 `uniCloud-alipay/database/` 里复制 uni_modules 已有的 schema**
3. **修改 uni_modules 的文件时**，要改源文件（`uni_modules/*/`），不要改快捷方式
4. **router 调用公共模块**时，通过 `require` 引用 package.json 中声明的依赖，不要硬编码路径
5. **不确定某个文件是物理文件还是快捷方式时**，先检查 `find uni_modules -name "同名文件"` 确认来源

## 开发方式

| 操作 | 方法 |
|---|---|
| 运行 | HBuilderX → 运行到 Chrome（H5） |
| 构建 | HBuilderX → 发行到 Web |
| 上传云函数 | HBuilderX → 上传 uniCloud 云函数 |
| 格式化 | `prettier --write .`（printWidth: 180） |

**无 CLI 构建脚本**，纯 HBuilderX 项目。

## 代码规范

### 命名
- 变量：camelCase（`userInfo`）
- 数据库字段：snake_case（`user_id`）
- 数据库表名：kebab-case（`uni-id-users`）
- Vuex 模块：`$` 前缀（`$app`、`$user`、`$error`）
- 组件：`vk-data-*`（框架）、`custom-*`（自定义）
- 页面：`pages_plugs/system/{实体}/list.vue`，表单在 `form/` 子目录

### 前端常用
```js
let vk = uni.vk;                          // 全局 vk 实例
vk.getVuex('$user.userInfo')              // 读 Vuex
vk.setVuex('$user.userInfo.avatar', url)  // 写 Vuex（支持点号路径）
vk.callFunction({ url: '...', data: {} }) // 调云函数
$hasRole('admin')                         // 角色检查
$hasPermission('user-add')                // 权限检查
vk.navigateTo({ url: '/pages/xxx' })      // 导航
```

### Admin CRUD 页面模板
```vue
<vk-data-table-query :action="action" v-model="queryForm" />
<vk-data-table :action="action" :columns="columns" />
<vk-data-dialog v-model="addForm">
  <vk-data-form v-model="formData" :columns="formColumns" />
</vk-data-dialog>
```

### 格式化（Prettier）
printWidth: 180, tabWidth: 2, semi: true, singleQuote: true, trailingComma: es5, vueIndentScriptAndStyle: true

`config.js` 和 `uni-config-center/**/*.js` 用双引号（overrides）。

## 文档

`vk-unicloud-docs/docs/` 是完整开发文档库（发布到 vkdoc.fsq.pub），涵盖：

- `admin/` — 万能表格、万能表单、组件用法、自定义组件、常见问题
- `client/` — vk.userCenter API、callFunction、页面拦截器、Vuex、上传、i18n
- `client/uniCloud/cloudfunctions/` — 云函数、云对象、DAO、中间件、定时器、缓存、加密、WebSocket、SSE
- `client/uniCloud/db/` — 数据库 API、schema、联表查询、事务
- `client/uniCloud/config/` — uni-id、uni-pay、vk-unicloud 配置
- `vk-uni-pay/` — 支付集成

**查阅方式**：遇到具体组件/API/配置问题时，先读对应目录下的 md 文件再动手。不要凭记忆猜测框架 API。

## 运行时

- **IDE**：HBuilderX ^3.1.10（必须，无 CLI）
- **Vue**：仅 Vue 2
- **H5 路由**：hash 模式，base `/admin/`
- **换行符**：LF（.gitattributes 强制）
- **无测试框架**：`npm test` 是空桩
- **H5 外部资源**（template.h5.html 加载）：Element UI CSS、Quill、TinyMCE、ExcelJS

## RBAC

角色 → 分配权限 + 菜单，用户 → 分配角色。
- 权限：permission_id、url 模式、match_mode（full/wildcard/regex）
- 菜单：menu_id、url、icon、parent_id（树形）
- 运行时：`$hasRole()`、`$hasPermission()`
- 页面级：checkTokenPages + checkPermissionPages（mode 2 = 除白名单外全部检查）

## 安全规则

- **必须用中文回答**
- 大改动先说明方案，等用户确认后再执行
- 前端表单校验 + 后端参数校验必须做
