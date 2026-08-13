---
sidebarDepth: 0
---

# 1、用户角色权限

#### 目前框架内置了 sys 过滤器（云函数层的权限过滤器，检测用户是否有此业务云函数的执行权限）

```js
用户表：`uni-id-users`
角色表：`uni-id-roles`
权限表：`uni-id-permissions`
由于云数据库的特殊性
用户角色中间表为用户表中的`role`字段(用户角色列表，由`role_id`组成的数组)
角色权限中间表为角色表中的`permission`字段(角色拥有的权限列表，由`permission_id`组成的数组)
```

### 云函数权限检测逻辑

#### 这里只是介绍下，框架已内置，无需写对应的代码

```js
1. 用户访问云函数 `user/sys/updateUserInfo`
则 `url = "user/sys/updateUserInfo"`
则云函数权限检测就变成了用户是否有执行 `user/sys/updateUserInfo` 云函数的权限。
2. 根据 `token` 获取到用户 `permission`
3. 根据权限表的权限规则（如完整匹配、通配符匹配、正则匹配）校验用户拥有的 `permission` 是否有任意一个权限匹配到了此 `url`
4. 若能匹配，代表用户有此云函数执行权限，放行，若不能匹配，代表用户无此云函数执行权限，需要拦截。
```

#### 注意：admin 角色无需赋予权限，即可访问所有云函数。

### 举例 1：设置用户 A 可以访问 `user/sys/updateUserInfo`

```
1、进入权限管理页面
2、创建权限C，其中url = user/sys/updateUserInfo
3、进入角色管理
4、创建角色B
5、给角色B赋予权限C
6、进入用户管理
7、给用户A赋予角色B
8、完成，此时用户A可以访问 user/sys/updateUserInfo
```

### 举例 2：设置用户 A 可以访问所有 以`user/sys/` 开头的云函数

```
1、进入权限管理页面
2、创建权限C，其中url = user/sys/* ， 匹配模式选择 通配符
3、进入角色管理
4、创建角色B
5、给角色B赋予权限C
6、进入用户管理
7、给用户A赋予角色B
8、完成，此时用户A可以访问 以 user/sys/ 开头的所有云函数
```

#### 以上为用户角色权限校验的大致逻辑（因为非常灵活配置，可以适用于所有系统：admin 后台，ERP 软件，APP、小程序等）

### 想要发挥内置权限过滤器的最大功能，建议

- `admin端` 的云函数全部写在 `service/admin` 目录内

- `client端` 的云函数全部写在 `service/client` 目录内
- `公共` 的云函数全部写在 `service/common` 目录内
- 需要权限的云函数写在 `sys` 目录内 如：`admin/user/sys/add` 、 `client/user/sys/setAvatar`
- 只需要登录即可请求的云函数写在 `kh` 目录内 如：`client/user/kh/setAvatar`

```js
注意：请求admin目录下的kh目录内的云函数  如：`admin/user/kh/setAvatar`
除了需要登录以外，登录用户的 allow_login_background 需为 true，否则也是无权限。
```

- 任何人都可以请求的云函数写在 `pub` 目录内 如：`client/user/pub/login`

#### [中间件 - 过滤器介绍](https://vkdoc.fsq.pub/client/uniCloud/middleware/filter.html)

#### 相关的页面列表

- 1、用户管理：`/pages_plugs/system/user/list`（此页面的用户管理仅仅显示可以登录 admin 后台的用户，你自己的小程序用户管理应该新建页面开发（尽量不要在此页面上开发））

- 2、角色管理：`/pages_plugs/system/role/list`

- 3、权限管理：`/pages_plugs/system/permission/list`

- 4、菜单管理：`/pages_plugs/system/menu/list`
