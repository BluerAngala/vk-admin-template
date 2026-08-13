---
sidebarDepth: 0
---

# 关于 vk-unicloud-admin 框架

:::tip 下载地址与文档

- admin 端框架下载： [https://ext.dcloud.net.cn/plugin?id=5043](https://ext.dcloud.net.cn/plugin?id=5043)

- admin 端框架文档： [https://vkdoc.fsq.pub/admin/](https://vkdoc.fsq.pub/admin/)

:::

### 什么是 `vk-unicloud-admin` ？

- `vk-unicloud-admin` 是基于 `uniapp` + `unicloud` + `uni-id` + `vk-unicloud-router` + `element` 的一套快速 `admin` 完整开发框架
- （只兼容 PC，只为 PC admin 而生，但 Ta 也是 uniapp 项目，非传统 vue-admin 项目，你可以用 Ta 来做你 H5、小程序、app 的 admin 管理端）

**注意：TA 是 uniapp 项目，支持 uniapp 所有 H5 的 API 和插件市场所有 uni-admin 插件**

**最大亮点：使用 `vk-unicloud-admin` 后，即使你是一个纯后端，不会写任何 css，照样可以写出功能强大且页面好看的 admin 管理系统。**

<img class="preview"  src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/ad18e7d6-ae0e-4424-bf3d-6e3dad1036a1.png"/>

### 与官方 `unicloud-admin` 的关系？

没有太大关系，用户在此框架上的编码风格与 `unicloud-admin` 差别较大。但框架兼容 `unicloud-admin`（官方的 admin 插件可以直接用在 `vk-unicloud-admin` 中）如：[APP 升级中心](https://vkdoc.fsq.pub/admin/question/question.html#%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8%E5%AE%98%E6%96%B9-unicloud-admin-%E7%9A%84%E6%8F%92%E4%BB%B6-%E5%A6%82-app%E5%8D%87%E7%BA%A7%E4%B8%AD%E5%BF%83)

### `vk-unicloud-admin` 主要功能 以及 对开发者的价值

- 1、完美集成 `vk-unicloud-router`，拥有 `vk-unicloud-router` 的所有现成 API 功能。让你开发事半功倍。[点击查看](https://vkdoc.fsq.pub/client/)
- 2、完美集成 `element` UI 框架，并在 `element` 基础上进行了深度封装（支持原生 `element`）[element 官网](https://element.eleme.cn/#/zh-CN/component/button)
- 3、`表单可视化拖拽工具`（可直接生成 `vk框架代码 `和 `element` 原生代码 [点击体验](https://vkunicloud.fsq.pub/vk-form-visualizer/)
- 4、`万能表格组件`，通过少量代码即可完成 `CRUD`，同时还拥有较高的自由度。几分钟完成一个页面 `CRUD`。
- 5、`万能表单组件`，通过少量代码即可完成表单渲染 + 表单请求。
- 6、超高自由度，支持使用插槽的形式自定义已有的功能和渲染方式，也支持直接使用 `element` 原生代码来写页面。
- 7、完善的用户角色权限，无需开发即可拥有（权限可精确到每一个云函数）。
- 8、`pages-dev.json` 机制，开发调试页面不会被发布到正式版中。
- 9、只要你开发过传统 `vue admin` 项目，那么上手此框架的学习成本几乎为 0
- 10、众多示例代码，为你的云开发之路扫平障碍。
- 11、内置 3 个主题（纯黑，纯白，黑白）且支持自定义主题。[点击查看主题](https://vkdoc.fsq.pub/admin/1/theme.html)
- 12、群内众多开发者，关于框架使用问题几乎有问必答。Q 群：22466457
- 13、更多功能敬请体验。

**最大亮点：使用 `vk-unicloud-admin` 后，即使你是一个纯后端，不会写任何 css，照样可以写出功能强大且页面好看的 admin 管理系统。**

### 核心功能

#### 一、万能表格

核心思想：通过 JSON 配置渲染页面（简单配置一下，表格就完成了）

如下方 JSON 用于渲染头像和时间

```js
[
  { key: 'avatar', title: '头像', type: 'avatar', width: 80, shape: 'circle' },
  {
    key: '_add_time',
    title: '添加时间',
    type: 'time',
    width: 160,
    valueFormat: 'yyyy-MM-dd hh:mm:ss',
  },
];
```

- 1、查询：包含分页、排序、多条件搜索、搜索项折叠、多表连表、数据源预处理、展开行、树状结构等等
- 2、支持多选框（用于批量操作）
- 3、自动生成详情页：点击详情按钮，自动显示详情页弹窗。
- 4、修改：点击修改按钮，自动显示修改表单弹窗。
- 5、删除：点击删除，显示气泡二次确认提示，再点击确定，则删除数据。
- 6、自定义操作按钮：如发货、审核等自定义按钮。
- 7、高自由度：每个字段都有插槽，在内置组件不满足需求的情况下，可以使用插槽自己编写该字段的渲染规则。（内置组件基本上可满足 90%以上的渲染需求）
- 8、导出 excel 表格：通过内置 api 只需一行代码即可直接导出表格数据。
- 9、导出满足表格查询条件的数据库内所有数据（unicloud 的查询有限制每次 500 条记录，但万能表格解决了此问题，可以导出数据库内全部数据)
- 10、异常重试机制：一般不需要此功能（即连接异常时会自动重新再查询，用户体验上只是感觉这次查询慢了一点而已，因为第一次失败了，查了 2 次或 2 次以上）
- 11、不仅仅支持 unicloud 云函数请求，还支持 http 请求。
- 12、支持下方自动显示合计
- 13、更多功能敬请体验 [万能表格文档地址](https://vkdoc.fsq.pub/admin/2/table.html)

#### 二、万能表单

核心思想：通过 JSON 配置渲染表单（简单配置一下，表单就完成了）

如下方 JSON 用于渲染 一个昵称输入框 和 性别单选按钮组

```js
[
  { key: 'nickname', title: '昵称', type: 'text' },
  {
    key: 'gender',
    title: '性别',
    type: 'radio',
    data: [
      { value: 1, label: '男' },
      { value: 2, label: '女' },
    ],
  },
];
```

- 1、自动提交表单
- 2、提交前自动表单验证
- 3、防止表单重复提交（提交后按钮自动进入 loading 状态，不可再点击）
- 4、同一表单可复用（如一般添加和修改的表单基本是一样的）
- 5、表单复用时，支持字段显示规则（如添加时有 A 字段，修改时，无 A 字段等）
- 6、拦截器：表单提交前拦截，执行自己逻辑，再放行或终止。
- 7、高自由度：每个字段都有插槽，在内置组件不满足需求的情况下，可以使用插槽自己编写该字段的渲染规则。（内置组件基本上可满足 90%以上的渲染需求）
- 8、重置表单：一键重置表单
- 9、表单可视化拖拽工具 [点击查看](https://vkunicloud.fsq.pub/vk-form-visualizer/#/)
- 10、更多功能敬请体验 [万能表单文档地址](https://vkdoc.fsq.pub/admin/3/form.html)

`vk-unicloud-admin` 框架同时还包含 `vk-unicloud-router` 所有功能，[点击查看 vk-unicloud-router 功能列表](https://vkdoc.fsq.pub/client/)

### 同时 admin 框架内置了以下页面

- 1、用户管理
- 2、角色管理
- 3、权限管理
- 4、菜单管理
- 5、应用管理
- 6、系统缓存管理
- 7、动态组件数据
- 8、用户登录日志
- 9、系统操作日志
- 10、VK 框架组件演示
- 11、element 静态功能演示
- 13、App 升级中心管理（新增于 1.14.0）
- 14、持续完善中。。。
