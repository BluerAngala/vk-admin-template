---
sidebarDepth: 0
---

# 4、不同端用户隔离

## 1、实现逻辑

用户表新增了 `dcloud_appid` 字段，类型是字符串数组，用来控制该用户可登录的应用列表。

在 admin 左侧菜单 用户角色权限 - 应用管理 中可管理当前的应用列表。

如指定哪个应用是用户端，哪个是管理端。（应用管理中的 appid 为 uniapp 项目的 manifest.json 文件内的 appid）

官方建议：`DCloud Appid`是一个很重要的配置，如无必要请勿随意更换。(在这个用户隔离逻辑下，更换后会导致用户无法登录)

## 2、数据库 - 应用表字段

#### 表名：`opendb-app-list`

| 字段名      | 字段说明                                                | 字段类型 |
| ----------- | ------------------------------------------------------- | -------- |
| \_add_time  | 记录添加时间                                            | time     |
| appid       | 应用的 AppID                                            | String   |
| type        | 应用类型 如 admin、client、rider、business （可自定义） | String   |
| name        | 应用名称 如 管理端、用户端、骑手端、商家端（可自定义）  | String   |
| description | 应用描述                                                | String   |
| create_date | 创建时间                                                | time     |

## 3、应用管理

框架内置了应用管理，1.4.0 之前的版本没有内置，需要手动添加

手动添加方法

- 1、下载最新版 admin 框架[点击下载](https://ext.dcloud.net.cn/plugin?id=5043)
- 2、复制新下载的项目根目录下的`pages_plugs`目录（全部）到你原本的框架内
- 3、复制云函数`\router\service\admin\system`目录（全部）到你原本的框架内
- 4、项目根目录`pages.json`的 `pages_plugs`子包添加代码 `{ "path": "system/app/list" },`
- 5、在菜单管理导入菜单（选择数组结构）
- JSON 内容为：

```js
[
  {
    _id: 'sys-app-manage',
    _add_time: 1596416400000,
    menu_id: 'sys-app-manage',
    name: '应用管理',
    icon: 'el-icon-cloudy',
    url: '/pages_plugs/system/app/list',
    comment: '应用管理',
    sort: 5,
    parent_id: 'sys-admin',
    enable: true,
  },
];
```

## 4、添加应用（重要）

因为每个人的 `DCloud Appid`是不一样的，所以你需要在应用管理中添加自己的应用（或直接修改内置的 2 条数据的 appid 即可）

DCloud Appid` 获取方法

复制`uniapp`项目根目录的`manifest.json`文件内的`appid`

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/e717232f-0f18-4dee-8437-5dec2c224920.png)

## 5、隔离不同端配置

#### （此步骤可忽略）隔离不同端配置（一般无必要，如有必要，可以这么做）

#### （除非你确定要隔离配置，否则建议保持原来的配置方案即可）

- 将`uni-id` 的`config.json`配置成数组形式（下方配置并非完全版，请勿直接复制）
- "dcloudAppid": "**UNI**xxxx1", // 务必替换为对应项目 manifest.json 内的 DCloud Appid
- "isDefaultConfig": true, // 默认配置标记，未匹配到 dcloudAppid 的情况下使用默认配置

```json
[
  {
    "dcloudAppid": "__UNI__xxxx1",
    "isDefaultConfig": true,
    "passwordSecret": "passwordSecret-demo",
    "tokenSecret": "tokenSecret-demo",
    "tokenExpiresIn": 7200,
    "tokenExpiresThreshold": 600,
    "app-plus": {
      "tokenExpiresIn": 2592000,
      "oauth": {
        "weixin": {
          "appid": "weixin appid",
          "appsecret": "weixin appsecret"
        }
      }
    }
  },
  {
    "dcloudAppid": "__UNI__xxxx2",
    "passwordSecret": "passwordSecret-demo",
    "tokenSecret": "tokenSecret-demo",
    "tokenExpiresIn": 7200,
    "tokenExpiresThreshold": 600,
    "app-plus": {
      "tokenExpiresIn": 2592000,
      "oauth": {
        "weixin": {
          "appid": "weixin appid",
          "appsecret": "weixin appsecret"
        }
      }
    }
  }
]
```

## 6、补齐用户 dcloud_appid 字段

- uni-id 在 3.3.0 提供了根据客户端 appid（项目 manifest.json 内配置的 DCloud Appid）隔离不同用户的功能
- 旧版本的 uni-id 在注册用户时并未将当前客户端的 appid 存储在用户的记录内
- 更新到新版后这些没有 dcloud_appid 字段的用户和之前一样可以登录所有端。
- 开发者使用云函数本地运行可以自行对用户数据进行修补，为用户创建 dcloud_appid 字段

[点击查看官方文档](https://uniapp.dcloud.net.cn/uniCloud/uni-id?id=makeup-dcloud-appid)
