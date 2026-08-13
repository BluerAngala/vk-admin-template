---
sidebarDepth: 0
---

# 微信公众号 JSAPI

:::warning 注意

1. 以下 API 需要 vk-unicloud 核心库版本 >= 2.16.0
2. 此为前端 API
   :::

## 介绍@introduce

微信公众号 JSAPI 是指微信公众平台面向网页开发者提供的基于微信内的网页 API

网页开发者可借助微信高效地使用拍照、选图、语音、位置等手机系统的能力，同时可以直接使用微信分享、扫一扫、卡券、支付等微信特有的能力，为微信用户提供更优质的网页体验。

[微信公众号文档地址](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html)

从上面的文档开始开发需要写很多代码才能使用微信公众号 JSAPI 的能力，但基于 vk 框架的微信公众号 JSAPI 只需要几行代码即可实现。见 [快速上手](#快速上手)

## 配置文件@config

微信公众号 JSAPI 依赖微信公众号 API 的配置

打开 `uniCloud/cloudfunctions/common/uni-config-center/uni-id/config.json` 文件，配置里面的

"h5-weixin" 微信公众号

```js
"h5-weixin": {
  "oauth": {
    "weixin": {
      "appid": "",
      "appsecret": ""
    }
  }
},
```

配置完需要上传 `uni-config-center` 这个公共模块才会生效

## 依赖的云函数@getWeiXinJsapiSign

依赖云函数 `user/pub/getWeiXinJsapiSign`，文件路径：`/router/service/user/pub/getWeiXinJsapiSign.js` 如果没有这个云函数，请下载最新框架获取。

## 快速上手@quickstart

以微信分享为例

App.vue 的 onLaunch 增加以下代码

```js
onLaunch(options){
  // #ifdef H5
  uni.vk.h5.init(); // 此方法全局调用一次即可
  // #endif
}
```

同时在需要微信分享的页面的 onLoad 增加以下代码（不写在 onLoad，写在其他能执行的方法里都可以）

```js
onLoad(options) {
  // 获得wx实例
  let wx = vk.h5.getWeiXinJsApi();
  // 修改自定义“转发给朋友”按钮的分享内容（注意：微信公众号不支持调用API直接分享，执行此API后依然需要点右上角三个点，点击“转发给朋友”）
  wx.updateAppMessageShareData({
    title: "分享给好友的标题", // 分享标题
    desc: "分享给好友的描述", // 分享描述
    link:  window.location.href, // 分享链接地址
    imgUrl: "https://www.xxx.com/a.jpg" // 分享图片url地址
  });
  // 修改自定义“分享到朋友圈”按钮的分享内容（注意：微信公众号不支持调用API直接分享，执行此API后依然需要点右上角三个点，点击“分享到朋友圈”）
  wx.updateTimelineShareData({
    title: "分享到朋友圈的标题", // 分享标题
    link:  window.location.href, // 分享链接地址
    imgUrl: "https://www.xxx.com/a.jpg" // 分享图片url地址
  });
},
```

完成，就是这么简单，同时为了方便同时设置“转发给朋友”和“分享到朋友圈”，vk 框架新增了一个聚合 API `vk.h5.updateShareData`

```js
onLoad(options) {
  // 修改自定义“转发给朋友”、“分享到朋友圈”按钮的分享内容（注意：微信公众号不支持调用API直接分享，执行此API后依然需要点右上角三个点，点击“转发给朋友”或“分享到朋友圈”）
  vk.h5.updateShareData({
    title: "分享标题", // 分享标题
    desc: "分享描述", // 分享描述，仅“转发给朋友”时有效
    link:  window.location.href, // 分享链接地址
    imgUrl: "https://www.xxx.com/a.jpg" // 分享图片url地址
  });
},
```

**再举一个执行打开微信扫一扫的 API 示例**

在需要执行打开微信扫一扫的时候，编写以下代码（注意：需要先在 App.vue 的 onLaunch 执行 `vk.h5.init();`

```js
// 获得wx实例
let wx = vk.h5.getWeiXinJsApi();
wx.scanQRCode({
  needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
  scanType: ['qrCode', 'barCode'], // 可以指定扫二维码还是一维码，默认二者都有
  success: (res) => {
    let result = res.resultStr; // 当 needResult 为 1 时，扫码返回的结果
  },
});
```

完成，就是这么简单，总结以下一共 3 句代码

1. App.vue 的 onLaunch 执行 `uni.vk.h5.init();`
2. 执行 `let wx = vk.h5.getWeiXinJsApi();` 获得 wx 实例
3. 执行 `wx.xxx` 可直接调用微信公众号 JS-SDK 的 API [JS-SDK 文档](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#10)

至于 token 获取，jsapi_ticket 获取，页面签名等等各种繁琐的步骤再也不用管了，直接通过 `wx.xxx` 调用即可。

## 多公众号调用@many

只需要修改第一步 App.vue 的 onLaunch 的代码如下

其中 appid 前端传，而 appsecret 在云函数 `user/pub/getWeiXinJsapiSign` 里通过 appid 获取

```js
onLaunch(options){
  // #ifdef H5
  uni.vk.userCenter.getWeiXinJsapiSign({
    data: {
      appid: "你的公众号appid"
    },
    success: (data) => {
      uni.vk.h5.init({
        ...data.config,
        debug: false
      });
    }
  });
  // #endif
}
```
