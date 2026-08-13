# 项目状态快照

> 本文件记录当前项目的实际业务模块、页面、数据表、配置等具体信息。
> **用本项目做模板开发新项目时，只需要改这个文件 + 对应的页面/服务/菜单代码。**
> AGENTS.md 是通用开发规则，不需要改。

---

## 当前配置

| 项 | 值 | 改模板时需改？ |
|---|---|---|
| 项目名 | `new-ai-admin` | ✅ manifest.json `name` |
| appid | `__UNI__F83A9DD` | ✅ manifest.json `appid`（需到 DCloud 重新申请） |
| 版本 | `1.0.0` | ✅ manifest.json `versionName` |
| H5 标题 | 开发测试卡密系统 | ✅ manifest.json `h5.title` |
| H5 base | `/admin/` | 视部署环境决定 |
| 主题 | `blackWhite` | 按需 app.config.js `theme.use` |
| 登录页 | `/pages/login/index` | 按需 app.config.js `login.url` |
| 首页 | `/pages/login/index` | ✅ app.config.js `index.url`（当前指向登录页，应改为仪表盘） |

---

## 业务模块清单

### 核心业务

| 模块 | 说明 | 前端页面 | 云函数路径 | 数据表 |
|---|---|---|---|---|
| **卡密管理** | 核心功能。卡密生成、批量操作、续费、机器统计、公开校验接口 | `pages/card-manage/` | `admin/card/{kh,sys,pub}/*` | `vk-card-key` |
| **产品管理** | 产品 CRUD、用户购买、初始化产品数据 | `pages/system/product/` `pages/my-products/` | `admin/product/{kh,sys}/*` | `vk-products` `vk-user-products` |
| **积分系统** | 积分充值、余额查询、消费记录、支付配置 | `pages/points-shop/` | `admin/points/{kh,sys}/*` | `vk-user-points` `vk-points-log` `vk-pay-config` `vk-recharge-orders` |
| **工单系统** | 用户提工单、管理员回复、状态管理 | `pages/ticket/{list,create,detail}` | `admin/ticket/{kh,sys}/*` | `vk-tickets` `vk-ticket-replies` |
| **邀请返利** | 邀请链接、返利记录、多级返利配置 | `pages/invite-center/` `pages/invite-center/rebate-history` | `admin/rebate/sys/*` + `invite/*` | `vk-invite-rebate-log` |
| **黑名单** | 用户黑名单管理 | 管理后台内 | `admin/blacklist/sys/*` | `vk-blacklist` |

### 辅助功能

| 模块 | 说明 | 前端页面 |
|---|---|---|
| **个人中心** | 用户信息、头像、密码修改 | `pages/user-center/` |
| **我的产品** | 已购产品列表 | `pages/my-products/` |
| **公告系统** | 公告配置（存在 `vk-global-data` 的 `announcement` key） | `pages/system/announcement/` |
| **统计面板** | 卡密购买统计、积分购买统计、机器总数 | `pages/system/statistics/` |
| **产品文档** | 浏览器插件、定制多维表、定制软件说明 | `pages/docs/{crx-extensions,table,software}/` |
| **帮助中心** | 使用帮助 | `pages/docs/help/` |

### 管理后台（系统管理，`pages_plugs/system/`）

| 页面 | 功能 | 云函数路径 |
|---|---|---|
| `system/user/list` | 用户管理（CRUD、绑定角色、批量操作） | `admin/system/user/sys/*` |
| `system/role/list` | 角色管理 | `admin/system/role/sys/*` |
| `system/permission/list` | 权限管理 | `admin/system/permission/sys/*` |
| `system/menu/list` | 菜单管理 | `admin/system/menu/sys/*` |
| `system/app/list` | 应用管理 | `admin/system/app/sys/*` |
| `system/app-upgrade-center/list` | 升级中心 | `admin/system/app-upgrade-center/sys/*` |
| `system/rebate-config/list` | 返利配置 | `admin/rebate/sys/*` |
| `system/points-pay-config/list` | 积分支付配置 | `admin/points/sys/*` |
| `system/rebate-records/list` | 返利记录 | `admin/rebate/sys/*` |
| `system/ticket/list` | 工单管理（管理员） | `admin/ticket/sys/*` |

### 运维工具（`pages_plugs/system_uni/`）

| 页面 | 功能 |
|---|---|
| `vk-global-data` | 全局键值数据管理 |
| `uni-id-log` | 登录日志 |
| `opendb-admin-log` | 操作日志 |
| `vk-components-dynamic` | 动态组件 |
| `uni-id-files/list` | 文件管理 |
| `vk-pay-orders` | 支付订单 |
| `vk-ws-connection` | WebSocket 连接 |
| `vk-error-log` | 错误日志 |
| `lucky-draw/list` | 抽奖活动 |

---

## 数据库表清单

### 框架标准表（不要删，新项目也要用）

| 表名 | 来源 | 用途 |
|---|---|---|
| `uni-id-users` | uni-id | 用户表 |
| `uni-id-roles` | uni-id | 角色表 |
| `uni-id-permissions` | uni-id | 权限表 |
| `uni-id-log` | uni-id | 登录日志 |
| `opendb-admin-menus` | uni-admin | 后台菜单 |
| `opendb-admin-log` | uni-admin | 操作日志 |
| `opendb-app-list` | uni-admin | 应用列表 |
| `opendb-app-versions` | uni-admin | 版本管理 |
| `opendb-verify-codes` | uni-captcha | 验证码 |
| `opendb-tempdata` | vk-unicloud | 临时数据 |
| `opendb-open-data` | vk-unicloud | 公开数据 |

### 业务表（新项目按需保留/修改）

| 表名 | 用途 | 关键字段 |
|---|---|---|
| `vk-card-key` | 卡密 | `card_code`(unique), `card_type`, `status`, `used_user_id` |
| `vk-products` | 产品定义 | `name`, `price`, `base_price`, `custom_user_ids` |
| `vk-user-products` | 用户-产品关联 | `user_id` + `product_id`(unique) |
| `vk-user-points` | 用户积分余额 | `user_id`(unique) |
| `vk-points-log` | 积分变动流水 | `user_id`, `order_id`(unique), `type`, `source` |
| `vk-recharge-orders` | 充值订单 | `trade_no`(unique), `user_id`, `status` |
| `vk-pay-orders` | 支付订单 | 来自 uni-pay |
| `vk-pay-config` | 支付配置 | 来自 uni-pay |
| `vk-tickets` | 工单 | `user_id`, `title`, `status` |
| `vk-ticket-replies` | 工单回复 | `ticket_id`, `user_id` |
| `vk-invite-rebate-log` | 邀请返利记录 | `inviter_id`, `invitee_id`, `order_id`(unique) |
| `vk-blacklist` | 黑名单 | `user_id`(unique) |
| `vk-global-data` | 全局键值 | `key`(unique) |
| `vk-components-dynamic` | 动态组件 | 框架自带 |
| `vk-error-log` | 错误日志 | 框架自带 |
| `vk-files` | 文件 | 框架自带 |
| `vk-files-categories` | 文件分类 | 框架自带 |
| `vk-lucky-draw-activity` | 抽奖活动 | 按需 |
| `vk-ws-connection` | WebSocket | 框架自带 |
| `vk-test` | 测试（可删） | 框架自带演示表 |

---

## 菜单结构

### 生产菜单（`static_menu/menu.json`）

```
├── 产品列表 → /pages/my-products/my-products
├── 卡密管理 → /pages/card-manage/card-manage
├── 购买积分 → /pages/points-shop/points-shop
├── 我的工单 → /pages/ticket/list
├── 个人中心 → /pages/user-center/user-center
├── 邀请中心 → /pages/invite-center/invite-center
├── 使用帮助 → /pages/docs/help/help
├── 更多产品
│   ├── 浏览器插件 → /pages/docs/crx-extensions/
│   ├── 定制多维表 → /pages/docs/table/
│   └── 定制软件 → /pages/docs/software/
└── [框架内置] 登录/注册/错误页
```

### 开发菜单（`static_menu/menu-dev.json`，生产不显示）

- VK 框架组件演示（table/form/input/detail/dialog/upload/editor）
- Element UI 静态演示（弹窗/表单/结果/异常/详情/设置）
- 实用工具（表单可视化设计器）
- 友情链接

---

## 替换模板清单

新项目基于本模板开发时，按以下顺序处理：

### 必须改

1. **manifest.json** — `appid`（申请新的）、`name`、`versionName`、`h5.title`
2. **app.config.js** — `index.url`（改为新项目首页）、`login.url`（如需自定义登录页）
3. **static_menu/menu.json** — 替换为新项目的菜单结构
4. **pages.json** — 删除不需要的页面，添加新页面

### 按需改

5. **业务云函数** — `service/admin/` 下按模块删减/新增
6. **数据库表** — `database/` 下删减不需要的 `.schema.json` / `.index.json` / `.init_data.json`
7. **主题** — `common/theme/` 下选择或自定义
8. **app.config.menu.js** — 如需调整菜单合并逻辑
9. **common/function/myPubFunction.js** — 自定义公共函数

### 不要改

- `uni_modules/` — 框架核心，升级时会覆盖
- `store/modules/` — 通用状态管理
- `windows/` — 布局组件（topWindow/leftWindow）
- `components/vk-data-*` — 框架自带组件
- `pages_plugs/error/` — 错误页
