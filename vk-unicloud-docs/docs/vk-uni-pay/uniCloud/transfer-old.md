---
sidebarDepth: 0
---

# 单笔转账到支付宝或微信（旧版）

:::warning 重要通知

此为旧版本接口文档，vk-uni-pay 版本 ≥ 1.16.0 时，请查看 [新版本文档](https://vkdoc.fsq.pub/vk-uni-pay/uniCloud/transfer.html)

:::

## vkPay.transfer

## 支付宝

**注意**

需要申请开通支付宝支付的【转账到支付宝账户】接口，如下图所示

![](https://mp-cf0c5e69-620c-4f3c-84ab-f4619262939f.cdn.bspapp.com/vk-doc/424.png)

```js
const vkPay = require('vk-uni-pay');

let transferRes = await vkPay.transfer({
  account: '对方支付宝账号',
  real_name: '对方真实姓名',
  amount: 10, // 100=1元（单位分）
  title: '提现到支付宝',
  pay_type: 'alipay',
  remark: '转账备注',
  out_biz_no: '转账单号',
  payer_use_alias: true, // 是否展示付款方别名，为true将展示商家支付宝在商家中心 商户信息 > 商户基本信息 页面配置的 商户别名
});
if (transferRes.code === 0) {
  // 转账成功后的逻辑
} else {
  // 转账失败后的逻辑
}
```

### 请求参数

| 参数               | 说明                                                                                                                                       | 类型    | 默认值 | 可选值        |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | ------- | ------ | ------------- |
| account            | 对方支付宝账号或支付宝的会员 ID                                                                                                            | String  | -      | -             |
| real_name          | 对方真实姓名                                                                                                                               | String  | -      | -             |
| amount             | 转账金额 100=1 元(单位分)，金额最低 0.1 元，也就是 amount >= 10                                                                            | Number  | -      | -             |
| title              | 转账标题                                                                                                                                   | String  | -      | -             |
| pay_type           | wxpay：微信支付 alipay：支付宝支付                                                                                                         | String  | -      | wxpay、alipay |
| remark             | 转账备注                                                                                                                                   | String  | -      | -             |
| out_biz_no         | 转账单号                                                                                                                                   | String  | -      | -             |
| check_name         | 是否需要检测真实姓名                                                                                                                       | Boolean | true   | false         |
| pid                | 多商户模式下的自定义商户 id（等于 vk-pay-config 表的\_id） [查看 vk-pay-config 表](https://vkdoc.fsq.pub/vk-uni-pay/db/vk-pay-config.html) | String  | -      | -             |
| `config_directory` | 多商户模式下的配置所在目录，与 pid 二选一                                                                                                  | String  | -      | -             |
| payer_use_alias    | 是否展示付款方别名，为 true 将展示商家支付宝在商家中心 商户信息 > 商户基本信息 页面配置的 商户别名                                         | Boolean | false  | true          |

## 微信 v2

**注意**

需要申请开通微信支付的【企业付款到零钱】接口（只有以前的老商户才有这个接口），如下图所示

![](https://mp-cf0c5e69-620c-4f3c-84ab-f4619262939f.cdn.bspapp.com/vk-doc/423.png)

无框架下的云函数代码示例（该写法同时也适用于任何框架）

```js
const vkPay = require('vk-uni-pay');

let transferRes = await vkPay.transfer({
  openid: '对方的openid',
  real_name: '对方真实姓名', // 若check_name=true,则real_name必填
  check_name: false, // 是否需要检测真实姓名
  amount: 10, // 100=1元（单位分）
  title: '提现到微信零钱',
  pay_type: 'wxpay',
  platform: 'mp-weixin',
  remark: '转账备注',
  out_biz_no: '转账单号',
});
if (transferRes.code === 0) {
  // 转账成功后的逻辑
} else {
  // 转账失败后的逻辑
}
```

### 请求参数

| 参数            | 说明                                                                                                                                       | 类型    | 默认值 | 可选值                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------- | ------ | ----------------------- |
| real_name       | 对方真实姓名                                                                                                                               | String  | -      | -                       |
| amount          | 转账金额 100=1 元(单位分)，金额最低 0.1 元，也就是 amount >= 10                                                                            | Number  | -      | -                       |
| title           | 转账标题                                                                                                                                   | String  | -      | -                       |
| pay_type        | wxpay：微信支付 alipay：支付宝支付                                                                                                         | String  | -      | wxpay、alipay           |
| remark          | 转账备注                                                                                                                                   | String  | -      | -                       |
| out_biz_no      | 转账单号                                                                                                                                   | String  | -      | -                       |
| check_name      | 是否需要检测真实姓名                                                                                                                       | Boolean | true   | false                   |
| openid          | 用户的 openid                                                                                                                              | String  | -      | -                       |
| platform        | 平台类型：app-plus、mp-weixin，用于获取对应平台的支付配置信息                                                                              | String  | -      | app-plus、mp-weixin、h5 |
| pid             | 多商户模式下的自定义商户 id（等于 vk-pay-config 表的\_id） [查看 vk-pay-config 表](https://vkdoc.fsq.pub/vk-uni-pay/db/vk-pay-config.html) | String  | -      | -                       |
| payer_use_alias | 支付宝专用 - 是否展示付款方别名，为 true 将展示商家支付宝在商家中心 商户信息 > 商户基本信息 页面配置的 商户别名                            | Boolean | false  | true                    |

## 微信 v3

> vk-pay 的版本需 >= 1.14.1

**注意**

需要申请开通微信支付的【商家转账到零钱】接口，如下图所示

![](https://mp-cf0c5e69-620c-4f3c-84ab-f4619262939f.cdn.bspapp.com/vk-doc/422.png)

### 单笔模式

```js
const vkPay = require('vk-uni-pay');

let transferRes = await vkPay.transfer({
  //real_name: "真实姓名", // 真实姓名 大于2000元的转账需要填写真实姓名
  amount: 1, // 100=1元(单位分)
  title: '转账',
  pay_type: 'wxpay',
  openid: 'oJEy94iPPehudfKiHmdmaJqNOVD8',
  remark: '转账备注',
  out_biz_no: 'test' + new Date().getTime(), // 转账单号（请自己控制全局唯一）
  version: 3, // 固定3，代表使用v3版本
});
if (transferRes.code === 0) {
  // 转账成功后的逻辑
} else {
  // 转账失败后的逻辑
}
```

#### 请求参数

| 参数       | 说明                                                                                                                                               | 类型   | 默认值 | 可选值 |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------ | ------ |
| real_name  | 【特殊选填】对方真实姓名（转账大于 2000 元时必填）                                                                                                 | String | -      | -      |
| amount     | 【必填】转账金额 100=1 元(单位分)，金额最低 0.1 元，也就是 amount >= 10                                                                            | Number | -      | -      |
| title      | 【必填】转账标题                                                                                                                                   | String | -      | -      |
| pay_type   | 【必填】固定 wxpay                                                                                                                                 | String | -      | wxpay  |
| remark     | 【必填】转账备注                                                                                                                                   | String | -      | -      |
| out_biz_no | 【必填】转账单号                                                                                                                                   | String | -      | -      |
| openid     | 【必填】微信专用 - 用户的 openid，需要与配置中的 appid 对应或与 appid 参数对应                                                                     | String | -      | -      |
| appid      | 【选填】手动传 appid，不填则自动从配置中获取                                                                                                       | String | -      | -      |
| platform   | 【选填】若传了 platform，且没传 appid，则 appid 从指定的 platform 中获取                                                                           | String | -      | -      |
| pid        | 【选填】多商户模式下的自定义商户 id（等于 vk-pay-config 表的\_id） [查看 vk-pay-config 表](https://vkdoc.fsq.pub/vk-uni-pay/db/vk-pay-config.html) | String | -      | -      |

### 批量模式

```js
const vkPay = require('vk-uni-pay');
let out_biz_no = 'test' + new Date().getTime();
let transfer_detail_list = [
  {
    out_detail_no: out_biz_no + '1', // 该用户的转账子单号
    transfer_amount: 50, // 该用户的转账金额 单位为分 100 = 1元
    transfer_remark: '关羽的报销单', // 该用户的转账备注
    openid: 'xxxxxxxx', // 该用户的openid
    //user_name: "关羽",
  },
  {
    out_detail_no: out_biz_no + '2', // 该用户的转账子单号
    transfer_amount: 50, // 该用户的转账金额 单位为分 100 = 1元
    transfer_remark: '张飞的报销单', // 该用户的转账备注
    openid: 'xxxxxxxx', // 该用户的openid
    //user_name: "张飞",
  },
];
let transferRes = await vkPay.transfer({
  out_biz_no, // 转账单号（请自己控制全局唯一）
  batch_name: '2022年8月员工报销单', // 本次批量转账的名称
  batch_remark: '2022年8月员工报销单', // 本次批量转账的备注
  total_amount: 100, // 本次批量转账共转金额 单位为分 100 = 1元
  total_num: transfer_detail_list.length, // 本次批量转账共几笔
  transfer_detail_list, // 本次批量转账详情
  pay_type: 'wxpay', // 固定 wxpay
  version: 3, // 固定3，代表使用v3版本
});

if (transferRes.code === 0) {
  // 转账成功后的逻辑
} else {
  // 转账失败后的逻辑
}
```

#### 请求参数

| 参数                 | 说明                                                                                                                                       | 类型   | 默认值 | 可选值 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ------ | ------ |
| appid                | 手动传 appid，不填则自动从配置中获取                                                                                                       | String | -      | -      |
| out_biz_no           | 转账单号                                                                                                                                   | String | -      | -      |
| batch_name           | 本次批量转账的名称                                                                                                                         | String | -      | -      |
| batch_remark         | 本次批量转账的备注                                                                                                                         | String | -      | -      |
| total_amount         | 本次批量转账共转金额 单位为分 100 = 1 元                                                                                                   | Number | -      | -      |
| total_num            | 本次批量转账共几笔                                                                                                                         | Number | -      | -      |
| transfer_detail_list | 本次批量转账详情                                                                                                                           | Array  | -      | -      |
| pay_type             | 固定 wxpay                                                                                                                                 | String | -      | -      |
| version              | 固定 3，代表使用 v3 版本                                                                                                                   | Number | -      | -      |
| pid                  | 多商户模式下的自定义商户 id（等于 vk-pay-config 表的\_id） [查看 vk-pay-config 表](https://vkdoc.fsq.pub/vk-uni-pay/db/vk-pay-config.html) | String | -      | -      |

## 注意事项

- 新注册的企业支付宝账号，单笔转账接口的申请直接在支付宝官网申请可能会无法申请（申请条件以支付宝支付官网为准），此时可以联系支付宝商务人员，进行人工申请。
- 新注册的微信商户号，可能无法申请转账接口，申请条件以微信支付官网为准
- 支付宝不校验姓名时，account 参数为 支付宝的会员 ID，而非支付宝账号
