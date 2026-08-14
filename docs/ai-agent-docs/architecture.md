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
│  ├── cloudfunctions/migration/ ← 正式数据迁移        │
│  ├── cloudfunctions/mytest/    ← 临时测试脚本        │
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
| `uniCloud-alipay/cloudfunctions/migration/` | 正式数据迁移脚本 |
| `uniCloud-alipay/cloudfunctions/mytest/` | 临时测试云函数（数据库修复、调试等） |
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

## 与官方 uni-app admin 的区别

| 方面 | 官方 uni-app admin | vk-unicloud-admin（本项目） |
|---|---|---|
| 数据库操作 | `<unicloud-db>` 组件 | `vk.callFunction()` + router |
| 后端架构 | 多个云函数/云对象 | 单云函数 router，URL 路由 |
| 菜单系统 | `opendb-admin-menus` 集合 | `static_menu/` JSON + 云端动态 |
| 请求方式 | `$request()` 或云对象 | `vk.callFunction({ url, data })` |
| 权限检查 | `$hasPermission()` | `$hasRole()`、`$hasPermission()` |
| 配置文件 | `admin.config.js` | `app.config.js` |
