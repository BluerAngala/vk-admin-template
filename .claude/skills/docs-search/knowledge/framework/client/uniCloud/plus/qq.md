---
sidebarDepth: 0
---

# QQ 小程序 API

> 以下 API 需要 vk-unicloud 核心库版本 >= 2.14.1

## 配置文件@config

打开 `uniCloud/cloudfunctions/common/uni-config-center/uni-id/config.json` 文件，配置里面的

"mp-qq" 微信小程序

```js
"mp-qq": {
  "oauth": {
    "qq": {
      "appid": "",
      "appsecret": ""
    }
  }
},
```

配置完需要上传 `uni-config-center` 这个公共模块才会生效

## 授权相关 API@auth

### 获取 token@getAccessToken

`vk.openapi.qq.auth.getAccessToken`

```js
/**
 * 获取小程序全局唯一后台接口调用凭据（access_token）。调用绝大多数后台接口时都需使用 access_token，接口会自动缓存token，无需再手动保存token
 * @param {Boolean} cache 默认true 如果为false，代表不从缓存中读取token，一般不传此参数
 */
let access_token = await vk.openapi.qq.auth.getAccessToken();
```

### code 换取 openid@code2Session

`vk.openapi.qq.auth.code2Session`

```js
/**
 * 登录凭证校验。通过 qq.login 接口获得临时登录凭证 code 后传到开发者服务器调用此接口完成登录流程。
 * @param {String} code 登录时获取的 code
 * @param {String} needKey 是否需要返回 sessionKey 或 accessToken 默认 false
 */
let code2SessionRes = await vk.openapi.qq.auth.code2Session({
  code: code,
  needKey: false,
});
```

### 获取小程序码@getMiniCode

`vk.openapi.qq.acode.getMiniCode`

```js
/**
 * 获取小程序码
 * @param {String} access_token   默认自动获取，不需要传
 * @param {String} path 必须是已经发布的小程序存在的页面（否则报错），例如 pages/index/index 根路径前不要填加 / 可以携带参数 如 pages/index/index?a=1
 */
let getMiniCodeRes = await vk.openapi.qq.acode.getMiniCode({
  path: 'pages/index/index?a=1&b=2',
});
```

**注意：getMiniCode 在执行成功后返回的是二进制，故在云函数中需要转换，完整代码如下**

```js
let getMiniCodeRes = await vk.openapi.qq.acode.getMiniCode({
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

`vk.openapi.qq.security.msgSecCheck`

```js
/**
 * 检查一段文本是否含有违法违规内容。
 * 频率限制：单个 appId 调用上限为 4000 次/分钟，2,000,000 次/天*
 * @param {String} access_token   默认自动获取，不需要传
 * @param {String} content        要检测的文本内容，长度不超过 500KB
 */
let msgSecCheckRes = await vk.openapi.qq.security.msgSecCheck({
  content: '', // 文本内容，不可超过500KB
});
```

### 检测图片是否违规@security-imgSecCheck

`vk.openapi.qq.security.imgSecCheck`

```js
/**
 * 校验一张图片是否含有违法违规内容。
 * 频率限制：单个 appId 调用上限为 2000 次/分钟，200,000 次/天 （ 图片大小限制：1M **）
 * @param {String} access_token   默认自动获取，不需要传
 * @param {String} base64         要检测的图片文件base64，图片尺寸不超过 750px x 1334px
 */
let imgSecCheckRes = await vk.openapi.qq.security.imgSecCheck({
  base64: base64,
});
```

## 发送消息@subscribeMessage

### 发送订阅消息@subscribeMessage-send

`vk.openapi.qq.subscribeMessage.send`

**云端发送**

```js
/**
 * 发送订阅消息
 * @param {String} access_token       默认自动获取，不需要传
 * @param {String} touser             接收者（用户）的 openid
 * @param {String} template_id        所需下发的订阅模板id
 * @param {String} page               点击模板卡片后的跳转页面，仅限本小程序内的页面。支持带参数,（示例index?foo=bar）。该字段不填则模板无跳转。
 * @param {Object} data               模板内容，格式形如 { "key1": { "value": any }, "key2": { "value": any } }
 * @param {String} emphasis_keyword   模板需要放大的关键词，不填则默认无放大。
 * @param {String} oac_appid          若希望通过小程序绑定的公众号下发，则在该字段填入公众号的 appid
 * @param {Number} use_robot          若希望通过客服机器人下发，则在该字段填
 */
let sendRes = await vk.openapi.qq.subscribeMessage.send({
  touser: '9D26812AF23D9B2743235C4E3F3353E8', // 接收者（用户）的 openid
  template_id: '789697983d789c9257b7745470442be4', // 所需下发的订阅模板id
  page: 'pages/index/index', // 点击模板卡片后的跳转页面，仅限本小程序内的页面。支持带参数,（示例index?foo=bar）。该字段不填则模板无跳转。
  data: {
    keyword1: {
      value: '339208499',
    },
    keyword2: {
      value: '2019年5月05日 12:30',
    },
    keyword3: {
      value: '腾讯大厦',
    },
  },
  emphasis_keyword: 'keyword1.DATA',
});
console.log('sendRes: ', sendRes);
```

如果发送失败，可以在云函数内打印下 `sendRes` 的值，并根据返回的 `code` 进行判断错在哪里。[传送门 - QQ 官方文档](https://q.qq.com/wiki/develop/miniprogram/server/open_port/port_module.html#sendtemplatemessage)

**前端订阅**

发送订阅消息需要用户先在小程序前端点击订阅，且订阅是一次性的，发第二次消息需要再次订阅。

```js
uni.subscribeAppMsg({
  tmplIds: ['271167b4691a07becf2ac115a896ebd6'], // 模板id
  subscribe: true,
  success(res) {
    console.log('----subscribeAppMsg----success', res);
  },
  fail(res) {
    console.log('----subscribeAppMsg----fail', res);
  },
});
```

## 多小程序调用@many

以上所有 API 均支持多加 2 个参数

| 参数      | 说明                                                          | 类型   |
| --------- | ------------------------------------------------------------- | ------ |
| appid     | 可不填，不填会自动从 uni-id 配置的 mp-qq 节点里获取 appid     | String |
| appsecret | 可不填，不填会自动从 uni-id 配置的 mp-qq 节点里获取 appsecret | String |

1. 如果 `appid` 和 `appsecret` 均不填，则自动从 uni-id 配置的 mp-qq 节点里获取 appid
2. 如果填了 `appid` 不填 `appsecret`，则 `appsecret` 会自动从 `uni-config-center/vk-unicloud/index.js 的QQ小程序配置（vk.oauth.qq.list）` 里找对应的值
