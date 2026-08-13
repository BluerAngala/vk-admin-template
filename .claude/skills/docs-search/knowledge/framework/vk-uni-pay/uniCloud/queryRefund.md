---
sidebarDepth: 0
---

# 查询退款状态

## vkPay.queryRefund

## 示例代码@demo

无框架下的云函数代码示例（该写法同时也适用于任何框架）

```js
const vkPay = require('vk-uni-pay');

exports.main = async (event, context) => {
  let res = await vkPay.queryRefund({
    out_trade_no: '商户支付订单号',
  });

  return res;
};
```

## 请求参数@params

| 参数         | 说明                                       | 类型   | 默认值 | 可选值 |
| ------------ | ------------------------------------------ | ------ | ------ | ------ |
| out_trade_no | 必填项，商户支付订单号，需自行保证全局唯一 | String | -      | -      |

## 返回值@return

|   参数名    |  类型  |             说明             |
| :---------: | :----: | :--------------------------: |
| queryResult | Object |     第三方支付返回的结果     |
|  orderInfo  | Object | 订单信息（只包含了部分信息） |
