---
sidebarDepth: 0
---

# 商家转账到用户的支付宝或微信（最新版）

:::warning 重要通知

此接口需要 vk-uni-pay 版本 ≥ 1.16.0，低版本请查看 [老版本文档](https://vkdoc.fsq.pub/vk-uni-pay/uniCloud/transfer-old.html)

由于微信全面升级了转账接口，新的转账接口名为商家转账，且微信在 2025 年 03 年 31 日将废弃老的接口，故 vk-pay 的转账接口在 1.16.0 版本进行了升级，升级后不兼容老版本转账接口，请使用新的转账接口进行转账。

支付宝的转账接口参数也进行了升级，升级后不兼容老版本转账接口的参数，请使用新的转账接口参数进行转账。支付宝的转账接口产品没变。

:::

## vkPay.transfer

## 支付宝@alipay

需要申请开通支付宝支付的【转账到支付宝账户】或【商家转账】接口，如下图所示，目前支付宝这两个产品的效果是一样的。

![](https://mp-cf0c5e69-620c-4f3c-84ab-f4619262939f.cdn.bspapp.com/vk-doc/424.png)

### 调用示例@alipay-demo

无框架下的云函数代码示例（该写法同时也适用于任何框架）

```js
const vkPay = require('vk-uni-pay');

let transferRes = await vkPay.transfer({
  provider: 'alipay', // 固定值alipay
  out_bill_no: 'test' + Date.now(), // 商户系统内部的商家单号，要求此参数只能由数字、大小写字母组成，在商户系统内部唯一
  payee_info: {
    identity_type: 'ALIPAY_LOGON_ID', // 收款方账户类型。可取值：ALIPAY_USER_ID（支付宝用户 UID）、ALIPAY_LOGON_ID（支付宝登录账号）ALIPAY_OPEN_ID（支付宝 openId）
    // 当 identity_type=ALIPAY_USER_ID 时，参数 identity 填写支付宝用户 UID。示例值：2088开头的一串数字
    // 当 identity_type=ALIPAY_LOGON_ID 时，参数 identity 填写支付宝登录账号。示例值：邮箱或手机号
    // 当 identity_type=ALIPAY_OPEN_ID 时，参数 identity 填写支付宝用户 openId。示例值：英文字母和数字组成一串字符串
    identity: 'xxx@163.com',
    name: '真实姓名', // 收款方真实姓名。当 identity_type=ALIPAY_LOGON_ID 时，本参数必填
    // cert_type: "", // 参与方的证件类型。IDENTITY_CARD：身份证，PASSPORT：护照
    // cert_no: "", // 参与方的证件号，支持身份证号、护照号。当传入cert_type时，必传
  },
  transfer_amount: 10, // 转账金额 100=1元（单位分）
  order_title: '转账', // 转账标题
  transfer_remark: '转账备注', // 转账备注
  payer_use_alias: true, // 是否展示付款方别名，为 true 将展示商家支付宝在商家中心 商户信息 > 商户基本信息 页面配置的 商户别名
  // 如果转账失败，提示转账场景名称为空，则需要多传下面2个参数
  transfer_scene_name: '佣金报酬', // 该笔转账使用的转账场景，商户可前往 https://b.alipay.com/page/bizfund/transferScene/list 中查看/申明转账场景。
  transfer_scene_report_infos: [
    {
      info_type: '佣金报酬说明', // 转账场景信息类型，即商户所属转账场景下的信息类型。此字段内容为固定值，需严格按照 https://opendocs.alipay.com/open/0iaxid 传参。
      info_content: '8月家政服务报酬', // 转账场景信息描述，即商户所属转账场景下的信息内容。商户可按实际业务场景自定义传参，需严格按照 https://opendocs.alipay.com/open/0iaxid 传参。
    },
  ],
});

if (transferRes.code === 0) {
  // 转账成功后的逻辑
} else {
  // 转账失败后的逻辑
}
```

### 请求参数@alipay-params

| 参数               | 说明                                                                                                                                                                    | 类型    | 默认值          | 可选值 |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | --------------- | ------ |
| provider           | 固定值 alipay                                                                                                                                                           | String  | -               |        |
| out_bill_no        | 必填，商户系统内部的商家单号，要求此参数只能由数字、大小写字母组成，在商户系统内部唯一                                                                                  | String  | -               | -      |
| payee_info         | 必填，收款方信息                                                                                                                                                        | Object  | true            | false  |
| transfer_amount    | 转账金额 100=1 元(单位分)，金额最低 0.1 元，也就是 amount >= 10                                                                                                         | Number  | -               | -      |
| order_title        | 必填，转账业务的标题，用于在支付宝用户的账单里显示。                                                                                                                    | String  | -               | -      |
| transfer_remark    | 转账备注                                                                                                                                                                | String  | -               | -      |
| payer_use_alias    | 支付宝专用 - 是否展示付款方别名，为 true 将展示商家支付宝在商家中心 商户信息 > 商户基本信息 页面配置的 商户别名                                                         | Boolean | false           | true   |
| platform           | 使用哪个平台的配置，使用哪个平台的配置，如 mp-weixin、h5-weixin 等，默认是 transfer                                                                                     | String  | transfer        | -      |
| pid                | 多商户模式下的自定义商户 id（等于 vk-pay-config 表的\_id）[查看 vk-pay-config 表](https://vkdoc.fsq.pub/vk-uni-pay/db/vk-pay-config.html)，与 `config_directory` 二选一 | String  | -               | -      |
| `config_directory` | 多商户模式下的配置所在目录，与 pid 二选一                                                                                                                               | String  | default         | -      |
| app_auth_token     | 支付宝服务商模式下，子商户的授权 token                                                                                                                                  | String  | -               | -      |
| biz_scene          | 业务场景                                                                                                                                                                | String  | DIRECT_TRANSFER | -      |

### 返回值@alipay-return

| 参数   | 说明                                                                                                                                                                             |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| code   | 0 接口请求成功 其他均为接口请求失败                                                                                                                                              |
| msg    | 请求接口失败后的失败原因                                                                                                                                                         |
| result | 支付宝官方原始返回值 [支付宝官方文档](https://opendocs.alipay.com/open/62987723_alipay.fund.trans.uni.transfer?pathHash=66064890&ref=api&scene=ca56bca529e64125a2786703c6192d41) |

## 微信 - 免确认模式@wxpay-authorization

:::warning 版本要求
免确认收款授权功能需要 vk-uni-pay 版本 ≥ 1.17.0
:::

免确认收款授权是一种新的转账模式：用户授权一次后，后续商户可以直接转账给用户，**无需用户再次点击确认收款按钮**，极大简化了转账流程。

需要申请开通微信支付的【商家转账】接口，如下图所示

![](https://cdn.fsq.pub/vkdoc/vk-pay/1820a4da-b42b-4152-b80f-0715fe8ac196.png)

**与用户主动确认模式的区别**

| 对比项   | 用户主动确认模式               | 免确认模式（推荐）                                   |
| -------- | ------------------------------ | ---------------------------------------------------- |
| 用户操作 | 每次转账都需要用户点击确认收款 | 只需授权一次，后续转账自动到账                       |
| 超时风险 | 24 小时内未确认则资金退回      | 无超时风险                                           |
| 适用场景 | 一次性转账                     | 提现、工资发放等需要频繁转账的场景                   |
| 接口     | `vkPay.transfer`               | `vkPay.transfer`（传入 `out_authorization_no` 参数） |

**使用流程**

1. 调用 `createUserConfirmAuthorization` 发起授权申请，返回 `options` 参数
2. 前端调用 `requestMerchantTransfer` 拉起用户授权弹窗，用户点击确认授权
3. 用户授权成功后，后续调用 `vkPay.transfer` 时传入 `out_authorization_no` 即可免确认直接转账

### 发起免确认收款授权@createUserConfirmAuthorization

调用此接口后，前端需要调用 `requestMerchantTransfer` 拉起用户授权弹窗。

:::warning 注意
发起免确认收款授权时，商户号和实际运行的小程序的 AppID 必须是绑定关系（即商户号关联的 AppID 需要包含当前小程序的 AppID），否则授权会失败。这一点与用户主动确认模式不同，用户主动确认模式支持跨小程序调用任意支付配置。
:::

:::tip 授权后转账
用户一旦完成授权，商家发起转账属于服务端操作，可以在任意小程序的服务端调用转账接口，不受 AppID 绑定关系限制。
:::

**调用示例**

```js
const vkPay = require('vk-uni-pay');

let out_authorization_no = 'test001';

let res = await vkPay.createUserConfirmAuthorization({
  provider: 'wxpay', // 固定值wxpay
  out_authorization_no, // 必填，商户系统内部的免确认收款授权单号，out_authorization_no 的值需要保存到数据库，因为发起转账需要用到
  openid: 'ogtX061Da3Azw7fUZm-zNBYmbt0U', // 必填，收款用户openid
  transfer_scene_id: '1000', // 必填，转账场景ID
  user_display_name: '用户展示名称', // 必填，用户展示名称（会在授权弹窗中展示给用户）
  user_recv_perception: '现金奖励', // 用户收款感知
  // authorization_notify_url: '', // 授权结果通知地址，不填则自动拼接
  // scene_info: {}, // 用户端场景信息
});
if (res.code === 0) {
  // 授权申请提交成功
  // 需要前端调用 requestMerchantTransfer(res.options) 拉起用户授权弹窗
} else {
  // 授权申请提交失败
}
```

**请求参数**

| 参数                     | 说明                                                                                                                       | 类型   | 默认值   | 可选值 |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------- | ------ | -------- | ------ |
| provider                 | 固定值 wxpay                                                                                                               | String | -        |        |
| out_authorization_no     | 必填，商户系统内部的免确认收款授权单号，要求全局唯一（值需要保存到数据库，因为发起转账需要用到）                           | String | -        | -      |
| openid                   | 必填，收款用户的 openid                                                                                                    | String | -        | -      |
| transfer_scene_id        | 必填，转账场景 ID，可前往”商户平台-产品中心-商家转账”中申请                                                                | String | -        | -      |
| user_display_name        | 必填，用户展示名称，会在授权弹窗中展示给用户                                                                               | String | -        | -      |
| user_recv_perception     | 用户收款感知                                                                                                               | String | -        | -      |
| authorization_notify_url | 授权结果通知地址，不填则自动拼接                                                                                           | String | -        | -      |
| scene_info               | 用户端场景信息                                                                                                             | Object | -        | -      |
| platform                 | 使用哪个平台的配置，如 mp-weixin、h5-weixin 等，默认是 transfer                                                            | String | transfer | -      |
| pid                      | vk-pay-config 表的\_id（多商户模式下必填） [查看 vk-pay-config 表](https://vkdoc.fsq.pub/vk-uni-pay/db/vk-pay-config.html) | String | -        | -      |
| config_directory         | 多商户模式下的配置所在目录，与 pid 二选一                                                                                  | String | -        | -      |

**返回值**

| 参数    | 说明                                                                                        |
| ------- | ------------------------------------------------------------------------------------------- |
| code    | 0 接口请求成功 其他均为接口请求失败                                                         |
| msg     | 请求接口失败后的失败原因                                                                    |
| result  | 微信支付官方原始返回值 [微信官方文档](https://pay.weixin.qq.com/doc/v3/merchant/4015901167) |
| options | 前端调用 `requestMerchantTransfer` 所需要的参数（包含 mchId、appId、package）               |

**前端拉起授权弹窗**

```js
// res.options 就是 vkPay.createUserConfirmAuthorization 接口返回值中的 options 参数
uni.requestMerchantTransfer({
  ...res.options,
  success: (res) => {
    // 用户确认授权成功
  },
  fail: (res) => {
    // 用户取消授权或授权失败
  },
});
```

### 发起转账 - 免确认模式转账@transferByAuthorization

用户授权成功后，调用此接口可直接转账给用户，无需用户再次确认收款。

**调用示例**

```js
const vkPay = require('vk-uni-pay');

let transferRes = await vkPay.transfer({
  provider: 'wxpay', // 固定值wxpay
  out_bill_no: 'test' + Date.now(), // 必填，商户系统内部的商家单号
  out_authorization_no: 'test001', // 商户系统内部的免确认收款授权单号（需与发起授权时一致）
  transfer_amount: 100, // 转账金额 100=1元（单位分）
  transfer_remark: '提现到账', // 转账备注
  transfer_scene_id: '1000', // 必填，转账场景ID
  user_recv_perception: '现金奖励', // 用户收款感知
  transfer_scene_report_infos: [
    {
      info_type: '活动名称',
      info_content: '新会员有礼',
    },
    {
      info_type: '奖励说明',
      info_content: '注册会员抽奖一等奖',
    },
  ],
  // user_name: '真实姓名', // 转账金额 >= 2000元时必填，转账金额 < 0.3元时不允许传
  // sponsor_mchid: '', // 出资商户号，可指定已授权的商户出资
});
if (transferRes.code === 0) {
  // 转账成功
} else {
  // 转账失败
}
```

**请求参数**

| 参数                        | 说明                                                                                                                       | 类型   | 默认值   | 可选值 |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------ | -------- | ------ |
| provider                    | 固定值 wxpay                                                                                                               | String | -        |        |
| out_bill_no                 | 必填，商户系统内部的商家单号，要求此参数只能由数字、大小写字母组成，在商户系统内部唯一                                     | String | -        | -      |
| appid                       | appid，不填默认使用配置中的 appId                                                                                          | String | -        | -      |
| authorization_id            | 与 out_authorization_no 二选一必填，微信免确认收款授权单号                                                                 | String | -        | -      |
| out_authorization_no        | 与 authorization_id 二选一必填，商户系统内部的免确认收款授权单号（需与发起授权时一致）                                     | String | -        | -      |
| transfer_amount             | 转账金额 100=1 元(单位分)，金额最低 0.1 元，也就是 amount >= 10                                                            | Number | -        | -      |
| user_name                   | 收款方真实姓名，转账金额 >= 2000 元时必填，转账金额 < 0.3 元时不允许传                                                     | String | -        | -      |
| transfer_remark             | 转账备注                                                                                                                   | String | 转账     | -      |
| transfer_scene_id           | 必填，该笔转账使用的转账场景，可前往”商户平台-产品中心-商家转账”中申请                                                     | String | -        | -      |
| user_recv_perception        | 用户收款时感知到的收款原因                                                                                                 | String | -        | -      |
| transfer_scene_report_infos | 选填，各转账场景下需报备的内容                                                                                             | Array  | -        | -      |
| sponsor_mchid               | 出资商户号，可指定已授权发起商户资金权限的商户进行出资                                                                     | String | -        | -      |
| platform                    | 使用哪个平台的配置，如 mp-weixin、h5-weixin 等，默认是 transfer                                                            | String | transfer | -      |
| pid                         | vk-pay-config 表的\_id（多商户模式下必填） [查看 vk-pay-config 表](https://vkdoc.fsq.pub/vk-uni-pay/db/vk-pay-config.html) | String | -        | -      |
| config_directory            | 多商户模式下的配置所在目录，与 pid 二选一                                                                                  | String | default  | -      |

**返回值**

| 参数   | 说明                                                                                                |
| ------ | --------------------------------------------------------------------------------------------------- |
| code   | 0 接口请求成功 其他均为接口请求失败                                                                 |
| msg    | 转账结果描述（已受理 / 处理中 / 等待用户确认 / 转账中 / 转账成功 / 转账失败 / 撤销受理 / 撤销完成） |
| result | 微信支付官方原始返回值 [微信官方文档](https://pay.weixin.qq.com/doc/v3/merchant/4014399371)         |

### 查询免确认收款授权@queryUserConfirmAuthorization

根据商户侧授权单号查询授权状态。

**调用示例**

```js
const vkPay = require('vk-uni-pay');

let res = await vkPay.queryUserConfirmAuthorization({
  provider: 'wxpay', // 固定值wxpay
  out_authorization_no: 'test001', // 必填，商户系统内部的免确认收款授权单号
});
console.log('res: ', res);
// res.msg 可能的值：
// “用户已确认授权，授权生效中”（TAKING_EFFECT）
// “已受理商户的授权申请，待用户确认”（WAIT_USER_CONFIRM）
// “授权已关闭”（CLOSED）
```

**请求参数**

| 参数                 | 说明                                                                                                                       | 类型   | 默认值   | 可选值 |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------ | -------- | ------ |
| provider             | 固定值 wxpay                                                                                                               | String | -        |        |
| out_authorization_no | 必填，商户系统内部的免确认收款授权单号                                                                                     | String | -        | -      |
| platform             | 使用哪个平台的配置，如 mp-weixin、h5-weixin 等，默认是 transfer                                                            | String | transfer | -      |
| pid                  | vk-pay-config 表的\_id（多商户模式下必填） [查看 vk-pay-config 表](https://vkdoc.fsq.pub/vk-uni-pay/db/vk-pay-config.html) | String | -        | -      |
| config_directory     | 多商户模式下的配置所在目录，与 pid 二选一                                                                                  | String | default  | -      |

**返回值**

| 参数   | 说明                                                                                        |
| ------ | ------------------------------------------------------------------------------------------- |
| code   | 0 接口请求成功 其他均为接口请求失败                                                         |
| msg    | 授权状态描述                                                                                |
| result | 微信支付官方原始返回值 [微信官方文档](https://pay.weixin.qq.com/doc/v3/merchant/4014399423) |

### 解除免确认收款授权@closeUserConfirmAuthorization

解除用户的免确认收款授权，解除后需用户重新授权才能使用免确认转账。

**调用示例**

```js
const vkPay = require('vk-uni-pay');

let res = await vkPay.closeUserConfirmAuthorization({
  provider: 'wxpay', // 固定值wxpay
  out_authorization_no: 'test001', // 必填，商户系统内部的免确认收款授权单号
});
if (res.code === 0) {
  // 授权已解除
}
```

**请求参数**

| 参数                 | 说明                                                                                                                       | 类型   | 默认值   | 可选值 |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------ | -------- | ------ |
| provider             | 固定值 wxpay                                                                                                               | String | -        |        |
| out_authorization_no | 必填，商户系统内部的免确认收款授权单号                                                                                     | String | -        | -      |
| platform             | 使用哪个平台的配置，如 mp-weixin、h5-weixin 等，默认是 transfer                                                            | String | transfer | -      |
| pid                  | vk-pay-config 表的\_id（多商户模式下必填） [查看 vk-pay-config 表](https://vkdoc.fsq.pub/vk-uni-pay/db/vk-pay-config.html) | String | -        | -      |
| config_directory     | 多商户模式下的配置所在目录，与 pid 二选一                                                                                  | String | default  | -      |

**返回值**

| 参数   | 说明                                                                                        |
| ------ | ------------------------------------------------------------------------------------------- |
| code   | 0 接口请求成功 其他均为接口请求失败                                                         |
| msg    | 操作结果描述                                                                                |
| result | 微信支付官方原始返回值 [微信官方文档](https://pay.weixin.qq.com/doc/v3/merchant/4015653811) |

### 授权回调通知@transfer-auth-notify

用户在前端确认或取消授权后，微信会通过回调通知商户系统。

在云函数 `vk-pay` 的 `service/pay-notify` 目录创建 1 个文件，文件名固定为 `transfer-auth.js`，文件内容如下：

```js
'use strict';

var db = uniCloud.database(); // 全局数据库引用
var _ = db.command; // 数据库操作符

module.exports = async (obj) => {
  let user_order_success = true;
  let { data = {} } = obj;
  let {
    out_authorization_no, // 商户系统内部的免确认收款授权单号
    authorization_id, // 微信免确认收款授权单号
    openid, // 用户openid
    state, // 授权状态
  } = data;

  /**
   * state: 授权状态
   * TAKING_EFFECT: 用户已确认授权，授权生效中
   * CLOSED: 授权已关闭
   */

  console.log('在这里写自己的授权回调逻辑处理');

  if (state === 'TAKING_EFFECT') {
    // 用户已确认授权，授权生效中
    // 可在此处更新数据库中该用户的授权状态
  } else if (state === 'CLOSED') {
    // 授权已关闭
  }

  // 此处写你自己的回调逻辑开始-----------------------------------------------------------
  // 有三种方式
  // 方式一：直接写数据库操作（原生数据库语句）
  // 方式二：使用 await uniCloud.callFunction 调用其他云函数
  // 方式三：使用 await uniCloud.httpclient.request 调用http接口地址

  // 注意：如果使用方式二和方式三时，为了安全起见，请带上请求密钥（密钥自己传一个固定的32位字符串即可），然后在你请求的接口中判断密钥是否一致，可以有效的防止伪造请求。（因为密钥只有你自己知道）

  // 此处写你自己的回调逻辑结束-----------------------------------------------------------
  // user_order_success = true 代表你自己的逻辑处理成功 返回 false 代表你自己的处理逻辑失败。
  return user_order_success;
};
```

### 最佳流程实践@authorization-best-practices

**用户首次申请提现时发起授权（绑定提现账户）**

免确认模式的核心是**一次授权，后续免确认**，因此建议在用户首次申请提现前发起授权，本质就是绑定提现账户的操作。

**推荐流程**

1. 用户首次申请提现 → 检测该用户是否已授权（数据库中是否存在该 `user_id` 对应的 `out_authorization_no`）
2. 未授权 → 调用 `createUserConfirmAuthorization` 发起授权，前端拉起授权弹窗，用户确认后，将 `user_id` 与 `out_authorization_no` 一对一绑定存库（比如在 uni-id-users 表新增一个字段存储 `out_authorization_no` 或新建一张表专门存储 `user_id` 与 `out_authorization_no` 的对应关系）
3. 已授权 → 直接进入申请提现流程
4. 商家审核通过 → 根据 `user_id` 取出 `out_authorization_no`，直接调用 `transfer` 执行转账，用户无需任何操作，资金自动到账
5. 后续再次提现 → 跳过授权步骤，审核通过直接转账

![](https://cdn.fsq.pub/vkdoc/vk-pay/608.png)

**授权状态管理**

建议在授权回调通知中维护数据库的授权状态，转账前可先查询本地数据库判断授权是否有效，减少不必要的接口调用。若转账时发现授权已失效（如用户主动解除授权），可引导用户重新发起授权，授权成功后自动重新执行转账。

## 微信 - 用户主动确认模式@wxpay-manual

### 发起转账 - 需用户主动确认收款

需要申请开通微信支付的【商家转账】接口，如下图所示

![](https://cdn.fsq.pub/vkdoc/vk-pay/1820a4da-b42b-4152-b80f-0715fe8ac196.png)

此模式下，调用转账接口后需要用户手动点击确认收款按钮，转账才算完成。

:::tip 跨小程序转账
用户主动确认模式下，支持 A 小程序调用 B 小程序的支付配置进行转账，两者不需要绑定关系。只需通过 `pid` 或 `config_directory` 参数指定目标小程序的支付配置即可。
:::

:::tip 推荐使用免确认模式
如果你的业务场景需要频繁转账（如提现、工资发放等），强烈推荐使用 [微信 - 免确认模式](#wxpay-authorization)。用户只需授权一次，后续转账自动到账，无需用户再次操作，彻底解决超时退回的问题。
:::

#### 调用示例@wxpay-manual-demo

无框架下的云函数代码示例（该写法同时也适用于任何框架）

```js
const vkPay = require('vk-uni-pay');

let transferRes = await vkPay.transfer({
  provider: 'wxpay', // 固定值wxpay
  out_bill_no: 'test' + Date.now(), // 商户系统内部的商家单号，要求此参数只能由数字、大小写字母组成，在商户系统内部唯一
  transfer_amount: 30, // 转账金额 100=1元（单位分）
  openid: 'ogtX061Da3Azw7fUZm-zNBYmbt0U', // 用户的openid
  user_name: '真实姓名', // 收款方真实姓名，转账金额 >= 2000元时必填，转账金额 < 0.3元时不允许传
  transfer_remark: '转账备注', // 转账备注
  transfer_scene_id: '1000', // 必填，该笔转账使用的转账场景，可前往”商户平台-产品中心-商家转账”中申请。如：1000 代表 现金营销场景
  user_recv_perception: '现金奖励', // 用户收款感知，不同的transfer_scene_id对应不同的值，请查看 https://pay.weixin.qq.com/doc/v3/merchant/4013774588
  // 为转账场景报备信息，也需要根据不同的transfer_scene_id对应不同的值，请查看 https://pay.weixin.qq.com/doc/v3/merchant/4013774588
  transfer_scene_report_infos: [
    {
      info_type: '活动名称',
      info_content: '新会员有礼',
    },
    {
      info_type: '奖励说明',
      info_content: '注册会员抽奖一等奖',
    },
  ],
});
if (transferRes.code === 0) {
  // 转账申请提交成功后的逻辑
  // 注意：微信转账接口调用成功后，用户还需要点击确认收款按钮才算转账完成，确认收款按钮是前端API requestMerchantTransfer，其请求参数可在 transferRes.options 的返回值中获取
} else {
  // 转账申请提交失败后的逻辑
}
```

#### 请求参数@wxpay-manual-params

| 参数                                     | 说明                                                                                                                                                                                                                | 类型   | 默认值   | 可选值 |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | -------- | ------ |
| provider                                 | 固定值 wxpay                                                                                                                                                                                                        | String | -        |        |
| out_bill_no                              | 必填，商户系统内部的商家单号，要求此参数只能由数字、大小写字母组成，在商户系统内部唯一                                                                                                                              | String | -        | -      |
| appid                                    | appid，不填默认使用配置中的 appId                                                                                                                                                                                   | String | -        | -      |
| openid                                   | 必填，收款用户的 openid                                                                                                                                                                                             | String | -        | -      |
| user_name                                | 收款方真实姓名，转账金额 >= 2000 元时必填，转账金额 < 0.3 元时不允许传                                                                                                                                              | String | -        | -      |
| transfer_amount                          | 转账金额 100=1 元(单位分)，金额最低 0.1 元，也就是 amount >= 10                                                                                                                                                     | Number | -        | -      |
| transfer_remark                          | 转账备注                                                                                                                                                                                                            | String | 转账     | -      |
| transfer_scene_id                        | 必填，该笔转账使用的转账场景，可前往”商户平台-产品中心-商家转账”中申请。如：1001-现金营销                                                                                                                           | String | -        | -      |
| user_recv_perception                     | 用户收款时感知到的收款原因将根据转账场景自动展示默认内容。如有其他展示需求，可在本字段传入。各场景展示的默认内容和支持传入的内容 详见：https://pay.weixin.qq.com/doc/v3/merchant/4012711988#3.3-发起转账            | String | -        | -      |
| transfer_scene_report_infos              | 必填，各转账场景下需报备的内容 详见：https://pay.weixin.qq.com/doc/v3/merchant/4012711988#（3）按转账场景报备背景信息                                                                                               | Array  | -        | -      |
| transfer_scene_report_infos.info_type    | 必填，请根据产品文档确认当前转账场景下需传入的信息类型，需按要求填入，有多个字段时需填写完整 如：转账场景为 1000-现金营销，需填入活动名称、奖励说明                                                                 | String | -        | -      |
| transfer_scene_report_infos.info_content | 必填，请根据信息类型，描述当前这笔转账单的转账背景 如：信息类型为活动名称，请在信息内容描述用户参与活动的名称，如新会员有礼。信息类型为奖励说明，请在信息内容描述用户因为什么奖励获取这笔资金，如注册会员抽奖一等奖 | String | -        | -      |
| notify_url                               | 转账回调通知地址，不填则自动拼接                                                                                                                                                                                    | String | -        | -      |
| platform                                 | 使用哪个平台的配置，如 mp-weixin、h5-weixin 等，默认是 transfer                                                                                                                                                     | String | transfer | -      |
| pid                                      | vk-pay-config 表的\_id（多商户模式下必填） [查看 vk-pay-config 表](https://vkdoc.fsq.pub/vk-uni-pay/db/vk-pay-config.html)                                                                                          | String | -        | -      |
| config_directory                         | 多商户模式下的配置所在目录，与 pid 二选一                                                                                                                                                                           | String | default  | -      |

#### 返回值@wxpay-manual-return

| 参数    | 说明                                                                                            |
| ------- | ----------------------------------------------------------------------------------------------- |
| code    | 0 接口请求成功 其他均为接口请求失败                                                             |
| msg     | 请求接口失败后的失败原因                                                                        |
| result  | 微信支付官方原始返回值 [微信支付官方文档](https://pay.weixin.qq.com/doc/v3/merchant/4012716434) |
| options | 微信支付用户确认收款接口 requestMerchantTransfer 所需要的参数                                   |

### 用户确认收款@wxpay-user-confirm

云函数调用转账接口成功后，客户端还需要调用 API requestMerchantTransfer 来让用户点击确认收款，只有用户点了确认收款按钮后，转账才算完成。

**注意：用户收款的时效是 24 小时，如用户不确认将在 24 小时后关闭单据，资金退回至商户的出资账户。**

#### 微信小程序@wxpay-user-confirm-mp

微信小程序执行 uni.requestMerchantTransfer 接口即可，代码如下

```js
uni.requestMerchantTransfer({
  ...options, // 变量 options 就是 vkPay.transfer 接口的返回值中的 options 参数
  success: (res) => {
    // 确认收款成功
  },
  fail: (res) => {
    // 确认收款失败
  },
});
```

#### 微信公众号@wxpay-user-confirm-h5

微信公众号需要执行 WeixinJSBridge 内的 requestMerchantTransfer 接口，代码如下

**注意：**

- WeixinJSBridge 内的 API 需要执行过 wx.config 才可以调用，具体查看微信官方文档：[传送门](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html)
- 如果你有使用 vk 框架开发，则可参考 vk 文档：[传送门](https://vkdoc.fsq.pub/client/uniCloud/plus/weixin-h5-jsapi.html)

```js
// 变量 options 就是 vkPay.transfer 接口的返回值中的 options 参数
WeixinJSBridge.invoke('requestMerchantTransfer', options, (res) => {
  if (res.err_msg === 'requestMerchantTransfer:ok') {
    // 确认收款成功
  } else {
    // 确认收款失败
  }
});
```

#### App@wxpay-user-confirm-app

App 端需要导入 requestMerchantTransfer uts 插件 [传送门](https://ext.dcloud.net.cn/plugin?id=22283)

导入该插件后，再执行 uni.requestMerchantTransfer 接口即可，代码如下

```js
uni.requestMerchantTransfer({
  ...options, // 变量 options 就是 vkPay.transfer 接口的返回值中的 options 参数
  success: (res) => {
    // 确认收款成功
  },
  fail: (res) => {
    // 确认收款失败
  },
});
```

### 最佳流程实践@best-practices

因为调用微信转账接口后，24 小时内用户未确认收款则资金会原路退回，如果用户提现需要先审核，那么势必会导致出现这样的不友好的流程：

1. 用户申请提现
2. 商家审核通过，执行转账接口，然后需要通过某种方式提醒用户
3. 用户需要在 24 小时内再次打开 App 或小程序并点击确认收款按钮

因为用户申请提现到商家审核通过有一定的时差，比如相差 3 天，那么用户并不知道什么时候会审核通过，如果用户第 5 天才进入系统，那么会导致超 24 小时而无法确认收款。

所以最佳流程应该是这样的：

1. 用户申请提现
2. 商家审核通过，先不执行转账接口，只在数据库标记该提现记录状态为审核通过
3. 等用户再次进入系统（不管什么时候）请求接口获取已审核通过但未提现的申请，此时调用转账接口，然后前端立即显示收款按钮，这个时候用户点击收款就一定可以收到，而不会出现超 24 小时无法确认收款的问题。

### 撤销转账@cancelTransfer

商户通过转账接口发起付款后，在用户确认收款之前可以通过该接口撤销付款。该接口返回成功仅表示撤销请求已受理，系统会异步处理退款等操作，以最终查询单据返回状态为准。

**调用示例**

```js
const vkPay = require('vk-uni-pay');

let cancelTransferRes = await vkPay.cancelTransfer({
  provider: 'wxpay', // 固定值wxpay
  platform: 'mp-weixin', // 平台类型：app-plus、mp-weixin，用于获取对应平台的支付配置信息
  out_bill_no: '商户转账单号', // 商户转账单号
});
if (cancelTransferRes.code === 0) {
  // 撤销成功
} else {
  // 撤销失败
}
```

返回值可查看[微信文档-撤销转账](https://pay.weixin.qq.com/doc/v3/merchant/4012716458)

### 查询转账单@queryTransfer

商户通过转账接口发起付款后，可以通过该接口查询转账单的状态。

**调用示例**

```js
const vkPay = require('vk-uni-pay');

let queryTransferRes = await vkPay.queryTransfer({
  provider: 'wxpay', // 固定值wxpay
  platform: 'mp-weixin', // 平台类型：app-plus、mp-weixin，用于获取对应平台的支付配置信息
  out_bill_no: '商户转账单号', // 商户转账单号，与 transfer_bill_no 二选一即可
  // transfer_bill_no: “微信转账单号”, // 微信转账单号，与 out_bill_no 二选一即可
});
console.log('queryTransferRes: ', queryTransferRes);
```

返回值可查看[微信文档-查询转账单](https://pay.weixin.qq.com/doc/v3/merchant/4012716437)

### 转账回调通知@notice

:::warning 注意

1. 暂只支持微信的转账回调通知，目前支付宝的转账接口是实时的，不需要回调通知。
2. 由于转账订单插件没有建立数据库表，因此插件没有维护转账订单的订单状态。因此请关注第 3 条和第 4 条。
3. 同样的通知可能会多次发送给商户系统。商户系统需要重视对重复通知的正确处理。 当商户系统收到通知时，先检查对应业务数据状态，如果未处理，进行处理; 如果已处理，则直接 `return true;` 即可。
4. 在对业务数据进行状态检查和处理之前，要采用数据锁进行并发控制，以避免函数重入造成的数据混乱。
   :::

**友情提示：支付回调通知插件已处理重入的情况，无需关心，但转账回调通知插件没有处理重入的情况，需要自己控制**

**相关代码**

在云函数 `vk-pay` 的 `service/pay-notify` 目录创建 1 个文件，文件名固定为 `transfer.js`，文件内容如下：

```js
'use strict';
/**
 * 要求：只改下订单状态，保证能及时返回给第三方支付服务器成功状态（必须要在5秒内返回）
 */

var db = uniCloud.database(); // 全局数据库引用
var _ = db.command; // 数据库操作符
var $ = _.aggregate; // 聚合查询操作符

module.exports = async (obj) => {
  let user_order_success = true;
  let { data = {} } = obj;
  let {
    appid, // appid
    create_time, // 创建时间
    mch_id, // 商户号
    openid, // 用户openid
    out_bill_no, // 商户转账单号
    state, // 状态：SUCCES
    transfer_amount, // 转账金额
    transfer_bill_no, // 微信转账单号
    transfer_remark, // 转账备注
    update_time, // 更新时间
  } = data;

  /**
   * state: 转账状态（只有 state 为 SUCCESS 或者 FAIL 或者 CANCELLED 的时候才会回调到这里）
   * SUCCESS: 转账成功
   * FAIL: 转账失败
   * CANCELLED: 转账撤销完成
   */

  // data内的其他参数详见文档：https://pay.weixin.qq.com/doc/v3/merchant/4012716437 中的应答参数

  console.log('在这里写自己的转账回调逻辑处理');

  if (state === 'SUCCESS') {
    // 转账成功
  } else if (state === 'FAIL') {
    // 转账失败
  } else if (state === 'CANCELLED') {
    // 转账撤销完成
  }

  // 此处写你自己的支付成功逻辑开始-----------------------------------------------------------
  // 有三种方式
  // 方式一：直接写数据库操作（原生数据库语句）
  // 方式二：使用 await uniCloud.callFunction 调用其他云函数
  // 方式三：使用 await uniCloud.httpclient.request 调用http接口地址

  // 注意：如果使用方式二和方式三时，为了安全起见，请带上请求密钥（密钥自己传一个固定的32位字符串即可），然后在你请求的接口中判断密钥是否一致，可以有效的防止伪造请求。（因为密钥只有你自己知道）

  // 此处写你自己的支付成功逻辑结束-----------------------------------------------------------
  // user_order_success =  true 代表你自己的逻辑处理成功 返回 false 代表你自己的处理逻辑失败。
  return user_order_success;
};
```

## 微信 - 通用@wxpay-common

### 开通教程@wxpay-open

前往 [微信支付后台](https://pay.weixin.qq.com/index.php/core/home/login)，扫码登录对应的商户号，必须是企业，不支持个人和个体户。

点击上方菜单【产品中心】，在页面中找到【商家转账】产品，点击 Ta 进行开通，如下图所示。

![](https://cdn.fsq.pub/vkdoc/vk-pay/17d70386-136c-400e-a905-5cd8ff53ea4e.png)

### 设置 IP 白名单@wxpay-ip-whitelist

微信转账接口需要设置 IP 白名单，开通后，根据下图所示设置 IP 白名单

![](https://cdn.fsq.pub/vkdoc/vk-pay/9ad9170a-3105-4263-ad70-60b902f6cdfb.png)

![](https://cdn.fsq.pub/vkdoc/vk-pay/c8f380db-5ac4-4e07-8afe-8fb1917cc1a3.png)

其中 ip 白名单的值查看：[云函数固定 IP 白名单](https://vkdoc.fsq.pub/client/uniCloud/plus/weixin-h5.html#ip)

### 充值运营账户金额@wxpay-recharge

你的客户支付成功的钱在微信支付商户号的【基本账户】中，不在【运营账户】中，因此还需要充值【运营账户】，转账的金额从【运营账户】中扣除，如下图所示。建议用超级管理员的微信扫码充值。

![](https://cdn.fsq.pub/vkdoc/vk-pay/570112db-f5fe-43bb-8b4d-b22af42caaec.png)

### 转账单号说明@out-bill-no

**out_bill_no**

商户转账单号 out_bill_no 参数说明：

- 需自行保证全局唯一。
- 一个商户转账单号对应一笔转账请求，假设转账接口请求失败或其他原因未成功，不要更换商户转账单号，应该用原单号进行重试。否则会有重复转账的资金风险。
- 如用户未确认收款，请勿在撤销或者等待单据关闭前，又发起一笔新的转账，避免重复出资带来资损。

## 注意事项@tips

- 新注册的企业支付宝账号，转账接口的申请直接在支付宝官网申请，如果无法申请（申请条件以支付宝支付官网为准），可以联系支付宝商务人员，进行人工申请。
- 新注册的微信商户号，可能无法申请转账接口，申请条件以微信支付官网为准

## 常见问题@q

### 转账回调的时候报错：key required@q1

在转账配置中设置下 `"version": 3` 如下图所示

![](https://cdn.fsq.pub/vkdoc/vk-pay/af4b7b8e-44c3-4ae0-b6e1-16f7623b7d6d.png)

配置好后，需要重新上传公共模块 `uni-config-center` 才会生效（因为回调是强制请求云端的）

![](https://cdn.fsq.pub/vkdoc/vk-pay/4d542047-dab8-4f5e-826e-33629b774816.png)
