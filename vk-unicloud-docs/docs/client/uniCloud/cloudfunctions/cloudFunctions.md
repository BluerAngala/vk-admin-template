---
sidebarDepth: 0
---

# 云函数

## 云函数是什么？

云函数是运行在云端的 JavaScript 代码，是基于 Node.js 的扩展，本质上 Ta 就是一个 Node.js 的后端服务。

## 云函数模板

### 简易模板

```js
'use strict';
module.exports = {
  /**
   * 此函数名称
   * @url user/pub/test1 前端调用的url参数地址
   * data 请求参数
   * @param {String} params1  参数1
   */
  main: async (event) => {
    let { data = {}, userInfo, util, filterResponse, originalParam } = event;
    let { customUtil, config, pubFun, vk, db, _, $ } = util;
    let { uid } = data;
    let res = { code: 0, msg: '' };
    // 业务逻辑开始-----------------------------------------------------------
    // 可写与数据库的交互逻辑等等

    // 业务逻辑结束-----------------------------------------------------------
    return res;
  },
};
```

### 完整模板

```js
'use strict';
module.exports = {
  /**
   * 此函数名称
   * @url user/pub/test1 前端调用的url参数地址
   * @description 此函数描述
   * @param {Object} data 请求参数
   * @param {String} uniIdToken 用户token
   * @param {String} userInfo 当前登录用户信息（可信任，仅kh目录下的函数有此值）
   * pub目录下请求参数需要带上 need_user_info = true
   * @param {Object} util 公共工具包
   * @param {Object} filterResponse 过滤器返回的数据
   * @param {Object} originalParam 原始请求参数（包含了原始event和context）
   * data 请求参数 说明
   * @param {String} uid 当前登录用户id（可信任，仅kh目录下的函数有此值）
   * res 返回参数说明
   * @param {Number} code 错误码，0表示成功
   * @param {String} msg 详细信息
   */
  main: async (event) => {
    //  注意: userInfo 和 uid 是可信任的，但默认只有kh目录下的函数才有此值
    let { data = {}, userInfo, util, filterResponse, originalParam } = event;
    let { customUtil, uniID, config, pubFun, vk, db, _, $ } = util;
    let { uid } = data;
    let res = { code: 0, msg: '' };
    // 业务逻辑开始-----------------------------------------------------------
    // 可写与数据库的交互逻辑等等

    // 业务逻辑结束-----------------------------------------------------------
    return res;
  },
};
```

### 模板内参数含义

```js
let { data = {}, userInfo, util, filterResponse, originalParam } = event;
let { customUtil, uniID, config, pubFun, vk, db, _ } = util;
let { uid } = data;
```

#### 常用

| 参数     | 说明                                                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| data     | 前端传过来的请求参数                                                                                                                 |
| userInfo | 当前登录用户的用户信息（kh 目录下的云函数才有，pub 目录下需要多传一个参数`need_user_info:true`） [点击查看示例](#need-user-info示例) |
| uid      | 当前登录用户的用户的 id（kh 目录下的云函数才有，pub 目录下需要多传一个参数`need_user_info:true`）[点击查看示例](#need-user-info示例) |
| vk       | vk 实例对象                                                                                                                          |
| pubFun   | 你自己的公共函数（函数文件在 `router/util/pubFunction.js`）                                                                          |
| db       | 数据库对象                                                                                                                           |
| \_       | 等价于 db.command                                                                                                                    |

##### need_user_info 示例

**正确示例**

```js
vk.callFunction({
  url: 'template/db_api/pub/add',
  title: '请求中...',
  data: {
    need_user_info: true, // 注意，need_user_info是加在 data 的属性里，而不是与data同级
  },
  success: (data) => {},
});
```

**错误示例**

```js
vk.callFunction({
  url: 'template/db_api/pub/add',
  title: '请求中...',
  need_user_info: true, // 注意，此为错误示例，写在这里是无效的
  success: (data) => {},
});
```

#### 特殊

| 参数           | 说明                                                                       |
| -------------- | -------------------------------------------------------------------------- |
| config         | 全局配置                                                                   |
| util           | 框架内置的工具函数包（公共函数）                                           |
| filterResponse | 过滤器返回的数据                                                           |
| originalParam  | 原始请求数据（IP 地址这些就是从这里获取 `originalParam.context.CLIENTIP`） |
| customUtil     | 你自己的工具包（公共函数）                                                 |
| uniID          | uni-id 实例对象                                                            |

#### originalParam.context 介绍

```js
//originalParam.context中可获取客户端调用的上下文
let os = originalParam.context.OS; //客户端操作系统，返回值：android、ios    等
let platform = originalParam.context.PLATFORM; //运行平台，返回值为 mp-weixin、app-plus等
let appid = originalParam.context.APPID; // manifest.json中配置的appid
let clientIP = originalParam.context.CLIENTIP; // 客户端ip信息
let clientUA = originalParam.context.CLIENTUA; // 客户端user-agent
let deviceId = originalParam.context.DEVICEID; // 客户端标识，新增于HBuilderX 3.1.0，同uni-app客户端getSystemInfo接口获取的deviceId
let spaceInfo = originalParam.context.SPACEINFO; // 当前环境信息 {spaceId:'xxx',provider:'tencent'}
```

## 自动获取 userInfo

首先需要先介绍下两个框架内置的过滤器

- `kh` 过滤器 ： `kh` 目录下的云函数需要检测用户是否已登录。
- `pub`过滤器 ： `pub`目录下的云函数所有人都可以直接访问。
- `kh`目录下的函数默认会自动获取 `userInfo`（当前登录用户信息）

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/e7bdb9e0-8b64-46d3-8e93-8b0978ac4f34.png '屏幕截图.png')

**_如果此云函数不需要用户信息，可以在前端多传一个参数`need_user_info:false` 可以减少一次数据库查询（加快响应速度）(快 100ms 左右)_**

此时 依然会检测 token 是否有效，故 `uid` （当前登录用户 ID）仍然可以获取到（因为 uid 是从 token 中解密获取，而非查数据库）

```js
vk.callFunction({
  url: 'client/user/kh/findMyOrderList',
  data: {
    need_user_info: false, // 如果云函数用不到 `userInfo`，则传false可以加快接口相应速度
    // 以下是你自己的参数
    a: 1,
    b: 2,
  },
  success: (data) => {},
});
```

`pub`目录下的云函数默认不会获取 `userInfo`（当前登录用户信息），且不会获取 `uid`（因为 pub 不解析 token）

**_如果`pub`目录下的云函数想要获取 `userInfo`，则可以在前端多传一个参数`need_user_info:true`_**

此处如果用户 token 有效，就可以获取到 `userInfo`，若 token 无效，则取不到`userInfo`

```js
vk.callFunction({
  url: 'client/user/pub/findGoodsInfo',
  data: {
    need_user_info: true, // 如果pub下的云函数需要用到 `userInfo`，则传true,
    // 以下是你自己的参数
    a: 1,
    b: 2,
  },
  success: (data) => {},
});
```

## 获取云函数原始请求参数

`originalParam` 为原始请求参数

```js
'use strict';
module.exports = {
  /**
   * 此函数名称
   * @url user/pub/test1 前端调用的url参数地址
   */
  main: async (event) => {
    let { originalParam } = event;
    let res = { code: 0, msg: '' };

    return res;
  },
};
```

`originalParam` 参数详情

```json
{
  "event": {
    // 路由内部云函数路径
    "$url": "template/test/pub/test",
    // 请求参数
    "data": { "a": "1" },
    // 请求token
    "uni_id_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIxNDEzOWUxMjYxMjg1ZWVkMDczZjI5ZDEyYTIxNTMzOSIsInJvbGUiOlsic3RhZmZfaW5zaWRlX3RvX3Nob3BfMSIsInRvdGFsX3BlcmZvcm1hbmNlXzEiXSwicGVybWlzc2lvbiI6W10sImlhdCI6MTYzMDg5Nzc1NiwiZXhwIjoxNjMxNTAyNTU2fQ.ZoUGu6nVfL2ZKpD_t1WVgPjZfnXU51rOISERiHlEB3I"
  },
  "context": {
    // 当前云函数被何种方式调用
    // client   客户端callFunction方式调用
    // http     云函数url化方式调用
    // timing   定时触发器调用
    // server   由管理端调用，HBuilderX里上传并运行，仅阿里云支持，腾讯云这种方式调用也是client
    // function 由其他云函数callFunction调用，仅阿里云支持，腾讯云这种方式调用也是client
    "SOURCE": "client",
    // 运行环境
    // local    本地运行
    // cloud    云端运行
    "RUNTIME_ENV": "local",
    // IP
    "CLIENTIP": "127.0.0.1",
    // UA
    "CLIENTUA": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1",
    // 空间信息
    "SPACEINFO": {
      "spaceId": "87c16e8a-f811-412b-222c-375b62c859d35",
      "provider": "aliyun"
    },
    // 以下四个属性只有使用uni-app以callFunction方式调用才能获取
    "PLATFORM": "h5", // 运行平台，返回值为 mp-weixin、app-plus等
    "OS": "ios", //客户端操作系统，返回值：android、ios    等
    "APPID": "__UNI__721340", // manifest.json中配置的appid
    "DEVICEID": "16310672816989449766" // 客户端标识，新增于HBuilderX 3.1.0，同uni-app客户端getSystemInfo接口获取的deviceId
  }
}
```

## 获取 url 化后的云函数原始请求参数

`originalParam` 为原始请求参数

```js
'use strict';
module.exports = {
  /**
   * 此函数名称
   * @url user/pub/test1 前端调用的url参数地址
   */
  main: async (event) => {
    let { originalParam } = event;
    let res = { code: 0, msg: '' };

    return res;
  },
};
```

`originalParam` 参数详情

```json
{
  "event": {
    // 请求参数
    "body": "\r\n{\r\n\t\"uni_id_token\":\"\",\r\n\t\"$url\":\"template/test/pub/test\",\r\n\t\"data\":{\r\n\t   \r\n\t}\r\n\r\n}",
    // 请求头
    "headers": {
      "accept": "*/*",
      "accept-encoding": "gzip, deflate, br",
      "connection": "keep-alive",
      "content-length": "85",
      "content-type": "application/json",
      "host": "https://ea2dc91d-ddd2-44b0-8350-1a18e4d0d142.bspapp.com",
      "postman-token": "808f27da-f56d-43e1-a7b9-af00d9ef2123",
      "user-agent": "PostmanRuntime/7.26.8",
      "x-client-proto": "https",
      "x-client-proto-ver": "HTTP/1.1",
      "x-daa-tunnel": "hop_count=1",
      "x-forwarded-for": "125.110.181.153, 180.153.100.151",
      "x-forwarded-proto": "https",
      "x-nws-log-uuid": "d709692d-67f2-4492-be64-f5ccbbe1225a",
      "x-real-ip": "181.152.101.121",
      "x-stgw-time": "1632034119.033",
      "x-tencent-ua": "Qcloud"
    },
    // 请求模式 GET POST
    "httpMethod": "GET",
    // 是否被base64编码
    "isBase64Encoded": false,
    // 请求路径
    "path": "/",
    // url?后面的参数
    "queryStringParameters": {},
    "multiValueHeaders": {
      "accept": ["*/*"],
      "accept-encoding": ["gzip, deflate, br"],
      "connection": ["keep-alive"],
      "content-length": ["85"],
      "content-type": ["application/json"],
      "host": ["https://ea2dc91d-ddd2-44b0-8350-1a18e4d0d142.bspapp.com"],
      "postman-token": ["808f27da-f56d-43e1-a7b9-cf00d9ef2416"],
      "user-agent": ["PostmanRuntime/7.26.8"],
      "x-client-proto": ["https"],
      "x-client-proto-ver": ["HTTP/1.1"],
      "x-daa-tunnel": ["hop_count=1"],
      "x-forwarded-for": ["125.110.181.153, 180.153.100.151"],
      "x-forwarded-proto": ["https"],
      "x-nws-log-uuid": ["ea2dc91d-ddd2-44b0-8350-1a18e4d0d142"],
      "x-real-ip": ["180.153.100.151"],
      "x-stgw-time": ["1632034119.033"],
      "x-tencent-ua": ["Qcloud"]
    },
    "requestContext": {
      "appId": "1213450789",
      "envId": "vk-test-001",
      "requestId": "d97bbbbdcd61169690e96aecb0ccac3e",
      "uin": "100234245603"
    }
  },
  "context": {
    "callbackWaitsForEmptyEventLoop": true,
    "memory_limit_in_mb": 256,
    "time_limit_in_ms": 60000,
    "request_id": "9ec799ae-1915-11ec-9504-da7fa40678f4",
    "function_version": "$LATEST",
    "function_name": "router",
    "namespace": "vk-test-001",
    "tencentcloud_region": "ap-shanghai",
    "tencentcloud_appid": "12134807805",
    "tencentcloud_uin": "100234245603",
    "SOURCE": "http",
    "CLIENTIP": "180.153.100.151",
    "CLIENTUA": "PostmanRuntime/7.26.8",
    "SPACEINFO": {
      "spaceId": "vk-test-001",
      "provider": "tencent"
    },
    "FUNCTION_NAME": "router"
  }
}
```
