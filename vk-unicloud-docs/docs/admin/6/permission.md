---
sidebarDepth: 0
---

# 权限管理

![](https://cdn.fsq.pub/vkdoc/vk-admin/f917417a-9188-4615-9892-a569badc7bb0.png)

## 页面路径

- /pages_plugs/system/permission/list

## 相关云函数路径

- /router/service/admin/system/permission/

## 功能介绍

[传送门](https://vkdoc.fsq.pub/admin/4/role.html)

---

## 页面权限拦截

框架内置了页面权限拦截机制，在用户跳转页面时，自动检查该页面是否在用户的菜单权限列表中。若无权限，会自动跳转到 403 无权限页面。

### 工作原理

应用启动时（`onLaunch`），框架通过 `uni.addInterceptor` 拦截 `redirectTo`、`navigateTo`、`reLaunch` 三种页面跳转方式，在跳转前执行权限检查：

1. 403 页面自身不做检查（防止无限重定向）
2. 判断页面是否在 `checkPermissionPages` 规则范围内
3. 检查用户的菜单列表（`$app.menuList`）中是否存在该页面
4. 无权限时调用 `vk.navigateTo403()` 跳转到 403 页面

### 配置说明

在 `app.config.js` 中配置以下两项：

#### checkPermissionPages

控制哪些页面需要检查菜单权限：

```js
checkPermissionPages: {
  /**
   * 如果 mode = 1 则代表 list 内的页面需要检查菜单权限，不在 list 内的页面不需要检查
   * 如果 mode = 2 则代表 list 内的页面不需要检查菜单权限，不在 list 内的页面需要检查
   * 注意: list 内是通配符表达式，非正则表达式
   */
  mode: 2,
  list: ['/pages/index/index', '/pages/login/*'],
},
```

#### noPermission

指定 403 无权限页面的路径：

```js
noPermission: {
  url: '/pages_plugs/error/403',
},
```

### 与 checkTokenPages 的关系

| 配置项                 | 作用                     | 前置条件               |
| ---------------------- | ------------------------ | ---------------------- |
| `checkTokenPages`      | 控制哪些页面需要登录     | 无                     |
| `checkPermissionPages` | 控制哪些页面需要菜单权限 | 页面需要先通过登录检查 |

两者独立配置，互不干扰。如果一个页面不需要登录，则也不会检查菜单权限。

### 常见配置示例

**示例 1：排除首页和登录页，其余页面均检查权限（默认配置）**

```js
checkPermissionPages: {
  mode: 2,
  list: ['/pages/index/index', '/pages/login/*'],
},
```

**示例 2：只对特定业务页面检查权限**

```js
checkPermissionPages: {
  mode: 1,
  list: ['/pages/system/*', '/pages/order/*'],
},
```
