---
sidebarDepth: 0
---

# uni-id 配置

## 完整配置

**配置文件所在文件位置：`uniCloud/cloudfunctions/common/uni-config-center/uni-id/config.json`**

**由于`uni-id`配置无法打注释，故下方为`uni-id`配置的介绍（实际使用需要去除所有注释）**

```json
{
  "passwordSecret": "passwordSecret-demo", // 加密密码所用的密钥，修改会导致所用户之前的密码失效。如一定要修改，请查看https://uniapp.dcloud.io/uniCloud/uni-id?id=modifysecret
  "tokenSecret": "tokenSecret-demo", // 生成token所用的密钥，修改会导致所有用户之前的token失效。
  "tokenExpiresIn": 604800, // 全平台token过期时间，未指定过期时间的平台会使用此值，604800代表7天
  "tokenExpiresThreshold": 259200, // checkToken时如果token有效期小于此值则自动获取新token，如果不配置此参数则不开启自动获取新token功能
  "tokenMaxLimit": 10, // 每个账户的最大token数量，0为不限，淘汰策略：新的淘汰旧的（注意，即使设置为0，框架也会自动淘汰已过期的token）
  "passwordErrorLimit": 6, // 密码错误最大重试次数
  "bindTokenToDevice": false, // 是否将token和设备绑定，设置为true会进行ua校验
  "passwordErrorRetryTime": 3600, // 密码错误重试次数超限之后的冻结时间
  "autoSetInviteCode": true, // 是否在用户注册时自动设置邀请码
  "forceInviteCode": false, // 是否强制用户注册时必填邀请码，默认为false（需要注意的是目前只有短信验证码注册才可以填写邀请码）
  "preferedAppPlatform": "app-plus", // 指定app端对应的PLATFORM名称，用于处理app-plus和app的兼容问题，详细说明见：https://uniapp.dcloud.net.cn/uniCloud/uni-id?id=prefered-app-platform
  "preferedWebPlatform": "h5", // 指定web端对应的PLATFORM名称，用于处理web和h5兼容性问题
  "app-plus": {
    "tokenExpiresIn": 604800, // app端 token过期时间
    "oauth": {
      // App微信登录所用到的appid、appsecret需要在微信开放平台获取，注意：不是公众平台而是开放平台
      "weixin": {
        "appid": "",
        "appsecret": ""
      },
      "huawei": {
        "clientId": "",
        "clientSecret": ""
      },
      "apple": {
        "bundleId": ""
      }
    }
  },
  "mp-weixin": {
    "oauth": {
      // 微信小程序登录所用的appid、appsecret需要在对应的小程序管理控制台获取
      "weixin": {
        "appid": "",
        "appsecret": ""
      }
    }
  },
  "h5": {
    "oauth": {
      // 微信PC网站扫码登录所用的appid、appsecret（前往微信开放平台申请）
      "weixin": {
        "appid": "",
        "appsecret": ""
      }
    }
  },
  "h5-weixin": {
    "oauth": {
      // 微信公众号登录所用的appid、appsecret
      "weixin": {
        "appid": "",
        "appsecret": ""
      }
    }
  },
  "mp-alipay": {
    "oauth": {
      // 支付宝小程序登录用到的appid、privateKey请参考支付宝小程序的文档进行设置或者获取，https://opendocs.alipay.com/open/291/105971#LDsXr
      "alipay": {
        "appid": "",
        "privateKey": ""
      }
    }
  },
  "service": {
    // unicloud短信
    "sms": {
      "name": "重要", // 应用名称，对应短信模版的name
      "codeExpiresIn": 180, // 验证码过期时间，单位为秒，注意一定要是60的整数倍
      "templateId": "你的短信模板ID" // 短信模板ID
    },
    // 一键登录
    "univerify": {
      "appid": "your appid" // uniapp的appid
    }
  }
}
```

## 修改 passwordSecret

> `注意：通常情况下设定好passwordSecret之后不需要再进行修改，使用此功能时请务必小心谨慎`

**说明**

在 config.json 内修改 passwordSecret 会导致历史用户无法通过密码登录。但是某些情况下有些应用有修改 passwordSecret 的需求，例如刚开始使用 uni-id 时没有自定义 passwordSecret，现在想要自定义 passwordSecret）

**如何使用**

下面以将 passwordSecret 从`passwordSecret-demo`修改为`qwertyasdfgh`为例介绍如何使用

```json
// 旧config.json
{
  "passwordSecret": "passwordSecret-demo"
}

// 新config.json
{
  "passwordSecret": [{
    "version": 1,
    "value": "passwordSecret-demo"
  },{
    "version": 2,
    "value": "qwertyasdfgh"
  }]
}

```

如果在上面基础上再修改 passwordSecret 为`1q2w3e4r5t`,config.json 调整如下

> !!!注意只有在数据库内完全没有使用某个版本（`password_secret_version`字段表示了用户密钥版本）密钥的用户才可以将此密钥从 config.json 内去除。没有`password_secret_version`的用户使用的是最旧版本的 passwordSecret，如果存在这样的用户对应的 passwordSecret 也不可去除。

```json
// 新config.json，
{
  "passwordSecret": [
    {
      "version": 1,
      "value": "passwordSecret-demo"
    },
    {
      "version": 2,
      "value": "qwertyasdfgh"
    },
    {
      "version": 3,
      "value": "1q2w3e4r5t"
    }
  ]
}
```

**原理**

uni-id-users 表内存储的 password 字段为使用 hmac-sha1 生成的 hash 值，此值不可逆向推出用户真实密码。所以直接修改 passwordSecret 会导致老用户无法使用密码登录。

上述修改通过密钥版本号区分新旧密钥，用户登录时如果密钥版本小于当前最新版本，会为用户更新数据库内存储的 password 字段，并记录当前使用的密钥版本。

用户对应的数据库记录内没有密钥版本的话会使用最低版本密钥进行密码校验，校验通过后为用户更新为最新版密钥对应的 password 并记录版本号。

由于是不可逆加密，理论上 passwordSecret 泄露不会造成用户的真实密码被泄露，自定义 passwordSecret 只是进一步加强安全性。

## 自定义 token 内容

token 内默认缓存了用户的角色权限。但是某些情况下开发者可能还希望缓存一些别的东西，以便在客户端能方便的访问（**注意：不可缓存机密信息到 token 内**）。

**用法**

创建文件：`uniCloud/cloudfunctions/common/uni-config-center/uni-id/custom-token.js` 内容如下：

```js
module.exports = async (tokenObj) => {
  // tokenObj为原始token信息结构如下
  // {
  //   uid: 'abc', // 用户id
  //   role: [], // 用户角色列表
  //   permission: [] // 用户权限列表，admin角色的用户权限列表为空数组
  // }

  tokenObj.customField = 'hello custom token'; // 自定义token字段
  return tokenObj; // 注意务必返回修改后的token对象
};
```

uni-id 会自动加载 custom-token.js 进行处理，在所有生成 token 的操作（包括：登录、注册、token 过期自动刷新、开发者自行调用 createToken）执行时自动获取新 token 信息，并生成 token。

**注意**

- 使用 custom-token 时自行调用 createToken 接口会变为异步操作，需使用`await uniID.createToken(...)`
- 千万不要删除原始 token 内的字段
