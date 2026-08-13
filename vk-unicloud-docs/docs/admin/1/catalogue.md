# admin 框架目录结构

## 前端（页面）目录结构

```js
.
├── vk-unicloud-admin ──────# 根目录
│ └── common───────────────────# 自定义公共资源
│ └── components───────────────# 自定义全局组件
│ └── node_modules─────────────# node模块
│ └── pages────────────────────# 【重要】页面目录（你开发的页面都写在这个目录内）
│ ── └── index────────────────────# 首页
│ ── └── login────────────────────# 登陆页面
│ ── └── ...──────────────────────# 你的其他页面
│ └── pages_plugs──────────────# 框架内置页面
│ ──└── error─────────────────────# 错误页面
│ ──└── system────────────────────# 用户角色权限菜单
│ ──└── system-uni────────────────# 其他页面
│ └── pages_template───────────# 框架模板示例页面
│ ──└── components────────────────# VK框架内置组件示例
│ ──└── element───────────────────# element原生组件示例
│ ──└── kong──────────────────────# 空页面模板示例
│ └── README───────────────────# 框架更新记录
│ └── static───────────────────# 静态资源目录
│ └── static_menu──────────────# 【重要】静态菜单目录
│ └── store────────────────────# 【重要】vuex目录
│ └── uni_modules──────────────# uni模块
│ └── windows──────────────────# admin窗体（左侧菜单和顶部导航）
│ └── app.config.js────────────# 【重要】全局配置
│ └── App.vue──────────────────# App.vue
│ └── main.js──────────────────# main.js
│ └── pages.json───────────────# 【重要】页面配置
│ └── pages-dev.json───────────# 【重要】只会在开发模式时打包的页面配置
└─────────────────────────────────
```

以上标记为【重要】的目录是你实际开发过程中会经常使用的。

## 后端（云函数）目录结构

[点击查看](https://vkdoc.fsq.pub/client/uniCloud/cloudfunctions/catalogue.html)

`admin端`的云函数代码写法和`client端`基本一致。

建议

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
