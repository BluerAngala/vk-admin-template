---
sidebarDepth: 0
---

# 支付宝小程序 API

> 以下 API 需要 vk-unicloud 核心库版本 >= 2.14.3

## 配置文件@config

打开 `uniCloud/cloudfunctions/common/uni-config-center/uni-id/config.json` 文件，配置里面的

"mp-alipay" 支付宝小程序

```js
"mp-alipay": {
  "oauth": {
    "alipay": {
      "appid": "",
      "privateKey": ""
    }
  }
}
```

[传送门 - 支付宝官方文档](https://opendocs.alipay.com/mini/a25c5d8f_alipay.open.app.qrcode.create?pathHash=2334bbff)

配置完需要上传 `uni-config-center` 这个公共模块才会生效

## 授权相关 API@auth

### code 换取 openid@code2Session

`vk.openapi.alipay.auth.code2Session`

```js
/**
 * 登录凭证校验。通过 alipay.login 接口获得临时登录凭证 code 后传到开发者服务器调用此接口完成登录流程。
 * @param {String} code 登录时获取的 code
 * @param {String} needKey 是否需要返回 sessionKey 或 accessToken 默认 false
 */
let code2SessionRes = await vk.openapi.alipay.auth.code2Session({
  code: code,
  needKey: false,
});
```

### 获取小程序码@getMiniCode

`vk.openapi.alipay.acode.getMiniCode`

```js
/**
 * 获取小程序码
 * @param {String} access_token   默认自动获取，不需要传
 * @param {String} page         必须是已经发布的小程序存在的页面（否则报错），例如 pages/index/index, 根路径前不要填加 /,不能携带参数（参数请放在scene字段里），如果不填写这个字段，默认跳主页面
 * @param {String} scene        最大32个可见字符，只支持数字，大小写英文以及部分特殊字符：!#$&'()*+,/:;=?@-._~，其它字符请自行编码为合法字符（因不支持%，中文无法使用 urlencode 处理，请使用其他编码方式）
 */
let getMiniCodeRes = await vk.openapi.alipay.acode.getMiniCode({
  page: 'pages/index/index',
  scene: 'a=1&b=2',
});
let qrcode = getMiniCodeRes.qr_code_url_circle_white;
console.log('qrcode: ', qrcode);
```

## 内容安全@security

### 检测文本是否违规@security-msgSecCheck

`vk.openapi.alipay.security.msgSecCheck`

暂不支持，支付宝未开放此 API。

### 检测图片是否违规@security-imgSecCheck

`vk.openapi.alipay.security.imgSecCheck`

暂不支持，支付宝未开放此 API。

## 发送消息@subscribeMessage

### 发送订阅消息@subscribeMessage-send

`vk.openapi.alipay.subscribeMessage.send`

**云端发送**

```js
/**
 * 发送订阅消息
 * @param {String} access_token       默认自动获取，不需要传
 * @param {String} touser             接收者（用户）的 openid（2088开头的支付宝用户id）
 * @param {String} template_id        所需下发的订阅模板id
 * @param {String} page               点击模板卡片后的跳转页面，仅限本小程序内的页面。支持带参数,（示例index?foo=bar）。该字段不填则模板无跳转。
 * @param {Object} data               模板内容，格式形如 { "key1": { "value": any }, "key2": { "value": any } }
 */
let sendRes = await vk.openapi.alipay.subscribeMessage.send({
  touser: '208800xxxxxxx', // 接收者（用户）的 openid
  template_id: 'da4ce1b528614c7fae371bcad1914ebe', // 所需下发的订阅模板id
  page: 'pages/index/index', // 点击模板卡片后的跳转页面，仅限本小程序内的页面。支持带参数,（示例index?foo=bar）。该字段不填则模板无跳转。
  data: {
    keyword1: {
      value: '11',
    },
    keyword2: {
      value: '22',
    },
    keyword3: {
      value: '33',
    },
  },
});
console.log('sendRes: ', sendRes);
```

如果发送失败，可以在云函数内打印下 `sendRes` 的值，并根据返回的 `code` 进行判断错在哪里。[传送门 - 支付宝官方文档](https://developer.open-alipay.com/docs/resource/zh-CN/mini-app/develop/server/subscribe-notification/notify)

**前端订阅**

发送订阅消息需要用户先在小程序前端点击订阅，且订阅是一次性的，发第二次消息需要再次订阅。

```js
uni.requestSubscribeMessage({
  entityIds: ['da4ce1b528614c7fae371bcad1914ebe'], // 模板id
  success(res) {
    console.log('----subscribeAppMsg----success', res);
  },
  fail(res) {
    console.log('----subscribeAppMsg----fail', res);
  },
});
```

## 支付宝小程序万能 API 调用接口@generalapi

**如果以上 API 不能满足你的需求，你可以使用这个万能 API**

```js
let requestRes = await vk.openapi.alipay.request({
  method: '接口名',
  data: {
    biz_content: {
      // 请求参数写这里
      a: 1,
      b: '2',
    },
  },
});
```

**请求参数**

| 参数             | 说明                                     | 类型   | 默认值 | 可选值 |
| ---------------- | ---------------------------------------- | ------ | ------ | ------ |
| method           | 接口名，如 alipay.open.app.qrcode.create | String | -      | -      |
| data             | 请求数据                                 | Object | -      | -      |
| data.biz_content | 接口参数                                 | Object | -      | -      |

**url 参数详解**

以 `获取小程序码` 为例

**请求地址**

`method` 为 `alipay.open.app.qrcode.create`

**最终代码**

```js
let biz_content = {
  url_param: 'pages/index/index',
  query_param: 'a=1&b=2',
  describe: '推广',
};

let requestRes = await vk.openapi.alipay.request({
  method: 'alipay.open.app.qrcode.create',
  data: {
    biz_content,
  },
});

console.log('requestRes: ', requestRes);
```

**公共返回参数**

| 参数 | 说明                     | 类型   |
| ---- | ------------------------ | ------ |
| code | 0 代表成功，其他均为失败 | Number |
| msg  | 失败时的提示内容         | String |

其他返回参数参考支付宝小程序服务端 API 文档 [传送门 - 支付宝官方文档](https://opendocs.alipay.com/mini/a25c5d8f_alipay.open.app.qrcode.create?pathHash=2334bbff)

## 多小程序调用@many

以上所有 API 均支持多加 2 个参数

| 参数       | 说明                                                               | 类型   |
| ---------- | ------------------------------------------------------------------ | ------ |
| appid      | 可不填，不填会自动从 uni-id 配置的 mp-alipay 节点里获取 appid      | String |
| privateKey | 可不填，不填会自动从 uni-id 配置的 mp-alipay 节点里获取 privateKey | String |

1. 如果 `appid` 和 `privateKey` 均不填，则自动从 uni-id 配置的 mp-alipay 节点里获取 appid
2. 如果填了 `appid` 不填 `privateKey`，则 `privateKey` 会自动从 `uni-config-center/vk-unicloud/index.js 的支付宝小程序配置（vk.oauth.alipay.list）` 里找对应的值
