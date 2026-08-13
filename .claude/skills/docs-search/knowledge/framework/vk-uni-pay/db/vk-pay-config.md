---
sidebarDepth: 0
---

# vk-pay-config

## 说明

**统一支付配置表**

该表为插件支付专用表，主要存放商户的支付配置

## 字段

| 字段名称            | 字段类型 | 必填 | 默认值 | 说明                                                                              |
| ------------------- | :------: | :--: | :----: | --------------------------------------------------------------------------------- |
| \_id                |  string  |  是  |        | 商户支付 pid                                                                      |
| alipay              |  object  |  否  |        | 支付宝支付配置 [详情](#alipay字段-支付宝配置说明)                                 |
| wxpay               |  object  |  否  |        | 微信支付配置[详情](#wxpay字段-微信支付配置说明)                                   |
| alipayAppPayToH5Pay | boolean  |  否  | false  | 是否使用当面付接口来代替支付宝 app 支付<br/>优势：可免去申请支付宝 APP 支付的接口 |
| appleiap            |  object  |  否  |        | ios 内购支付配置                                                                  |
| vkspay              |  object  |  否  |        | VksPay 个人支付配置                                                               |
| wxpay-virtual       |  object  |  否  |        | 微信小程序虚拟支付配置                                                            |
| douyin              |  object  |  否  |        | 抖音支付配置                                                                      |

## 完整数据格式示例

```js
{
  "_id":"001",
  "wxpay": {
    "mp-weixin": {
      "appId": "",
      "secret": "",
      "mchId": "",
      "key": "",
      "pfx": "",
      "v3Key": "",
      "appCertContent": "",
      "appPrivateKeyContent": "",
      "wxpayPublicKeyContent": "",
      "wxpayPublicKeyId": "",
      "version": 3
    },
    "app-plus": {
      "appId": "",
      "secret": "",
      "mchId": "",
      "key": "",
      "pfx": "",
      "v3Key": "",
      "appCertContent": "",
      "appPrivateKeyContent": "",
      "wxpayPublicKeyContent": "",
      "wxpayPublicKeyId": "",
      "version": 3
    },
    "h5": {
      "appId": "",
      "secret": "",
      "mchId": "",
      "key": "",
      "pfx": "",
      "v3Key": "",
      "appCertContent": "",
      "appPrivateKeyContent": "",
      "wxpayPublicKeyContent": "",
      "wxpayPublicKeyId": "",
      "version": 3
    },
    "h5-weixin": {
      "appId": "",
      "secret": "",
      "mchId": "",
      "key": "",
      "pfx": "",
      "v3Key": "",
      "appCertContent": "",
      "appPrivateKeyContent": "",
      "wxpayPublicKeyContent": "",
      "wxpayPublicKeyId": "",
      "version": 3
    },
    "mweb": {
      "appId": "",
      "secret": "",
      "mchId": "",
      "key": "",
      "pfx": "",
      "v3Key": "",
      "appCertContent": "",
      "appPrivateKeyContent": "",
      "wxpayPublicKeyContent": "",
      "wxpayPublicKeyId": "",
      "version": 3,
      "sceneInfo": {
        "h5_info": {
          "type": "Wap",
          "wap_url": "https://www.xxxxxx.com",
          "wap_name": "网站名称"
        }
      }
    },
    "transfer": {
      "appId": "",
      "mchId": "",
      "v3Key": "",
      "appCertContent": "",
      "appPrivateKeyContent": "",
      "wxpayPublicKeyContent": "",
      "wxpayPublicKeyId": "",
      "version": 3
    }
  },
  "alipay": {
    "mp-alipay": {
      "appId": "",
      "privateKey": "",
      "alipayPublicCertContent": "",
      "alipayRootCertContent": "",
      "appCertContent": "",
      "sandbox": false
    },
    "app-plus": {
      "appId": "",
      "privateKey": "",
      "alipayPublicCertContent": "",
      "alipayRootCertContent": "",
      "appCertContent": "",
      "sandbox": false
    },
    "h5": {
      "appId": "",
      "privateKey": "",
      "alipayPublicCertContent": "",
      "alipayRootCertContent": "",
      "appCertContent": "",
      "sandbox": false
    },
    "transfer": {
      "appId": "",
      "privateKey": "",
      "alipayPublicCertContent": "",
      "alipayRootCertContent": "",
      "appCertContent": "",
      "sandbox": false
    }
  },
  "appleiap": {
    "app-plus": {
      "password": "",
      "timeout": 10000,
      "receiptExpiresIn": 86400,
      "sandbox": false
    }
  },
  "wxpay-virtual": {
    "mp-weixin": {
      "appId": "",
      "secret": "",
      "mchId": "",
      "offerId": "",
      "appKey": "",
      "sandboxAppKey": "",
      "rate": 100,
      "token": "",
      "encodingAESKey": "",
      "sandbox": false
    }
  },
  "vkspay": {
    "mchId": "",
    "key": ""
  },
  "douyin": {
    "mp-toutiao": {
      "appId": "",
      "secret": "",
      "mchId": "",
      "salt": "",
      "token": "",
      "sandbox": false
    }
  }
}
```

## wxpay 字段（微信支付配置说明）

### v2 版本

| 字段名称 | 字段类型 | 必填 | 默认值 | 说明                                                                   |
| -------- | :------: | :--: | :----: | ---------------------------------------------------------------------- |
| appId    |  string  |  是  |        | 微信后台的 appId                                                       |
| secret   |  string  |  是  |        | 微信后台的 secret（微信小程序、微信公众号必填）                        |
| mchId    |  string  |  是  |        | 微信支付的商户 id                                                      |
| key      |  string  |  是  |        | 微信支付 V2 版本的 api 密钥                                            |
| pfx      |  string  |  否  |        | 微信支付 V2 版本的 p12 证书（apiclient_cert.p12 证书转 base64 后的值） |
| version  |  number  |  是  |   2    | 启用支付的版本 2 代表 v2 版本 3 代表 v3 版本                           |

### v3 版本

| 字段名称              | 字段类型 | 必填 | 默认值 | 说明                                                                                                                                                                                   |
| --------------------- | :------: | :--: | :----: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| appId                 |  string  |  是  |        | 微信后台的 appId                                                                                                                                                                       |
| secret                |  string  |  是  |        | 微信后台的 secret（微信小程序、微信公众号必填）                                                                                                                                        |
| mchId                 |  string  |  是  |        | 微信支付的商户 id                                                                                                                                                                      |
| v3Key                 |  string  |  是  |        | 微信支付 V3 版本的 api 密钥                                                                                                                                                            |
| appCertContent        |  string  |  是  |        | 微信支付 V3 版本需要用到的证书<br/>apiclient_cert.pem 文件内的字符串的值（变成一行，且换行处需要加\n）                                                                                 |
| appPrivateKeyContent  |  string  |  是  |        | 微信支付 V3 版本需要用到的证书<br/>apiclient_key.pem 文件内的字符串的值（变成一行，且换行处需要加\n）                                                                                  |
| wxpayPublicKeyContent |  string  | 特殊 |        | 微信支付 V3 需要用到的证书<br/>pub_key.pem 文件内的字符串的值（变成一行，且换行处需要加\n）<br/>仅限开启了微信支付公钥的商户，若已开通微信支付平台证书的商户可无视此参数或注释掉此参数 |
| wxpayPublicKeyId      |  string  | 特殊 |        | 微信支付 V3 版本需要用到的微信支付公钥 ID，值为以 `PUB_KEY_ID_` 开头的一串字符串<br/>仅限开启了微信支付公钥的商户，若已开通微信支付平台证书的商户可无视此参数或注释掉此参数            |
| version               |  number  |  是  |   3    | 启用支付的版本 2 代表 v2 版本 3 代表 v3 版本                                                                                                                                           |

## alipay 字段（支付宝配置说明）

| 字段名称                | 字段类型 | 必填 | 默认值 | 说明                                                                                             |
| ----------------------- | :------: | :--: | :----: | ------------------------------------------------------------------------------------------------ |
| appId                   |  string  |  是  |        | 支付宝开放平台的应用 appId                                                                       |
| privateKey              |  string  |  是  |        | 应用私钥                                                                                         |
| alipayPublicCertContent |  string  |  是  |        | 支付宝公钥证书<br/>alipayCertPublicKey_RSA2.crt 文件内的字符串的值（变成一行，且换行处需要加\n） |
| alipayRootCertContent   |  string  |  是  |        | 支付宝根证书<br/>alipayRootCert.crt 文件内的字符串的值（变成一行，且换行处需要加\n）             |
| appCertContent          |  string  |  是  |        | 应用公钥证书<br/>appCertPublicKey.crt 文件内的字符串的值（变成一行，且换行处需要加\n）           |
| sandbox                 |  string  |  否  | false  | 是否沙箱模式 true 沙箱模式 false 正常模式                                                        |

## 特别说明

- 微信 V2 版本的 `pfx` 的值是 `apiclient_cert.p12` 证书文件转 `base64` 后的值
- 微信 V3 版本的 `appCertContent` 的值是 `apiclient_cert.pem` 证书文件内的字符串的值（变成一行，且换行处需要加\n）
- 微信 V3 版本的 `appPrivateKeyContent` 的值是 `apiclient_key.pem` 证书文件内的字符串的值（变成一行，且换行处需要加\n）
- 微信 V3 版本的 `wxpayPublicKeyContent` 的值是 `pub_key.pem` 证书文件内的字符串的值（变成一行，且换行处需要加\n）仅限开启了微信支付公钥的商户，若已开通微信支付平台证书的商户可无视此参数或注释掉此参数，[详情查看](https://vkdoc.fsq.pub/vk-uni-pay/config.html#wxpaypublickeypath)
- 微信 V3 版本的 `wxpayPublicKeyId` 的值是微信支付公钥 ID，值为以 `PUB_KEY_ID_` 开头的一串字符串 [详情查看](https://vkdoc.fsq.pub/vk-uni-pay/config.html#wxpaypublickeypath)
- 支付宝的 `alipayPublicCertContent` 的值是 `alipayCertPublicKey_RSA2.crt` 证书文件内的字符串的值（变成一行，且换行处需要加\n）
- 支付宝的 `alipayRootCertContent` 的值是 `alipayRootCert.crt` 证书文件内的字符串的值（变成一行，且换行处需要加\n）
- 支付宝的 `appCertContent` 的值是 `appCertPublicKey.crt` 证书文件内的字符串的值（变成一行，且换行处需要加\n）

### 证书如何转 base64

新建一个云函数，同时将微信 p12 证书复制到跟这个云函数同级目录，运行以下代码即可获得 base64。

```js
const fs = require('fs');
let pfx = fs.readFileSync(__dirname + '/apiclient_cert.p12');
let base64 = pfx.toString('base64');
console.log('base64: ', base64);
```

或直接使用证书转换工具 [传送门 - 证书转换工具](https://vkunicloud.fsq.pub/admin/#/pages_template/components/form/form-pay-cert)

### 证书如何快速变成一行

[传送门 - 证书快速变成一行](https://vkunicloud.fsq.pub/admin/#/pages_template/components/form/form-pay-cert)
