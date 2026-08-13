# Repository Guidelines

> AI 助手协作 vk-unicloud-admin 仓库的入口指南。读完本文应能正确选择工具、定位代码、遵守调用与状态管理约定,避免误改示例/演示资产。

## 1. Project Overview

**vk-unicloud-admin v1.21.0** —— 基于 `uni-app (Vue2) + uniCloud + uni-id + element-ui + vk-unicloud-router` 的 **PC 后台管理框架**(`manifest.json:88` `vueVersion: "2"`,`engines.uni-app: ^4.36`,`engines.HBuilderX: ^3.1.10`)。

- **作者**:VK(`package.json:19`)。文档站:https://vkdoc.fsq.pub/admin/
- **核心卖点**:"万能表格"与"万能表单"以 JSON 配置驱动 CRUD;内置用户/角色/权限/菜单/应用/升级中心等 12 项开箱模块(README §1-§3)
- **PC-only**:虽为 uniapp 项目,但 `template.h5.html` 注释明确"TinyMCE 等仅支持 PC、微信浏览器不支持";布局由 `topWindow`+`leftWindow` 自绘(`pages.json:282-296`)

## 2. Architecture & Data Flow

### 2.1 整体链路

```
[Vue Page / Component]
  └─ vk.callFunction({ url, data, success })
       └─ POST /http/router   (app.config.js:11 functionName="router")
            └─ uniCloud-alipay/cloudfunctions/router/index.js
                 ├─ middleware/*  (encrypt / registerInit / addAdminLog / errorFilter)
                 ├─ service/<group>/<sub>/<action>.js
                 │     └─ vk.baseDao.getTableData / vk.daoCenter.*Dao
                 │           └─ uniCloud.database()
                 └─ util/pubFunction.js  (跨业务工具)
```

### 2.2 三段式权限分层(云函数 service/ 子目录命名)

| 后缀 | 含义 | 前置条件 |
|---|---|---|
| `sys` | 管理员/系统侧 | `role.includes("admin")` + `uni-id-permissions` 节点匹配(`admin/*/sys/*`) |
| `kh` | 已登录客户端用户 | 有效 token,只读/改 `user_id == auth.uid` 的数据 |
| `pub` | 公开接口 | 无 token,如 `admin/card/pub/verify` |

例:工单列表 `pages/ticket/list.vue` → `vk.callFunction({ url: 'admin/ticket/kh/getList' })` → `service/admin/ticket/kh/getList.js`。

### 2.3 状态管理

- Vuex 单一 store(`store/index.js`),`namespaced:true`,模块自动注册
- 模块:**`$app`**(菜单/路由/尺寸)、**`$user`**(userInfo/permission/inviteCode/login)、**`$error`**(logs)
- 持久化:`uni.setStorageSync('lifeData')`,**`$error` 不持久**(`store/index.js:2` `notSaveStateKeys`)
- **约定**:业务代码**只走 `vk.setVuex('updateStore', {...})` 与 `vk.getVuex('$user.userInfo')`**,不要 `this.$store.commit` 或 `mapState`;通用 `updateStore` 支持 `'a.b.c'` 多级写入(`store/index.js:48-59`)

### 2.4 业务模块映射(已观察的 6 大域)

| 业务域 | 前端页面 | 云函数入口 | 数据表(schema) |
|---|---|---|---|
| 卡密授权 | `pages/card-manage/` | `admin/card/{pub,kh,sys}/*` | `vk-card-key` |
| 积分 | `pages/points-shop/`,`pages/user-center/` | `admin/points/{kh,sys}/*` | `vk-user-points` + `vk-points-log` |
| 产品 | `pages/my-products/`,`pages/system/product/` | `admin/product/{kh,sys}/*` | `vk-products` + `vk-user-products` |
| 工单 | `pages/ticket/{list,detail,create}.vue` | `admin/ticket/{kh,sys}/*` | `vk-tickets` + `vk-ticket-replies` |
| 邀请返利 | `pages/invite-center/` | `invite/{pub,util}/*` + `admin/rebate/sys/*` | `vk-invite-rebate-log` + `vk-global-data(key=invite_rebate_config)` |
| 系统设置 | `pages_plugs/system/*`(管理员) | `admin/system/*/sys/*` | `uni-id-*` + `opendb-*` |

## 3. Key Directories

| 路径 | 用途 | 备注 |
|---|---|---|
| `main.js` | Vue 入口,挂载 element-ui / umy-ui / vk / vkAdminUI,自动注册 `components/` 下同名子目录为全局组件 | **不要**新增 vendor UI 库 |
| `App.vue` | 根组件,`onLaunch` 拉取菜单/权限,`onPageNotFound` 跳 404 | 已 `@import '@/common/uni-admin/css/uni.css'` |
| `pages/` | 用户/普通管理员前台业务(首页/登录/注册/卡密/积分/工单/个人中心/邀请) | 主包 pages 20 个 |
| `pages_plugs/` | 管理员系统管理 + vk-unicloud 自带运营页 + 错误页 | subPackages 21 个;`error/{403,404,500}` 是默认错误页 |
| `pages_template/` | vkAdminUI / element-ui 模板演示 | **仅开发态出现**,见 §6 |
| `components/` | 全局组件;`vk-data-input-editor`(自研 contentEditable 富文本,1002 行)、`custom-editor-tinymce`(TinyMCE 封装,scene:form/table/detail) | 自动注册机制见 `main.js:26-36` |
| `common/uni-admin/` | uni-admin 官方模板样式补丁 | `说明.md` 详述 |
| `common/theme/` | 主题配置 `white / black / blackWhite / custom` | 由 `app.config.js theme.use` 切换 |
| `common/function/myPubFunction.js` | 自定义公共函数,挂在 `app.config.js myfn`,运行期通过 `vk.myfn.xxx()` 访问 | 当前仅 `myfn.test1` 示例 |
| `uni_modules/` | 23+ 个 uni_modules 插件(uni-id-pages / uni-forms / uni-popup / uni-captcha / vk-unicloud / vk-mail 等) | **不要**手动改这里,按 uni_modules 规范升级;见 §9.11 重复 schema 规则 |
| `store/modules/` | Vuex 模块($app/$user/$error) | 自动 require/import |
| `static_menu/` | `menu.json` 生产菜单 + `menu-dev.json` 演示菜单 | `app.config.menu.js` 按 `NODE_ENV` 合并 |
| `uniCloud-alipay/cloudfunctions/router/` | **单云函数 `router`**(URL `/http/router`);`service/admin/*` 业务、`util/*` 工具、`dao/*` DAO、`middleware/*` 拦截器 | 所有业务入口,改这里=改后端 |
| `uniCloud-alipay/database/` | schema + init_data + jql 脚本;`db_init.jql` / `db_init.json` / `更新产品管理菜单路径.jql` 是**一次性脚本** | 见 §7 |
| `script/` | Node 一次性数据修复/检查脚本(`check-missing-points.js` / `fix-missing-points.js` / `check-user-points.js` / `check_specific_card.js`) | 需用 `node script/xxx.js` 手动跑 |
| `windows/` | `topWindow.vue`(顶栏 100px,含多标签页 `vk-data-menu-tabs`)+ `leftWindow.vue`(侧菜单 280px,渲染 `$app.navMenu`) | `pages.json` 全局挂载 |
| `pages.js` | HBuilderX 编译钩子:dev 时把 `pages-dev.json` 合并进 `pagesJson` | 与 `app.config.menu.js` 同源(NODE_ENV 判据) |
| `md/` | 业务文档:卡密校验客户端对接、迁移指南(旧 `user_obj/verifyAPIKey` → 新 `admin/card/pub/verify`) | 改动业务请同步更新 |

## 4. Development Commands

| 动作 | 命令 / 工具 | 备注 |
|---|---|---|
| 安装运行时依赖 | `npm i` | **必做**(README:130,167);仅装 3 个 vendor,无 devDeps |
| 包管理器 | **npm** | `package-lock.json` 存在,无 yarn/pnpm lock |
| 启动开发 | **用 HBuilderX 打开项目根目录 → 运行 → 运行到浏览器(chrome/Edge)** | **不要**用 `npm run dev`(无此脚本);HBX 是唯一运行入口 |
| 启动云函数本地调试 | HBX 右键 `uniCloud-alipay/cloudfunctions/router` → 本地运行云函数 / `运行云服务空间初始化向导` | `.hbuilderx/launch.json` 配 `provider:alipay / type:uniCloud / launchtype:local` |
| 数据库初始化 | HBX 右键 `uniCloud-alipay/database/db_init.jql` / `db_init.json` | **一次性,不可重入**(除非带幂等注释) |
| 调试查询 | 在 `uniCloud-alipay/database/JQL查询.jql` 写查询,右键运行 | 这是仓库的"开发期 SQL 替代品" |
| 发布 H5 | HBX → 发行 → 网站(PC Web);输出路径 `unpackage/dist/build/h5` | H5 部署时记得 `manifest.json:74` 的 `base: "/admin/"` |
| 数据修复脚本 | `node script/fix-missing-points.js` 等 | 一次性,需先看脚本顶部 `UNPACKAGE/argv` 注释 |

## 5. Code Conventions & Common Patterns

### 5.1 云函数调用(全仓唯一范式)

```js
// 标准调用
vk.callFunction({
  url: 'admin/ticket/kh/getList',
  data: { page: 1, status: 'pending' },
  success: (res) => { /* res = { rows, total } 或 { code:0, msg, data } */ },
  fail: (err) => { uni.showToast({ title: err.msg || '请求失败', icon: 'none' }) }
})
```

- **`url` 字符串格式**:`<group>/<module>/<sys|kh|pub>/<action>`(如 `admin/points/kh/addPoints`、`client/pub/getAnnouncement`)
- **错误处理**:`app.config.js:42` `globalError: true` 开启全局拦截,业务内不必重复 `try/catch`,但**关键事务**(如积分改写)仍需后端 `transaction` + `rollback`,见 `service/admin/card/kh/renew.js:160`
- **不要**直接用 `uniCloud.callFunction`(未发现使用点,会绕过 token 拦截)

### 5.2 状态读写

```js
// 读
const userInfo = vk.getVuex('$user.userInfo')
const isAdmin = userInfo.role && userInfo.role.includes('admin')

// 写
vk.setVuex('updateStore', { name: '$user.userInfo.nickname', value: '新昵称' })
// 或
vk.setVuex('$user.userInfo', { ...userInfo, nickname: '新昵称' })
```

### 5.3 命名

- **页面文件**:kebab-case(`card-manage.vue`、 `invite-center.vue`、 `rebate-history.vue`)
- **业务目录**:`pages/<domain>/<page>.vue`,管理员子页面放 `pages_plugs/system/<module>/list.vue` + `form/<action>.vue`
- **云函数文件**:flat `<action>.js`(`getList.js` / `create.js` / `updateStatus.js` / `reply.js`),**不带 `.vue`**;首行注释 `@url admin/.../...`
- **store 模块**:`$<scope>` 前缀(`$app` / `$user` / `$error`),体现 "framework-owned" 语义
- **数据库表**:`vk-<domain>[-<entity>]`(`vk-card-key` / `vk-points-log` / `vk-user-products`);业务前缀 `vk-`,uni-admin 标准表保留 `uni-id-*` / `opendb-*`

### 5.4 业务逻辑边界

- **数据库访问只走后端**:`vk-card-key` / `vk-tickets` / `vk-invite-rebate-log` 等 schema 全部 `read/create/update/delete: false`,**前端**不可直连 clientDB
- **幂等 anchor**:积分变动必须先写 `vk-points-log`(`order_id` 唯一),`util/points.js addPoints` 内部已检查
- **续费/扣减**:必须 `transaction.rollback()` 包裹;`service/admin/card/kh/renew.js` 是参考实现
- **加密通道**:`app.config.js checkEncryptRequest.mode=1` 走 AES-256-GCM;密钥 hex 默认常量,**生产应改 env `ENCRYPTION_KEY`**(`util/card.js`)

### 5.5 样式

- 全局 SCSS:`common/css/app.scss` 已在 `main.js:39` 引入
- 主题:`theme.use = 'blackWhite'`(默认),改主题要同步 `common/theme/{black,white,blackWhite}.js`
- PC 框架:`navigationStyle:custom` + `topWindow`(100px)+ `leftWindow`(280px,折叠 64px),**不要**在子页面覆盖 `window` 字段

## 6. Runtime/Tooling Preferences

| 项 | 值 | 证据 |
|---|---|---|
| **IDE(必需)** | HBuilderX ^3.1.10 | `package.json:28`;`main.js` 用 `require.context`、`uniCloud.database()` 等仅 HBX 编译的语法 |
| **运行时** | H5 走 hash 路由 `/admin/` base | `manifest.json:70-77` |
| **Vue 版本** | Vue 2(`vueVersion: "2"`) | `manifest.json:88` |
| **包管理器** | **npm**(无 yarn/pnpm lock) | `package-lock.json` 存在 |
| **Node 运行时**(云函数) | Nodejs 18 | `cloudfunctions/router/package.json` cloudfunction-config |
| **加密** | AES-256-GCM | `util/card.js` |
| **UI 库** | element-ui 2.15.14(非 element-plus)+ umy-ui 1.1.6 + vk-unicloud-admin-ui ^1.20.15 | `package.json:23-26` |
| **状态管理** | Vuex 3/4(Vue2 走 Vuex.Store,Vue3 走 createStore,二选一编译) | `store/index.js:61-133` `#ifdef VUE3` 条件编译 |
| **路径别名** | `~@/` `@/` `/` 统一映射到 `UNI_INPUT_DIR` | `postcss.config.js:6-15` |
| **dev/prod 判据** | `process.env.NODE_ENV !== 'production'`(HBX 自动注入) | `pages.js:1`、 `app.config.menu.js:1`、 `app.config.js:9` |

## 7. Testing & QA

**结论:本仓库无前端 JS 单元测试、无 E2E、无 CI/CD。**

| 项 | 状态 |
|---|---|
| `npm test` | 占位 `echo "Error: no test specified" && exit 1`(`package.json:18`)|
| Jest / Vitest / Mocha | **未发现**;无 `*.test.*` / `*.spec.*` / `tests/` / `__tests__/` |
| Cypress / Playwright | **未发现** |
| CI(`.github/workflows/`、 `.gitlab-ci.yml`、 `.travis.yml`) | **未发现** |
| `uniCloud-alipay/cloudfunctions/router/service/template/test/` | **不是**单测,是 vk-router 的云函数调用模板(`@url template/test/...`);被前端 `vk.callFunction({ url: 'template/test/...' })` 直接引用 |
| `database/vk-test.*` | **不是**测试断言目标,是 vk-unicloud-admin 框架自带的"CRUD 演示表",对应 `template/db_api/*` |
| `database/db_init.jql` / `db_init.json` / `更新产品管理菜单路径.jql` | **一次性数据脚本**,不可重入;改时保留 `// 首次运行可注释` 之类的幂等注释 |

**约定俗成的验证方式**:
1. **业务调试**:`uniCloud-alipay/database/JQL查询.jql` 写查询 + HBX 右键运行
2. **接口调试**:`uniCloud-alipay/cloudfunctions/router/router.param.json` 改默认 `url`,HBX 本地运行云函数
3. **页面冒烟**:HBX 运行到浏览器,手工点页面 + 观察控制台(vk 在 `app.config.js:9` `debug` 模式打日志)
4. **数据修复**:`node script/xxx.js`(脚本顶部通常带 `argv` 解析)

**AI 协作硬性约束**:
- ❌ **不要**建议或运行 `npm test` —— 会立即 exit 1
- ❌ **不要**为业务代码硬塞 Jest/Vitest —— 仓库从无此约定
- ❌ **不要**把 `service/template/test/*` 改写成 `describe/it/expect` —— 这些是示例,被前端代码 + 文档直接引用
- ❌ **不要**改 `db_init.jql` / `db_init.json` 的现有数据;新增初始化请写新文件并标记幂等
- ✅ **改业务前先跑**:`JQL查询.jql` 验证数据形态 + `router.param.json` 验证接口签名
- ✅ **改前端 vk 调用前先**:`read pages/.../*.vue` 确认当前 `url` 串 + `read service/.../...js` 确认后端期望参数

## 8. Important Files Quick Reference

| 关注点 | 文件 |
|---|---|
| 入口 | `main.js`, `App.vue`, `manifest.json` |
| 全局配置 | `app.config.js`, `app.config.menu.js`, `postcss.config.js`, `template.h5.html` |
| 页面注册 | `pages.json`, `pages-dev.json`, `pages.js` |
| 状态 | `store/index.js`, `store/modules/{$app,$user,$error}.js` |
| 主题 | `common/theme/{index,black,white,blackWhite}.js` |
| 自定义函数 | `common/function/myPubFunction.js` |
| 全局组件 | `components/vk-data-input-editor/`, `components/custom-editor-tinymce/` |
| 顶栏/侧栏 | `windows/topWindow.vue`, `windows/leftWindow.vue` |
| 云函数入口 | `uniCloud-alipay/cloudfunctions/router/index.js` + `package.json` + `router.param.json` |
| 业务云函数 | `uniCloud-alipay/cloudfunctions/router/service/admin/{card,points,product,ticket,statistics,system,system_uni,kong}/{sys,kh,pub}/*.js` |
| 业务工具 | `uniCloud-alipay/cloudfunctions/router/util/{card,points}.js`, `util/pubFunction.js` |
| 中间件 | `uniCloud-alipay/cloudfunctions/router/middleware/modules/*.js` |
| 数据库 | `uniCloud-alipay/database/*.schema.json` / `*.index.json` / `*.init_data.json` |
| 一次性脚本 | `uniCloud-alipay/database/{db_init.jql, db_init.json, 更新产品管理菜单路径.jql}`, `script/*.js` |
| 文档 | `README.md`, `md/卡密校验接口客户端调用说明.md`, `md/卡密校验接口迁移指南.md`, `common/uni-admin/说明.md`, `changelog.md` |
| IDE 启动 | `.hbuilderx/launch.json` |

## 9. Common Pitfalls(AI 必读)

1. **`service/template/test/*` ≠ 测试** —— 改前先确认是否被前端示例页引用(`md/` 文档、 `pages_template/components/*` 演示)
2. **`vk-test` 表 ≠ 单元测试目标** —— 写示例业务时若被引用,应改用真实业务表
3. **`db_init.*` 脚本 ≠ 迁移工具** —— 改它会污染现有数据;新初始化写独立文件
4. **`pages_template/` 演示页生产被剥离** —— 不要在 `pages.json` 直接注册,会绕过 dev-only 注入逻辑
5. **Vuex 不要直接 commit** —— 用 `vk.setVuex('updateStore', { name, value })` 或 `vk.setVuex($user.userInfo, obj)`
6. **不要新增 vendor UI 库** —— 已有 element-ui + umy-ui + vk-unicloud-admin-ui,新增会冲突 theme
7. **H5 部署路径 `/admin/`** —— `manifest.json:74`,跨域/静态资源引用都要带此 base
8. **跨端不可移植** —— 框架 PC-only,不要把页面改成移动端(布局假设宽屏 ≥1280)
9. **appid 隔离** —— 每个部署要修改 `manifest.json:3` `__UNI__xxx` 并在 `opendb-app-list` 注册(README §6)
10. **改完页面记得在 `pages_plugs/system_uni/vk-global-data` 或 `app.config.menu.js` 同步菜单** —— 静态菜单 + 动态菜单双轨,缺一会导致 404
11. **不要在 `uniCloud-alipay/database/` 中放与 uni_modules 同名的 schema 文件** —— HBuilderX 构建时会自动加载 `uni_modules/*/uniCloud/database/` 下的 schema,与项目本地同名文件冲突导致重复报错。如需定制 uni_modules 的 schema(如改字段名/类型),直接修改 uni_modules 源文件并接受升级时需重新同步的风险;不要在 `database/` 目录放副本

## 10. Quick Recipe: 新增一个 CRUD 页面

```js
// 1. 后端: uniCloud-alipay/cloudfunctions/router/service/admin/<module>/sys/<action>.js
module.exports.main = async (event) => {
  let { data = {}, userInfo, util, originalParam } = event;
  let { vk } = util;
  let res = { code: 0, msg: '' };
  try {
    res.data = await vk.baseDao.getTableData({
      dbName: 'vk-<entity>',
      data,                       // 来自前端的 data
      whereJson: data.whereJson,  // 过滤
      sortArr: [{ name: '_add_time', type: 'desc' }],
      pageIndex: data.pageIndex || 1,
      pageSize: data.pageSize || 20,
    });
  } catch (err) {
    res.code = -1; res.msg = err.message;
  }
  return res;
};

// 2. 前端: pages/<domain>/list.vue(参考 pages/ticket/list.vue 9.0KB 模板)
import { ...mapActions } from 'vuex' // 不用,直接 vk.callFunction
// loadData() → vk.callFunction({ url: 'admin/<module>/kh/getList', data: { ... }, success })

// 3. 菜单: app.config.menu.js / static_menu/menu.json(开发同步 menu-dev.json)

// 4. 权限: uniCloud-alipay/database/uni-id-permissions.init_data.json 加
//    { "permission_id": "sys-<module>-get", "comment": "...", "url": "admin/<module>/sys/getList" }
```



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



---

**TL;DR 给 AI 协作者**:
- 工具链:HBX + npm,无测试/CI/lint
- 唯一通信:`vk.callFunction({ url })` 走单云函数 `router`
- 状态唯一出口:`vk.setVuex` / `vk.getVuex`
- 边界:`pages/`(前台) vs `pages_plugs/`(管理员) vs `pages_template/`(dev 演示)
- 禁区:`service/template/test/*` 演示、`vk-test` 表、`db_init.*` 一次性脚本不要当测试/迁移用
