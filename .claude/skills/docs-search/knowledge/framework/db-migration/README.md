# 数据库一键搬家工具

:::tip 下载地址与文档

- 下载： [https://ext.dcloud.net.cn/plugin?id=6089](https://ext.dcloud.net.cn/plugin?id=6089)

- 文档： [https://vkdoc.fsq.pub/db-migration/](https://vkdoc.fsq.pub/db-migration/)

:::

## 一键搬家的优势

- 1、`官方的web控制台` 需要一个一个表导出导入，操作繁琐。而 `一键搬家` 不需要。

- 2、直接用 `官方的web控制台` 导出的 json 文件导入腾讯云，会出现 24 位 id 和外键搜索查不到的 bug。而 `一键搬家` 自动帮你所有 24 位 id 增加 1 位解决此 bug。

- 3、不仅支持将 `A账号` 下的 `A1空间` 搬家到 `A2空间`，还支持将 `A账号` 下的 `A1空间` 搬家到 `B账号` 下的 `B1空间`。

- 4、支持全端（阿里云、腾讯云、支付宝云）

- 5、省心、省力、解放双手！

## 一键搬家最重要的优势

**如果你用 `官方的web控制台` 从阿里云空间导出的 json 文件导入腾讯云空间，你会发现根据 `_id` 搜索时，有可能无法搜索到数据，那是因为腾讯云不支持阿里云生成的 24 位 `_id`，阿里云生成的 24 位 `_id` 导入到腾讯云空间后，会造成无法根据 `_id` 来查询数据，而 `一键搬家` 可以帮你完美解决这个棘手问题。**

## 效果视频

<video src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/257dab2e-eedc-48c4-aef7-d6149ea7b97b.mp4" controls="controls" style="max-width:100%;">
  您的浏览器不支持 video 标签。
</video>

## 名词定义

- 1、旧空间：就是你需要搬家的空间。

- 2、新空间：就是你需要把旧空间搬到这的空间。

## 注意事项

- 1、请确保 `旧空间` 和 `新空间` 是可以正常访问的空间。

- 2、`新空间` 数据库的数据在导入前 `会被全部清空`（需要注意空间别选错了，否则后果自负）。

- 3、`旧空间` 数据库的数据 `不会被清空`（也不会被修改）

- 4、搬家会消耗数据库查询次数、写入次数，以及云函数流量（请确保资源充足）。

- 6、目前大致耗时 = （你数据量总记录数 / 1000） 秒（即每秒搬 1000 条数据）（后面会继续优化这个速度）

- 7、如有问题，可以加 Q 群：`22466457` 进行反馈（关于插件问题必定会得到处理）。

## 插件市场地址

[点击前往](https://ext.dcloud.net.cn/plugin?id=6089)

## 一键搬家配置

配置文件为【一键搬家】项目根目录下的 `vk.db.config.js` 文件

```js
/**
 * 一键搬家配置
 */
export default {
  // 旧环境
  oldEnv: {
    cloud: 'uniCloud', // 通用参数 固定为 uniCloud
    platform: 'aliyun', // 通用参数 阿里云：aliyun 腾讯云：tencent 支付宝云：alipay 私有云：dcloud
    dbType: '', // 数据库类型 不填代表内置数据库，ext-db 代表扩展数据库
    spaceId: 'mp-9dd9a70d-0000-6666-a520-105287d47ff4', // 通用参数 从 https://unicloud.dcloud.net.cn/home 获取 对应SpaceId参数
    clientSecret: '阿里云专属参数', // 阿里云专属参数 从 https://unicloud.dcloud.net.cn/home 获取 对应ClientSecret参数
    spaceAppId: '支付宝云专属参数', // 支付宝云专属参数 从 https://unicloud.dcloud.net.cn/home 获取 对应SpaceAppId参数
    accessKey: '支付宝云专属参数', // 支付宝云专属参数 从 https://unicloud.dcloud.net.cn/home 获取 对应AK参数
    secretKey: '支付宝云专属参数', // 支付宝云专属参数 从 https://unicloud.dcloud.net.cn/home 获取 对应SK参数
    actionsecret: '5d44a032652974c3e53644945a95b126', // 通用参数 请求密钥，从 uniCloud/cloudfunctions/vk-db-migration/vk.db.config.js 获取（两者保持一样即可）
    endpoint: '私有云专属参数', // 私有云专属参数 从 https://unicloud.dcloud.net.cn/pages/private-cloud/cluster-list 获取 ApiEndpoint
  },
  // 新环境
  newEnv: {
    cloud: 'uniCloud', // 通用参数 固定为 uniCloud
    platform: 'aliyun', // 通用参数 阿里云：aliyun 腾讯云：tencent 支付宝云：alipay 私有云：dcloud
    dbType: '', // 数据库类型 不填代表内置数据库，ext-db 代表扩展数据库
    spaceId: 'env-00jx6s6j6mnt', // 通用参数 空间id 从 https://unicloud.dcloud.net.cn/home 获取 对应SpaceId参数
    clientSecret: '阿里云专属参数', // 阿里云专属参数 从 https://unicloud.dcloud.net.cn/home 获取 对应ClientSecret参数
    spaceAppId: '支付宝云专属参数', // 支付宝云专属参数 从 https://unicloud.dcloud.net.cn/home 获取 对应SpaceAppId参数
    accessKey: '支付宝云专属参数', // 支付宝云专属参数 从 https://unicloud.dcloud.net.cn/home 获取 对应AK参数
    secretKey: '支付宝云专属参数', // 支付宝云专属参数 从 https://unicloud.dcloud.net.cn/home 获取 对应SK参数
    actionsecret: '5d44a032652974c3e53644945a95b126', // 通用参数 请求密钥，从 uniCloud/cloudfunctions/vk-db-migration/vk.db.config.js 获取（两者保持一样即可）
    endpoint: '私有云专属参数', // 私有云专属参数 从 https://unicloud.dcloud.net.cn/pages/private-cloud/cluster-list 获取 ApiEndpoint
  },
  maxPageSize: 500, // 数据库单次请求获取数量，默认500，如果前端报内存超出大小限制的错误，可以尝试调小此值来解决。如设置为100或50或更小的值，最小为1，最大1000
  concurrencyImport: false, // 是否并发导入？设置为true可以提高性能，但无法保证迁移后的数据与原始顺序一致（一般业务进行查询时都会加排序条件，此时基本无影响），设置为false则可保证迁移后的数据与原始数据顺序一致
  debug: false, // 浏览器控制台是否打印请求日志，设置为 false 可以提升性能
  errorReconnectionCount: 10, // 数据库连接失败后重新连接次数，默认10次，一般无需修改
  maxImportQueueCount: 10, // 最大等待的导入队列数，默认10，一般无需修改（太大会影响前端性能）最小为1，最大为20
  maxLogCount: 200, // 控制台显示的最大日志数量，默认200，一般无需修改（太大会影响前端性能）
  handleObjectKeyName: true, // 是否需要同时处理满足阿里云_id格式的字段名，一般无需修改（true：同时处理字段名和字段值 false：只处理字段值，默认true）
  // 数据库内存储链接地址域名替换规则
  // 打开 fileRule 内的注释，编写旧域名和新域名，导入后数据库内的文件链接会用新域名代替旧域名
  fileRule: [
    // { "old": "https://test1.xxx.com", "new": "https://test2.xxx.com" }
  ],
  // 数据库集合（表）列表，目前没有接口可以直接获取表列表，故需要在此手动填写数据库中需要搬家的表信息
  // 可以自动根据 database 目录内的文件 生成数据库表名列表 方法：在项目根目录执行 node vk.create-db-config.js 详见文档 https://vkdoc.fsq.pub/db-migration/#如何生成数据库初始化文件
  db: [{ name: 'uni-id-users' }, { name: 'uni-id-roles' }, { name: 'uni-id-permissions' }, { name: 'opendb-admin-menus' }, { name: 'opendb-app-list' }],
};
```

**如何获取空间环境参数？**

登录[unicloud-web 控制台](https://unicloud.dcloud.net.cn/home)，在总览页面即可看到对应的参数。

## 操作步骤

- 1、打开【一键搬家】项目根目录 `vk.db.config.js` 配置文件，修改 `oldEnv` 、 `newEnv` 配置

![](https://mp-cf0c5e69-620c-4f3c-84ab-f4619262939f.cdn.bspapp.com/vk-doc/433.png)

- 2、生成 `database` 目录下的数据库初始化文件

### 如何生成数据库初始化文件？@init-db

在 `uniCloud控制台` 云数据库菜单下点击 `生成初始化数据` 选择只导出首条记录，生成不包含 ID（包含也没事）【一键搬家】运行时，会自动清空新空间的数据。

![](https://mp-cf0c5e69-620c-4f3c-84ab-f4619262939f.cdn.bspapp.com/vk-doc/451.png)

![](https://mp-cf0c5e69-620c-4f3c-84ab-f4619262939f.cdn.bspapp.com/vk-doc/452.png)

**注意：如果生成失败，不要慌，过一会再试**

- 3、把生成并解压的 `database` 文件全部复制到【一键搬家】项目根目录的 `uniCloud/database目录下`

![](https://mp-cf0c5e69-620c-4f3c-84ab-f4619262939f.cdn.bspapp.com/vk-doc/453.png)

注意：如果【一键搬家】项目的 `uniCloud/database目录下` 有 `db_init.json` 文件，则需要删除 Ta（这步很重要，因为上面介绍的是使用新的数据库初始化方式的，当然老的 `db_init.json` 方式目前也还是支持的）

![](https://mp-cf0c5e69-620c-4f3c-84ab-f4619262939f.cdn.bspapp.com/vk-doc/455.png)

然后在项目根目录执行 `node vk.create-db-config.js`

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/4ee5f06a-4665-450e-8d8f-00825a8801ea.png)

- 4、【一键搬家】项目绑定 `旧空间`，并上传云函数 `vk-db-migration` 和 `vk-db-migration-ext-db`

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/14fe3965-8268-4ab0-9dd4-6361451d0885.png)

- 5、【一键搬家】项目切换到 `新空间` ，在 `新空间` 也上传云函数 `vk-db-migration` 和 `vk-db-migration-ext-db`

**如何切换空间?**

右键 `uniCloud` 目录，点击关联空间，选择需要切换的空间。

**如何切换阿里云、腾讯云、支付宝云空间**

右键 `uniCloud` 目录，点击重命名，腾讯云为: `uniCloud-tcb` ，阿里云为 `uniCloud-aliyun`，支付宝云为 `uniCloud-alipay`，然后再右键 `uniCloud` 目录，点击关联空间，选择需要切换的空间。

### 特别注意：如果你购买的是普通授权版（非源码授权版），你可能需为两个空间各购买 1 次插件。

- 6、切换到 `新空间` 后，在 `新空间` 初始化你自己数据库 （注意：如果初始化报错，不要急，再初始化一次，直到提示成功或提示没有任何表数据要上传时，则代表成功）

![](https://mp-cf0c5e69-620c-4f3c-84ab-f4619262939f.cdn.bspapp.com/vk-doc/454.png)

- 7、启动 `一键搬家` 项目（请使用连接云端云函数）

**_注意：运行前先确认下，旧空间和新空间没有填错，否则运行时，新空间数据会清空（旧空间数据不会变）_**

- 8、启动【一键搬家】项目，访问首页，当看到页面控制台上打印 `点击上方【开始一键搬家】按钮可进行一键搬家` 时，点击此按钮即可。

- 9、点击【开始一键搬家】按钮

- 10、如不出意外，等待进度条到 100%即可。如果出了意外（比如阿里云数据库不稳定导致连续 20 次数据库连接失败（目前会自动重试 20 次），则需要刷新页面并重新点击【开始一键搬家】按钮

- 11、完成后请将 `uniCloud/cloudfunctions/vk-db-migration/vk.db.config.js` 和 `uniCloud/cloudfunctions/vk-db-migration-ext-db/vk.db.config.js` 的 `runKey` 设置为 false，再分别上传到 `旧空间` 和 `新空间`（这步很关键，防止后面误点导致数据被清空，也可以直接去 web 控制台删除云函数 `vk-db-migration` 和 `vk-db-migration-ext-db`）

- 12、完成。

## 常见问题

### 如你已付费购买，缺还提示[vk-database-one-click-migration]：不能在当前云服务空间使用

如果使用数据库搬家项目的时候遇到 `data undefined` 同时提示 `[vk-database-one-click-migration]：不能在当前云服务空间使用​`
则去项目根目录下的 `package.json` 文件内查看看是否有名为 `sn` 的属性，把 Ta 删除后再试试。

### 当需要迁移的数据条数非常多时，且迁移的时候不想停服太长时间时，支持先迁移部分数据（这部分数据需要保证不会再被修改和删除）

只有表存在不会再被修改和删除的数据时才能先迁移这部分数据，迁移的时候旧空间是不需要停服的

假设表 `uni-id-log` 有 2000 万条数据，其中这 2000 万条数据都不会再被修改和删除（因为这是日志表，不会被修改和删除，只会新增），这些数据的最后一条数据的 `_id` 是 `666c48a1a891ba9fb989fb30`（请必须通过 `_id` 降序排序后拿第一条数据的\_id，千万不要去控制台翻最后一页）

拿到目前最后一条 `_id` 的数据库语句如下，请在云函数中自己执行并获取到 `endId`

```js
const db = uniCloud.database();
let dbRes = await db.collection('uni-id-log').orderBy('_id', 'desc').limit(1).get();
let endId = dbRes.data[0]._id;
console.log('endId: ', endId);
```

`vk.db.config.js` 配置的时候这样写，多配置一个参数 `endId`，配置如下

解释：`endId` 代表只迁移到这个 `_id`（包含此 id） 后就结束此表

```js
...其他配置

"db": [
  ...其他表
	{ "name": "uni-id-log", "endId": "666c48a1a891ba9fb989fb30" },
]
```

下次停服全量迁移的时候，再多配置一个参数 `startId`，并去掉之前的参数 `endId`，配置如下

```js
...其他配置

"db": [
  ...其他表
	{ "name": "uni-id-log", "startId": "666c48a1a891ba9fb989fb30" },
]
```

解释：`startId` 代表迁移时从这个 `_id`（不包含此 id，即此 id 的下一条记录）开始

### 数据库里的文件 URL 域名如何替换？

修改配置 `fileRule` 数组，如下所示

注意：文件本身不会迁移，这里只替换域名，适用于云存储文件已迁移完成只需要改数据库内字段的 URL 值的情况。

```js
"fileRule": [
	{ "old": "https://test1.xxx.com", "new": "https://test2.xxx.com" }
],
```

## 特别注意

搬家完成后请将 `uniCloud/cloudfunctions/vk-db-migration/vk.db.config.js` 和 `uniCloud/cloudfunctions/vk-db-migration-ext-db/vk.db.config.js` 的 `runKey` 设置为 false，再分别上传到 `旧空间` 和 `新空间`（这步很关键，防止后面误点导致数据被清空，也可以直接去 web 控制台删除云函数 `vk-db-migration` 和 `vk-db-migration-ext-db`）
