---
sidebarDepth: 0
---

# 获取支付参数

## vkPay.createPayment

## 示例代码@demo

无框架下的云函数代码示例（该写法同时也适用于任何框架）

```js
const vkPay = require('vk-uni-pay');

exports.main = async (event, context) => {
  let res = await vkPay.createPayment({
    context,
    provider: 'alipay',
    data: {
      openid: '用户openid，小程序支付时必传',
      out_trade_no: '必填项，商户支付订单号，需自行保证全局唯一',
      total_fee: 1, // 订单金额（单位分 100 = 1元）
      subject: '订单标题',
      type: 'recharge', // 订单类型如recharge（充值订单）、goods（商品订单）、vip（会员订单）等，此处type的值如果是recharge，则回调时就会执行 pay-notify 目录下的 recharge.js 内的逻辑
      // 自定义回调数据，能在回调事件获取到以下数据，回调函数中通过 let { out_trade_no, user_id, recharge_balance } = data;方式获取（不可与data内的一级属性名重复）
      custom: {},
      // 微信、支付宝文档上的其他选填参数（other内的参数会原样发送给微信、支付宝）
      other: {},
    },
  });

  return res;
};
```

## 请求参数@params

| 参数       | 说明                                                                                                                                                                                                                                                                                                                                                                               | 类型    | 默认值 | 可选值                                                         |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------ | -------------------------------------------------------------- |
| context    | 客户端请求环境，用于自动识别支付方式，如识别是小程序支付还是 APP 支付还是 H5 支付等等 [详情](#context-参数)                                                                                                                                                                                                                                                                        | Object  | -      | -                                                              |
| provider   | 支付供应商：<br/>wxpay：微信支付官方 <br/>alipay：支付宝支付官方 <br/>appleiap：IOS 内购支付 [详情](https://vkdoc.fsq.pub/vk-uni-pay/iosiap.html) <br/>vkspay：VksPay 个人支付 [详情](https://vkdoc.fsq.pub/vk-uni-pay/vkspay.html) <br/>wxpay-virtual：微信小程序虚拟支付 [详情](https://vkdoc.fsq.pub/vk-uni-pay/wxpay-virtual.html) <br/>douyin：抖音支付 <br/>huawei：华为支付 | String  | -      | wxpay、alipay、appleiap、vkspay、wxpay-virtual、douyin、huawei |
| isPC       | 如果是 PC 扫码支付，则设为 true（使用支付组件时，组件会自动上传 isPC 的参数）                                                                                                                                                                                                                                                                                                      | Boolean | false  | true                                                           |
| needQRcode | 是否强制使用二维码支付（让顾客扫码支付，一般用于物联网，如按摩椅上的扫码支付） [详情](#needqrcode-强制使用二维码支付模式)                                                                                                                                                                                                                                                          | Boolean | false  | true                                                           |
| data       | 订单数据 [详情](#data-参数)                                                                                                                                                                                                                                                                                                                                                        | Object  | -      |                                                                |

### data 参数@params-data

| 参数               | 说明                                                                                                                                                                                                                                                                                                                     | 类型   | 默认值 | 可选值 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ------ | ------ |
| openid             | 用户 openid，小程序支付和微信公众号支付时必传                                                                                                                                                                                                                                                                            | String | -      | -      |
| out_trade_no       | 必填项，商户支付订单号，需自行保证全局唯一                                                                                                                                                                                                                                                                               | String | -      | -      |
| total_fee          | 订单金额（单位分 100 = 1 元）                                                                                                                                                                                                                                                                                            | Number | -      | -      |
| subject            | 订单标题                                                                                                                                                                                                                                                                                                                 | String | -      | -      |
| type               | 订单类型如 recharge（充值订单）、goods（商品订单）、vip（会员订单）等。                                                                                                                                                                                                                                                  | String | -      | -      |
| custom             | 自定义数据，不可与外部已有字段重名（custom 内的参数不会发送给微信、支付宝）                                                                                                                                                                                                                                              | Object | -      | -      |
| other              | 微信、支付宝文档上的其他选填参数（other 内的参数会原样发送给微信、支付宝）                                                                                                                                                                                                                                               | Object | -      | -      |
| pid                | 多商户模式下的自定义商户 id（等于 vk-pay-config 表的\_id）[查看 vk-pay-config 表](https://vkdoc.fsq.pub/vk-uni-pay/db/vk-pay-config.html)，与 `config_directory` 二选一                                                                                                                                                  | String | -      | -      |
| `config_directory` | 多商户模式下的配置所在目录，与 pid 二选一                                                                                                                                                                                                                                                                                | String | -      | -      |
| user_id            | 用户 id（选填）                                                                                                                                                                                                                                                                                                          | String | -      | -      |
| nickname           | 用户昵称（选填）                                                                                                                                                                                                                                                                                                         | String | -      | -      |
| return_url         | 手机端同步回调地址，仅`provider=vkspay`时生效（选填）                                                                                                                                                                                                                                                                    | String | -      | -      |
| time_expire        | 指定支付截至时间，13 位时间戳格式（选填）                                                                                                                                                                                                                                                                                | Number | -      | -      |
| auth_code          | 用户的付款码                                                                                                                                                                                                                                                                                                             | String | -      | -      |
| store_id           | 微信支付 v3 必填，付款码支付时的门店 id                                                                                                                                                                                                                                                                                  | String | -      | -      |
| biz_type           | 华为支付必填，业务类型，注意类型是字符串 <br/>100001：虚拟商品购买<br/>100002：实物商品购买<br/>100003：预付类账号充值<br/>100004：航旅交通服务<br/>100005：活动票务订购<br/>100006：商业服务消费<br/>100007：生活服务消费<br/>100008：租金缴纳<br/>100009：会员费缴纳<br/>100011：其他商家消费<br/>100037：公共便民服务 | String | -      | -      |

**out_trade_no**

商户支付订单号 out_trade_no 参数说明：

- 用于根据 out_trade_no 查订单状态、发起退款等接口需要。
- 同时该订单号需保证全局唯一。
- 通常情况下，支付订单号就是你系统的订单表的订单号或订单表的\_id
- 假设你的订单号是：2107151010101541001
- 但如果你的订单分多次付款（如预付款，尾款等，则需要分别创建不同的支付订单号，如 pre2107151010101541001、due2107151010101541001，也可以是 2107151010101541001-1、2107151010101541001-2）
- 对未支付的订单再次发起支付时，商户应该使用原单号发起，不要更换支付单号，避免用户重复支付。

**time_expire**

time_expire 的值是时间戳，如 `time_expire: Date.now() + 1000*60` 代表 60 秒后过期

建议 time_expire 的值在 1-10 分钟内

**注意：**

1. provider=wxpay 时，time_expire 的扫码支付最短时间是 1 分钟，其他是 5 分钟
2. provider=alipay 时，time_expire 的最短时间是 1 秒
3. provider=appleiap 时，不支持此参数
4. provider=vkspay 时，不支持此参数

### context 参数@params-context

1. VK 云函数传 `originalParam.context`
2. VK 云对象传 `this.getClientInfo()`
3. 官方云函数传 `context`
4. 官方云对象传如下格式

```js
context: {
  "APPID": "", // DCloudAppId
  "PLATFORM": "", // mp-weixin 微信小程序，h5，app-plus 等条件编译的平台字符串
  "CLIENTIP": "127.0.0.1", // ip
  "CLIENTUA": "HBuilderX", // ua（仅h5支付需要）
  "SPACEINFO": {
    "spaceId": "mp-70255e58-5282-4b64-941f-006c17c560c8", // 空间id
  }
}
```

## 返回值@return

|    参数名    |  类型   |                                         说明                                         |
| :----------: | :-----: | :----------------------------------------------------------------------------------: |
|  orderInfo   | Object  |                 用于发起支付的订单信息（不同的付款方式返回的值不同）                 |
| out_trade_no | String  |                               本次交易的商户支付订单号                               |
|   provider   | String  |                                 本次交易的支付供应商                                 |
|   pay_type   | String  |                                  本次交易的付款方式                                  |
|  needQRcode  | Boolean |                             本次交易的是否是扫码支付模式                             |
| qrcodeImage  | String  | 如果是扫码支付，且设置了`needQRcode:'image'`，则会返回此字段，代表二维码的 base64 值 |
|  total_fee   | Number  |               本次交易的付款金额（单位分 100 = 1 元）（新增于 1.11.3）               |
|   platform   | String  |                     发起支付时的客户端运行环境（新增于 1.11.3）                      |

## 常见问题@question

### 推荐支付交互流程@q1

以电商下单为例

1. 【前端】提交购买的产品和数量到【云端】
2. 【云端】生成业务订单，假设订单号为 001，返回给【前端】
3. 【前端】进入付款页面，选择微信支付或支付宝支付，提交【云端】
4. 【云端】先根据订单号 001 查询到订单金额，再传给 vkPay.createPayment，注意，这里的金额不是前端传的，而是从你数据库的业务订单表中获取的，保证金额不被篡改，执行 vkPay.createPayment 后返回给前端支付信息
5. 【前端】vk-uni-pay 组件会自动响应支付信息并唤起支付
6. 【云端】用户支付成功后，接收异步回调，执行自定义回调逻辑

### pid（多商户模式）@q2

通过 pid 指定使用表 vk-pay-config 的哪个 \_id 配置

```js
const vkPay = require('vk-uni-pay');

exports.main = async (event, context) => {
  let res = await vkPay.createPayment({
    context,
    provider: 'alipay',
    data: {
      pid: '001', // 使用vk-pay-config表_id为001的商户配置
      openid: '用户openid，小程序支付时必传',
      out_trade_no: '必填项，商户支付订单号，需自行保证全局唯一',
      total_fee: 1, // 订单金额（单位分 100 = 1元）
      subject: '订单标题',
      type: 'recharge', // 订单类型如recharge（充值订单）、goods（商品订单）、vip（会员订单）等，此处type的值如果是recharge，则回调时就会执行 pay-notify 目录下的 recharge.js 内的逻辑
      // 自定义回调数据，能在回调事件获取到以下数据，回调函数中通过 let { out_trade_no, user_id, recharge_balance } = data;方式获取（不可与data内的一级属性名重复）
      custom: {},
      // 微信、支付宝文档上的其他选填参数（other内的参数会原样发送给微信、支付宝）
      other: {},
    },
  });

  return res;
};
```

### config_directory（多商户模式）@q8

通过 config_directory 指定配置所在目录

```js
const vkPay = require('vk-uni-pay');

exports.main = async (event, context) => {
  let res = await vkPay.createPayment({
    context,
    provider: 'alipay',
    data: {
      config_directory: 'xxx', // 使用 uni-config-center/uni-pay/${config_directory}/config.js 的配置
      openid: '用户openid，小程序支付时必传',
      out_trade_no: '必填项，商户支付订单号，需自行保证全局唯一',
      total_fee: 1, // 订单金额（单位分 100 = 1元）
      subject: '订单标题',
      type: 'recharge', // 订单类型如recharge（充值订单）、goods（商品订单）、vip（会员订单）等，此处type的值如果是recharge，则回调时就会执行 pay-notify 目录下的 recharge.js 内的逻辑
      // 自定义回调数据，能在回调事件获取到以下数据，回调函数中通过 let { out_trade_no, user_id, recharge_balance } = data;方式获取（不可与data内的一级属性名重复）
      custom: {},
      // 微信、支付宝文档上的其他选填参数（other内的参数会原样发送给微信、支付宝）
      other: {},
    },
  });

  return res;
};
```

### needQRcode（强制使用二维码支付模式）@q3

给 vue 页面使用时，传 `needQRcode:true`

```js
const vkPay = require('vk-uni-pay');

exports.main = async (event, context) => {
  let res = await vkPay.createPayment({
    context,
    provider: 'alipay',
    needQRcode: true, // 前端页面是vue时，传true
    data: {
      openid: '用户openid，小程序支付时必传',
      out_trade_no: '必填项，商户支付订单号，需自行保证全局唯一',
      total_fee: 1, // 订单金额（单位分 100 = 1元）
      subject: '订单标题',
      type: 'recharge', // 订单类型如recharge（充值订单）、goods（商品订单）、vip（会员订单）等，此处type的值如果是recharge，则回调时就会执行 pay-notify 目录下的 recharge.js 内的逻辑
      // 自定义回调数据，能在回调事件获取到以下数据，回调函数中通过 let { out_trade_no, user_id, recharge_balance } = data;方式获取（不可与data内的一级属性名重复）
      custom: {},
      // 微信、支付宝文档上的其他选填参数（other内的参数会原样发送给微信、支付宝）
      other: {},
    },
  });

  return res;
};
```

给 nvue 页面使用时，传 `needQRcode:'image'`

```js
const vkPay = require('vk-uni-pay');

exports.main = async (event, context) => {
  let res = await vkPay.createPayment({
    context,
    provider: 'alipay',
    needQRcode: 'image', // 前端页面是nvue时，传 "image"
    data: {
      openid: '用户openid，小程序支付时必传',
      out_trade_no: '必填项，商户支付订单号，需自行保证全局唯一',
      total_fee: 1, // 订单金额（单位分 100 = 1元）
      subject: '订单标题',
      type: 'recharge', // 订单类型如recharge（充值订单）、goods（商品订单）、vip（会员订单）等，此处type的值如果是recharge，则回调时就会执行 pay-notify 目录下的 recharge.js 内的逻辑
      // 自定义回调数据，能在回调事件获取到以下数据，回调函数中通过 let { out_trade_no, user_id, recharge_balance } = data;方式获取（不可与data内的一级属性名重复）
      custom: {},
      // 微信、支付宝文档上的其他选填参数（other内的参数会原样发送给微信、支付宝）
      other: {},
    },
  });

  return res;
};
```

### 支付宝小程序支付使用新版 JSAPI 接口@q4

支付宝官方公告：2024 年 4 月 1 日起，小程序必须使用专用支付产品（JSAPI 支付），否则可能影响支付功能。

只需要在 `other` 内额外增加一个参数 `product_code: "JSAPI_PAY"` 即可，如下示例 如果还是不能支付，来 Q 群解决：22466457

```js
const vkPay = require('vk-uni-pay');

exports.main = async (event, context) => {
  let res = await vkPay.createPayment({
    context,
    provider: 'alipay',
    data: {
      openid: '用户openid，小程序支付时必传',
      out_trade_no: '必填项，商户支付订单号，需自行保证全局唯一',
      total_fee: 1, // 订单金额（单位分 100 = 1元）
      subject: '订单标题',
      type: 'recharge', // 订单类型如recharge（充值订单）、goods（商品订单）、vip（会员订单）等，此处type的值如果是recharge，则回调时就会执行 pay-notify 目录下的 recharge.js 内的逻辑
      // 自定义回调数据，能在回调事件获取到以下数据，回调函数中通过 let { out_trade_no, user_id, recharge_balance } = data;方式获取（不可与data内的一级属性名重复）
      custom: {},
      // 微信、支付宝文档上的其他选填参数（other内的参数会原样发送给微信、支付宝）
      other: {
        product_code: 'JSAPI_PAY',
      },
    },
  });

  return res;
};
```

### 支付宝小程序支付失败，报获取支付宝账号失败@q5

因 uni-id 只支持 userid 模式，不支持 openid 模式，故需要前往支付宝开放平台，小程序应用-开发设置-openid 配置管理-设置-申诉为 userid 模式，操作步骤如下，操作完后需等待支付宝审核通过，并点击切换到 uid 作为用户标识后才能正常使用。

![](https://cdn.fsq.pub/vkdoc/vk-client/4ea34ab1-a274-4a11-8f07-b14c7e46365f.png)

![](https://cdn.fsq.pub/vkdoc/vk-client/20f0215c-8462-4dc0-8e4f-58fbb3a8503b.png)

![](https://cdn.fsq.pub/vkdoc/vk-client/6237e551-7e95-4d4e-8f08-807837392788.png)

申诉通过后，还需要再次点下-开发设置-openid 配置管理-设置-切换到 uid 作为用户标识

![](https://cdn.fsq.pub/vkdoc/vk-client/8a6fdf61-0b34-4a12-b3aa-8bdb646f035a.png)

![](https://cdn.fsq.pub/vkdoc/vk-client/b3ca531f-0ec3-4051-98d4-6ab1faa8f732.png)

![](https://cdn.fsq.pub/vkdoc/vk-client/379a5b81-3479-469c-9d3b-266a5c650692.png)

### 支付宝小程序支付失败，报请开启 API 代理@q6

点击 IDE，这里把代理开起来，会弹出一个二维码，手机扫码后 IDE 上点击支付手机上就会弹支付弹窗了，或者直接用真机调试即可。

![](https://cdn.fsq.pub/vkdoc/vk-pay/c92c4298-5d0a-475e-bd8f-8f9e1ee78115.png)

![](https://cdn.fsq.pub/vkdoc/vk-pay/6e4360f1-693d-446e-aded-37fdae3de501.png)

### 商家扫用户付款码支付@q7

> vk-pay 的版本需 >= 1.14.0

```js
const vkPay = require('vk-uni-pay');

exports.main = async (event, context) => {
  let res = await vkPay.createPayment({
    context,
    provider: 'alipay',
    data: {
      auth_code: '用户的付款码', // 付款码
      store_id: '001', // 付款码支付的门店id（微信支付v3必填）
      out_trade_no: '必填项，商户支付订单号，需自行保证全局唯一', // 这里可以填和付款码一样，因为一个out_trade_no只能和一个auth_code发起支付，即使支付失败或取消支付，也需要更换out_trade_no
      total_fee: 1, // 订单金额（单位分 100 = 1元）
      subject: '订单标题',
      type: 'recharge', // 订单类型如recharge（充值订单）、goods（商品订单）、vip（会员订单）等，此处type的值如果是recharge，则回调时就会执行 pay-notify 目录下的 recharge.js 内的逻辑
      // 自定义回调数据，能在回调事件获取到以下数据，回调函数中通过 let { out_trade_no, user_id, recharge_balance } = data;方式获取（不可与data内的一级属性名重复）
      custom: {},
      // 微信、支付宝文档上的其他选填参数（other内的参数会原样发送给微信、支付宝）
      other: {},
    },
  });

  return res;
};
```

前端完整示例页面请查看 `/pages/index/codepay.vue`，请一定要先运行示例页面进行体验，支付成功后，再根据示例页面代码集成到自己项目。

**配置节点**

微信支付：`wxpay.codepay`

支付宝：`alipay.codepay`

[查看完整支付配置](https://vkdoc.fsq.pub/vk-uni-pay/config.html)

**如何区分付款码是微信支付还是支付宝支付的?**

```js
// 识别用户付款码类型
const getAuthCodeProvider = (code) => {
  if (!code) {
    return;
  }
  if (!/^\d+$/.test(code)) {
    return;
  }
  // 微信支付用户付款码规则：18位纯数字，前缀以10、11、12、13、14、15开头
  if (code.length === 18 && ['10', '11', '12', '13', '14', '15'].includes(code.substring(0, 2))) {
    return 'wxpay';
  }
  // 支付宝用户付款码规则：16-24位纯数字，前缀以 25-30 开头
  if (code.length >= 16 && code.length <= 24 && ['25', '26', '27', '28', '29', '30'].includes(code.substring(0, 2))) {
    return 'alipay';
  }
  return;
};

let provider = getAuthCodeProvider('133821125287601700');
console.log('provider: ', provider);
```

**注意事项**

1. 当 `vkPay.createPayment` 接口内传了参数 `auth_code`，即代表使用付款码支付
2. 付款码支付时，`out_trade_no` 和 `auth_code` 是一对一关系，且同一个 `auth_code` 只能发起一次支付，也代表着同一个 `out_trade_no` 也只能发起一次支付
3. 如果订单付款失败再次发起支付需要更换 `out_trade_no`，请做好 `out_trade_no` 和你业务系统订单号的关联关系
4. 微信支付 v3 接口必须传参数 store_id，否则会报错，store_id 的值是门店 id，目前可以随便填，比如填 "001"，如果在微信支付的门店管理里有提交真实的店铺，建议填真实的门店编号
5. 微信支付的付款码支付成功没有异步回调，但自 `1.14.0` 版本起，新增了[主动触发回调模式](https://vkdoc.fsq.pub/vk-uni-pay/uniCloud/queryPayment.html#%E4%B8%BB%E5%8A%A8%E6%89%A7%E8%A1%8C%E5%9B%9E%E8%B0%83%E5%87%BD%E6%95%B0)，前端 vk-uni-pay 组件设置 `:await-notify="true"` 即可开启
6. 支付宝的付款码支付无法监听到用户取消支付，不过小金额支付时，支付宝大概率是免密直接支付
7. 微信支付会风控，一般没有真实线下交易场景的商户进行付款码支付的时候，即使支付 1 分钱，用户大概率也是需要等待用户输入密码的
8. 如果出现需要支付密码，跟插件无关，是支付公司风控的
