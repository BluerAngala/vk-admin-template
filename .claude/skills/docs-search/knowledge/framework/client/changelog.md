---
sidebarDepth: 0
---

# client 框架目录结构

## 前端（页面）目录结构@client

```js
.
├── vk-unicloud-router ──────# 根目录
│ └── common───────────────────# 自定义公共资源
│ └── components───────────────# 自定义全局组件
│ └── node_modules─────────────# node模块
│ └── pages────────────────────# 【重要】页面目录（你开发的页面都写在这个目录内）
│ ── └── index────────────────────# 首页
│ ── └── ...──────────────────────# 你的其他页面
│ └── pages_template───────────# 框架模板示例页面
│ ──└── ...───────────────────────# 框架模板示例页面
│ └── static───────────────────# 静态资源目录
│ └── store────────────────────# 【重要】vuex目录
│ └── uni_modules──────────────# uni模块
│ └── app.config.js────────────# 【重要】全局配置（前端）
│ └── App.vue──────────────────# App.vue
│ └── main.js──────────────────# main.js
│ └── manifest.json────────────# uniapp项目的配置文件（每个uniapp项目都有）
│ └── pages.json───────────────# 【重要】页面配置
│ └── uni.scss─────────────────# 全局css变量（如无必要，建议不改动，加太多变量会使包体积变大）
└─────────────────────────────────
```

以上标记为【重要】的目录是你实际开发过程中会经常使用的。

## 后端（云函数）目录结构@cloud

[点击查看](https://vkdoc.fsq.pub/client/uniCloud/cloudfunctions/catalogue.html)

建议

- `client端` 的云函数全部写在 `service/client` 目录内
- 只需要登录即可请求的云函数写在 `kh` 目录内 如：`client/user/kh/setAvatar`
- 任何人都可以请求的云函数写在 `pub` 目录内 如：`client/user/pub/login`
