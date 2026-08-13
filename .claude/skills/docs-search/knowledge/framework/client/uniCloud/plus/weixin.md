---
sidebarDepth: 0
---

# 微信小程序 API

:::warning 注意

此非前端 API，请在云函数内调用。
:::

## 配置文件@config

打开 `uniCloud/cloudfunctions/common/uni-config-center/uni-id/config.json` 文件，配置里面的

"mp-weixin" 微信小程序

"app-plus" APP（需要用到 APP 登录才需要配置）

"h5-weixin" （需要用到公众号登录才需要配置）

```js
"app-plus": {
  "tokenExpiresIn": 604800,
  "oauth": {
    "weixin": {
      "appid": "",
      "appsecret": ""
    }
  }
},
"mp-weixin": {
  "oauth": {
    "weixin": {
      "appid": "",
      "appsecret": ""
    }
  }
},
"h5-weixin": {
  "oauth": {
    "weixin": {
      "appid": "",
      "appsecret": ""
    }
  }
},
```

配置完需要上传 `uni-config-center` 这个公共模块才会生效

## 授权相关 API@auth

### 获取 token@getAccessToken

`vk.openapi.weixin.auth.getAccessToken`

```js
/**
 * (带缓存,缓存1小时) 获取小程序全局唯一后台接口调用凭据（access_token）。调用绝大多数后台接口时都需使用 access_token，开发者需要进行妥善保存。
 * @param {String} cache 默认true 使用缓存
 */
let access_token = await vk.openapi.weixin.auth.getAccessToken();
```

### code 换取 openid@code2Session

`vk.openapi.weixin.auth.code2Session`

```js
/**
 * 登录凭证校验。通过 wx.login 接口获得临时登录凭证 code 后传到开发者服务器调用此接口完成登录流程。
 * @param {String} js_code 登录时获取的 code
 */
let code2SessionRes = await vk.openapi.weixin.auth.code2Session({
  js_code: js_code,
});
```

### 获取微信绑定的手机号@getPhoneNumber

`vk.openapi.weixin.decrypt.getPhoneNumber`

**方式一：通过 code**

```js
/**
 * 获取微信绑定的手机号
 * @param {String} code 通过前端button组件事件getphonenumber得到的 e.detail.code
 */
let getPhoneNumberRes = await vk.openapi.weixin.decrypt.getPhoneNumber({
  code,
});
```

**方式二：通过 encryptedData+iv+sessionKey**

```js
/**
 * 获取微信绑定的手机号
 * @param {String} encryptedData 加密数据 通过前端button组件事件getphonenumber得到的 e.detail.encryptedData
 * @param {String} iv 密钥1 通过前端button组件事件getphonenumber得到的 e.detail.iv
 * @param {String} sessionKey 密钥2 通过code2Session接口得到sessionKey
 */
let getPhoneNumberRes = await vk.openapi.weixin.decrypt.getPhoneNumber({
  encryptedData,
  iv,
  sessionKey,
});
```

### 获取小程序码@wxacode-getUnlimited

`vk.openapi.weixin.wxacode.getUnlimited`

```js
/**
 * 获取小程序码，适用于需要的码数量极多的业务场景。通过该接口生成的小程序码，永久有效，数量暂无限制。 更多用法详见 获取二维码。
 * @param {String} access_token 默认自动获取，不需要传
 * @param {String} scene        最大32个可见字符，只支持数字，大小写英文以及部分特殊字符：!#$&'()*+,/:;=?@-._~，其它字符请自行编码为合法字符（因不支持%，中文无法使用 urlencode 处理，请使用其他编码方式）
 * @param {String} page         必须是已经发布的小程序存在的页面（否则报错），例如 pages/index/index, 根路径前不要填加 /,不能携带参数（参数请放在scene字段里），如果不填写这个字段，默认跳主页面
 * @param {boolean} check_path  默认是true，检查page 是否存在，为 true 时 page 必须是已经发布的小程序存在的页面（否则报错）；为 false 时允许小程序未发布或者 page 不存在， 但page 有数量上限（60000个）请勿滥用。
 * @param {String} env_version  要打开的小程序版本。正式版为 "release"，体验版为 "trial"，开发版为 "develop"。默认是正式版。
 * @param {number} width        默认430，二维码的宽度，单位 px，最小 280px，最大 1280px
 * @param {boolean} auto_color  自动配置线条颜色，如果颜色依然是黑色，则说明不建议配置主色调，默认 false
 * @param {Object} line_color   默认是{"r":0,"g":0,"b":0} 。auto_color 为 false 时生效，使用 rgb 设置颜色 例如 {"r":"xxx","g":"xxx","b":"xxx"} 十进制表示
 * @param {boolean} is_hyaline  默认是false，是否需要透明底色，为 true 时，生成透明底色的小程序
 */
let getUnlimitedRes = await vk.openapi.weixin.wxacode.getUnlimited({
  page: 'pages/index/index',
  scene: '',
  check_path: false,
  env_version: 'develop', // 要打开的小程序版本。正式版为 "release"，体验版为 "trial"，开发版为 "develop"。默认是正式版。
});
```

**注意：getUnlimited 在执行成功后返回的是二进制，故在云函数中需要转换，完整代码如下**

```js
let getUnlimitedRes = await vk.openapi.weixin.wxacode.getUnlimited({
  page: 'pages/index/index',
  scene: '',
  check_path: false,
  env_version: 'develop', // 要打开的小程序版本。正式版为 "release"，体验版为 "trial"，开发版为 "develop"。默认是正式版。
});
if (typeof getUnlimitedRes === 'object' && getUnlimitedRes.code) {
  return getUnlimitedRes;
}
try {
  // 二进制转base64
  let base64 = Buffer.from(getUnlimitedRes, 'binary').toString('base64');
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

### 获取 scheme 码@urlscheme-generate

`vk.openapi.weixin.urlscheme.generate`

```js
/**
 * 获取小程序scheme码
 * @param {String} access_token    默认自动获取，不需要传
 * @param {Object} jump_wxa        跳转到的目标小程序信息。
 * @param {boolean} is_expire      生成的scheme码类型，到期失效：true，永久有效：false。
 * @param {number} expire_type     默认值0，到期失效的 scheme 码失效类型，失效时间：0，失效间隔天数：1
 * @param {number} expire_time     到期失效的scheme码的失效时间，为Unix时间戳。生成的到期失效scheme码在该时间前有效。最长有效期为1年。生成到期失效的scheme时必填。
 * @param {number} expire_interval 到期失效的 scheme 码的失效间隔天数。生成的到期失效 scheme 码在该间隔时间到达前有效。最长间隔天数为30天。is_expire 为 true 且 expire_type 为 1 时必填
 * jump_wxa 的结构
 * @param {string} path            通过 scheme 码进入的小程序页面路径，必须是已经发布的小程序存在的页面，不可携带 query。path 为空时会跳转小程序主页。
 * @param {string} query           通过 scheme 码进入小程序时的 query，最大1024个字符，只支持数字，大小写英文以及部分特殊字符：!#$&'()*+,/:;=?@-._~%`
 * @param {String} env_version     默认值"release"。要打开的小程序版本。正式版为"release"，体验版为"trial"，开发版为"develop"，仅在微信外打开时生效。
 * 返回结果
 * @return {String} openlink
 */
let generateRes = await vk.openapi.weixin.urlscheme.generate({
  jump_wxa: {
    path: 'pages/index/index',
    query: 'a=1',
    env_version: 'develop', // 要打开的小程序版本。正式版为 "release"，体验版为 "trial"，开发版为 "develop"。默认是正式版。
  },
  is_expire: true,
  expire_type: 1,
  expire_interval: 30, // 有效期30天（最大30天）
});
```

### 获取小程序 URL 链接@urllink-generate

`vk.openapi.weixin.urllink.generate`

```js
/**
 * 获取小程序 URL Link，适用于短信、邮件、网页、微信内等拉起小程序的业务场景。通过该接口，可以选择生成到期失效和永久有效的小程序链接，有数量限制，目前仅针对国内非个人主体的小程序开放
 * @param {String} access_token      默认自动获取，不需要传
 * @param {String} path              通过 URL Link 进入的小程序页面路径，必须是已经发布的小程序存在的页面，不可携带 query 。path 为空时会跳转小程序主页
 * @param {string} query             通过 URL Link 进入小程序时的query，最大1024个字符，只支持数字，大小写英文以及部分特殊字符：!#$&'()*+,/:;=?@-._~%
 * @param {boolean} is_expire        默认值false。生成的 URL Link 类型，到期失效：true，永久有效：false。注意，永久有效 Link 和有效时间超过180天的到期失效 Link 的总数上限为10万个，详见获取 URL Link，生成 Link 前请仔细确认。
 * @param {number} expire_type       默认值0.小程序 URL Link 失效类型，失效时间：0，失效间隔天数：1
 * @param {number} expire_time       到期失效的 URL Link 的失效时间，为 Unix 时间戳。生成的到期失效 URL Link 在该时间前有效。最长有效期为30天。expire_type 为 0 必填
 * @param {number} expire_interval   到期失效的URL Link的失效间隔天数。生成的到期失效URL Link在该间隔时间到达前有效。最长间隔天数为30天。expire_type 为 1 必填
 * @param {string} env_version       默认值"release"。要打开的小程序版本。正式版为 "release"，体验版为"trial"，开发版为"develop"，仅在微信外打开时生效。
 * 返回结果
 * @return {String} url_link
 */
let generateRes = await vk.openapi.weixin.urllink.generate({
  path: 'pages/index/index',
  query: 'a=1&b=2',
  is_expire: true,
  expire_type: 1,
  expire_interval: 30, // 有效期30天（最大30天）
  env_version: 'develop', // 要打开的小程序版本。正式版为 "release"，体验版为 "trial"，开发版为 "develop"。默认是正式版。
});
```

## 内容安全@security

### 检测文本是否违规@security-msgSecCheck

`vk.openapi.weixin.security.msgSecCheck`

```js
/**
 * 检查一段文本是否含有违法违规内容。
 * 频率限制：单个 appId 调用上限为 4000 次/分钟，2,000,000 次/天*
 * @param {String} access_token   默认自动获取，不需要传
 * @param {String} content        要检测的文本内容，长度不超过 500KB
 * @param {String} openid         用户的小程序openid（用户需在近两小时访问过小程序）version=2时必填
 * @param {Number} scene          场景值（1 资料；2 评论；3 论坛；4 社交日志）
 * @param {Number} version        接口版本号，可选1或2，但1的检测能力很弱
 */
let msgSecCheckRes = await vk.openapi.weixin.security.msgSecCheck({
  content: '', // 文本内容，不可超过500KB
  openid: '', // 用户的小程序openid
  scene: 3, // 场景值（建议为2或3）
  version: 2, // 接口版本号（建议为2）
});
```

### 检测图片是否违规@security-imgSecCheck

`vk.openapi.weixin.security.imgSecCheck`

```js
/**
 * 校验一张图片是否含有违法违规内容。
 * 频率限制：单个 appId 调用上限为 2000 次/分钟，200,000 次/天 （ 图片大小限制：1M **）
 * @param {String} access_token   默认自动获取，不需要传
 * @param {String} base64         要检测的图片文件base64，图片尺寸不超过 750px x 1334px
 * @param {String} openid         用户的小程序openid（用户需在近两小时访问过小程序）version=2时必填
 * @param {Number} scene          场景值（1 资料；2 评论；3 论坛；4 社交日志）
 * @param {Number} version        接口版本号，可选1或2，但1的检测能力很弱
 */
let imgSecCheckRes = await vk.openapi.weixin.security.imgSecCheck({
  base64: base64,
  openid: '', // 用户的openid
  scene: 3, // 场景值（建议为2或3）
  version: 2, // 接口版本号（建议为2）
});
```

**注意**

- V2 的检测结果是异步返回的，需要提前在微信公众平台「开发」-「开发设置」-「消息推送」开启消息服务，检测结果在 30 分钟内会推送到你的消息接收服务器。

## 发送消息@subscribeMessage

### 发送订阅消息@subscribeMessage-send

`vk.openapi.weixin.subscribeMessage.send`

```js
/**
 * 发送订阅消息
 * @param {String} touser             接收者（用户）的 openid
 * @param {String} template_id        所需下发的订阅模板id
 * @param {String} page               点击模板卡片后的跳转页面，仅限本小程序内的页面。支持带参数,（示例index?foo=bar）。该字段不填则模板无跳转。
 * @param {String} data               模板内容，格式形如 { "key1": { "value": any }, "key2": { "value": any } }
 * @param {String} miniprogram_state  跳转小程序类型：developer为开发版；trial为体验版；formal为正式版；默认为正式版
 */
let sendRes = await vk.openapi.weixin.subscribeMessage.send({
  touser: openid,
  template_id: '订阅模板ID',
  page: 'pages/index/index', // 注意：此处的page地址不要/开头
  data: {
    character_string1: {
      value: '202103040830158485629163994677',
    },
    name2: {
      value: '中通快递',
    },
    character_string3: {
      value: 'ZT2015215125352511',
    },
    thing6: {
      value: '雪花秀滋盈生人生焕颜精华露',
    },
    thing8: {
      value: '杭州市xxxxxxxxx号',
    },
  },
  miniprogram_state: 'formal',
});
if (sendRes.code === 0) {
  // 发送成功
} else {
  // 发送失败
}
```

**前端**

注意：发送订阅消息需要用户先在小程序前端点击订阅，且订阅是一次性的，发第二次消息需要再次订阅。

```js
// 前端订阅消息
uni.requestSubscribeMessage({
  tmplIds: ['订阅模板ID'],
});
```

注意：订阅消息发送的每个字段值是有严格限制的，具体限制 [点击查看](https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/subscribe-message/subscribeMessage.send.html)
并阅读其 `订阅消息参数值内容限制说明`

如果发送失败，可以在云函数内打印下 `sendRes` 的值，并根据返回的 `code` 进行判断错在哪里。

| 值    | 说明                                                                    |
| ----- | ----------------------------------------------------------------------- |
| 40003 | touser 字段 openid 为空或者不正确                                       |
| 40037 | 订阅模板 id 为空不正确                                                  |
| 43101 | 用户拒绝接受消息，如果用户之前曾经订阅过，则表示用户取消了订阅关系      |
| 47003 | 模板参数不准确，可能为空或者不满足规则，errmsg 会提示具体是哪个字段出错 |
| 41030 | page 路径不正确，需要保证在现网版本小程序中存在，与 app.json 保持一致   |

### 小程序转公众号模板消息@uniformMessage-send

`vk.openapi.weixin.uniformMessage.send`

**注意：此接口已被微信官方废弃，无法使用，即无法用微信小程序的 openid 来发送微信公众号的模板消息了**

<!--
**该接口亮点：可以用小程序的 openid 来发送公众号的模板消息（用户只需关注公众号，无需点击订阅消息）**

**特别注意**

2023年5月4日，微信官方限制了 `历史模板` 消息不再支持 `first` 和 `remark` 以及字体颜色，详情看 [微信公告](https://mp.weixin.qq.com/s?__biz=Mzg4NDYwOTcyNA==&mid=2247509160&idx=1&sn=d65ca01350c4e0aa5c2000a6388994fa&chksm=cfb7637bf8c0ea6d2c123321e88a586e8d03e01d976b6e79e7fb0480a6a6fe99be926de68e3b#rd)

**同时微信官方出了 `类目模板`，但此接口不支持新出的 `类目模板`，只能用 `历史模板`**

![](https://mp-cf0c5e69-620c-4f3c-84ab-f4619262939f.cdn.bspapp.com/cloudstorage/6c6145dc-daa0-4e18-a5b9-f2bf6e159e8d.png)
-->

**请求参数**

| 参数        | 类型   | 说明                                                                          |
| ----------- | ------ | ----------------------------------------------------------------------------- |
| touser      | String | 接收者（用户）的 openid（可以是小程序下的 openid，也可以是公众号下的 openid） |
| template_id | String | 所需下发的消息模板 id                                                         |
| url         | String | 跳转网页时填写                                                                |
| miniprogram | Object | 跳转小程序时填写                                                              |
| data        | Object | 模板内容                                                                      |

```js
/**
 * 发送公众号模板消息
 * @param {String} touser             接收者（用户）的 openid（可以是小程序下的openid，也可以是公众号下的openid）
 * @param {String} template_appid     公众号appid（不传自动从uni-id配置中获取）
 * @param {String} template_id        所需下发的消息模板id
 * @param {String} url                跳转网页时填写
 * @param {Object} miniprogram        跳转小程序时填写
 * @param {Object} data               模板内容
 */
let sendRes = await vk.openapi.weixin.uniformMessage.send({
  touser: '', // 接收者（用户）的 openid（可以是小程序下的openid，也可以是公众号下的openid）
  template_id: '', // 所需下发的订阅模板id
  url: 'https://www.baidu.com', // 跳转网页时填写（如填了miniprogram参数则自动忽略url参数）
  miniprogram: {
    appid: '', // 需要跳转的小程序appid
    pagepath: 'pages/order/order?id=aaa', // 需要跳转的小程序页面
  },
  data: {
    first: {
      value: '您购买的订单已经发货啦，正快马加鞭向您飞奔而去。',
      color: '#173177',
    },
    keyword1: {
      value: 'D201803111235825',
      color: '#173177',
    },
    keyword2: {
      value: '2018-03-11 19:56',
      color: '#173177',
    },
    keyword3: {
      value: '顺丰快递',
      color: '#173177',
    },
    keyword4: {
      value: '980456952123',
      color: '#173177',
    },
    keyword5: {
      value: '王先生 135xxxxxxxx 广东省深圳市龙华区建设东路',
      color: '#173177',
    },
    remark: {
      value: '欢迎再次购买！',
      color: '#173177',
    },
  },
});
```

**注意：公众号和小程序无需绑定在同一个开放平台下，但需要同时满足下面的 4 个要求。**

- 1、公众号必须和小程序是同主体。
- 2、公众号必须是已经认证的服务号（必须企业资质，每年 300 元认证费用）
- 3、小程序关联了公众号。
- 4、该用户关注了公众号。

如果发送失败，可以在云函数内打印下 `sendRes` 的值，并根据返回的 `code` 进行判断错在哪里。

| 值    | 说明                              |
| ----- | --------------------------------- |
| 40003 | touser 字段 openid 为空或者不正确 |
| 40037 | 模板 id 不正确                    |
| 45009 | 接口调用超过限额                  |
| 40013 | 不符合绑定关系要求                |

### 单独公众号模板消息@h5-templateMessage-send

`vk.openapi.weixin.h5.templateMessage.send`

该接口与 `vk.openapi.weixin.uniformMessage.send` 的区别是

- 1、templateMessage 只需配置公众号的配置，而 uniformMessage 需要同时配置小程序+公众号的配置。（在 uni-id 的配置文件中配置）
- 2、templateMessage 的 touser 参数只能是公众号下的 openid，而 uniformMessage 可以是小程序下的 openid，也可以是公众号下的 openid）

**特别注意**

2023 年 5 月 4 日，微信官方限制了模板消息不再支持 `first` 和 `remark` 以及字体颜色，详情看 [微信公告](https://mp.weixin.qq.com/s?__biz=Mzg4NDYwOTcyNA==&mid=2247509160&idx=1&sn=d65ca01350c4e0aa5c2000a6388994fa&chksm=cfb7637bf8c0ea6d2c123321e88a586e8d03e01d976b6e79e7fb0480a6a6fe99be926de68e3b#rd)

**请求参数**

| 参数        | 类型   | 说明                                               |
| ----------- | ------ | -------------------------------------------------- |
| touser      | String | 接收者（用户）的 openid（只能是公众号下的 openid） |
| template_id | String | 所需下发的消息模板 id                              |
| url         | String | 跳转网页时填写                                     |
| miniprogram | Object | 跳转小程序时填写                                   |
| data        | Object | 模板内容                                           |

```js
/**
 * 发送公众号模板消息
 * @param {String} touser             接收者（用户）的 openid（只能是公众号下的openid）
 * @param {String} template_id        所需下发的消息模板id
 * @param {String} url                跳转网页时填写
 * @param {Object} miniprogram        跳转小程序时填写
 * @param {Object} data               模板内容
 */
let sendRes = await vk.openapi.weixin.h5.templateMessage.send({
  touser: '', // 接收者（用户）的 openid（只能是公众号下的openid）
  template_id: '', // 所需下发的订阅模板id
  url: 'https://www.baidu.com', // 跳转网页时填写（如填了miniprogram参数则自动忽略url参数）
  miniprogram: {
    appid: '', // 需要跳转的小程序appid
    pagepath: 'pages/order/order?id=aaa', // 需要跳转的小程序页面
  },
  data: {
    first: {
      value: '您购买的订单已经发货啦，正快马加鞭向您飞奔而去。',
      color: '#173177',
    },
    keyword1: {
      value: 'D201803111235825',
      color: '#173177',
    },
    keyword2: {
      value: '2018-03-11 19:56',
      color: '#173177',
    },
    keyword3: {
      value: '顺丰快递',
      color: '#173177',
    },
    keyword4: {
      value: '980456952123',
      color: '#173177',
    },
    keyword5: {
      value: '王先生 135xxxxxxxx 广东省深圳市龙华区建设东路',
      color: '#173177',
    },
    remark: {
      value: '欢迎再次购买！',
      color: '#173177',
    },
  },
});
```

**注意：公众号需要同时满足下面的 2 个要求。**

- 1、公众号必须是已经认证的服务号（必须企业资质，每年 300 元认证费用）
- 2、该用户关注了公众号。

如果发送失败，可以在云函数内打印下 `sendRes` 的值，并根据返回的 `code` 进行判断错在哪里。

| 值    | 说明                              |
| ----- | --------------------------------- |
| 40003 | touser 字段 openid 为空或者不正确 |
| 40037 | 模板 id 不正确                    |
| 45009 | 接口调用超过限额                  |
| 40013 | 不符合绑定关系要求                |

## 直播@livebroadcast

### 获取直播间列表@livebroadcast-getLiveInfo

`vk.openapi.weixin.livebroadcast.getLiveInfo`

```js
/**
 * 获取直播间列表
 * @params {Number} pageIndex 第几页
 * @params {Number} pageSize  每页显示数量
 */
let getLiveInfoRes = await vk.openapi.weixin.livebroadcast.getLiveInfo({
  pageIndex: 1,
  pageSize: 100,
});
```

## 发货管理@order

> vk-unicloud 版本 ≥ 2.19.2

微信小程序自营类目的商家需要统一接入微信平台的发货管理，否则微信会限制支付接口的调用。

整个流程为：

1. 用户在你微信小程序下单
2. 用户支付成功
3. 后台发货，同时调用下面的[【发货信息录入接口】](#order-upload-shipping-info)，向微信平台发送支付订单信息，如果是实物商品，还可以再调用[【传运单接口】](#logistics-trace-waybill)，上报微信快递物流信息，这样再通过[【查运单接口】](#logistics-query-follow-trace)即可查询快递物流轨迹信息
4. 微信会给支付者发送服务消息，用户点击后会进入确认收货页面，只有用户点了确认收货或订单到期自动确认收货后，商家才能收到资金，否则资金处于冻结状态
5. 完成

同时还可能需要商家缴纳保证金，其金额不一定是 10 万，可能是几千，也可能是几万，反正很坑，如下图所示

![](https://cdn.fsq.pub/vkdoc/vk-client/f505118a-b444-439c-9f88-d62c9a08b77c.png)

[小程序交易保证金管理规定](https://developers.weixin.qq.com/miniprogram/dev/platform-capabilities/business-capabilities/ministore/minishopopencomponent2/baozhengjin.html)

不过这个保证金是可以不缴纳的，只是不缴纳会影响其他小程序跳转到你的小程序的能力（不影响登录、支付等其他功能），[查看实物交易类小程序跳转规范](https://mp.weixin.qq.com/cgi-bin/announce?token=1559487538&action=getannouncement&key=11736404407Ko3H2&version=1&lang=zh_CN&platform=2)

### 发货信息录入接口@order-upload-shipping-info

`vk.openapi.weixin.order.uploadShippingInfo`

请求参数请查看[微信官方文档](https://developers.weixin.qq.com/miniprogram/dev/platform-capabilities/business-capabilities/order-shipping/order-shipping.html#%E4%B8%80%E3%80%81%E5%8F%91%E8%B4%A7%E4%BF%A1%E6%81%AF%E5%BD%95%E5%85%A5%E6%8E%A5%E5%8F%A3)

```js
/**
 * 发货信息录入接口
 * @param {object} order_key             订单，需要上传物流信息的订单
 * @param {number} logistics_type        物流模式，发货方式枚举值：1、实体物流配送采用快递公司进行实体物流配送形式 2、同城配送 3、虚拟商品，虚拟商品，例如话费充值，点卡等，无实体配送形式 4、用户自提
 * @param {number} delivery_mode         发货模式，发货模式枚举值：1、UNIFIED_DELIVERY（统一发货）2、SPLIT_DELIVERY（分拆发货） 示例值: UNIFIED_DELIVERY
 * @param {boolean} is_all_delivered     分拆发货模式时必填，用于标识分拆发货模式下是否已全部发货完成，只有全部发货完成的情况下才会向用户推送发货完成通知。示例值: true/false
 * @param {array<object>} shipping_list  物流信息列表，发货物流单列表，支持统一发货（单个物流单）和分拆发货（多个物流单）两种模式，多重性: [1, 10]
 * @param {string} upload_time           上传时间，用于标识请求的先后顺序 示例值: `2022-12-15T13:29:35.120+08:00`
 * @param {object} payer                 支付者，支付者信息
 */
let uploadRes = await vk.openapi.weixin.order.uploadShippingInfo({
  order_key: {
    order_number_type: 2,
    transaction_id: '4200002504202501085353055271',
  },
  logistics_type: 1,
  delivery_mode: 1,
  is_all_delivered: true,
  shipping_list: [
    {
      tracking_no: '78869806474031', // 物流单号，物流快递发货时必填，示例值: 323244567777 字符字节限制: [1, 128]
      express_company: 'ZTO', // 物流公司编码，快递公司ID，参见「查询物流公司编码列表」，物流快递发货时必填， 示例值: DHL 字符字节限制: [1, 128]
      item_desc: '测试商品1号*1,测试商品2号*2', // 商品信息
      contact: {
        consignor_contact: '177****1234',
      },
    },
  ],
  upload_time: vk.pubfn.timeFormat(new Date(), 'yyyy-MM-ddThh:mm:ss.S+08:00', 8),
  payer: {
    openid: 'oRrtV7FOndtawDfZ2Ut3ehqFkWKI',
  },
});
```

### 发货信息合单录入接口@order-uploadCombinedShippingInfo

`vk.openapi.weixin.order.uploadCombinedShippingInfo`

请求参数请查看[微信官方文档](https://developers.weixin.qq.com/miniprogram/dev/platform-capabilities/business-capabilities/order-shipping/order-shipping.html#%E4%BA%8C%E3%80%81%E5%8F%91%E8%B4%A7%E4%BF%A1%E6%81%AF%E5%90%88%E5%8D%95%E5%BD%95%E5%85%A5%E6%8E%A5%E5%8F%A3)

```js
/**
 * 发货信息合单录入接口
 * @param {object} order_key             订单，需要上传物流信息的订单
 * @param {array<object>} sub_orders     子单物流详情
 * @param {string} upload_time           上传时间，用于标识请求的先后顺序 示例值: `2022-12-15T13:29:35.120+08:00`
 * @param {object} payer                 支付者，支付者信息
 */
let uploadRes = await vk.openapi.weixin.order.uploadCombinedShippingInfo({
  order_key: {
    order_number_type: 1,
    mchid: 'fake-mchid-123',
    out_trade_no: 'fake-tradeno-20221214190427-0',
  },
  sub_orders: [
    {
      order_key: {
        order_number_type: 1,
        mchid: 'fake-mchid-123',
        out_trade_no: 'fake-tradeno-20221214190427-01',
      },
      delivery_mode: 2,
      logistics_type: 1,
      is_all_delivered: true,
      shipping_list: [
        {
          tracking_no: 'fake-trackingno-202212141904271',
          express_company: 'YD',
          item_desc: '微信气泡狗零钱包*1',
          contact: {
            consignor_contact: '021-**34-12',
          },
        },
        {
          tracking_no: 'fake-trackingno-202212141904272',
          express_company: 'DHL',
          item_desc: '微信黄脸布艺胸针*1；微信气泡狗零钱包*1',
          contact: {
            consignor_contact: '021-**34-12',
          },
        },
      ],
    },
    {
      order_key: {
        order_number_type: 1,
        mchid: 'fake-mchid-321',
        out_trade_no: 'fake-tradeno-20221214190427-02',
      },
      delivery_mode: 1,
      logistics_type: 1,
      shipping_list: [
        {
          tracking_no: 'fake-trackingno-202212141904273',
          express_company: 'YTO',
          item_desc: '微信气泡狗双面钥匙扣*1',
          contact: {
            receiver_contact: '+86-123****4321',
          },
        },
      ],
    },
  ],
  upload_time: '2022-12-15T13:29:35.120+08:00',
  payer: {
    openid: 'ogqztkPsejM9MQAFfwCQSCi4oNg3',
  },
});
```

### 查询订单发货状态@order-getOrder

`vk.openapi.weixin.order.getOrder`

请求参数请查看[微信官方文档](https://developers.weixin.qq.com/miniprogram/dev/platform-capabilities/business-capabilities/order-shipping/order-shipping.html#%E4%B8%89%E3%80%81%E6%9F%A5%E8%AF%A2%E8%AE%A2%E5%8D%95%E5%8F%91%E8%B4%A7%E7%8A%B6%E6%80%81)

```js
/**
 * 查询订单发货状态
 */
let getOrderRes = await vk.openapi.weixin.order.getOrder({
  transaction_id: '',
  merchant_id: '',
  sub_merchant_id: '',
  merchant_trade_no: '',
});
```

### 查询订单列表@order-getOrderList

`vk.openapi.weixin.order.getOrderList`

请求参数请查看[微信官方文档](https://developers.weixin.qq.com/miniprogram/dev/platform-capabilities/business-capabilities/order-shipping/order-shipping.html#%E5%9B%9B%E3%80%81%E6%9F%A5%E8%AF%A2%E8%AE%A2%E5%8D%95%E5%88%97%E8%A1%A8)

```js
/**
 * 查询订单列表
 */
let getOrderRes = await vk.openapi.weixin.order.getOrderList({
  page_size: 100,
});
```

### 确认收货提醒接口@order-notifyConfirmReceive

`vk.openapi.weixin.order.notifyConfirmReceive`

请求参数请查看[微信官方文档](https://developers.weixin.qq.com/miniprogram/dev/platform-capabilities/business-capabilities/order-shipping/order-shipping.html#%E4%BA%94%E3%80%81%E7%A1%AE%E8%AE%A4%E6%94%B6%E8%B4%A7%E6%8F%90%E9%86%92%E6%8E%A5%E5%8F%A3)

```js
/**
 * 确认收货提醒接口
 */
let getOrderRes = await vk.openapi.weixin.order.notifyConfirmReceive({
  transaction_id: 'fake-transid-20221209132531-44',
  merchant_id: 'fake-mchid-123',
  merchant_trade_no: 'fake-tradeno-20221209132531-44',
  received_time: 1670829139,
});
```

### 消息跳转路径设置接口@order-setMsgJumpPath

`vk.openapi.weixin.order.setMsgJumpPath`

请求参数请查看[微信官方文档](https://developers.weixin.qq.com/miniprogram/dev/platform-capabilities/business-capabilities/order-shipping/order-shipping.html#%E5%85%AD%E3%80%81%E6%B6%88%E6%81%AF%E8%B7%B3%E8%BD%AC%E8%B7%AF%E5%BE%84%E8%AE%BE%E7%BD%AE%E6%8E%A5%E5%8F%A3)

```js
/**
 * 消息跳转路径设置接口
 */
let setRes = await vk.openapi.weixin.order.setMsgJumpPath({
  path: 'pages/order/info',
});
```

### 查询小程序是否已开通发货信息管理服务@order-isTradeManaged

`vk.openapi.weixin.order.isTradeManaged`

本接口无请求参数

```js
/**
 * 查询小程序是否已开通发货信息管理服务
 */
let checkRes = await vk.openapi.weixin.order.isTradeManaged();
if (checkRes.is_trade_managed) {
  res.msg = '已开通小程序发货信息管理服务';
} else {
  res.msg = '未开通小程序发货信息管理服务';
}
```

### 查询小程序是否已完成交易结算管理确认@order-isTradeManagementConfirmationCompleted

`vk.openapi.weixin.order.isTradeManagementConfirmationCompleted`

本接口无请求参数

```js
/**
 * 查询小程序是否已完成交易结算管理确认
 */
let checkRes = await vk.openapi.weixin.order.isTradeManagementConfirmationCompleted();
if (checkRes.completed) {
  res.msg = '已完成交易结算管理确认';
} else {
  res.msg = '未完成交易结算管理确认';
}
```

### 特殊发货报备@order-opspecialorder

`vk.openapi.weixin.order.opspecialorder`

请求参数请查看[微信官方文档](https://developers.weixin.qq.com/miniprogram/dev/platform-capabilities/business-capabilities/order-shipping/order-shipping.html#%E5%8D%81%E3%80%81%E7%89%B9%E6%AE%8A%E5%8F%91%E8%B4%A7%E6%8A%A5%E5%A4%87)

```js
/**
 * 特殊发货报备
 */
let opspecialorderRes = await vk.openapi.weixin.order.opspecialorder({
  order_id: '123456',
  type: 1,
  delay_to: 1752035828,
});
```

## 物流接口@logistics

> vk-unicloud 版本 ≥ 2.19.2

### 获取支持的快递公司列表@logistics-getAllDelivery

`vk.openapi.weixin.logistics.getAllDelivery`

请求参数请查看[微信官方文档](https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/express/express-by-business/getAllDelivery.html)

```js
/**
 * 获取支持的快递公司列表
 */
let getAllDeliveryRes = await vk.openapi.weixin.logistics.getAllDelivery();
```

### 传运单接口@logistics-trace-waybill

`vk.openapi.weixin.logistics.traceWaybill`

介绍：该接口可以上报物流快递信息，然后配合[【查运单接口】](#logistics-query-follow-trace)可以查询快递物流配送轨迹信息。

此接口需要开通【物流消息】

![](https://cdn.fsq.pub/vkdoc/vk-client/da9009b2-9878-4f3a-97cb-1ce901494f86.png)

请求参数请查看[微信官方文档](https://developers.weixin.qq.com/miniprogram/dev/platform-capabilities/industry/express/business/express_open_msg.html#_4-1%E3%80%81%E4%BC%A0%E8%BF%90%E5%8D%95%E6%8E%A5%E5%8F%A3-follow-waybill)

```js
/**
 * 传运单接口
 */
let traceWaybillRes = await vk.openapi.weixin.logistics.traceWaybill({
  openid: 'ovtZW4yB7DIj3CxOb6ii-nk4HhFo',
  waybill_id: 'WXTESTEXPRESS0000014',
  sender_phone: '12345678901',
  receiver_phone: '123456566',
  delivery_id: 'KYSY',
  goods_info: {
    detail_list: [
      {
        goods_name: '测试名字',
        goods_img_url: 'www.qq.com',
      },
      {
        goods_name: '测试名字2',
        goods_img_url: 'www.qq.com',
      },
    ],
  },
});
```

### 查运单接口@logistics-query-follow-trace

`vk.openapi.weixin.logistics.queryFollowTrace`

介绍：该接口可以查询通过[【传运单接口】](#logistics-trace-waybill)上报的快递物流配送轨迹信息

此接口需要开通【物流消息】

![](https://cdn.fsq.pub/vkdoc/vk-client/da9009b2-9878-4f3a-97cb-1ce901494f86.png)

请求参数请查看[微信官方文档](https://developers.weixin.qq.com/miniprogram/dev/platform-capabilities/industry/express/business/express_open_msg.html#_4-2%E3%80%81%E6%9F%A5%E8%BF%90%E5%8D%95%E6%8E%A5%E5%8F%A3-query-follow-trace)

```js
/**
 * 查运单接口
 */
let queryFollowTraceRes = await vk.openapi.weixin.logistics.queryFollowTrace({
  waybill_token,
});
```

### 更新物品信息接口@logistics-updateFollowWaybillGoods

`vk.openapi.weixin.logistics.updateFollowWaybillGoods`

此接口需要开通【物流消息】

![](https://cdn.fsq.pub/vkdoc/vk-client/da9009b2-9878-4f3a-97cb-1ce901494f86.png)

请求参数请查看[微信官方文档](https://developers.weixin.qq.com/miniprogram/dev/platform-capabilities/industry/express/business/express_open_msg.html#_4-3%E3%80%81%E6%9B%B4%E6%96%B0%E7%89%A9%E5%93%81%E4%BF%A1%E6%81%AF%E6%8E%A5%E5%8F%A3-update-follow-waybill-goods)

```js
/**
 * 更新物品信息接口
 */
let updateFollowWaybillGoodsRes = await vk.openapi.weixin.logistics.updateFollowWaybillGoods({
  waybill_token: 'o_ARWHaxIxzWHmdui-AIw8SuE1QtaUZK8aUnZguAn1nsZ72ZjWlq8btV8j-wAc94',
  goods_info: {
    detail_list: [
      {
        goods_name: '测试更新商品',
        goods_img_url: 'www.qq.com',
      },
    ],
  },
});
```

## 微信小程序万能 API 调用接口@generalapi

**如果以上 API 不能满足你的需求，你可以使用这个万能 API**

```js
let requestRes = await vk.openapi.weixin.request({
  method: 'GET',
  url: 'wxaapi/newtmpl/gettemplate',
  data: {},
});
```

**请求参数**

| 参数      | 说明                                                              | 类型   | 默认值 | 可选值 |
| --------- | ----------------------------------------------------------------- | ------ | ------ | ------ |
| method    | 请求模式，分为 GET 和 POST（不区分大小写）                        | String | POST   | GET    |
| url       | 微信接口路径                                                      | String | -      | -      |
| data      | 请求数据                                                          | Object | -      | -      |
| appid     | 可不填，不填会自动从 uni-id 配置的 mp-weixin 节点里获取 appid     | String | -      | -      |
| appsecret | 可不填，不填会自动从 uni-id 配置的 mp-weixin 节点里获取 appsecret | String | -      | -      |

**url 参数详解**

以 `获取小程序 URL Link` 为例

**请求地址**

`POST` https://api.weixin.qq.com/`wxa/generate_urllink`?access_token=ACCESS_TOKEN

`method` 为 `POST`

`url` 为 `wxa/generate_urllink`

**最终代码**

```js
let requestRes = await vk.openapi.weixin.request({
  method: 'POST',
  url: 'wxa/generate_urllink',
  data: {
    path: 'pages/index/index',
  },
});
```

**公共返回参数**

| 参数 | 说明                     | 类型   |
| ---- | ------------------------ | ------ |
| code | 0 代表成功，其他均为失败 | Number |
| msg  | 失败时的提示内容         | String |

其他返回参数参考微信小程序服务端 API 文档 [传送门](https://developers.weixin.qq.com/miniprogram/dev/api-backend/)

## 多小程序调用@many

以上所有 API 均支持多加 2 个参数

| 参数      | 说明                                                              | 类型   |
| --------- | ----------------------------------------------------------------- | ------ |
| appid     | 可不填，不填会自动从 uni-id 配置的 mp-weixin 节点里获取 appid     | String |
| appsecret | 可不填，不填会自动从 uni-id 配置的 mp-weixin 节点里获取 appsecret | String |

1. 如果 `appid` 和 `appsecret` 均不填，则自动从 uni-id 配置的 mp-weixin 节点里获取 appid
2. 如果填了 `appid` 不填 `appsecret`，则 `appsecret` 会自动从这里找对应的值
