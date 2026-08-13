---
sidebarDepth: 0
---

# vk-uni-pay 统一支付组件

**使用 `vk-uni-pay` 组件的优势**

- 1、自动请求云函数
- 2、自动识别 H5、小程序、APP，抹平不同平台的代码差异
- 3、H5 扫码支付自动获取二维码地址 vkPay.codeUrl，支持自动轮询获取支付状态
- 4、可实时监听支付状态 vkPay.status 0：待支付 1：支付中 2：已支付
- 5、支付成功的判断是直接查你数据库的订单状态是否已支付，安全可靠。

## template

```vue
<vk-uni-pay
  ref="vkPay"
  :query-payment-action="vkPay.queryPaymentAction"
  :status.sync="vkPay.status"
  :code-url.sync="vkPay.codeUrl"
  :page-show="vkPay.pageShow"
  :polling="vkPay.polling"
></vk-uni-pay>
```

## 属性

| 参数                 | 说明                                                                                    | 类型           | 默认值 | 可选值 |
| -------------------- | --------------------------------------------------------------------------------------- | -------------- | ------ | ------ |
| query-payment-action | 查询支付状态的云函数配置                                                                | Object、String | -      | -      |
| status.sync          | Vue2 特有属性 支付状态 0:待支付 1:支付中 2:已支付                                       | Numbner        | -      | -      |
| code-url.sync        | Vue2 特有属性 PC 扫码支付专用 - 二维码 url 地址                                         | String         | -      | -      |
| qrcode-image.sync    | Vue2 特有属性 PC 扫码支付专用 - 二维码图片 base64 值                                    | String         | -      | -      |
| v-model:status       | Vue3 特有属性 支付状态 0:待支付 1:支付中 2:已支付                                       | Numbner        | -      | -      |
| v-model:code-url     | Vue3 特有属性 PC 扫码支付专用 - 二维码 url 地址                                         | String         | -      | -      |
| v-model:qrcode-image | Vue3 特有属性 PC 扫码支付专用 - 二维码图片 base64 值                                    | String         | -      | -      |
| page-show            | PC 扫码支付专用 - 当前页面是否在前端显示                                                | Boolean        | true   | false  |
| polling              | PC 扫码支付专用 - 是否自动轮询检测扫码支付状态                                          | Boolean        | false  | true   |
| polling-time         | 轮询间隔                                                                                | Number         | 1500   | -      |
| return-url           | 仅微信手机外部浏览器 H5 支付时有效                                                      | String         | -      | -      |
| await-notify         | 支付成功后，是否需要等待异步回调全部执行完成后才通知前端                                | Boolean        | false  | true   |
| pay-order-info       | 支付成功后，是否需要返回支付订单数据                                                    | Boolean        | true   | false  |
| debug                | 是否需要打印调试日志（当前仅用于 ios 内购时生效）                                       | Boolean        | false  | true   |
| auto-get-openid      | 是否自动获取小程序的 openid（若传 false，则在 createPayment 时需要自己传对应的 openid） | Boolean        | true   | false  |

## 方法

**通过 this.$refs.vkPay.xxx(); 方式调用**

| 方法名        | 说明         |
| ------------- | ------------ |
| createPayment | 发起支付     |
| queryPayment  | 查询支付状态 |

**注意：需要在 `template` 内声明组件，且声明 `ref="vkPay"`**

```vue
<vk-uni-pay ref="vkPay" ...其他参数></vk-uni-pay>
```

**Vue3 setup 内写法**

由于 setup 内没有 this，故写法稍微变一下，代码如下：

```js
import { ref } from 'vue';

const vkPay = ref(null); // 这里的 vkPay 变量名必须和组件写的ref的值一致

// this.$refs.vkPay.createPayment 改成 vkPay.value.createPayment
vkPay.value.createPayment({
  // 参数
});
```

## createPayment 示例

```js
this.$refs.vkPay.createPayment({
  // 如果是非路由框架，则action为字符串，值为云函数名称
  // 如果是路由框架，则按下方配置填写
  action: {
    name: 'vk-pay', // 云函数名称
    action: 'pay/createPayment', // 路由模式下云函数地址
    actionKey: 'action', // 路由模式下云函数地址的识别key(注意VK路由框架下,此值为$url)
    dataKey: 'data', // 路由模式下云函数请求参数的识别key
  },
  // 请求数据
  data: {
    provider: form1.provider,
    total_fee: form1.total_fee,
    out_trade_no: form1.out_trade_no,
    subject: form1.subject,
    body: form1.body,
    type: form1.type,
  },
  // 支付订单创建成功回调
  create: (res) => {
    console.log('pay-create', res);
    this.form1.out_trade_no = res.out_trade_no; // 如果订单号是云端生成的，这里可以拿到订单号，此处如果return false; 则不再执行后续逻辑
  },
  // 支付成功回调
  success: (res) => {
    this.toast('支付成功', 'success');
    console.log('pay-success', res);
  },
  // 支付失败回调
  fail: (res) => {
    if (res.failType === 'create') {
      // 创建支付失败时提示
      this.alert(res.msg);
    } else if (res.failType === 'request') {
      // 请求支付失败时提示
      this.toast('请求支付失败');
    } else if (res.failType === 'result') {
      // 支付结果失败时提示
      this.toast('支付失败');
    }
  },
  // 取消回调
  cancel: (res) => {
    this.toast('用户取消支付');
  },
});
```

## queryPayment 示例

```js
this.$refs.vkPay.queryPayment({
  title: '查询中...',
  data: {
    out_trade_no: this.form1.out_trade_no,
  },
  success: (data) => {
    this.vkPay.status = 2; // 标记为已支付
    this.toast(data.msg);
  },
});
```

**toast 和 alert 简易封装**

```js
toast(title, icon = "none", mask = false) {
  uni.showToast({
    title,
    icon,
    mask,
    duration: 1500
  });
},
alert(content, title = "提示") {
  uni.showModal({
    title,
    content,
    showCancel: false
  });
}
```

## 完整示例

```vue
<template>
  <view class="app">
    <!-- 页面示例开始 -->
    <view class="page-content">
      <!-- #ifdef H5 || APP-PLUS -->
      <view>请选择支付方式（H5和APP可以选择）</view>
      <view style="font-size: 24rpx;">H5端会智能识别微信公众号、手机外部浏览器，PC网站扫码支付</view>
      <radio-group @change="radioChange" style="display: flex;margin: 10rpx 0;">
        <label style="flex: 1;">
          <radio value="wxpay" :checked="form1.provider == 'wxpay'" />
          <text>微信</text>
        </label>
        <label style="flex: 1;">
          <radio value="alipay" :checked="form1.provider == 'alipay'" />
          <text>支付宝</text>
        </label>
      </radio-group>
      <!-- #endif -->
      <view style="margin-bottom: 16rpx;">支付金额：(单位分 100 = 1元)</view>
      <input class="input" type="text" v-model="form1.total_fee" placeholder="支付金额" />
      <view style="margin-bottom: 16rpx;">订单号</view>
      <input class="input" type="text" v-model="form1.out_trade_no" placeholder="订单号" />

      <!-- #ifdef H5 -->
      <button class="button" v-if="h5Env === 'h5-weixin'" type="primary" @click="getWeiXinJsCode('snsapi_base')">公众号获取openid示例</button>
      <button class="button" v-if="vkPay.status == 0" type="primary" @click="createPayment">发起支付</button>
      <button class="button" v-else-if="vkPay.status == 2" type="primary" @click="createPayment">再次发起支付</button>
      <!-- #endif -->

      <!-- #ifndef H5 -->
      <button class="button" @click="createPayment">支付</button>
      <!-- #endif -->

      <button class="button" @click="queryPayment">支付结果查询</button>
      <button class="button" @click="refund">申请退款</button>
      <button class="button" @click="queryRefund">退款结果查询</button>

      <button class="button" @click="transferAlipay">转账到支付宝</button>
      <button class="button" @click="transferWxpay2">转账到微信零钱v2</button>
      <button class="button" @click="transferWxpay3">转账到微信零钱v3</button>
      <button class="button" @click="getWxpayPublicCert">获取微信支付v3平台证书</button>
    </view>

    <!-- 页面示例结束s -->

    <!-- vue2版本的支付组件开始 -->
    <!-- #ifndef VUE3 -->
    <vk-uni-pay
      ref="vkPay"
      :status.sync="vkPay.status"
      :code-url.sync="vkPay.codeUrl"
      :qrcode-image.sync="vkPay.qrcodeImage"
      :query-payment-action="vkPay.queryPaymentAction"
      :page-show="vkPay.pageShow"
      :auto-get-openid="vkPay.autoGetOpenid"
      :polling="vkPay.polling"
      :return-url="vkPay.returnUrl"
      :await-notify="vkPay.awaitNotify"
      :pay-order-info="vkPay.payOrderInfo"
    ></vk-uni-pay>
    <!-- #endif -->
    <!-- vue2版本的支付组件结束 -->

    <!-- vue3版本的支付组件开始 -->
    <!-- #ifdef VUE3 -->
    <vk-uni-pay
      ref="vkPay"
      v-model:status="vkPay.status"
      v-model:codeUrl="vkPay.codeUrl"
      v-model:qrcodeImage="vkPay.qrcodeImage"
      :query-payment-action="vkPay.queryPaymentAction"
      :page-show="vkPay.pageShow"
      :auto-get-openid="vkPay.autoGetOpenid"
      :polling="vkPay.polling"
      :return-url="vkPay.returnUrl"
      :await-notify="vkPay.awaitNotify"
      :pay-order-info="vkPay.payOrderInfo"
    ></vk-uni-pay>
    <!-- #endif -->
    <!-- vue3版本的支付组件结束 -->

    <!-- 弹窗开始 -->

    <!-- 二维码支付弹窗开始 -->
    <view class="pay-qrcode-popup" v-if="vkPay.status < 2 && vkPay.codeUrl">
      <view class="pay-qrcode-popup-mask" @click="cancelPay"></view>
      <view class="pay-qrcode-popup-content">
        <image v-if="vkPay.qrcodeImage" :src="vkPay.qrcodeImage" class="pay-qrcode-popup-image"></image>
        <vk-uni-qrcode v-else :text="vkPay.codeUrl" :size="450"></vk-uni-qrcode>
        <view class="pay-qrcode-popup-info">
          <view>
            <text class="pay-qrcode-popup-info-fee">{{ (form1.total_fee / 100).toFixed(2) }}</text>
            <text>元</text>
          </view>
          <view v-if="form1.provider == 'wxpay'">请用微信扫码支付</view>
          <view v-else-if="form1.provider == 'alipay'">请用支付宝扫码支付</view>
        </view>
        <button v-if="vkPay.status == 1" type="primary" @click="queryPayment">我已完成支付</button>
      </view>
    </view>
    <!-- 二维码支付弹窗结束 -->

    <!-- 外部浏览器H5支付弹窗确认开始 -->
    <view class="pay-confirm-popup" v-if="vkPay.confirmShow">
      <view class="pay-confirm-popup-content">
        <view class="pay-confirm-popup-title">请确认支付是否已完成</view>
        <view><button type="primary" @click="queryPayment">已完成支付</button></view>
        <view class="pay-confirm-popup-refresh"><button type="default" @click="afreshPayment">支付遇到问题，重新支付</button></view>
        <view class="pay-confirm-popup-cancel" @click="vkPay.confirmShow = false">暂不支付</view>
      </view>
    </view>
    <!-- 外部浏览器H5支付弹窗确认结束 -->

    <!-- 弹窗结束 -->
  </view>
</template>

<script>
  export default {
    data() {
      // 页面数据变量
      return {
        vkPay: {
          /**
           * 查询支付状态的云函数配置
           * 如果是非路由框架，则action为字符串，值为云函数名称
           * 如果是路由框架，则按下方配置填写
           * 注意：queryPaymentAction内参数用默认即可，无需更改。（除非你已经知道参数的意义）
           */
          queryPaymentAction: {
            name: 'vk-pay', // 云函数名称
            action: 'pay/queryPayment', // 路由模式下云函数地址
            actionKey: 'action', // 路由模式下云函数地址的识别key
            dataKey: 'data', // 路由模式下云函数请求参数的识别key
          },
          // PC支付的付款二维码地址，渲染二维码需要自己写，可以参考示例中的二维码组件 vk-uni-qrcode
          codeUrl: '',
          qrcodeImage: '',
          // 当前支付状态 0:等待发起支付 1:支付中 2:已支付（注意：跟数据库的status无关）
          status: 0,
          // 当前页面是否显示
          pageShow: true,
          // 启用轮询检测订单支付状态（仅h5支付有效）
          polling: true,
          // 仅微信手机外部浏览器H5支付时有效，必须是http或https开头的绝对路径，且在微信H5支付配置的域名白名单中。你还需要将此H5域名加入uniCloud白名单
          // 如果此值为空，则默认返回当前页面，返回的页面url参数会带上confirmShow=true&out_trade_no=实际订单号
          returnUrl: '',
          // 确认已支付的弹窗开关（微信手机外部浏览器H5支付时有效）
          confirmShow: false,
          // 支付成功后，是否需要等待异步回调全部执行完成后才通知前端（当awaitNotify和payOrderInfo均为false时，支付成功的响应速度最快）
          awaitNotify: true,
          // 支付成功后，是否需要返回支付订单数据（当awaitNotify和payOrderInfo均为false时，支付成功的响应速度最快）
          payOrderInfo: false,
          // 是否自动获取小程序的openid（若传false，则在createPayment时需要自己传对应的openid，一般服务商模式下需要传false）
          autoGetOpenid: true,
        },
        // 表单请求数据
        form1: {
          provider: 'wxpay',
          total_fee: 1,
          out_trade_no: '',
          subject: '测试订单标题',
          body: '测试订单详情',
          type: 'recharge',
          openid: '',
        },
      };
    },
    // 监听 - 页面每次【加载时】执行(如：前进)
    onLoad(options = {}) {
      // 此处是因为微信H5外部浏览器支付后微信会重新打开指定页面，我们需要做一个弹窗让用户自己点下是否支付成功，同时云函数会去请求微信服务器检查是否真的付款成功。
      this.vkPay.confirmShow = options.confirmShow || false;
      if (options.out_trade_no) this.form1.out_trade_no = options.out_trade_no;
      if (options.code && options.state) {
        // 获取微信公众号的openid
        setTimeout(() => {
          this.getOpenid({
            code: options.code,
          });
        }, 300);
      }
    },
    // 监听 - 页面每次【显示时】执行(如：前进和返回) (页面每次出现在屏幕上都触发，包括从下级页面点返回露出当前页面)
    onShow() {
      this.vkPay.pageShow = true;
    },
    // 监听 - 页面每次【隐藏时】执行(如：返回)
    onHide() {
      this.vkPay.pageShow = false;
    },
    // 函数
    methods: {
      // 发起支付
      createPayment(obj = {}) {
        let { form1 } = this;
        // 这里的订单号\金额等数据应该是从数据库里获取的,这里为演示需要,故直接本地生成.
        form1.out_trade_no = obj.out_trade_no || 'test_' + Date.now();
        // #ifdef MP-WEIXIN
        form1.provider = 'wxpay';
        // #endif
        // #ifdef MP-ALIPAY
        form1.provider = 'alipay';
        // #endif
        this.$refs.vkPay.createPayment({
          // 如果是非路由框架，则外层action不再是json，而为字符串，值为云函数名称，如 action: "你的云函数名称"
          // 如果是路由框架，则按下方配置填写
          // 如果云函数name为 vk-pay，则无需改动 action
          action: {
            name: 'vk-pay', // 云函数名称
            action: 'pay/createPayment', // 路由模式下云函数地址
            actionKey: 'action', // 路由模式下云函数地址的识别key(注意VK路由框架下,此值为$url)
            dataKey: 'data', // 路由模式下云函数请求参数的识别key
          },
          // 请求数据（data内的参数会传给云函数，云函数中通过 data.xxx 的方式获取）
          data: {
            provider: form1.provider,
            total_fee: form1.total_fee,
            out_trade_no: form1.out_trade_no,
            subject: form1.subject,
            body: form1.body,
            type: form1.type,
            openid: form1.openid, // 如果是微信公众号支付，则openid不能为空
          },
          // 支付订单创建成功回调
          create: (res) => {
            console.log('pay-create', res);
            this.form1.out_trade_no = res.out_trade_no; // 如果订单号是云端生成的，这里可以拿到订单号，此处如果return false; 则不再执行后续逻辑
          },
          // 支付成功回调
          success: (res) => {
            // 此处一般是写支付成功的提示或跳转到支付成功的页面。
            uni.showToast({ title: '支付成功', icon: 'success', mask: true });
            console.log('pay-success', res);
          },
          // 失败回调
          fail: (res) => {
            console.error('pay-fail', res);
            if (res.failType === 'create') {
              // 创建支付失败时提示
              uni.showModal({
                title: '提示',
                content: res.msg,
                showCancel: false,
              });
            } else if (res.failType === 'request') {
              // 请求支付失败时提示
              uni.showToast({ title: '请求支付失败', icon: 'none', mask: true });
            } else if (res.failType === 'result') {
              // 支付结果失败时提示
              uni.showToast({ title: '支付失败', icon: 'none', mask: true });
            }
          },
          // 取消回调
          cancel: (res) => {
            uni.showToast({ title: '用户取消支付', icon: 'none', mask: true });
          },
        });
      },
      // 重新支付
      afreshPayment() {
        this.createPayment({
          out_trade_no: this.form1.out_trade_no,
        });
      },
      // 支付状态查询
      queryPayment() {
        // 支付状态查询你可以直接查你的订单表，看订单是否已支付（因为最终判定用户是否支付成功应该以你的订单表为准）
        // 如果vkPay.queryPayment接口返回支付成功，但你的订单表查询到未支付，代表你的异步回调函数写的有问题。
        this.$refs.vkPay.queryPayment({
          title: '查询中...',
          data: {
            out_trade_no: this.form1.out_trade_no,
          },
          needAlert: true,
          success: (data) => {
            this.vkPay.status = 2; // 标记为已支付
            this.vkPay.confirmShow = false; // 关闭确认弹窗（微信H5支付有弹窗确认）
            uni.showToast({ title: data.msg, icon: 'none', mask: true });
          },
          fail: (res = {}) => {
            if (res.msg === '订单已退款') {
              this.vkPay.confirmShow = false; // 关闭确认弹窗（微信H5支付有弹窗确认）
            }
          },
        });
      },
      // 退款，此为演示，实际业务开发不应该写在前端，而是写在云函数中。
      refund() {
        this.callFunction({
          title: '退款中...',
          name: 'vk-pay',
          data: {
            action: 'pay/refund',
            data: {
              out_trade_no: this.form1.out_trade_no,
              //refund_fee: 1, // 退款金额，100=1元（单位分）不填则全额退款
            },
          },
          success: (data) => {
            uni.showToast({ title: data.msg, icon: 'none', mask: true });
          },
        });
      },
      // 退款查询
      queryRefund() {
        this.callFunction({
          title: '查询中...',
          name: 'vk-pay',
          data: {
            action: 'pay/queryRefund',
            data: {
              out_trade_no: this.form1.out_trade_no,
            },
          },
          success: (data) => {
            uni.showModal({
              title: '提示',
              content: data.msg,
              showCancel: false,
            });
          },
        });
      },
      // 转账到支付宝，此为演示，实际业务开发不应该写在前端，而是写在云函数中。
      transferAlipay() {
        this.callFunction({
          title: '请求中...',
          name: 'vk-pay',
          data: {
            action: 'pay/transfer',
            data: {
              real_name: '真实姓名',
              account: '对方支付宝账号',
              pay_type: 'alipay',
            },
          },
          success: (data) => {
            uni.showModal({
              title: '提示',
              content: data.msg,
              showCancel: false,
            });
          },
        });
      },
      // 转账到微信零钱 v2版本，此为演示，实际业务开发不应该写在前端，而是写在云函数中。
      transferWxpay2() {
        this.callFunction({
          title: '请求中...',
          name: 'vk-pay',
          data: {
            action: 'pay/transfer',
            data: {
              real_name: '真实姓名',
              openid: 'oaQxQ5SYLXdTeGMeuBYjUqaguDBY',
              pay_type: 'wxpay',
              platform: 'mp-weixin',
            },
          },
          success: (data) => {
            uni.showModal({
              title: '提示',
              content: data.msg,
              showCancel: false,
            });
          },
        });
      },
      // 转账到微信零钱 v3版本，此为演示，实际业务开发不应该写在前端，而是写在云函数中。
      transferWxpay3() {
        this.callFunction({
          title: '请求中...',
          name: 'vk-pay',
          data: {
            action: 'pay/wxpayTransfer3',
            data: {},
          },
          success: (data) => {
            uni.showModal({
              title: '提示',
              content: data.msg,
              showCancel: false,
            });
          },
        });
      },
      // 获取微信支付v3版本的微信平台证书
      getWxpayPublicCert() {
        this.callFunction({
          title: '请求中...',
          name: 'vk-pay',
          data: {
            action: 'pay/getWxpayPublicCert',
            data: {},
          },
          success: (data) => {
            uni.showModal({
              title: '提示',
              content: '请按F12 看浏览器控制台的输出内容',
              showCancel: false,
            });
            let wxpayPublicCertSn = data.wxpayPublicCertSn;
            let wxpayPublicCertContent = data.wxpayPublicCertContent;
            console.log('wxpayPublicCertSn: ', wxpayPublicCertSn);
            console.log(`wxpayPublicCertContent: 请将它压缩成一行（复制下面的证书，用""引号框住证书内容，按一下回车，自动把换行转为\\n`);
            console.log(wxpayPublicCertContent);
          },
        });
      },
      // 取消支付
      cancelPay() {
        this.vkPay.status = 0;
        this.vkPay.codeUrl = '';
      },
      // 云函数调用简易封装，你也可以用你原本框架的云函数请求封装方法来调用云函数。
      callFunction(obj = {}) {
        let { needAlert = true } = obj;
        if (obj.title) uni.showLoading({ title: obj.title, mask: true });
        uniCloud.callFunction({
          ...obj,
          success: (result = {}) => {
            if (obj.title) uni.hideLoading();
            let res = result.result;
            if (res.code === 0) {
              if (typeof obj.success == 'function') obj.success(res);
            } else {
              if (needAlert && res.msg)
                uni.showModal({
                  title: '提示',
                  content: res.msg,
                  showCancel: false,
                });
              if (typeof obj.fail == 'function') obj.fail(res);
            }
          },
          fail: (res = {}) => {
            if (obj.title) uni.hideLoading();
            if (needAlert && res.msg)
              uni.showModal({
                title: '提示',
                content: res.msg,
                showCancel: false,
              });
            if (typeof obj.fail == 'function') obj.fail(res);
          },
        });
      },
      // 选择支付方式
      radioChange(e) {
        this.form1.provider = e.detail.value;
      },
      // 获取公众号code
      getWeiXinJsCode(scope = 'snsapi_base') {
        let appid = 'wx2ebf03d174875bed'; // 填写公众号的appid
        let redirect_uri = window.location.href.split('?')[0];
        let url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirect_uri}&response_type=code&scope=${scope}&state=STATE#wechat_redirect`;
        window.location.href = url;
      },
      // 获取公众号openid
      getOpenid(data) {
        let { code } = data;
        this.callFunction({
          title: '请求中...',
          name: 'vk-pay',
          data: {
            action: 'pay/code2SessionWeixinH5',
            data,
          },
          success: (res) => {
            if (res.openid) {
              this.form1.openid = res.openid;
              uni.showToast({
                title: '已获取到openid，可以开始支付',
                icon: 'none',
                mask: true,
              });
            }
          },
        });
      },
    },
    // 计算属性
    computed: {
      // h5运行环境
      h5Env() {
        // #ifdef H5
        let ua = window.navigator.userAgent.toLowerCase();
        if (ua.match(/MicroMessenger/i) == 'micromessenger' && ua.match(/miniprogram/i) == 'miniprogram') {
          // 微信小程序
          return 'mp-weixin';
        }
        if (ua.match(/MicroMessenger/i) == 'micromessenger') {
          // 微信公众号
          return 'h5-weixin';
        }
        if (ua.match(/alipay/i) == 'alipay' && ua.match(/miniprogram/i) == 'miniprogram') {
          // 支付宝小程序
          return 'mp-alipay';
        }
        if (ua.match(/alipay/i) == 'alipay') {
          // 支付宝内
          return 'h5-alipay';
        }
        // 外部 H5
        return 'h5';
        // #endif
      },
    },
  };
</script>
<style lang="scss" scoped>
  /* 示例页面样式开始 */
  .page-content {
    padding: 15px;
    max-width: 800px;
    margin: 0 auto;
    .input {
      width: 100%;
      height: 46px;
      border: solid 1px #dddddd;
      border-radius: 5px;
      margin-bottom: 15px;
      padding: 0px 15px;
      box-sizing: border-box;
    }
    .button {
      margin-bottom: 15px;
    }
  }
  /* 示例页面样式结束 */

  /* 外部浏览器H5支付弹窗确认开始 */
  .pay-confirm-popup {
    position: fixed;
    z-index: 2;
    width: 100vw;
    top: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    .pay-confirm-popup-content {
      width: 550rpx;
      margin: 50% auto 0 auto;
      background-color: #ffffff;
      border-radius: 10rpx;
      padding: 40rpx;
      .pay-confirm-popup-title {
        text-align: center;
        padding: 20rpx 0;
        margin-bottom: 30rpx;
      }
      .pay-confirm-popup-refresh {
        margin-top: 20rpx;
      }
      .pay-confirm-popup-cancel {
        margin-top: 20rpx;
        text-align: center;
      }
    }
  }
  /* 外部浏览器H5支付弹窗确认结束 */

  /* 二维码支付弹窗开始 */
  .pay-qrcode-popup {
    position: fixed;
    z-index: 9999;
    width: 100vw;
    top: 0;
    bottom: 0;
    top: 0;
    right: 0;
    .pay-qrcode-popup-mask {
      position: absolute;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0, 0, 0, 0.6);
    }
    .pay-qrcode-popup-content {
      position: relative;
      width: 500rpx;
      margin: 40% auto 0 auto;
      background-color: #ffffff;
      border-radius: 10rpx;
      padding: 40rpx;
      box-sizing: content-box;
      text-align: center;
      .pay-qrcode-popup-info {
        text-align: center;
        padding: 20rpx;
        .pay-qrcode-popup-info-fee {
          color: red;
          font-size: 60rpx;
          font-weight: bold;
        }
      }
      .pay-qrcode-popup-image {
        width: 450rpx;
        height: 450rpx;
      }
    }
  }
  /* 二维码支付弹窗结束 */
</style>
```
