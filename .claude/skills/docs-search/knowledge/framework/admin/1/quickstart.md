# 快速上手 - 安装步骤

1. 下载 uniapp 插件市场的 `vk-unicloud-admin` 项目

下载地址：[https://ext.dcloud.net.cn/plugin?id=5043](https://ext.dcloud.net.cn/plugin?id=5043)

2. `项目根目录` 执行 `npm i` 命令 （必须先执行此 npm 命令，安装必要的依赖，否则会无法启动。）

接下来是后端（云函数端）安装步骤

- 通常一个完整的项目分为 `client端`（客户端）、`admin端`（管理端）、`service端`（服务端，这里指云函数端）

**这里需要分三种情况**

- 情况一：你之前已经在用 `vk-unicloud-router` 框架开发 H5、小程序、APP 的开发者。[情况一详情](#情况一)

- 情况二：你之前是用别的框架开发 H5、小程序、APP，现在只想用 VK 框架单独开发 admin 项目。[情况二详情](#情况二)

- 情况三：你的项目刚开始，`client端` 和 `admin端` 都还没开发。[情况三详情](#情况三)

### 情况一

思路：因为云函数会互相覆盖，因此我们可以把 `service端（云函数端）` 统一放在 `client端` 的项目中，而 `admin端` 项目 直接绑定 `client端` 项目

**安装步骤：**

**友情提示：可以直接从第 4 步开始，1-3 步 client 端已经自带了**

1. 把 `admin端` 内的 `uniCloud/router/service/admin` 内的以下文件复制到你之前的 `client端` 项目 `uniCloud/router/service/admin` 内（复制整个目录）
2. 把 `admin端` 内的 `uniCloud/router/service/template` 内的以下文件复制到你之前的 `client端` 项目 `uniCloud/router/service/template` 内（复制整个目录）
3. 把 `admin端` 内的 `uniCloud/database/db_init/` 目录下的 3 个数据库表数据导入对应的表内（导入方法：服务空间后台 - 数据库 - 导入）

```js
uni-id-roles 角色表
uni-id-permissions 权限表
opendb-admin-menus 菜单表
```

4. 把 `admin端` 的服务空间直接绑定 `client端` 项目（注意是 `绑定` 不是 `关联`）（注意是 `绑定` 不是 `关联`）（注意是 `绑定` 不是 `关联`）

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/98c6961a-22c8-4d61-833f-f558d848b0e5.png)
![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/8a9406fd-ff00-48d4-b1fe-6e133c2bf13a.png)

5. 上传 `router` 云函数

6. 完成

### 情况二

已完成情况一的请直接跳过情况二和情况三

**安装步骤：**

1. 在 `项目根目录` 目录执行 `npm i`

2. 右键 `uniCloud` 目录 点击 `运行云服务空间初始化向导`

3. 完成

### 情况三

**安装步骤：**

- 建议你先使用 `vk-unicloud-router` 框架进行 `client端` 开发，`client端` 开发完成后，使用 `vk-unicloud-admin` 开发 `admin端`

- 当然你也可以先开发 `admin端`，再开发 `client端`。

- 如果先开发 `admin端`，则直接用 `情况二` 的安装步骤即可。

- 如果先开发 `client端`，则先下载 `client端` 开发框架，等 `client端` 开发完后再用 `情况一` 的安装步骤即可 [点击前往下载 client 端开发框架](https://ext.dcloud.net.cn/plugin?id=2204)

**初始 admin 账号密码：123456**

**如密码错误，可以强制重置 admin 账号密码**

[点击查看『强制重置 admin 账号密码步骤』](https://vkdoc.fsq.pub/admin/4/forceResetAdminPassword.html)

**安装代码快捷提示步骤**

1. 将 `根目录/使用帮助/代码快捷提示/javascript代码块提示.json` 内的代码 复制到 hbx 工具 - 代码块设置 - javascript 代码块
2. 将 `根目录/使用帮助/代码快捷提示/vue代码块提示.json` 内的代码 复制到 hbx 工具 - 代码块设置 - vue 代码块

**其他**

删除 `pages.json` 内的 `pages_template/components` 和 `pages_template/element` 分包（此为发布演示版本需要而加，你的项目可以删除，删除后开发模式下依然存在（因为在`pages-dev.json`中配置了），发布到线上环境时自动屏蔽）

**若提示上传云函数失败，请仔细对比下你的项目 `uniCloud/common` 目录是否跟下图完全一致**

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/7ae174db-7666-4301-b017-725edc73e3a3.png)

如果不一致，特别是 `uni-id` 目录下没有这个文件 `uni-id/node_modules/uni-config-center/uni-id/config.json`，则在 `uni-id` 目录执行 `npm i` 试试（如果有这个`uni-id/node_modules`目录，先删除目录，再执行 npm i）

**若新建的用户登录提示用户不存在（数据库明明有数据），此时是因为不同端用户隔离导致的**

1. 先用 admin 账号登录后台，进入应用管理

因为每个人的 `DCloud Appid`是不一样的，所以你需要在应用管理中添加自己的应用（或直接修改内置的 2 条数据的 appid 即可）

`DCloud Appid` 获取方法

复制 `uniapp` 项目根目录的 `manifest.json` 文件内的 `appid`

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/e717232f-0f18-4dee-8437-5dec2c224920.png)

2. 再进入用户管理，对需要设置的用户点击编辑，设置该用户可以登录哪些端。

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/18cd54d5-bedc-4d4f-bda2-7c339c865257.png)

3. 完成，可以登录了。

**如有疑问，请加群：22466457 关于插件的问题包教包会！**
