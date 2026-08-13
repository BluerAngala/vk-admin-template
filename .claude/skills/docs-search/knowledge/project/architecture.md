# 架构与数据流（vk-unicloud-admin）

## 整体结构

```
┌─────────────────────────────────────────────────────┐
│  HBuilderX IDE（无 CLI 构建脚本）                     │
├─────────────────────────────────────────────────────┤
│  main.js → App.vue → Vuex Store → vue-i18n          │
│       ↓                                              │
│  vk-unicloud（核心框架）                              │
│       ↓                                              │
│  ┌─────────┐  ┌────────────┐  ┌──────────────────┐  │
│  │topWindow│  │ leftWindow │  │  content pages   │  │
│  │ (顶栏)  │  │  (侧边栏)  │  │  (vk.callFunction)│ │
│  └─────────┘  └────────────┘  └──────────────────┘  │
│       ↓              ↓                ↓               │
│  uni-id-pages   static_menu/      单云函数 router    │
│  （认证/Token）  + 云端动态菜单    （全部后端逻辑）   │
├─────────────────────────────────────────────────────┤
├── uniCloud-alipay/                                    │
│  ├── cloudfunctions/router/    ← 全部后端代码         │
│  │   ├── service/             ← 业务逻辑             │
│  │   ├── dao/                 ← 数据库操作           │
│  │   └── middleware/          ← 中间件               │
│  └── database/                 ← 项目自有表 schema   │
├── uni_modules/                                        │
│  ├── vk-unicloud/             ← 核心框架             │
│  ├── uni-id/                  ← 用户认证             │
│  ├── uni-config-center/       ← 集中配置             │
│  └── ...其他模块                                     │
└─────────────────────────────────────────────────────┘
```

## 核心架构特点

### 1. 单云函数架构

**所有后端请求都走一个 `router` 云函数**，通过 URL 路径路由到对应的 service 文件：

```
前端请求：vk.callFunction({ url: 'user/pub/login', data: {...} })
    ↓
router 云函数接收
    ↓
URL 路径 = 文件路径：service/user/pub/login.js
    ↓
执行业务逻辑，返回结果
```

### 2. 数据流

```
页面（Vue组件）
    ↓ vk.callFunction()
router 云函数
    ↓ URL 匹配
service 文件（业务逻辑）
    ↓ vk.daoCenter
BaseDao（数据库操作）
    ↓
uniCloud 数据库
```

### 3. 菜单系统

**静态菜单 + 动态菜单合并**：

```
static_menu/menu.json（生产环境）
static_menu/menu-dev.json（开发环境）
    ↓ 合并
app.config.menu.js
    ↓ 与云端动态菜单合并（按 menu_id 去重）
Vuex: $app.navMenu、$app.menuList
    ↓
leftWindow.vue 渲染
```

## 启动流程

1. `main.js` — 创建 Vue 实例，注册 Vuex store、vue-i18n
2. `App.vue` — `onLaunch` 执行 `checkToken` 检查登录状态
3. `vk.userCenter.getMenu()` — 从云端拉取动态菜单
4. 与 `static_menu/` 静态菜单合并，存入 Vuex
5. `windows/topWindow.vue` — 渲染顶部导航栏
6. `windows/leftWindow.vue` — 渲染左侧菜单

## 目录结构

| 目录 | 用途 |
|---|---|
| `pages/` | 主页面：首页、登录、用户中心等 |
| `pages_plugs/system/` | 管理 CRUD：user、role、permission、menu、app |
| `pages_plugs/system-uni/` | uni 专属：全局数据、日志、文件管理 |
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

## 后端结构（router/）

```
router/
├── main.js                # 入口，URL 路由分发
├── package.json           # 依赖：vk-unicloud、uni-id、uni-config-center
├── dao/
│   ├── config.js          # 数据库表名常量
│   ├── base.js            # BaseDao 类（CRUD、聚合、事务）
│   └── modules/           # 自动发现 *Dao.js
├── middleware/
│   └── modules/           # URL 正则匹配，index 10→999 排序执行
├── service/
│   ├── admin/system/      # 核心 CRUD：user/、role/、menu/、permission/
│   ├── user/              # 用户中心：pub/（公开）、kh/（自助）、sys/（管理）
│   └── template/          # 示例代码
└── util/
    └── formRules.js       # 按实体的表单校验类
```

## 重要文件

| 文件 | 职责 |
|---|---|
| `main.js` | 应用入口，注册 store、i18n |
| `App.vue` | 根组件 — 登录检查、菜单初始化、主题初始化 |
| `app.config.js` | 中心配置：登录页、首页、权限白名单、主题 |
| `app.config.menu.js` | 菜单数据：静态菜单 + 合并逻辑 |
| `pages.json` | 路由、窗口布局 |
| `store/modules/app.js` | 主题、导航菜单、UI 状态 |
| `store/modules/user.js` | 用户信息、Token 管理 |
| `windows/topWindow.vue` | 顶部导航栏 |
| `windows/leftWindow.vue` | 侧边栏菜单 |

## ⚠️ 关键配置文件详解

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

**⚠️ 重要经验**：
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

## ⚠️ HBuilderX 快捷方式机制

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

### 开发规范

1. **不要在 `uniCloud-alipay/cloudfunctions/` 里创建与 uni_modules 同名的云函数**
2. **不要在 `uniCloud-alipay/database/` 里复制 uni_modules 已有的 schema**
3. **修改 uni_modules 的文件时**，要改源文件（`uni_modules/*/`），不要改快捷方式
4. **router 调用公共模块**时，通过 `require` 引用 package.json 中声明的依赖

## RBAC 权限系统

角色 → 分配权限 + 菜单，用户 → 分配角色。

- 权限：permission_id、url 模式、match_mode（full/wildcard/regex）
- 菜单：menu_id、url、icon、parent_id（树形）
- 运行时：`$hasRole()`、`$hasPermission()`
- 页面级：checkTokenPages + checkPermissionPages（mode 2 = 除白名单外全部检查）

## 与官方 uni-app admin 的区别

| 方面 | 官方 uni-app admin | vk-unicloud-admin（本项目） |
|---|---|---|
| 数据库操作 | `<unicloud-db>` 组件 | `vk.callFunction()` + router |
| 后端架构 | 多个云函数/云对象 | 单云函数 router，URL 路由 |
| 菜单系统 | `opendb-admin-menus` 集合 | `static_menu/` JSON + 云端动态 |
| 请求方式 | `$request()` 或云对象 | `vk.callFunction({ url, data })` |
| 权限检查 | `$hasPermission()` | `$hasRole()`、`$hasPermission()` |
| 配置文件 | `admin.config.js` | `app.config.js` |
