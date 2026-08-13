---
sidebarDepth: 0
---

# 多商户（服务商版）

## 介绍

**什么是多商户？**

当你的系统是由 N 个客户端组成（如 N 个小程序组成，类似 saas 系统），同时希望每个小程序的收款账户各自独立（即 A 小程序收款到 A 公司，B 小程序收款到 B 公司）此时需要多商户的支持。

或者是

当你的系统是 1 个类似淘宝、京东的平台，其他商户入驻你的平台，你希望每个入驻的商户的收款账户各自独立（即 A 商户收款到 A 公司，B 商户收款到 B 公司）此时需要多商户的支持。

在 `vk-uni-pay` 中，支持多商户（服务商版）

注意：

1. 你需要先成为支付服务商，本文不介绍如何成为服务商，如果你现在还不是服务商，你也可以使用更简单的非服务商模式 [传送门 - 非服务商模式的多商户](https://vkdoc.fsq.pub/vk-uni-pay/advanced/multi-merchant.html)
2. 服务商模式下，无法使用转账功能（微信和支付宝限制的）

## 微信服务商

> vk-pay 的版本需 >= 1.10.0

**配置**

配置 `common/uni-config-center/uni-pay/config.js` 中的参数使用服务商的密钥和证书

注意：微信服务商的配置和普通商户一样，但里面的 appId 等都是用服务商的，而不是用子商户的 [传送门 - 支付配置](https://vkdoc.fsq.pub/vk-uni-pay/config.html)

**使用**

`vkPay.createPayment` 接口中多传两个参数 `sub_appid` 和 `sub_mchid` 即可

注意：

1. `sub_mchid` 必传
2. 如果 `openid` 是子商户小程序的，则 `sub_appid` 必传，如果 `openid` 是服务商小程序的，则 `sub_appid` 不传。
3. 服务商必须要有一个绑定了服务商商户且已微信认证的微信公众号或微信小程序（主体是服务商公司的，此公众号或小程序的 appId 就是服务商的 appId，只需要一个即可，服务商支付配置里都用这个 appId）
4. `sp_appid` 和 `sp_mchid` 这 2 个参数是配置在支付配置里的 `appId` 和 `mchId`，不需要单独传，也不需要把配置里的参数改名成 `sp_appid`，只需要配置 `appId` 和 `mchId`，插件会自动识别并转化
5. 服务商模式下，组件页面上的 `autoGetOpenid` 必须设置为 `false`，而用户的 `openid` 需要自己传

```js
const vkPay = require('vk-uni-pay');

exports.main = async (event, context) => {
  let res = await vkPay.createPayment({
    context,
    provider: 'wxpay',
    data: {
      sub_appid: 'xxxxxxx', // 子商户appid（注意，此appid必须绑定在子商户商户号下）
      sub_mchid: 'xxxxxxx', // 子商户商户号（注意，此商户号必须绑定在服务商名下）
      openid: '用户openid，小程序支付时必传',
      out_trade_no: '必填项，商户支付订单号，需自行保证全局唯一',
      total_fee: 1, // 订单金额(单位分 100 = 1元)
      subject: '订单标题',
      type: '订单类型如recharge（充值订单）、goods（商品订单）、vip（会员订单）等。', // 此处type的值如果是goods，则回调时就会执行 pay-notify 目录下的 goods.js 内的逻辑
      // 自定义回调数据，能在回调事件获取到以下数据，回调函数中通过 let { out_trade_no, user_id, recharge_balance } = data;方式获取（不可与data内的一级属性名重复）
      custom: {},
      // 微信、支付宝文档上的其他选填参数（other内的参数会原样发送给微信、支付宝）
      other: {},
    },
  });

  return res;
};
```

## 支付宝服务商

> vk-pay 的版本需 >= 1.10.0

**配置**

配置 `common/uni-config-center/uni-pay/config.js` 中的参数使用服务商的密钥和证书

注意：支付宝服务商的配置和普通商户一样 [传送门 - 支付配置](https://vkdoc.fsq.pub/vk-uni-pay/config.html)

**使用**

`vkPay.createPayment` 接口中多传一个参数 `app_auth_token` 即可

**什么是 `app_auth_token`**

`app_auth_token` 是子商户的授权 token，可在支付宝服务商后台看到，直接复制过来即可。

示例代码

```js
const vkPay = require('vk-uni-pay');

exports.main = async (event, context) => {
  let res = await vkPay.createPayment({
    context,
    provider: 'alipay',
    data: {
      app_auth_token: 'xxxxxxxxxxxx', // 子商户的授权token（若不传，会尝试从配置去获取）
      openid: '用户openid，小程序支付时必传',
      out_trade_no: '必填项，商户支付订单号，需自行保证全局唯一',
      total_fee: 1, // 订单金额(单位分 100 = 1元)
      subject: '订单标题',
      type: '订单类型如recharge（充值订单）、goods（商品订单）、vip（会员订单）等。', // 此处type的值如果是goods，则回调时就会执行 pay-notify 目录下的 goods.js 内的逻辑
      // 自定义回调数据，能在回调事件获取到以下数据，回调函数中通过 let { out_trade_no, user_id, recharge_balance } = data;方式获取（不可与data内的一级属性名重复）
      custom: {},
      // 微信、支付宝文档上的其他选填参数（other内的参数会原样发送给微信、支付宝）
      other: {},
    },
  });

  return res;
};
```

### 支付宝小程序特殊参数

服务商模式下，支付宝小程序支付需要在 other 参数里额外传以下参数，同时注释掉原本的 openid 参数

```js
const vkPay = require("vk-uni-pay");

exports.main = async (event, context) => {

  let res = await vkPay.createPayment({
    context,
    provider: "alipay",
    data: {
      app_auth_token: "xxxxxxxxxxxx", // 子商户的授权token（若不传，会尝试从配置去获取）
      //openid: "用户openid，小程序支付时必传", // 服务商这里的openid不传
      out_trade_no: "必填项，商户支付订单号，需自行保证全局唯一",
      total_fee: 1, // 订单金额(单位分 100 = 1元)
      subject: "订单标题",
      type: "订单类型如recharge（充值订单）、goods（商品订单）、vip（会员订单）等。", // 此处type的值如果是goods，则回调时就会执行 pay-notify 目录下的 goods.js 内的逻辑
      // 自定义回调数据，能在回调事件获取到以下数据，回调函数中通过 let { out_trade_no, user_id, recharge_balance } = data;方式获取（不可与data内的一级属性名重复）
      custom:{

      },
      // 微信、支付宝文档上的其他选填参数（other内的参数会原样发送给微信、支付宝）
      other:{
        product_code: "JSAPI_PAY",
        op_app_id: "实际唤起支付的小程序appid"，
        op_buyer_open_id: "实际唤起支付的小程序对应的用户的openid"
      }
    }
  });

  return res;
};
```

## 常见问题

### 为什么小程序报 code 无效或 openid 无效？

小程序支付必传 openid，而默认插件会自动获取用户的 openid，但是在服务商模式下，用户的 openid 需要自己获取，因此需要将支付组件属性 `autoGetOpenid` 的值设置为 false，同时在 `createPayment` 时主动传入当前用户的 openid

### 微信服务商的配置正确，但依然报 appid 和 mch_id 不匹配的错误？

前往微信服务商后台，关联 appid

![](https://mp-cf0c5e69-620c-4f3c-84ab-f4619262939f.cdn.bspapp.com/vk-doc/402.png)
