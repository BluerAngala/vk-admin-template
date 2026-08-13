---
sidebarDepth: 0
---

# 短信发送（聚合版）

支持 uniCloud 内置短信与阿里云短信，可发送通知类短信（如物流、订单）和验证码短信。

## 调用示例@demo

### 发送通知类短信（非验证码）@sendSms

`vk.sendSms`（≥2.21.0）或 `vk.system.smsUtil.sendSms`（<2.21.0）

**请求参数**

| 参数       | 类型                | 必填 | 说明                                                                      |
| ---------- | ------------------- | ---- | ------------------------------------------------------------------------- |
| provider   | String              | 是   | 服务供应商：`unicloud`（uniCloud 内置）、`aliyun`（阿里云）               |
| phone      | String              | 否   | 单个手机号，与 phoneList 二选一                                           |
| phoneList  | Array&lt;String&gt; | 否   | 批量发送手机号，与 phone 二选一                                           |
| templateId | String              | 是   | 短信模板 ID（unicloud 为数字如 11558，阿里云为如 SMS_xxx）                |
| data       | Object              | 是   | 模板变量，key 与模板中占位符一致，如 `{ orderNo, expressCom, expressNo }` |
| smsKey     | String              | 否   | 密钥 ID，不传则从 config 公共模块读取                                     |
| smsSecret  | String              | 否   | 密钥密码，不传则从 config 读取                                            |
| signName   | String              | 否   | 短信签名，不传则从 config 读取（阿里云必填签名时需配置或传入）            |

**返回说明**

返回值为 `{ code, msg }`。`code` 为 `0` 表示成功，其他值均为失败；`msg` 为失败时的原因说明。

```js
// 单个手机号 - uniCloud
let sendSmsRes = await vk.sendSms({
  provider: 'unicloud',
  phone: '15200000001',
  templateId: '11558',
  data: {
    orderNo: 'DD8888888888',
    expressCom: '顺丰快递',
    expressNo: 'SF88888888',
  },
});

// 多个手机号 - uniCloud
let sendSmsBatchRes = await vk.sendSms({
  provider: 'unicloud',
  phoneList: ['15200000001', '15200000002'],
  templateId: '11558',
  data: {
    orderNo: 'DD8888888888',
    expressCom: '顺丰快递',
    expressNo: 'SF88888888',
  },
});

// 单个手机号 - 阿里云
let sendSmsResAliyun = await vk.sendSms({
  provider: 'aliyun',
  phone: '15200000001',
  templateId: 'SMS_202470413',
  data: {
    orderNo: 'DD8888888888',
    expressCom: '顺丰快递',
    expressNo: 'SF88888888',
  },
});

// 多个手机号 - 阿里云
let sendSmsResAliyun = await vk.sendSms({
  provider: 'aliyun',
  phoneList: ['15200000001', '15200000002'],
  templateId: '11558',
  data: {
    orderNo: 'DD8888888888',
    expressCom: '顺丰快递',
    expressNo: 'SF88888888',
  },
});
```

### 发送短信验证码@sendSmsVerifyCode

`vk.system.smsUtil.sendSmsVerifyCode`：发送验证码并自动写入数据库，供后续 `uniID.verifyCode` 等校验使用。

**适用 type**

| type      | 说明                                          |
| --------- | --------------------------------------------- |
| login     | 手机号登录                                    |
| bind      | 绑定手机                                      |
| unbind    | 解绑手机                                      |
| reset-pwd | 重置账号密码                                  |
| 自定义    | 如 verify，需自行调用 `uniID.verifyCode` 校验 |

**请求参数**

| 参数      | 类型   | 必填 | 说明                                                               |
| --------- | ------ | ---- | ------------------------------------------------------------------ |
| provider  | String | 是   | 短信供应商：`unicloud`（内置验证码）、`aliyun`（阿里云验证码）     |
| phone     | String | 是   | 手机号                                                             |
| code      | String | 是   | 验证码内容（如 4 ～ 6 位数字）                                     |
| type      | String | 是   | 用途：`login` / `bind` / `unbind` / `reset-pwd` 或自定义           |
| expiresIn | Number | 否   | 有效时间（秒），须为 60 的倍数，不传则用 config 中的 codeExpiresIn |
| smsKey    | String | 否   | 密钥 ID，不传则从 config 读取                                      |
| smsSecret | String | 否   | 密钥密码，不传则从 config 读取                                     |
| signName  | String | 否   | 短信签名，不传则从 config 读取                                     |

**返回说明**

返回值为 `{ code, msg }`。`code` 为 `0` 表示成功，其他值均为失败；`msg` 为失败时的原因说明。

**云函数内完整示例（发送验证码）**

```js
'use strict';
module.exports = {
  main: async (event) => {
    let { data = {}, util } = event;
    let { vk } = util;
    let { mobile, type = 'login' } = data;
    let res = { code: 0, msg: '' };

    if (!mobile) return { code: -1, msg: '手机号不能为空' };

    let code = vk.pubfn.random(6, '0123456789');
    let sendSmsVerifyCodeRes = await vk.system.smsUtil.sendSmsVerifyCode({
      provider: 'unicloud',
      phone: mobile,
      code,
      type,
      expiresIn: 180,
    });

    if (sendSmsVerifyCodeRes.code !== 0) {
      return { code: -1, msg: sendSmsVerifyCodeRes.msg || '验证码发送失败' };
    }
    res.msg = '验证码已发送';
    return res;
  },
};
```

**云对象内调用示例**

```js
async sendSmsCode(mobile, type = "login") {
  let { vk } = this.getUtil();
  let code = vk.pubfn.random(6, "0123456789");
  let sendSmsVerifyCodeRes = await vk.system.smsUtil.sendSmsVerifyCode({
    provider: "unicloud",
    phone: mobile,
    code,
    type,
    expiresIn: 180
  });
  return sendSmsVerifyCodeRes;
}
```

#### 自定义校验 type@@sendSmsVerifyCode-type

如果业务不是上面 4 种（手机号登录、绑定手机、解绑手机、重置账号密码），那么 type 可以自己自定义，例如 type: "verify"。发送时仍用 `vk.system.smsUtil.sendSmsVerifyCode`，校验时需手动调用 `uniID.verifyCode`。

**uniID.verifyCode 请求参数**

| 参数   | 类型   | 必填 | 说明                                            |
| ------ | ------ | ---- | ----------------------------------------------- |
| mobile | String | 是   | 手机号                                          |
| code   | String | 是   | 用户输入的验证码                                |
| type   | String | 是   | 须与发送验证码时传入的 type 一致（如 "verify"） |

**返回说明**

返回值为 `{ code, msg }`。`code` 为 `0` 表示校验成功，其他值均为失败；`msg` 为失败原因（如验证码错误或过期）。

**云函数调用示例**

```js
'use strict';
module.exports = {
  main: async (event) => {
    let { data = {}, userInfo, util, filterResponse, originalParam } = event;
    let { customUtil, uniID, config, pubFun, vk, db, _, $ } = util;
    let { uid } = data;
    let res = { code: 0, msg: '' };
    // 业务逻辑开始-----------------------------------------------------------
    let verifyCodeRes = await uniID.verifyCode({
      mobile: '15200000001', // 手机号
      code: '123456', // 验证码
      type: 'verify', // 此处的type的值需和你发送验证码时传的type一致
    });
    if (verifyCodeRes.code !== 0) {
      // 校验失败
      return {
        code: -1,
        msg: '短信验证码错误',
      };
    }
    // 校验成功，继续执行其他逻辑

    // 业务逻辑结束-----------------------------------------------------------
    return res;
  },
};
```

**云对象调用示例**

```js
let { uniID } = this.getUtil();
let verifyCodeRes = await uniID.verifyCode({
  mobile: '15200000001', // 手机号
  code: '123456', // 验证码
  type: 'verify', // 此处的type的值需和你发送验证码时传的type一致
});
if (verifyCodeRes.code !== 0) {
  // 校验失败
  return {
    code: -1,
    msg: '短信验证码错误',
  };
}
// 校验成功，继续执行其他逻辑
```

## 配置 unicloud 短信@unicloud

定位到文件 `uniCloud/cloudfunctions/common/uni-config-center/uni-id/config.json` 的 `service.sms`

```js
"sms": {
  "name": "重要",
  "codeExpiresIn": 180,       // 验证码过期时间，单位为秒，注意一定要是60的整数倍
  "templateId": "",           // 发送验证码的短信模板ID（此模板id仅配合vk.system.smsUtil.sendSmsVerifyCode API需要）
  "smsKey": "",               // 可不填，短信密钥key，开通短信服务处可以看到 https://dev.dcloud.net.cn/uniSms
  "smsSecret": ""             // 可不填，短信密钥secret，开通短信服务处可以看到 https://dev.dcloud.net.cn/uniSms
},
```

配置完需要上传 `uni-config-center` 这个公共模块才会生效

## 配置阿里云短信@aliyun

定位到文件 `uniCloud/cloudfunctions/common/uni-config-center/vk-unicloud/index.js` 的 `vk.service.sms`

```js
// 短信服务
"sms": {
  // 阿里云短信服务
  "aliyun": {
    "enable": true,       // 是否启用阿里云短信
    "accessKeyId": "",     // 短信密钥key
    "accessKeySecret": "", // 短信密钥secret
    "signName": "",        // 默认签名
    "templateCode": {
      "verifyCode": ""     // 验证码短信模板 - 此模板id仅配合vk.system.smsUtil.sendSmsVerifyCode API需要
    }
  }
},
```

配置完需要上传 `uni-config-center` 这个公共模块才会生效

## 常见问题@question

### 发送短信失败，报错 uniCloud.sendSms 由 uni-cloud-sms 扩展库提供，请确保云函数/云对象/clientDB 依赖了此扩展库@q1

需要右键云函数，管理依赖，添加 uni-cloud-sms 扩展库，如下图所示

![](https://mp-cf0c5e69-620c-4f3c-84ab-f4619262939f.cdn.bspapp.com/vk-doc/446.png)
