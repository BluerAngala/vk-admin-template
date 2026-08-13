---
sidebarDepth: 0
---

# 云对象

> 新增于 vk-unicloud 2.8.0（于 2022-04-01 发布）

## 介绍@introduce

### 云对象是什么？@introduce-1

云对象是云函数的集合，即 N 个函数写在同一个 xx.js 文件里。

**_在 VK 框架中，可以做到云对象和云函数同时存在。_**

**即在 VK 框架中，同时支持 `云对象路由模式` 和 `云函数路由模式`。**

- 1、VK 框架使用云对象前的目录结构

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/ff8f0028-9a9c-464c-9c92-f900ac5354ba.png)

- 2、VK 框架使用云对象后的目录结构

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/1f4c0851-99e9-4fe1-8ab9-cbedee407002.png)

### 云对象能带来什么，优势是？@introduce-2

**云对象与之前的单文件云函数模式相比有什么优势？**

- 1、解决目录层级过深的问题

- 2、精简代码量（减少总体的代码量）

- 3、云对象作为业务逻辑相对独立的个体，自带 \_before 和 \_after 两个过滤器，逻辑更清晰。

### 从单文件云函数模式迁移到云对象复杂吗？@introduce-3

- 无需迁移，在 VK 框架中，可以做到云对象和云函数同时存在。

### 有了云对象是否可以放弃云函数？@introduce-4

这里说的云函数非 uniCloud 官方传统云函数，而是 VK 框架下的单文件云函数路由模式。（传统云函数模式早就可以放弃了）

看个人编码喜好，有人喜欢云函数路由模式，也有人喜欢云对象路由模式，两者各有风格和优势。

## 云对象内置 API@api

**特别注意**：云对象内置 API 无法通过重写覆盖，因此业务函数的命名需要规避云对象内置 API 的名称（如不要用 `getUserInfo` 做为函数名称，应该用 `getMyUserInfo`）

### this.getClientInfo（获取客户端信息）@get-client-info

**接口形式**

`this.getClientInfo()`

**示例：**

```js
module.exports = {
  add: function () {
    const clientInfo = this.getClientInfo();
  },
};
```

**解构赋值：**

```js
module.exports = {
  add: function () {
    let { uid } = this.getClientInfo();
  },
};
```

**返回值**

| 参数名         | 类型   | 必备 | 说明                                                                                                                      |
| -------------- | ------ | ---- | ------------------------------------------------------------------------------------------------------------------------- |
| os             | string | 是   | 客户端系统                                                                                                                |
| appId          | string | 是   | 客户端 DCloud AppId                                                                                                       |
| locale         | string | 是   | 客户端语言                                                                                                                |
| clientIP       | string | 是   | 客户端 ip                                                                                                                 |
| userAgent      | string | 是   | 客户端 ua                                                                                                                 |
| platform       | string | 是   | 客户端平台，h5，mp-weixin 等                                                                                              |
| deviceId       | string | 是   | 客户端 deviceId，目前同 getSystemInfo 内的 deviceId                                                                       |
| source         | string | 是   | 调用来源，返回值见下。新增于 HBuilderX 3.5.1                                                                              |
| uniIdToken     | string | 否   | 客户端用户 token                                                                                                          |
| uid            | string | 否   | 框架通过 token 解析出来的 uid（可信任）                                                                                   |
| filterResponse | object | 否   | 框架中间件返回值（middleware/modules 内的中间件）[查看详情](https://vkdoc.fsq.pub/client/uniCloud/middleware/filter.html) |
| originalParam  | object | 是   | 原始请求参数，特殊情况下需要                                                                                              |

getClientInfo().source，返回云函数调用来源，它的值域为：

| 取值     | 说明                                                 |
| -------- | ---------------------------------------------------- |
| client   | uni-app 客户端导入云对象调用                         |
| function | 由其他云函数或云对象调用                             |
| http     | 云对象 URL 化后通过 http 访问调用 `HBuilderX 3.5.2+` |
| timing   | 定时任务调用云对象 `HBuilderX 3.5.2+`                |
| server   | 云函数上传并运行                                     |

**注意事项**

- source 值是客户端提交的，理论上是可以被篡改的，因此不能单纯的通过 if (source == 'function') 就无条件信任所有参数，该做的判断依然要做。

**2.9.1 版本新增以下返回值**

`特别注意：以下参数在URL化访问时无法获取，故尽量不要依赖下面的参数`

| 参数名            | 说明                                                                                                                                                                                                              | 平台差异说明                                              |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| SDKVersion        | 客户端基础库版本                                                                                                                                                                                                  | 支付宝小程序和 H5 不支持                                  |
| appLanguage       | 应用设置的语言                                                                                                                                                                                                    | -                                                         |
| appName           | `manifest.json`中应用名称                                                                                                                                                                                         | -                                                         |
| appVersion        | `manifest.json` 中应用版本名称                                                                                                                                                                                    | -                                                         |
| appVersionCode    | `manifest.json` 中应用版本名号                                                                                                                                                                                    | -                                                         |
| browserName       | 浏览器名称或 App 的 webview 名称                                                                                                                                                                                  | -                                                         |
| browserVersion    | 浏览器版本、webview 版本                                                                                                                                                                                          | -                                                         |
| deviceModel       | 设备型号                                                                                                                                                                                                          | h5 平台中部分设备可能会无法获取                           |
| deviceOrientation | 设备方向                                                                                                                                                                                                          | 竖屏 portrait、横屏 landscape                             |
| devicePixelRatio  | 设备像素比                                                                                                                                                                                                        | -                                                         |
| deviceType        | 设备类型。如 phone、pad、pc、unknow                                                                                                                                                                               | -                                                         |
| hostLanguage      | 宿主语言                                                                                                                                                                                                          | app：仅 UniMPSDK 支持，h5：不支持，小程序：小程序宿主语言 |
| hostName          | 宿主主题 light、dark。app 平台中仅 UniMPSDK 支持，h5 不支持，小程序：light、dark。前提是微信小程序全局配置"darkmode":true 时才能获取                                                                              | -                                                         |
| hostVersion       | 宿主版本。如：微信版本号                                                                                                                                                                                          | app：仅 UniMPSDK 支持，h5：不支持，小程序：小程序宿主版本 |
| osName            | 系统名称，如 ios、android、windows、macos、linux                                                                                                                                                                  | -                                                         |
| osVersion         | 操作系统版本。如 ios 版本，andriod 版本                                                                                                                                                                           | -                                                         |
| safeArea          | 在竖屏正方向下的安全区域。由于此属性理解和使用比较困难，更推荐使用 safeAreaInsets 属性 [详见](https://uniapp.dcloud.net.cn/api/system/info.html#safearea)                                                         | -                                                         |
| safeAreaInsets    | 在竖屏正方向下的安全区域插入位置。与小程序定义的 safeArea 用途相同，但是规范参考 iOS 平台的 safeAreaInsets (opens new window)更利于理解和使用。[详见](https://uniapp.dcloud.net.cn/api/system/info.html#safearea) | -                                                         |
| ua                | userAgent 标识，小程序：不支持                                                                                                                                                                                    | -                                                         |
| uniCompileVersion | uni 编译器版本号[详见](https://uniapp.dcloud.net.cn/api/system/info.html#uniplatform)                                                                                                                             | -                                                         |
| uniPlatform       | uni-app 运行平台，与条件编译平台相同。[详见](https://uniapp.dcloud.net.cn/api/system/info.html#uniplatform)                                                                                                       | -                                                         |
| uniRuntimeVersion | uni 运行时版本                                                                                                                                                                                                    | -                                                         |
| screenHeight      | 屏幕高度                                                                                                                                                                                                          | -                                                         |
| screenWidth       | 屏幕宽度                                                                                                                                                                                                          | -                                                         |
| statusBarHeight   | 手机状态栏的高度                                                                                                                                                                                                  | -                                                         |
| windowBottom      | 可使用窗口的底部位置                                                                                                                                                                                              | -                                                         |
| windowHeight      | 可使用窗口高度                                                                                                                                                                                                    | -                                                         |
| windowTop         | 可使用窗口的顶部位置                                                                                                                                                                                              | -                                                         |
| windowWidth       | 可使用窗口宽度                                                                                                                                                                                                    | -                                                         |

### this.getCustomClientInfo（获取自定义客户端信息）@get-custom-client-info

> vk-unicloud 版本 ≥ 2.19.4

需要先在前端调用 [vk.setCustomClientInfo](https://vkdoc.fsq.pub/client/pages/updateRequestGlobalParam.html#set-custom-client-info) 设置自定义客户端信息，才能在云对象内获取到数据

**接口形式**

`this.getCustomClientInfo()`

**示例**

```js
module.exports = {
  add: function () {
    const customClientInfo = this.getCustomClientInfo();
  },
};
```

### this.getUserInfo（获取当前登录用户信息）@getUserInfo

**接口形式**

`await this.getUserInfo()`

**_注意：此接口需要加 await_**

**示例：**

```js
module.exports = {
  add: function() {
    let userInfo = await this.getUserInfo(); // 获取当前登录的用户信息
  }
}
```

**返回值**

返回的 `userInfo` 为当前登录用户在数据库表 `uni-id-users` 中的除 password 和 token 之外的全部字段数据

**特殊注意：**

`await this.getUserInfo()` 有缓存，在同一次请求中，多次调用 `await this.getUserInfo()` ，只执行一次数据库查询

这么做是为了防止在同一次请求中重复查询（加快响应速度）如果你在本次请求中修改了用户信息同时想获取修改后的用户信息，你应该执行

```js
let { uid } = this.getClientInfo();
// 根据id查询最新用户信息
let newUserInfo = await vk.daoCenter.userDao.findById(uid);
```

或

```js
let { uid } = this.getClientInfo();
// 修改的同时返回修改后的结果
let newUserInfo = await vk.baseDao.updateAndReturn({
  dbName: 'uni-id-users',
  whereJson: {
    _id: uid,
  },
  dataJson: {
    nickname: '修改后的昵称',
  },
});
```

### this.getCloudInfo（获取云端信息）@getCloudInfo

**接口形式**

`this.getCloudInfo()`

**示例**

```js
module.exports = {
  add: function () {
    const cloudInfo = this.getCloudInfo();
  },
};
```

**返回值**

| 参数名       | 类型   | 必备 | 说明                                                                       |
| ------------ | ------ | ---- | -------------------------------------------------------------------------- |
| provider     | string | 是   | 服务空间供应商                                                             |
| spaceId      | string | 是   | 服务空间 Id                                                                |
| functionName | string | 是   | 云对象名称，新增于`HBuilderX 3.5.1`                                        |
| functionType | string | 是   | 云对象此值固定为`cloudobject`，新增于`HBuilderX 3.5.1`                     |
| runtimeEnv   | string | 是   | 运行环境，取值为 local(本地运行)或 cloud(云端运行)，新增于`HBuilderX 4.25` |

### this.getUniIdToken（获取客户端 token）@getUniIdToken

**接口形式**

`this.getUniIdToken()`

**示例**

```js
module.exports = {
  add: function () {
    const token = this.getUniIdToken();
  },
};
```

### this.getMethodName（获取当前调用的方法名）@getMethodName

本方法主要用于在 `_before` 等拦截器方法里，判断客户端上传的信息进行处理，比如发现客户端调用的是 a 方法时，执行一段特殊逻辑。详见下文

**接口形式**

`this.getMethodName()`

**示例**

```js
module.exports = {
  _before: function () {
    // _before的用法请看后续章节
    const methodName = this.getMethodName(); // add
  },
};
```

### this.getParams（获取当前参数列表）@getParams

在云对象的普通方法里，参数可以直接获取。本方法主要用于在 `_before` 等拦截器方法里，判断客户端上传的信息进行处理。详见下文

**接口形式**

`this.getParams()`

**示例**

```js
module.exports = {
  _before: function () {
    // _before的用法请看后续章节
    let { a, b, c } = this.getParams();
  },
};
```

### this.getUniCloudRequestId（获取当前请求 id）@getUniCloudRequestId

**接口形式**

`this.getUniCloudRequestId()`

注意：HBX 版本大于 3.5.5 后，更新框架到最新版，当请求错误时，返回数据会自动带上 requestId，无需你自己写过滤器

**示例**

```js
module.exports = {
  _after: function (error, result) {
    if (error) {
      const requestId = this.getUniCloudRequestId();
    }
  },
};
```

### this.getHttpInfo（获取 url 化时的 http 信息）@getHttpInfo

仅可在云对象 url 化时使用，如何使用云对象的 url 化请参考：[云对象 url 化](https://vkdoc.fsq.pub/client/question/q2.html)

**接口形式**

`this.getHttpInfo()`

**示例**

```js
module.exports = {
  _before: function () {
    // _before的用法请看后续章节
    const httpInfo = this.getHttpInfo(); // 返回值和云函数url化时的event一致
  },
};
```

### this.getUtil（获取 util 工具包）@getUtil

**接口形式**

`this.getUtil()`

**示例**

```js
module.exports = {
  add: function () {
    let { customUtil, uniID, config, pubFun } = this.getUtil(); // 获取工具包
  },
};
```

**返回值**

| 参数名     | 类型   | 必备 | 说明                             |
| ---------- | ------ | ---- | -------------------------------- |
| customUtil | object | 是   | 自定义工具包                     |
| uniID      | object | 是   | uni-id 实例                      |
| config     | object | 是   | 全局配置信息                     |
| pubFun     | object | 是   | 自定义公共函数                   |
| db         | object | 是   | 数据库实例 = uniCloud.database() |
| \_         | object | 是   | 数据库操作符 = db.command        |
| $          | object | 是   | 聚合查询操作符 = \_.aggregate    |

## 预处理与后处理@intercept

### \_before（预处理）@intercept-before

云对象内可以创建一个特殊的方法\_before，用来在调用常规方法之前进行预处理，一般用于拦截器、统一的身份验证、参数校验等。

以下示例的逻辑是，当客户端调用 shop 云对象非 pub\_的方法时，校验当前登录用户是否有权限操作此店铺，校验失败则直接报错返回客户端，校验通过继续执行 update 方法。

如果需要从\_before 传递数据到后续执行的方法里，可以在\_before 中写 `this.aaa = xxx`，然后在你自己的方法里通过 `this.aaa` 即可获取到（注意不要和方法名重复即可，最好加个前缀
）。

```js
module.exports = {
  _before: function(){
    let methodName = this.getMethodName(); // 获取当前执行的函数名称
    if(methodName.indexOf("pub_") !== 0) {
      let { shop_id } = this.getParams(); // 获取前端传过来的参数
      let userInfo = await this.getUserInfo(); // 获取当前登录的用户信息
      let { shop_ids = [] } = userInfo;
      if (vk.pubfn.isNull(shop_id)) {
        return { code : -1, msg : `店铺id不能为空` };
      }
      if (shop_ids.indexOf(shop_id) === -1) {
        return { code : -1, msg : `无权限操作店铺【${shop_id}】` };
      }
    }
  },
  update: function(data) {
    return {
      errCode: 0,
      errMsg: '修改成功'
    }
  }
}
```

**注意**

判断用户是否登录框架已经内置，无需再写代码判断用户是否登录。[查看内置权限](#内置权限)

### \_after（后处理）@intercept-after

与预处理 `_before` 对应的是后处理 `_after`。云对象内可以创建一个特殊的方法 `_after` 用来再加工处理本次调用方法的返回结果或者抛出的错误

请看以下示例：

```js
module.exports = {
  _before: function () {
    this.startTime = Date.now(); // 在before内记录开始时间并在this上挂载，以供后续流程使用
  },
  _after(error, result) {
    if (error) {
      throw error; // 如果方法抛出错误，也直接抛出不处理
    }
    result.timeCost = Date.now() - this.startTime;
    return result;
  },
  add: function (data) {
    return {
      errCode: 0,
      errMsg: '创建成功',
    };
  },
};
```

## 内置权限@permissions

云对象已内置以下权限类型。

### pub（无需登录即可访问的函数）@permissions-pub

**满足以下任意一条规则，即为 `pub` 类型函数**

- 1、云对象内的函数名称以 `pub_` 开头，如：`pub_getList`（权重 3）
- 2、云对象以 `pub.js` 命名 或以 `pub.xxx.js` 命名（xxx 可以是任意字符串，如：`pub.user.js`）（权重 2）
- 3、云对象写在 `pub` 目录下，如：`pub/user.js`（权重 1）

### kh（需要登录才能访问的函数）@permissions-kh

**满足以下任意一条规则，即为 `kh` 类型函数**

- 1、默认云对象内的函数均需要登录才能访问 如：`getList` `getInfo` 等（权重 0）
- 2、云对象内的函数名称以 `kh_` 开头，如：`kh_getList`（权重 3）
- 3、云对象以 `kh.js` 命名 或以 `kh.xxx.js` 命名（xxx 可以是任意字符串，如 `kh.user.js`）（权重 2）
- 4、云对象写在 `kh` 目录下，如：`kh/user.js`（权重 1）

### sys（需要角色授权才能访问的函数）@permissions-sys

**满足以下任意一条规则，即为 `sys` 类型函数**

- 1、云对象内的函数名称以 `sys_` 开头，如：`sys_getList`（权重 3）
- 2、云对象以 `sys.js` 命名 或以 `sys.xxx.js` 命名（xxx 可以是任意字符串，如：`sys.user.js`）（权重 2）
- 3、云对象写在 `sys` 目录下，如：`sys/user.js`（权重 1）

sys 类型的函数通常用于 admin 端，如商城系统角色分为

- 管理员：可以进行所有操作。
- 财务：只能执行财务相关的操作，如：查看报表、提现等。
- 仓储：只能执行订单相关的操作，如：订单查看、发货等。
- 客服：只能执行客户、订单相关的查询操作，如：查看客户信息，查看订单信息。
- 老板：可以查看所有数据，但不可以修改和删除。如：查看报表、查看商城统计数据等。

**框架会通过用户拥有的角色权限，自动判断拦截请求。**

**拦截原理：通过 admin 端权限管理（设置某权限可以执行哪些云函数）、角色管理（角色赋予权限）、用户管理（用户赋予角色）完成。**

### \_（禁止访问，私有函数类型）@permissions-private

**满足以下任意一条规则，即为 `私有` 类型函数**

- 1、云对象内的函数名称以 `_` 开头则禁止前端访问 如：`_before` `_after` `_aaa`（权重 99）

### 特殊（同时满足多个类型时）@permissions-special

当云对象内某一个函数同时满足 `kh` 和 `pub` 类型时，通过权重值来决定属于哪一种类型。

如：

- 1、云对象名为 `pub.js`（满足 pub 权重 2） 函数名为 `kh_getList`（满足 kh 权重 3），则属于 `kh` 类型函数（取权重大的一方）。

- 2、云对象名为 `user.js`（满足 kh 权重 0） 函数名为 `pub_getList`（满足 pub 权重 3），则属于 `pub` 类型函数（取权重大的一方）。

## 快速上手 - 如何使用云对象？@tutorial

### 如何编写云对象？@tutorial-1

以创建 client 端 用户业务为例。

**手动版**

- 1、在 `router/service/client/` 目录新建 `user.js` 文件
- 2、复制 [云对象模板代码](#云对象模板代码) 覆盖 `user.js` 文件内容
- 3、完成

**自动版**

**自动版需要下载 [VK 框架快速开发辅助工具](https://ext.dcloud.net.cn/plugin?id=6663)**

- 1、在 `router/service/client/` 目录右键，依次点击 VK - 新建云对象
- 2、输入云对象名称 `user`，并点击确定
- 3、完成

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/613e4fb9-c562-46b4-8426-411797d218a6.png)

### 云对象模板代码@tutorial-2

以下是一个完整的云对象代码，里面包含了 `getInfo` 、 `getList` 两个函数，以及 两个内置函数 `_before` 和 `_after`

```js
'use strict';
let vk = uniCloud.vk; // 全局vk实例
// 涉及的表名
const dbName = {
  //test: "vk-test", // 测试表
};

const db = uniCloud.database(); // 全局数据库引用
const _ = db.command; // 数据库操作符
const $ = _.aggregate; // 聚合查询操作符
/**
 * 权限注意：访问以下链接查看
 * 文档地址：https://vkdoc.fsq.pub/client/uniCloud/cloudfunctions/cloudObject.html#内置权限
 */
const cloudObject = {
  isCloudObject: true, // 标记为云对象模式
  /**
   * 请求前处理，主要用于调用方法之前进行预处理，一般用于拦截器、统一的身份验证、参数校验、定义全局对象等。
   * 文档地址：https://vkdoc.fsq.pub/client/uniCloud/cloudfunctions/cloudObject.html#before-预处理
   */
  _before: async function () {
    vk = uniCloud.vk; // 将vk定义为全局对象
    // let { customUtil, uniID, config, pubFun } = this.getUtil(); // 获取工具包
  },
  /**
   * 请求后处理，主要用于处理本次调用方法的返回结果或者抛出的错误
   * 文档地址：https://vkdoc.fsq.pub/client/uniCloud/cloudfunctions/cloudObject.html#after-后处理
   */
  _after: async function (options) {
    let { err, res } = options;
    if (err) {
      if (err instanceof Error) {
        return; // 如果是Error类型，直接return;不处理
      }
      return err;
    }
    return res;
  },
  /**
   * 获取列表
   * @url XXXpathXXX.getList 前端调用的url参数地址
   */
  getList: async function (data) {
    let res = { code: 0, msg: '' };
    let { uid } = this.getClientInfo(); // 获取客户端信息
    // 业务逻辑开始-----------------------------------------------------------

    // 业务逻辑结束-----------------------------------------------------------
    return res;
  },
  /**
   * 模板函数
   * @url XXXpathXXX.test 前端调用的url参数地址
   */
  test: async function (data) {
    let res = { code: 0, msg: '' };
    let { uid } = this.getClientInfo(); // 获取客户端信息
    // 业务逻辑开始-----------------------------------------------------------

    // 业务逻辑结束-----------------------------------------------------------
    return res;
  },
};

module.exports = cloudObject;
```

### 前端如何调用云对象？@tutorial-3

调用云对象有两种方式。

**_注意： vk = this.vk 或 vk = uni.vk_**

#### 方式一：使用 vk.callFunction

**回调形式**

```js
// 回调形式 success fail complete
vk.callFunction({
  url: '云对象函数路径',
  title: '请求中...',
  data: {
    // 请求参数
    a: 1,
    b: '2',
  },
  success: (data) => {
    // 成功后的逻辑
  },
});
```

**promise 形式**

```js
// promise方式
vk.callFunction({
  url: '云对象函数路径',
  title: '请求中...',
  data: {
    // 请求参数
    a: 1,
    b: '2',
  },
})
  .then((data) => {
    // 成功后的逻辑
  })
  .catch((err) => {});
```

**async/await 形式**

此方式只能在声明了 async 的函数中运行。

```js
// async/await方式
let data = await vk.callFunction({
  url: '云对象函数路径',
  title: '请求中...',
  data: {
    // 请求参数
    a: 1,
    b: '2',
  },
});
```

**云对象函数路径 url 获取方式**

云对象函数路径 url = service 内的目录名+对象名+函数名

如：`client/user.getInfo` 代表调用 client 目录下的 user 对象内的 getInfo 函数。

#### 方式二：使用 uni.vk.importObject

方式二分两步

第一步：导入云对象。

```js
const userObject = uni.vk.importObject('client/user'); // 这段代码可以写在外层顶部，也可以直接写在对应函数内部。
```

**特别注意：目前 vue3 的 app 模式下，不可直接写在页面生命周期外，如果非要写在生命周期外（外层顶部）则需要这样写**

```js
var userObject;
setTimeout(() => {
  userObject = uni.vk.importObject('client/user'); // 导入云对象
}, 10);
```

因为目前 vue3 的 app 模式下，页面生命周期外的 js 代码执行顺序比 `main.js` 先执行，所以需要手动延迟执行。

第二步：调用云对象内的函数。

**回调形式**

```js
// 回调形式 success fail complete
userObject.getInfo({
  title: '请求中...',
  data: {
    // 请求参数
    a: 1,
    b: '2',
  },
  success: (data) => {
    // 成功后的逻辑
  },
});
```

**promise 形式**

```js
// promise方式
userObject
  .getInfo({
    title: '请求中...',
    data: {
      // 请求参数
      a: 1,
      b: '2',
    },
  })
  .then((data) => {
    // 成功后的逻辑
  })
  .catch((err) => {});
```

**async/await 形式**

此方式只能在声明了 async 的函数中运行。

```js
// async/await方式
let data = await userObject.getInfo({
  title: '请求中...',
  data: {
    // 请求参数
    a: 1,
    b: '2',
  },
});
```

##### uni.vk.importObject 的高级用法

**执行 router2 内的云对象**

```js
const pubObject = uni.vk.importObject('client/user', {
  name: 'router2',
});

let res = await pubObject.getList({
  title: '请求中',
  data: {
    a: 1,
    b: '2',
  },
});
```

**设置默认 title**

```js
const pubObject = uni.vk.importObject('client/user', {
  title: '请求中',
});

let res = await pubObject.getList({
  data: {
    a: 1,
    b: '2',
  },
});
```

**设置默认请求参数**

```js
const pubObject = uni.vk.importObject('client/user', {
  data: {
    a: 0,
    c: 2,
  },
});

let res = await pubObject.getList({
  data: {
    a: 1,
    b: '2',
  },
});

// 此时最终发送的请求参数是 { a: 1, b: "2", c: 2 }
```

**开启简易传参模式**

```js
const pubObject = uni.vk.importObject('client/pub.test', {
  title: '请求中',
  easy: true, // 开启简易传参模式
});

// 设置easy为true后，请求参数省略data
let res = await pubObject.getList({
  a: 1,
  b: '2',
});
```

**开启加密通信**

```js
const pubObject = uni.vk.importObject('client/user', {
  encrypt: true, // 开启加密通信
});

let res = await pubObject.getList({
  data: {
    a: 1,
    b: '2',
  },
});
```

## 本地运行@run-locally

**VK 框架下的云对象是支持本地运行的**

本地运行方式跟云函数一致

**具体操作步骤：**

**手动版**

- 1、右键 router 目录，点击 【配置运行测试参数】，会在 router 根目录生成一个 `router.param.json` 文件
- 2、复制下方代码到 `router.param.json` 文件内覆盖原本内容

```json
{
  "uni_id_token": "",
  "$url": "client/user.getInfo",
  "data": {
    "a": 1,
    "b": "2"
  }
}
```

- 3、右键 router 目录，点击【运行-本地云函数】（也可以按快捷键 ctrl + r，再按回车）

**自动版**

**自动版需要下载 [VK 框架快速开发辅助工具](https://ext.dcloud.net.cn/plugin?id=6663)**

- 1、先选中云对象内的某个函数名，再右键依次点击 VK-本地运行云函数（此时页面会跳到 `router.param.json` 文件内且自动修改$url 的值）
- 2、再右键 router 目录，点击【运行-本地云函数】（也可以按快捷键 ctrl + r，再按回车）

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/e647fdbb-dedb-433e-b5c9-1f15b9349a1c.png)

## 云对象 URL 化@url

与云函数基本一致

[点击查看](https://vkdoc.fsq.pub/client/question/q2.html)

## 云对象 URL 化之 URL 重写@urlrewrite

云对象的 URL 会带. 如：`https://www.aaa.com/http/router/client/user.getInfo`

如果你的 URL 尾部不想要带. 则可以使用 `URL重写` 来达到效果。

`https://www.aaa.com/http/router/client/user.getInfo` 重写为 `https://www.aaa.com/http/router/client/user/getInfo`

重写规则为：

```js
module.exports = {
  rule: {
    '^client/user/(.+)': 'client/user.$1',
  },
  config: {
    // 当设置为true时，只有符合url重写规则内的云函数才可以被url化访问。
    accessOnlyInRule: false,
  },
};
```

`https://www.aaa.com/http/router/client/pub.user.getInfo` 重写为 `https://www.aaa.com/http/router/client/user/getInfo`

重写规则为：

```js
module.exports = {
  rule: {
    '^client/user/(.+)': 'client/pub.user.$1',
  },
  config: {
    // 当设置为true时，只有符合url重写规则内的云函数才可以被url化访问。
    accessOnlyInRule: false,
  },
};
```

[点击查看详细说明](https://vkdoc.fsq.pub/client/question/q2.html)

## 访问 HTTP 服务@http

与云函数一致

[点击查看](https://vkdoc.fsq.pub/client/uniCloud/cloudfunctions/http.html)

## 定时器@triggers

与云函数一致，定时器是需要额外创建传统云函数的。

[点击查看](https://vkdoc.fsq.pub/client/uniCloud/cloudfunctions/timer.html)

## 使用 crypto 进行加密解密@crypto

与云函数一致，crypto 是 Nodejs 的内置模块，提供了加密功能，包括对 OpenSSL 的哈希、HMAC、加密、解密、签名、以及验证功能的一整套封装。

[点击查看](https://vkdoc.fsq.pub/client/uniCloud/cloudfunctions/crypto.html)

## 云对象操作常见问题@q

### 同一个云对象内 A 函数调用 B 函数@q1

在同一个云对象内，可以通过 `await this.xxx()` 来调用其他函数，xxx 为函数名。

### A 云对象内的函数调用 B 云对象的函数@q2

**不建议**

每个云对象之间业务逻辑隔离，建议不要有 A 云对象调用 B 云对象的想法，不然业务逻辑耦合度太高，不容易维护。

**为什么要低耦合？**

【高内聚，低耦合】是当代软件设计的规范。

道理很简单，耦合度很高的情况下，维护代码时修改一个地方会牵连到很多地方，如果修改时没有理清这些耦合关系，那么带来的后果可能会是灾难性的。
特别是对于需求变化较多以及多人协作开发维护的项目，修改一个地方会引起本来已经运行稳定的模块错误，严重时会导致恶性循环，问题永远改不完。

**注意**

如果涉及到自定义的全局公共函数，可以写在 `router/util/pubFunction.js` 文件中，在云对象中通过以下方式调用

```js
let { pubFun } = this.getUtil();
let xxxRes = await pubFun.xxx();
```

**我就要互相调用，应该怎么写？**

#### 方式一（推荐）

> vk-unicloud 版本需>=2.9.0

**注意：方式一只支持符合 VK 框架路由规则的云函数或云对象**

```js
// 云对象内调用其他云函数或云对象内的函数，在同一个router大函数下，name参数可不传
let callRes = await vk.callFunction({
  name: 'router',
  url: 'client/user.test',
  clientInfo: this.getClientInfo(),
  data: {
    a: 1,
  },
});
console.log(callRes);
```

#### 方式二（通用）

```js
let callFunctionRes = await uniCloud.callFunction({
  name: 'router',
  data: {
    $url: 'client/user.test',
    data: {
      a: 1,
      b: 2,
    },
  },
});
console.log(callFunctionRes.result);
```

### 云对象内函数比较多，如何快速查看函数列表

在 `HBuilderX` 内按 `Alt + w` 即可显示云对象结构，展开 `cloudObject` 对象即可看到所有函数名列表
