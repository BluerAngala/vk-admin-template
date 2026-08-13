---
sidebarDepth: 0
---

# 抖音小程序 API

> 以下 API 需要 vk-unicloud 核心库版本 >= 2.14.1

## 配置文件@config

打开 `uniCloud/cloudfunctions/common/uni-config-center/uni-id/config.json` 文件，配置里面的

"mp-toutiao" 抖音小程序（注意，抖音的是 mp-toutiao，而不是 mp-douyin）

```js
"mp-toutiao": {
  "oauth": {
    "toutiao": {
      "appid": "",
      "appsecret": ""
    }
  }
},
```

[传送门 - 抖音官方文档](https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/server/interface-request-credential/get-access-token)

配置完需要上传 `uni-config-center` 这个公共模块才会生效

## 授权相关 API@auth

### 获取 token@getAccessToken

`vk.openapi.douyin.auth.getAccessToken`

```js
/**
 * 获取小程序全局唯一后台接口调用凭据（access_token）。调用绝大多数后台接口时都需使用 access_token，接口会自动缓存token，无需再手动保存token
 * @param {Boolean} cache 默认true 如果为false，代表不从缓存中读取token，一般不传此参数
 */
let access_token = await vk.openapi.douyin.auth.getAccessToken();
```

### code 换取 openid@code2Session

`vk.openapi.douyin.auth.code2Session`

```js
/**
 * 登录凭证校验。通过 douyin.login 接口获得临时登录凭证 code 后传到开发者服务器调用此接口完成登录流程。
 * @param {String} code 登录时获取的 code
 * @param {String} needKey 是否需要返回 sessionKey 或 accessToken 默认 false
 */
let code2SessionRes = await vk.openapi.douyin.auth.code2Session({
  code: code,
  needKey: false,
});
```

### 获取小程序码@getMiniCode

`vk.openapi.douyin.acode.getMiniCode`

```js
/**
 * 获取小程序码
 * @param {String} access_token   默认自动获取，不需要传
 * @param {String} path 必须是已经发布的小程序存在的页面（否则报错），例如 pages/index/index, 根路径前不要填加 / 可以携带参数 如 pages/index/index?a=1
 */
let getMiniCodeRes = await vk.openapi.douyin.acode.getMiniCode({
  path: 'pages/index/index?a=1&b=2',
});
```

**注意：getMiniCode 在执行成功后返回的是二进制，故在云函数中需要转换，完整代码如下**

```js
let getMiniCodeRes = await vk.openapi.douyin.acode.getMiniCode({
  page: 'pages/index/index',
});
if (typeof getMiniCodeRes === 'object' && getMiniCodeRes.code) {
  return getMiniCodeRes;
}
try {
  // 二进制转base64
  let base64 = Buffer.from(getMiniCodeRes, 'binary').toString('base64');
  return {
    code: 0,
    base64: `data:image/png;base64,${base64}`,
  };
} catch (err) {
  // 转base64失败
  return {
    code: -1,
    msg: '生成小程序码失败',
    err: {
      message: err.message,
      stack: err.stack,
    },
  };
}
```

## 内容安全@security

### 检测文本是否违规@security-msgSecCheck

`vk.openapi.douyin.security.msgSecCheck`

```js
/**
 * 检查一段文本是否含有违法违规内容。
 * @param {String} access_token   默认自动获取，不需要传
 * @param {String} content        要检测的文本内容（与tasks二选一）
 * @param {Array}  tasks          要检测的文本内容数组（与content二选一）
 */
let msgSecCheckRes = await vk.openapi.douyin.security.msgSecCheck({
  content: '', // 文本内容
});

// 多行文本分开检测
let msgSecCheckRes = await vk.openapi.douyin.security.msgSecCheck({
  tasks: [
    {
      content: '第一段文本',
    },
    {
      content: '第二段文本',
    },
    {
      content: '第三段文本',
    },
  ],
});
```

### 检测图片是否违规@security-imgSecCheck

`vk.openapi.douyin.security.imgSecCheck`

```js
/**
 * 校验一张图片是否含有违法违规内容。
 * @param {String} access_token   默认自动获取，不需要传
 * @param {String} image          要检测的图片url地址（与base64二选一）
 * @param {String} base64         要检测的图片文件base64（与image二选一）
 */
let imgSecCheckRes = await vk.openapi.douyin.security.imgSecCheck({
  base64: base64,
});
```

## 发送消息@subscribeMessage

### 发送订阅消息@subscribeMessage-send

`vk.openapi.douyin.subscribeMessage.send`

**云端发送**

```js
/**
 * 发送订阅消息
 * @param {String} access_token       默认自动获取，不需要传
 * @param {String} touser             接收者（用户）的 openid
 * @param {String} template_id        所需下发的订阅模板id
 * @param {String} page               点击模板卡片后的跳转页面，仅限本小程序内的页面。支持带参数,（示例index?foo=bar）。该字段不填则模板无跳转。
 * @param {Object} data               模板内容，格式形如 { "key1": { "value": any }, "key2": { "value": any } }
 */
let sendRes = await vk.openapi.douyin.subscribeMessage.send({
  touser: '9D26812AF23D9B2743235C4E3F3353E8', // 接收者（用户）的 openid
  template_id: '789697983d789c9257b7745470442be4', // 所需下发的订阅模板id
  page: 'pages/index/index', // 点击模板卡片后的跳转页面，仅限本小程序内的页面。支持带参数,（示例index?foo=bar）。该字段不填则模板无跳转。
  data: {
    物品名称: '测试值0',
    购买金额: '测试值1',
  },
});
console.log('sendRes: ', sendRes);
```

如果发送失败，可以在云函数内打印下 `sendRes` 的值，并根据返回的 `code` 进行判断错在哪里。[传送门 - 抖音官方文档](https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/server/subscribe-notification/notify)

**前端订阅**

发送订阅消息需要用户先在小程序前端点击订阅，且订阅是一次性的，发第二次消息需要再次订阅。

```js
uni.requestSubscribeMessage({
  tmplIds: ['271167b4691a07becf2ac115a896ebd6'], // 模板id
  success: (res) => {
    console.log('----subscribeAppMsg----success', res);
  },
  fail: (res) => {
    console.log('----subscribeAppMsg----fail', res);
  },
});
```

## 抖音小程序万能 API 调用接口@generalapi

**如果以上 API 不能满足你的需求，你可以使用这个万能 API**

```js
let requestRes = await vk.openapi.douyin.request({
  method: 'POST',
  url: '接口路径',
  data: {},
});
```

**请求参数**

| 参数   | 说明                                       | 类型   | 默认值 | 可选值 |
| ------ | ------------------------------------------ | ------ | ------ | ------ |
| method | 请求模式，分为 GET 和 POST（不区分大小写） | String | POST   | GET    |
| url    | 接口路径                                   | String | -      | -      |
| data   | 请求数据                                   | Object | -      | -      |

**url 参数详解**

以 `获取小程序 URL Link` 为例

**请求地址**

`POST` https://developer.toutiao.com/`api/apps/url_link/generate`

`method` 为 `POST`

`url` 为 `api/apps/url_link/generate`

**最终代码**

```js
let requestRes = await vk.openapi.douyin.request({
  method: 'POST',
  url: 'api/apps/url_link/generate',
  data: {
    access_token: true, // 传true代表自动获取access_token
    ma_app_id: 'tt35f7434aaac849b101',
    app_name: 'douyin',
    path: 'pages/index/index',
    query: JSON.stringify({
      a: 1,
      b: '2',
    }),
    expire_time: parseInt((Date.now() + 1000 * 3600) / 1000), // 1小时过期
  },
});
console.log('requestRes: ', requestRes);
```

**公共返回参数**

| 参数 | 说明                     | 类型   |
| ---- | ------------------------ | ------ |
| code | 0 代表成功，其他均为失败 | Number |
| msg  | 失败时的提示内容         | String |

其他返回参数参考抖音小程序服务端 API 文档 [传送门 - 抖音官方文档](https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/server/interface-request-credential/get-access-token)

## 多小程序调用@many

以上所有 API 均支持多加 2 个参数

| 参数      | 说明                                                              | 类型   |
| --------- | ----------------------------------------------------------------- | ------ |
| appid     | 可不填，不填会自动从 uni-id 配置的 mp-douyin 节点里获取 appid     | String |
| appsecret | 可不填，不填会自动从 uni-id 配置的 mp-douyin 节点里获取 appsecret | String |

1. 如果 `appid` 和 `appsecret` 均不填，则自动从 uni-id 配置的 mp-douyin 节点里获取 appid
2. 如果填了 `appid` 不填 `appsecret`，则 `appsecret` 会自动从 `uni-config-center/vk-unicloud/index.js 的抖音小程序配置（vk.oauth.douyin.list）` 里找对应的值
