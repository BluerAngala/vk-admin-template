---
sidebarDepth: 0
---

# 常见问题

## 运行示例项目报错@q1

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/c92a0b26-0745-4e0f-a138-73bd1e11d9d0.png)

如果报上面这个错误，则分别在下图 2 个目录执行 npm i 命令

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/3ea7c826-8f63-4fd4-824a-e642f73a212a.png)

## 运行示例项目提示不能本地运行@q2

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/32f459fb-c7f5-4a61-b88e-1944c44523c1.png)

因为加密了，只能云端运行，不可以本地运行，如果要本地运行，则需要购买源码版。

## 购买了源码版，但源码还是加密的@q3

删除这个文件即可。

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/90d1be7f-9d4c-4567-aa81-5bb255639d99.png)

## 微信 H5 外部浏览器支付流程@q4

- 1、用户点击发起支付
- 2、唤起微信 APP，在微信 APP 内输入支付密码
- 3、支付成功后，会返回之前的页面（返回的页面可以通过 `return-url` 指定）

```vue
<vk-uni-pay ref="vkPay" :status.sync="vkPay.status" :query-payment-action="vkPay.queryPaymentAction" :return-url="vkPay.returnUrl"></vk-uni-pay>
```

- 4、此时页面需要弹出一个确认支付的弹窗

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/e6cbafb2-bdaf-444a-bc15-7704a8b408ad.png)

- 5、用户点击已完成支付，则会请求云函数，云函数会请求微信支付服务器进行查询是否真的已付款。
- （其中第 5 步建议替换成请求你自己业务的订单查询云函数，云函数内查询订单是否已被异步回调处理成已付款）
- 6、若已付款，前端应该自己处理下付款成功后的页面展示逻辑。

#### 注意事项

- 1、H5 支付的域名需要在微信支付商户后台进行配置
- 2、H5 支付的 unicloud 配置在 `uniCloud/cloudfunctions/common/uni-config-center/uni-pay/config.js` 的

```js
// 微信 - 手机外部浏览器H5支付
"wxConfigMweb": {
  "appId": "", // 可以是小程序的也可以是公众号的
  "secret": "",
  "mchId": "", // 商户id
  "key": "", // 商户key
  "pfx": fs.readFileSync(__dirname+'/wxpay/apiclient_cert.p12'),
  // 场景信息，必填
  "sceneInfo":{
    "h5_info":{
      "type": "Wap", // 此值固定Wap
      "wap_url": "https://www.xxxx.cn",// 你的H5首页地址，必须和你发起支付的页面的域名一致。
      "wap_name": "你的网站名称",// 你的H5网站名称
    }
  }
},
```

- 3、微信 H5 支付不支持在微信浏览器中支付（只能在非微信 APP 的浏览器中发起支付）（微信浏览器中只能用公众号支付）
- 4、returnUrl 的值必须是 http 或 https 开头的绝对路径，且在微信 H5 支付配置的域名白名单中。你还需要将此 H5 域名加入 uniCloud 白名单

## 微信公众号支付注意事项@q5

- 1、h5 的路由模式必须配置为 `history`，因为微信公众号登录的回调地址不支持 `hash` 模式。

- 2、微信公众号支付时，openid 为必传参数，需要先获取用户的 openid（网页授权）（一般你微信公众号登录的时候已经取到了）

获取 openid 的方法 [点击查看微信公众号文档](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html)

具体而言，获取 openid 流程分为两步：

- 1、访问授权页面，获取 code

- 2、通过 code 换取 openid

授权地址为：

`https://open.weixin.qq.com/connect/oauth2/authorize?appid=你公众号的appid&redirect_uri=你的回调地址&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect`

注意：

redirect_uri（你的回调地址）不可以带参数，访问授权页面后，最终会返回你的回调地址页面，同时带上 `code` 参数，使用这个 `code` 参数即可获取 `openid`（注意 `code` 是一次性的）

拼接完授权地址 url 后，直接执行下面代码即可访问授权页面

```js
window.location.href = url;
```

其中 scope = snsapi_base 时，为静默授权（无需用户点击同意）（但只能获取 openid）

scope = snsapi_userinfo 时，是用来获取用户的基本信息的。但这种授权需要用户手动同意，并且由于用户同意过，所以无须关注，就可在授权后获取该用户的基本信息。

#### 如何通过 code 换取 openid?

**vkUtil 在 `uni_modules/vk-uni-pay/js_sdk/vk-util.js`**

```js
vkUtil.getH5Openid(code).then((res) => {
  console.log('res', res);
});
```

**注意：**

- 1、微信公众号支付的域名需要在微信支付商户后台进行配置

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/76a353e8-eb7f-4a83-8005-d3fa60ee9e46.png)

- 2、微信公众号支付的 unicloud 配置在 `uniCloud/cloudfunctions/common/uni-config-center/uni-pay/config.js` 的 `wxpay` 节点的 `h5-weixin`

```js
// 微信 - 公众号支付（微信支付申请JSAPI支付）
"h5-weixin": {
  "appId": "",
  "secret": "",
  "mchId": "",
  "key": "",
  "pfx": fs.readFileSync(__dirname + '/wxpay/apiclient_cert.p12')
},
```

- 3、微信公众号支付只能在微信浏览器中支付（非微信 APP 的浏览器中无法发起支付，非微信 APP 的浏览器请使用 H5 支付）

#### 微信公众号支付本地调试技巧

微信公众号开发调试比较麻烦，麻烦在于网页授权需要添加域名白名单，用 localhost 或用 ip 访问本地是无法获取到微信的 code 的，这样也就无法获取 openid，导致无法支付。

操作步骤

- 1、手机和电脑连接在同一个局域网（路由器 WiFi 下）
- 2、查看自己电脑的局域网 ip 地址，比如为 192.168.1.8
- 3、假设你的线上域名是（必须要有自己的域名）www.abc.com 则设置 test.abc.com 先解析到你的前端托管域名上（为了让微信验证域名通过，因为验证域名时，需要上传微信指定的文件到你的前端托管）。
- 4、进入公众号后台，设置与开发 -> 公众号设置 -> 设置网页授权域名，添加 test.abc.com
- 5、成功添加后，再重新设置 test.abc.com 解析到你电脑的局域网 ip，如 192.168.1.8
- 6、过一段时间（大概 20 分钟后，更换域名解析生效需要时间，这 20 分钟内千万不要再去访问http://test.abc.com）
- 7、20 分钟后，访问 http://test.abc.com 此时就等于访问了 http://192.168.1.8，这样你的手机就用 http://test.abc.com 来访问你的项目
- 8、可以正常获取到 openid 了，就可以正常进行本地微信公众号支付测试了（不然每次都要上传到服务器测试）。

当用自定义域名时，还需要在项目根目录添加 `vue.config.js` 文件，文件内容如下：

```js
module.exports = {
  devServer: {
    disableHostCheck: true, // 忽略域名检查
    port: 80, // 设置80端口为项目启动端口
  },
};
```

## H5 支付浏览器报跨域错误@q6

- 进入 `unicloud` 控制台 [https://unicloud.dcloud.net.cn/home](https://unicloud.dcloud.net.cn/home)
- 点击跨域配置

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/045bbc8d-363e-4e1b-99e5-028b39e89eeb.png)

- 将你浏览器访问的域名加入安全域名中

如 将 `localhost:8080` `localhost:8081` `localhost:8082` `www.aaaa.com` 等加入安全域名

**_你浏览器中访问的域名是什么，就加什么域名_**

## 小程序体验版和正式版无法请求云函数@q7

[传送门 - 查看解决方案](https://vkdoc.fsq.pub/client/question/q10.html)

## APP 支付签名失败？@q8

APP 支付必须打自定义基座，包名和签名等必须和开放平台上填写的一致，且开放平台上申请的应用必须已通过审核。

## 发起支付时提示：请先配置正确的异步回调 URL@q9

配置文件在 `cloudfunctions/common/uni-config-center/uni-pay/config.js`(没有则新建)

配置属性 `notifyUrl` 格式为 "服务空间 SpaceID":"URL 化完整地址"

如：

```json
"notifyUrl": {
  "mp-22d55e33-c2f3-22b4-55fc-7b33a6144e22": "https://fc-mp-22d55e33-c2f3-22b4-55fc-7b33a6144e22.next.bspapp.com/http/vk-pay",
}
```

[查看完整配置文件](https://vkdoc.fsq.pub/vk-uni-pay/config.html)

**_如何获取服务空间 SpaceID?_**

- 进入 `unicloud` 控制台 [https://unicloud.dcloud.net.cn/home](https://unicloud.dcloud.net.cn/home)
- 这个就是

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/42a14023-1a36-4920-af40-89e8aef05d87.png)

**_如何获取 URL 化完整地址_**

- 进入 `unicloud` 控制台 [https://unicloud.dcloud.net.cn/home](https://unicloud.dcloud.net.cn/home)
- 进入对应的服务空间，点击左侧【云函数】-【函数列表】- 点击云函数 vk-pay 右边的 【详情】，在详情页即可看到 url 地址。

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/5722777d-d636-4b8e-9db5-f9c5ceac6ee0.png)

## 微信支付的 key 密钥在哪里获取?@q10

进入微信支付后台，点击账户中心 - API 安全 - 设置 APl2 密钥 - 修改（密钥只能修改后才能查看）

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/21b12172-ea0c-4f69-a064-2211a1fe149c.png)

## 如何使用 http 方式获取支付参数?@q11

![](https://cdn.fsq.pub/vkdoc/vk-pay/1715841080654k3jsq5k9cag.png)

注意：正式上线的项目，请不要将退款、转账等涉及资金外流的函数写到 `vk-pay` 自带的云函数中，你应该写在 `router` 或其他具有权限判断的云函数中鉴权（其他云函数可通过 `vk-uni-pay` 这个公共模块来调用退款等接口）

## 抖音支付如何请求其他 API@q12

以 `发起结算及分账` 接口为例，代码如下

```js
// 引入 vk-uni-pay 模块
const vkPay = require('vk-uni-pay');
// 初始化抖音支付实例
let uniPayInstance = await vkPay.initUniPayInstance({
  pay_type: 'douyin_mp-toutiao',
});
let out_trade_no = 'test_1719298119508';
// 发起请求
let requestRes = await uniPayInstance.request({
  method: 'POST',
  action: 'api/apps/ecpay/v1/settle',
  data: {
    out_settle_no: `st_${out_trade_no}`, // 自定义结算分账单号
    out_order_no: out_trade_no, // 订单号
    settle_desc: '主动结算', // 备注
    notify_url: `https://fc-mp-33d35e24-c2f3-47b4-80fc-7b23a666666.next.bspapp.com/http/vk-pay/vk-pay-notify/douyin_mp-toutiao/${out_trade_no}`, // 这里改成你的支付回调地址
    finish: 'true', // 是否完结订单
  },
});
console.log('requestRes: ', requestRes);
if (requestRes.code === 0) {
  // 执行成功
} else {
  // 执行失败
}
```

## 微信支付 APIv3 请求接口报错，提示未找到平台证书或微信支付公钥@q13

微信支付官方在 2024 年 12 月左右升级了 Ta 的验签证书模式，原来的微信支付平台证书，证书是通过 API 下载的，现在改成了微信支付公钥，证书是在网页端直接下载的。[查看详情](https://vkdoc.fsq.pub/vk-uni-pay/config.html#wxpaypublickeypath)

<style scoped>
h1{
  font-size:1.4em;
}

h2{
  font-size:1.3em;
}

h3{
  font-size:1.1em;
}
</style>
