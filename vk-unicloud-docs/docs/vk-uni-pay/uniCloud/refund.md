---
sidebarDepth: 0
---

# 发起退款

## vkPay.refund

## 示例代码@demo

无框架下的云函数代码示例（该写法同时也适用于任何框架）

```js
const vkPay = require('vk-uni-pay');

exports.main = async (event, context) => {
  let refundRes = await vkPay.refund({
    out_trade_no: '商户支付订单号',
    refund_desc: '退款说明',
    refund_fee: '退款金额100=1元（单位分）如不填，则全额退款',
  });
  if (refundRes.code !== 0) {
    return refundRes;
  }
  let res = { code: 0, msg: '退款成功' };
  /**
   * 执行自己的订单退款逻辑
   * 此处建议只改下订单状态和写入异步任务队列表
   * 将消息发送、返佣扣除、业绩结算扣除等业务逻辑异步处理
   * 如开启定时器每隔5秒触发一次，处理订单
   */
  return res;
};
```

## 请求参数@params

| 参数          | 说明                                                 | 类型   | 默认值 | 可选值 |
| ------------- | ---------------------------------------------------- | ------ | ------ | ------ |
| out_trade_no  | 必填项，商户支付订单号，需自行保证全局唯一           | String | -      | -      |
| out_refund_no | 商户退款订单号（不填会自动生成），需自行保证全局唯一 | String | -      | -      |
| refund_desc   | 退款说明                                             | String | -      | -      |
| refund_fee    | 退款金额，100=1 元（单位分）如不填，则全额退款       | Number | -      | -      |

### out_refund_no

商户退款单号，不填会自动生成

自动生成规则：商户支付订单号-退款次数

如：你的 out_trade_no 是 20220101090012541213652，本次是第一次退款，则 out_refund_no = 20220101090012541213652-1

## 返回值@return

|    参数名     |  类型  |     说明     | 支持平台 |
| :-----------: | :----: | :----------: | :------: |
|  outTradeNo   | String |  商户订单号  |    -     |
| transactionId | String |  平台订单号  |    -     |
|  outRefundNo  | String | 商户退款单号 | 微信支付 |
|   refundId    | String | 平台退款单号 |    -     |
|   refundFee   | Number |  退款总金额  |    -     |
| cashRefundFee | Number | 现金退款金额 |    -     |

## 微信支付 v2 退款报错说明@q1

目前 hbx 本地调试和支付宝云云端均为 node18，而 node18 已废弃微信支付 v2 的 p12 证书，故建议改为微信支付 v3 版本，不要使用微信支付 v2 版本，详见配置 [传送门](https://vkdoc.fsq.pub/vk-uni-pay/config.html#%E5%BE%AE%E4%BF%A1%E6%94%AF%E4%BB%98)
