# 示例项目运行教程

## 1、下载安装

- 1、从插件市场下载 `vk-uni-pay` 插件示例项目到你的 hbx 中。[插件市场传送门](https://ext.dcloud.net.cn/plugin?id=5642)
- 2、配置支付参数文件地址: `uniCloud/cloudfunctions/common/uni-config-center/uni-pay/config.js`(没有则新建) [查看支付参数](https://vkdoc.fsq.pub/vk-uni-pay/config.html)
- 3、复制 `使用帮助/vk-pay云函数示例代码/service/` 目录内的所有文件粘贴到 `vk-uni-pay/uniCloud/cloudfunctions/vk-pay/service/` 目录(没有目录则新建)
- 注意：测试完记得删除 `vk-uni-pay/uniCloud/cloudfunctions/vk-pay/service/pay/`目录下的这两个文件（`refund.js`和`transfer.js`）（因为涉及资金退款和转账）
- 4、右键 `uniCloud` 点击 `运行云服务空间初始化向导`
- 5、完成

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/5be98077-d85c-4392-9a70-3b6941a0af00.png)

其中第三步的文件在这里

![](https://mp-cf0c5e69-620c-4f3c-84ab-f4619262939f.cdn.bspapp.com/vk-doc/427.png)

## 2、配置 uni-id 里的小程序参数

因为小程序支付需要获取用户 openid（故需要配置 uni-id）

如果你不使用微信小程序支付，则直接跳过第二步

- 打开文件 `cloudfunctions/common/uni-config-center/uni-id/config.json`(没有则新建)（注意这里是`config.json`)

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/bc4c3c64-531c-4711-b32e-40679445fbdd.png)

**微信小程序支付时需要获取 `openId` ，故需要配置 `mp-weixin`**

**支付宝小程序支付时需要获取 `openId` ，故需要配置 `mp-alipay`**

- 完整的 uni-id 配置代码如下

```json
{
  "passwordSecret": "passwordSecret-demo",
  "tokenSecret": "tokenSecret-demo",
  "tokenExpiresIn": 7200,
  "tokenExpiresThreshold": 600,
  "passwordErrorLimit": 6,
  "bindTokenToDevice": false,
  "passwordErrorRetryTime": 3600,
  "autoSetInviteCode": true,
  "forceInviteCode": false,
  "app-plus": {
    "tokenExpiresIn": 2592000,
    "oauth": {
      "weixin": {
        "appid": "weixin appid",
        "appsecret": "weixin appsecret"
      },
      "apple": {
        "bundleId": "your APP bundleId"
      }
    }
  },
  "mp-weixin": {
    "oauth": {
      "weixin": {
        "appid": "weixin appid",
        "appsecret": "weixin appsecret"
      }
    }
  },
  "mp-alipay": {
    "oauth": {
      "alipay": {
        "appid": "alipay appid",
        "privateKey": "alipay privateKey"
      }
    }
  },
  "service": {
    "sms": {
      "name": "DCloud",
      "codeExpiresIn": 300,
      "smsKey": "your sms key",
      "smsSecret": "your sms secret"
    },
    "univerify": {
      "appid": "your appid",
      "apiKey": "your apiKey",
      "apiSecret": "your apiSecret"
    }
  }
}
```

- 配置完后，还需要到项目根目录的 `manifest.json` 文件中再次配置一下微信小程序的 `appid`，如下图所示

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/193905eb-6840-43fb-a5db-d3cfde6a9a3d.png)

## 3、配置 uni-pay 支付参数

[传送门](https://vkdoc.fsq.pub/vk-uni-pay/config.html)
