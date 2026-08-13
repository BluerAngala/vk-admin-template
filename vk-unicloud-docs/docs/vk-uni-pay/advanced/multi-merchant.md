---
sidebarDepth: 0
---

# 多商户（非服务商版）

**什么是多商户？**

当你的系统是由 N 个客户端组成（如 N 个小程序组成，类似 saas 系统），同时希望每个小程序的收款账户各自独立（即 A 小程序收款到 A 公司，B 小程序收款到 B 公司）此时需要多商户的支持。

或者是

当你的系统是 1 个类似淘宝、京东的平台，其他商户入驻你的平台，你希望每个入驻的商户的收款账户各自独立（即 A 商户收款到 A 公司，B 商户收款到 B 公司）此时需要多商户的支持。

在 `vk-uni-pay` 中，支持多商户（非服务商版），即就算你不是微信支付服务商，你也能做多商户收款了。

## 方案一：使用 pid 指定数据库配置 id@pid

你只需要将原本配置在 `common/uni-config-center/uni-pay/config.js` 中的支付配置改成存入数据库表 `vk-pay-config`，同时在 `vkPay.createPayment` 接口中多传一个参数 `pid` 即可

[传送门 - 支付配置表](https://vkdoc.fsq.pub/vk-uni-pay/db/vk-pay-config.html)

示例代码

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

## 方案二：使用 config_directory 指定配置目录@config-directory

通过 config_directory 指定配置所在目录

```js
const vkPay = require('vk-uni-pay');

exports.main = async (event, context) => {
  let res = await vkPay.createPayment({
    context,
    provider: 'alipay',
    data: {
      config_directory: 'xxx', // 使用 uni-config-center/uni-pay/xxx/config.js 的配置
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
