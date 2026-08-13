# 群友问题集

## 数据库明明有数据，但用户登录提示用户不存在？

- 1、先用 admin 账号登录后台，进入应用管理

因为每个人的 `DCloud Appid`是不一样的，所以你需要在应用管理中添加自己的应用（或直接修改内置的 2 条数据的 appid 即可）

`DCloud Appid` 获取方法

复制 `uniapp` 项目根目录的 `manifest.json` 文件内的 `appid`

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/e717232f-0f18-4dee-8437-5dec2c224920.png)

- 2、再进入用户管理，对需要设置的用户点击编辑，设置该用户可以登录哪些端。

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/18cd54d5-bedc-4d4f-bda2-7c339c865257.png)

- 3、完成，可以登录了。

## 为什么云函数 URL 化后，明明数据库里有该用户，登录提示用户不存在？

这是因为现在的 `uni-id` 模块强制不同端用户隔离导致的，你需要在 URL 化的请求头中多传 2 个参数

分别为：

- vk-appid （你项目的 manifest.json 内的 appid）
- vk-platform （运行环境，如 h5、mp-weixin、app-plus 等）

以 jquery 为例

```js
$.ajax({
  type: 'POST',
  url: 'https://xxx.com/http/router/template/test/pub/test',
  headers: {
    'content-type': 'application/json;charset=utf8',
    'uni-id-token': 'xxxxxxxxx', // 用户token
    'vk-appid': '__UNI__89927A9', // 你项目的dcloud_appid
    'vk-platform': 'mp-weixin', // 运行环境，如 h5、mp-weixin、app-plus 等
  },
  data: JSON.stringify({
    username: 'test',
    password: '123456',
  }),
  success: (data) => {
    console.log('data', data);
  },
});
```

## 如何使用官方 `unicloud-admin` 的插件，如 `APP升级中心`

注意：自 `vk-admin` `1.14.0` 版本起，已内置 `APP升级中心`（功能与官方的一致，同时在此基础上进行了拓展），无需再手动集成，下面只是介绍以下如果手动集成官方的 `APP升级中心`，需要的操作步骤。

插件根目录下的 `common/unicloud-admin` 目录为官方模板的一些样式文件

- 如果你需要引入 `unicloud-admin` 官方的一些插件，如[升级中心](https://ext.dcloud.net.cn/plugin?id=4470)
- 你可能会碰到样式错乱的问题，那是因为 `vk-unicloud-admin` 并没有引入 `unicloud-admin` 的公共样式
- 但框架已经帮你整理好了公共样式的文件，就在 `common/unicloud-admin` 目录内

在 `App.vue` 中引入 `unicloud-admin` 的公共样式

```vue
<style lang="scss">
  @import '@/common/unicloud-admin/css/uni.css';
  @import '@/common/unicloud-admin/css/uni-icons.css';
</style>
```

同时官方的插件一般是不通过 `云函数` 获取数据的，而是通过 `clientDB` 操作数据库（前端操作数据库）

- 因此，你需要上传一些数据库的 `schema.json` 文件

如 `升级中心` 需要上传以下两个 `schema.json` 文件

- opendb-app-list.schema.json
- opendb-app-versions.schema.json

这些 `schema.json` 文件一般在插件包里就有，直接右键点击对应的文件即可上传。

- 如升级中心的 `schema.json` 目录在 `uni_modules/uni-upgrade-center/uniCloud/database/opendb-app-list.schema.json`

- 同时一般插件还会有一个自己的 `db_init.json` 文件 如 `uni_modules/uni-upgrade-center/uniCloud/database/db_init.json` （也是右键上传）

## 如何关闭当前打开的 tabs 页面

```js
vk.menuTabs.closeCurrent();
```

若提示 `menuTabs is undefined` 则请在 `windows/topWindow.vue` 页面 添加如下代码

```js
// 组件挂载完毕时
mounted() {
  this.vk.menuTabs = this.$refs.menuTabs;
},
```

同时需【升级】`vk-unicloud-admin-ui` 包升级至 `1.7.2` 或以上

## 如何升级 `vk-unicloud-admin-ui` 包

步骤:

- 1、根目录的 `package.json` 文件打开，修改 `dependencies` 节点下的 `vk-unicloud-admin-ui` 的版本
- 2、项目根目录执行 `npm i`
- 3、重启项目

## 为什么 `npm i vk-unicloud-admin-ui` 提示版本不存在?

那一定是你的 npm 使用了别的镜像源（如淘宝镜像源）导致的。

解决方案：

- 1、先运行命令 `npm config set registry https://registry.npmjs.org`
- 2、再运行命令 `npm i vk-unicloud-admin-ui`

小知识：

- 查看镜像源 `npm config get registry`
- 设置 taobao 镜像 `npm config set registry https://registry.npmmirror.com`
- 恢复成原来的镜像 `npm config set registry https://registry.npmjs.org`

## 如何美化默认滚动条?

将下方的 css 样式复制到全局样式文件 `common/css/app.scss` 中

```css
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: rgba(135, 135, 135, 0.1);
}
::-webkit-scrollbar-thumb {
  background: rgba(135, 135, 135, 0.4);
  border-radius: 6px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(135, 135, 135, 0.8);
}
```

## 如何发布 admin 系统到 unicloud 前端网页托管?

依次点击 HBX 的 发行 - 上传网站到服务器（注意，目前只有阿里云的云空间支持在 HBX 上直接上传）

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/b7996a5b-6b2c-41e6-8820-a790fabfc091.png)

## 如何发布 admin 系统到自己的 web 服务器?

依次点击 HBX 的 发行 - 网站-PC-Web - 输入你的网站域名

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/3fd36d06-e901-4a77-8489-01dfe5cfc492.png)

打包完成 HBX 控制台会提示源码文件位置，将源码上传到你自己的 web 服务器对应目录即可。

## 表格查询翻页的时候报错 Sort exceeded memory limit of 104857600 bytes

排序字段加索引，其中表格查询默认是 `_add_time` 字段排序，故需 `_add_time` 字段需要加 非唯一索引（升序或降序都可以）

**特别说明：**

翻页其实是一个耗性能的操作，目前阿里云服务空间当翻页到第 300 万条数据时可能会报错（指加了索引后，如果不加索引，可能几万条数据就会报错）

因此当数据量达到 300 万时，应该限制下查询条件，比如限制时间范围，查询开始时间和结束时间不能大于 3 个月，且默认只查当月数据等等。

**那如果非要查询全部数据怎么办？**

用 `_id` 排序，同时限制只能下一页或上一页，不可以指定跳转到第几页

以 实现 \_id 升序排序为例

实现下一页通过 where \_id > 本页的最后一条记录，且 \_id 是升序排序，这样查询到的就是下一页的数据

实现上一页通过 where id < 本页的第一条记录，且 \_id 降序排序，这样查到的就是上一页数据

以 实现 \_id 降序排序为例

实现下一页通过 where \_id < 本页的最后一条记录，且 \_id 是降序排序，这样查询到的就是下一页的数据

实现上一页通过 where id > 本页的第一条记录，且 \_id 是升序排序，这样查到的就是上一页数据

## 如何使用官方的 uni 统计 2.0

由于 `uni统计2.0` 被内置在了 `uni-admin` 项目中，同时涉及到的表较多，且 `uni-admin` 内置的云函数、公共模块也较多，如果直接集成到 `vk-admin` 中，比较复杂，那么有没有更方便的集成方式呢？

答案是有的，你只需要按下面的步骤一一进行即可。

核心思路：统计独立部署，并统一上报到 uni 统计所属服务空间

**该集成方式的优势：**

1. 统计与业务分离，统计的并发和业务的并发量独立计算，互不影响 QPS
2. 一个空间可以管理多个应用的统计，且这些应用不需要关联这个空间（可跨账号）
3. 集成非常方便，适合任何项目

**该集成方式的劣势：**

注册用户统计和支付统计不可用（因为数据不在部署 uni 统计的空间上，当然你也可以自己写定时任务同步这些数据）

**操作步骤**

1. 新建一个服务空间（需全新的，没有部署过任何应用的）
2. 前往[uni-admin 插件详情页](https://ext.dcloud.net.cn/plugin?id=3268)，点击【在线体验/部署】

![](https://mp-cf0c5e69-620c-4f3c-84ab-f4619262939f.cdn.bspapp.com/vk-doc/456.png)

3. 等待一键部署完成，此过程大概 10-20 分钟左右，慢慢等即可
   ![](https://mp-cf0c5e69-620c-4f3c-84ab-f4619262939f.cdn.bspapp.com/vk-doc/457.png)

4. 打开你需要使用 uni 统计 2.0 的项目(你自己的客户端项目)的根目录的 `manifest.json` 文件，点击 uni 统计，全部开启

![](https://mp-cf0c5e69-620c-4f3c-84ab-f4619262939f.cdn.bspapp.com/vk-doc/458.png)

5. 别急着关闭 `manifest.json` 文件，再打开 Ta 的源码视图，找到根节点的 `uniStatistics` 节点，增加 `uniCloud` 配置，并设置 debug 为 true（方便调试的时候也能上报统计数据）

```js
"uniStatistics" : {
    "debug" : true,
    "enable" : true,
    "version" : "2",
    "uniCloud" : {
        "provider" : "aliyun",
        "spaceId" : "空间id",
        "clientSecret" : "空间clientSecret"
    }
},
```

uniCloud 内的参数说明

|    参数名    |  类型  | 必填 | 默认值 |                                                       说明                                                       |
| :----------: | :----: | :--: | :----: | :--------------------------------------------------------------------------------------------------------------: |
|   provider   | String |  是  |   -    |                                             aliyun、tencent、alipay                                              |
|   spaceId    | String |  是  |   -    |                               服务空间 ID，**注意是服务空间 ID，不是服务空间名称**                               |
| clientSecret | String |  是  |   -    |             仅阿里云支持，可以在[uniCloud 控制台](https://unicloud.dcloud.net.cn)服务空间列表中查看              |
|  accessKey   | String |  是  |   -    |        对应 AK 仅支付宝云支持, 可以在[uniCloud 控制台](https://unicloud.dcloud.net.cn)服务空间详情中查看         |
|   secretId   | String |  是  |   -    | 和 accessKey 一样即可，仅支付宝云支持, 可以在[uniCloud 控制台](https://unicloud.dcloud.net.cn)服务空间详情中查看 |
|  secretKey   | String |  是  |   -    |        对应 SK 仅支付宝云支持, 可以在[uniCloud 控制台](https://unicloud.dcloud.net.cn)服务空间详情中查看         |
|  spaceAppId  | String |  是  |   -    |            仅支付宝云支持, 可以在[uniCloud 控制台](https://unicloud.dcloud.net.cn)服务空间详情中查看             |

6. 启动项目，随便跳转几个页面(持续 20 秒左右)，去查看 uni 统计对应的服务空间里的数据库表 `uni-stat-page-logs` 是否有数据，如果有代表成功了。
7. 前往 uni 统计对应的服务空间控制台页面，点击前端托管，参数配置，绑定下自定义域名（默认域名有访问限制）
8. 通过 `https://自定义域名/admin/` 即可进入 uni-admin 统计后台
9. 然后需要在 uni-admin 添加下你的应用 id，点击系统管理-应用管理，新增应用（只需要填写 appid 和应用名称即可）

![](https://mp-cf0c5e69-620c-4f3c-84ab-f4619262939f.cdn.bspapp.com/vk-doc/460.png)

10. 操作完成后，明天就可以查看到数据了（注意：今天的数据需要明天跑批后才能看）

## 如何指定某个页面不显示 leftWindow 和 topWindow

在 `pages.json` 里配置即可，参考登录页面的配置，只需要配置 `style` 下的 `topWindow` 为 `false`，`leftWindow` 也为 `false`

```json
{
  "path": "pages/login/index",
  "style": {
    "topWindow": false,
    "leftWindow": false,
    "navigationBarTitleText": "登录"
  }
}
```

<style scoped>
h1{
  font-size:1.4em;
}

h2{
  font-size:1.3em;
}

h3{
  font-size:1.1em;
}
</style>
