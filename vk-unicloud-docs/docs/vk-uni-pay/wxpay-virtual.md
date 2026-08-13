---
sidebarDepth: 0
---

# 微信小程序虚拟支付

> vk-pay 的版本需 >= 1.12.2

**概述**

微信规定上架**短剧**类目的小程序必须使用微信小程序虚拟支付，不可以使用原先的微信支付

**注意**

1. 微信小程序虚拟支付只有特定类目的小程序才能开通
2. 微信小程序虚拟支付有较高的手续费，由微信官方收取，非本插件收取（手续费多少跟使用本插件无关）

## 配置

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/c209fb67-fe1a-4a7e-8e43-11cbffadb50c.png)

对应支付配置的节点是 `wxpay-virtual.mp-weixin`

```js
const fs = require('fs');
const path = require('path');
module.exports = {
  /**
   * 统一支付回调地址，格式为 "服务空间SpaceID":"URL化完整地址"
   * 这里的本地开发并不是指 http://localhost:8080/ 的地址，而是另外一个服务空间的ULR化地址（如果你本地开发和线上环境共用同一个服务空间则只需要填线上环境的即可）
   * 回调的云函数地址，建议填 /http/vk-pay，因为vk-pay云函数已经写好了回调处理的逻辑，否则你需要自己写全部的回调逻辑。
   * 其中vk-pay是可以改名的，只需要修改 uniCloud/cloudfunctions/vk-pay/package.json 文件中的 "path": "/http/vk-pay", 把 /http/vk-pay 改成 /http/xxxx 即可(需要重新上传云函数vk-pay)。
   */
  notifyUrl: {
    // 本地开发环境，如果你本地开发和线上环境共用同一个服务空间则只需要填线上环境的即可
    'mp-22d55e33-c2f3-22b4-55fc-7b33a6144e22': 'https://fc-mp-22d55e33-c2f3-22b4-55fc-7b33a6144e22.next.bspapp.com/http/vk-pay',
    // 线上正式环境
    'mp-6666d886-00b6-22b2-9156-84afeadcf669': 'https://fc-mp-6666d886-00b6-22b2-9156-84afeadcf669.next.bspapp.com/http/vk-pay',
  },
  // 微信虚拟支付
  'wxpay-virtual': {
    // 微信 - 小程序支付
    'mp-weixin': {
      'appId': '', // 小程序的appid
      'secret': '', // secret
      'mchId': '', // 商户id（在虚拟支付 - 基本配置 - 微信支付账号信息中获取）
      'offerId': '', // 支付应用ID（在虚拟支付 - 基本配置 - 基础配置中获取）
      'appKey': '', // 现网AppKey（正式环境，在虚拟支付 - 基本配置 - 基础配置中获取）
      'sandboxAppKey': '', // 沙箱AppKey（在虚拟支付 - 基本配置 - 基础配置中获取）
      'rate': 100, // 代币兑换比例，比如1元兑换100代币，那么这里就是100（需要开通虚拟支付的时候也设置成 1 人民币 = 100 代币）
      'token': '', // 微信小程序通信的token，在开发 - 开发管理 - 消息推送 - Token(令牌) 通信地址填：https://url地址/vk-pay-notify/wxpay-virtual_mp-weixin
      'encodingAESKey': '', // 必须43位，微信小程序消息加密密钥，在开发 - 开发管理 - 消息推送 - EncodingAESKey(消息加解密密钥)
      'sandbox': false, // 是否是沙箱环境（注意：沙箱环境异步回调可能有延迟，建议直接正式环境测试）
    },
  },
};
```

## 示例代码

```vue
<template>
  <view class="app">
    <!-- 页面示例开始 -->
    <view class="page-content">
      <view class="ios-tips"> 注意：苹果手机需要在微信虚拟支付 - 基本配置 - 启用苹果IAP支付后才能支付（订单实付金额需≥1元） </view>

      <view class="card">
        <view class="title">代币充值示例</view>
        <view class="content">
          <view style="margin-bottom: 8px">充值代币数量（建议设置 1 人民币 = 100 代币）</view>
          <input class="input" type="text" v-model.number="form1.wxpay_virtual.buy_quantity" placeholder="支付金额" />
          <view style="margin-bottom: 8px">订单号</view>
          <input class="input" type="text" v-model="form1.out_trade_no" placeholder="订单号，点击支付会自动生成" />
          <button class="button button-green" type="primary" @click="callPayment('short_series_coin')">发起微信虚拟支付</button>
          <button class="button" type="default" @click="afreshPayment('short_series_coin')" v-if="form1.out_trade_no">原订单发起支付</button>
          <button class="button" type="default" @click="queryPayment">支付结果查询</button>
          <button class="button" type="default" @click="queryUserBalance">查询我的代币余额</button>
        </view>
      </view>

      <view class="card">
        <view class="title">道具直购示例</view>
        <view class="content">
          <view style="margin-bottom: 8px">
            <view style="margin: 5px 0">道具选择</view>
            <radio-group @change="productIdChange">
              <label> <radio value="test001" checked="true" />道具1 </label>
              <label style="margin-left: 10px"> <radio value="test002" />道具2 </label>
            </radio-group>
          </view>
          <view style="margin-bottom: 8px">购买道具数量</view>
          <input class="input" type="text" v-model.number="form1.wxpay_virtual.buy_quantity" placeholder="支付金额" />
          <view style="margin-bottom: 8px">订单号</view>
          <input class="input" type="text" v-model="form1.out_trade_no" placeholder="订单号，点击支付会自动生成" />
          <button class="button button-green" type="primary" @click="callPayment('short_series_goods')">发起微信虚拟支付</button>
          <button class="button" type="default" @click="afreshPayment('short_series_goods')" v-if="form1.out_trade_no">原订单发起支付</button>
          <button class="button" type="default" @click="queryPayment">支付结果查询</button>
        </view>
      </view>

      <view class="card">
        <view class="title">退款示例</view>
        <view class="content">
          <view style="margin-bottom: 8px">订单号</view>
          <input class="input" type="text" v-model="form1.out_trade_no" placeholder="需要退款的订单号" />
          <view style="margin-bottom: 8px">退款（单位分 100 = 1元）：</view>
          <input class="input" type="text" v-model="form1.refund_fee" placeholder="退款金额，不填则全额退款" />
          <view class="tips">注意：如果是代币充值订单，退款不会自动扣减用户的代币</view>
          <button class="button" type="warn" @click="refund">申请退款</button>
          <button class="button" type="default" @click="queryRefund">退款结果查询</button>
        </view>
      </view>

      <view class="card">
        <view class="title">代币相关其他接口示例</view>
        <view class="content">
          <view style="margin-bottom: 8px">代币数量</view>
          <input class="input" type="text" v-model.number="currencyPayFormData.amount" placeholder="代币数量" />
          <view style="margin-bottom: 8px">订单号</view>
          <input class="input" type="text" v-model="currencyPayFormData.out_trade_no" placeholder="订单号，点击扣减代币会自动生成" />
          <button class="button" type="default" @click="queryUserBalance">查询我的代币余额</button>
          <button class="button" type="default" @click="currencyPay">扣减代币</button>
          <button class="button" type="default" @click="cancelCurrencyPay" v-if="currencyPayFormData.out_trade_no">扣减代币回退（撤销本次扣减的代币）</button>
          <view class="tips" v-if="currencyPayFormData.out_trade_no">currencyPay接口的逆操作</view>
          <button class="button" type="default" @click="presentCurrency">赠送代币（增加代币）</button>
        </view>
      </view>
    </view>

    <!-- 页面示例结束 -->

    <!-- vue2版本的支付组件开始 -->
    <!-- #ifdef VUE2 -->
    <vk-uni-pay
      ref="vkPay"
      :status.sync="vkPay.status"
      :code-url.sync="vkPay.codeUrl"
      :qrcode-image.sync="vkPay.qrcodeImage"
      :query-payment-action="vkPay.queryPaymentAction"
      :page-show="vkPay.pageShow"
      :auto-get-openid="vkPay.autoGetOpenid"
      :polling="vkPay.polling"
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
      :await-notify="vkPay.awaitNotify"
      :pay-order-info="vkPay.payOrderInfo"
    ></vk-uni-pay>
    <!-- #endif -->
    <!-- vue3版本的支付组件结束 -->
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
          codeUrl: '', // 微信虚拟支付此参数无效
          qrcodeImage: '', // 微信虚拟支付此参数无效
          // 当前支付状态 0:等待发起支付 1:支付中 2:已支付（注意：跟数据库的status无关）
          status: 0,
          // 当前页面是否显示
          pageShow: true,
          // 启用轮询检测订单支付状态
          polling: true,
          // 支付成功后，是否需要等待异步回调全部执行完成后才通知前端（当awaitNotify和payOrderInfo均为false时，支付成功的响应速度最快）
          awaitNotify: true,
          // 支付成功后，是否需要返回支付订单数据（当awaitNotify和payOrderInfo均为false时，支付成功的响应速度最快）
          payOrderInfo: false,
          // 是否自动获取小程序的openid
          autoGetOpenid: true,
        },
        // 表单请求数据
        form1: {
          provider: 'wxpay-virtual', // 支付供应商，此处固定为vkspay
          out_trade_no: '', // 订单号
          subject: '测试订单标题', // 订单标题
          type: 'wxpay-virtual-test', // 支付回调类型，支付成功后会执行 vk-pay/pay-notify/wxpay-virtual-test 云函数（可自定义）
          openid: '', // 微信小程序的用户openid
          refund_fee: '', // 部分退款时传的退款金额（单位分，100=1元）
          wxpay_virtual: {
            mode: 'short_series_coin', // 模式 short_series_coin 代币充值 short_series_goods 道具直购
            buy_quantity: 1, // 购买代币数量或道具数量
            product_id: 'test001', // 道具id，在微信小程序后台 - 功能 - 虚拟支付 - 基本配置 - 道具配置 中配置道具id
            goods_price: 1, // 道具价格，需要和配置的价格一致才能正常发起支付
          },
        },
        currencyPayFormData: {
          out_trade_no: '',
          amount: 1,
        },
        // 页面参数
        options: {},
      };
    },
    // 监听 - 页面每次【加载时】执行(如：前进)
    onLoad(options = {}) {
      this.options = options;
    },
    // 监听 - 页面每次【加载完毕】执行
    onReady() {},
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
        // #ifndef MP-WEIXIN
        uni.showModal({
          title: '提示',
          content: '请在微信小程序中体验',
          showCancel: false,
        });
        return;
        // #endif
        let that = this;
        let { form1 } = that;
        // 这里的订单号\金额等数据应该是从数据库里获取的,这里为演示需要,故直接本地生成.
        form1.out_trade_no = obj.out_trade_no || 'test_' + Date.now();
        that.$refs.vkPay.createPayment({
          // 如果是非路由框架，则外层action不再是json，而为字符串，值为云函数名称，如 action: "你的云函数名称"
          // 如果是路由框架，则按下方配置填写
          // 如果云函数name为 vk-pay，则无需改动 action
          action: {
            name: 'vk-pay', // 云函数名称
            action: 'pay/createPayment', // 路由模式下云函数地址
            actionKey: 'action', // 路由模式下云函数地址的识别key
            dataKey: 'data', // 路由模式下云函数请求参数的识别key
          },
          // 请求数据（data内的参数会传给云函数，云函数中通过 data.xxx 的方式获取）
          data: {
            provider: form1.provider,
            total_fee: form1.total_fee,
            out_trade_no: form1.out_trade_no,
            subject: form1.subject,
            type: form1.type,
            openid: form1.openid,
            wxpay_virtual: form1.wxpay_virtual, // 微信虚拟支付专属字段
          },
          // 支付订单创建成功回调
          create: (res) => {
            console.log('pay-create', res);
            this.form1.out_trade_no = res.out_trade_no; // 如果订单号是云端生成的，这里可以拿到订单号，此处如果return false; 则不再执行后续逻辑
          },
          // 成功回调
          success: (res) => {
            // 此处一般是写支付成功的提示或跳转到支付成功的页面。
            uni.showToast({ title: '支付成功', icon: 'success', mask: false });
            console.log('pay-success', res);
          },
          // 失败回调
          fail: (err) => {
            console.error('pay-fail', err);
            let errData = {
              '-5': '开通签约结果未知',
              '-15002': 'outTradeNo重复使用,请换新单号重试',
              '-15003': '系统错误',
              '-15005': '支付配置错误',
              '-15006': '支付配置错误',
              '-15007': 'session_key过期，用户需要重新登录',
              '-15008': '二级商户进件未完成',
              '-15009': '代币未发布',
              '-15010': '道具productId未发布',
              '-15012': '调用米大师失败导致关单,请换新单号重试',
              '-15013': '道具价格错误',
              '-15014': '道具/代币发布未生效，禁止下单，大概10分钟后生效',
              '-15017': '此商家涉嫌违规，收款功能已被限制，暂无法支付。商家可以登录微信商户平台/微信支付商家助手小程序查看原因和解决方案',
              '-15018': '代币或者道具productId审核不通过',
              '-15019': '调微信报商户受限,商家可以登录微信商户平台/微信支付商家助手小程序查看原因和解决方案',
              '-15020': '操作过快，请稍候再试',
              '-15021': '小程序被限频交易',
            };
            let errMsg = errData[String(err.errCode)] || err.errMsg || err.msg || err.message;
            if (errMsg === 'requestVirtualPayment:fail INVALID_PLATFORM') {
              errMsg = '苹果手机不支持微信虚拟支付';
            } else if (errMsg === 'requestVirtualPayment:fail no permission') {
              errMsg = '微信基础库 2.19.2 开始才支付微信虚拟支付';
            }
            console.error(errMsg);
            uni.showModal({
              title: '提示',
              content: errMsg,
              showCancel: false,
            });
          },
          // 取消回调
          cancel: (res) => {
            uni.showToast({ title: '用户取消支付', icon: 'none', mask: false });
          },
        });
      },
      // 调起支付
      callPayment(mode) {
        this.form1.wxpay_virtual.mode = mode;
        this.createPayment();
      },
      // 重新支付
      afreshPayment(mode) {
        this.form1.wxpay_virtual.mode = mode;
        this.createPayment({
          out_trade_no: this.form1.out_trade_no,
        });
      },
      // 支付状态查询
      async queryPayment() {
        // 支付状态查询你可以直接查你的订单表，看订单是否已支付（因为最终判定用户是否支付成功应该以你的订单表为准）
        // 如果vkPay.queryPayment接口返回支付成功，但你的订单表查询到未支付，代表你的异步回调函数写的有问题。
        if (!this.$refs.vkPay) {
          // 尝试延迟100毫秒
          const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
          await sleep(100);
        }
        this.$refs.vkPay.queryPayment({
          title: '查询中...',
          data: {
            out_trade_no: this.form1.out_trade_no,
          },
          needAlert: true,
          success: (data) => {
            this.vkPay.status = 2; // 标记为已支付
            uni.showToast({ title: data.msg, icon: 'none', mask: false });
          },
          fail: (res = {}) => {},
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
              refund_fee: this.form1.refund_fee, // 退款金额，100=1元（单位分）不填则全额退款
            },
          },
          success: (data) => {
            uni.showToast({ title: data.msg, icon: 'none', mask: false });
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
            uni.showModal({ title: '提示', content: data.msg, showCancel: false });
          },
        });
      },
      // 取消支付
      cancelPay() {
        this.vkPay.status = 0;
        this.vkPay.codeUrl = '';
      },
      // 查询用户微信虚拟支付代币余额（微信虚拟支付的代币余额是通过调用微信API查询的）
      async queryUserBalance() {
        // #ifndef MP-WEIXIN
        uni.showModal({
          title: '提示',
          content: '请在微信小程序中体验',
          showCancel: false,
        });
        return;
        // #endif
        let openid = await this.$refs.vkPay.getOpenid();
        this.callFunction({
          title: '查询中...',
          name: 'vk-pay',
          data: {
            action: 'pay/wxpayVirtual/queryUserBalance',
            data: {
              openid,
            },
          },
          success: (data) => {
            let { balance, presentBalance } = data;
            let content = `我的余额：${balance}`;
            if (presentBalance) {
              content += `（含赠送余额：${presentBalance}）`;
            }
            uni.showModal({ title: '提示', content, showCancel: false });
          },
        });
      },
      // 扣减用户代币，扣减用户代币需要保证用户的sessionKey在有效期内（uni-pay组件会自动获取当前微信用户的sessionKey）
      async currencyPay() {
        // #ifndef MP-WEIXIN
        uni.showModal({
          title: '提示',
          content: '请在微信小程序中体验',
          showCancel: false,
        });
        return;
        // #endif
        let openid = await this.$refs.vkPay.getOpenid();
        let out_trade_no = 'test_' + Date.now();
        this.currencyPayFormData.out_trade_no = out_trade_no;
        this.callFunction({
          title: '请求中...',
          name: 'vk-pay',
          data: {
            action: 'pay/wxpayVirtual/currencyPay',
            data: {
              openid,
              out_trade_no,
              amount: this.currencyPayFormData.amount,
            },
          },
          success: (data) => {
            uni.showModal({
              title: '提示',
              content: `成功扣减余额：${data.amount}，还剩余额：${data.balance}`,
              showCancel: false,
            });
          },
        });
      },
      //扣减代币回退（代币支付退款）
      async cancelCurrencyPay() {
        // #ifndef MP-WEIXIN
        uni.showModal({
          title: '提示',
          content: '请在微信小程序中体验',
          showCancel: false,
        });
        return;
        // #endif
        let openid = await this.$refs.vkPay.getOpenid();
        this.callFunction({
          title: '请求中...',
          name: 'vk-pay',
          data: {
            action: 'pay/wxpayVirtual/cancelCurrencyPay',
            data: {
              openid,
              out_trade_no: this.currencyPayFormData.out_trade_no,
              amount: this.currencyPayFormData.amount,
            },
          },
          success: (data) => {
            uni.showModal({
              title: '提示',
              content: `余额回退成功`,
              showCancel: false,
            });
          },
        });
      },
      // 赠送代币
      async presentCurrency() {
        // #ifndef MP-WEIXIN
        uni.showModal({
          title: '提示',
          content: '请在微信小程序中体验',
          showCancel: false,
        });
        return;
        // #endif
        let openid = await this.$refs.vkPay.getOpenid();
        let out_trade_no = 'test_' + Date.now();
        this.callFunction({
          title: '请求中...',
          name: 'vk-pay',
          data: {
            action: 'pay/wxpayVirtual/presentCurrency',
            data: {
              openid,
              out_trade_no,
              amount: this.currencyPayFormData.amount,
            },
          },
          success: (data) => {
            uni.showModal({
              title: '提示',
              content: `赠送成功，当前余额：${data.balance}`,
              showCancel: false,
            });
          },
        });
      },
      // 监听道具选择
      productIdChange(e) {
        this.form1.wxpay_virtual.product_id = e.detail.value;
        if (e.detail.value === 'test002') {
          this.form1.wxpay_virtual.goods_price = 2; // 道具价格
        } else {
          this.form1.wxpay_virtual.goods_price = 1; // 道具价格
        }
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
              if (needAlert && res.msg) uni.showModal({ title: '提示', content: res.msg, showCancel: false });
              if (typeof obj.fail == 'function') obj.fail(res);
            }
          },
          fail: (res = {}) => {
            if (obj.title) uni.hideLoading();
            if (needAlert && res.msg) uni.showModal({ title: '提示', content: res.msg, showCancel: false });
            if (typeof obj.fail == 'function') obj.fail(res);
          },
        });
      },
    },
    // 计算属性
    computed: {},
  };
</script>
<style lang="scss" scoped>
  /* 示例页面样式开始 */
  page,
  .app {
    background-color: var(--page-bg, #f8f8f8);
  }

  .page-content {
    padding: 1px 0;
    max-width: 800px;
    margin: 0 auto;
    font-size: 16px;

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

      &.button-green {
        background-color: #4caf50;
      }
    }

    .ios-tips {
      padding: 5px 20px;
      color: red;
      font-size: 14px;
      font-weight: bold;
    }
  }

  .card {
    margin: 10px;
    background-color: var(--card-bg, #ffffff);
    border-radius: 10px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .title {
      padding: 15px;
      font-weight: bold;
      font-size: 17px;
      border-bottom: 1px solid var(--border-color, #f0f0f0);
    }

    .content {
      padding: 15px;

      .tips {
        color: #8f8f8f;
        font-size: 12px;
        margin-bottom: 15px;
      }
    }
  }

  /* 示例页面样式结束 */

  /* 二维码支付弹窗开始 */
  .pay-qrcode-popup {
    position: fixed;
    z-index: 2;
    width: 100vw;
    top: 0;
    bottom: 0;

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
      width: 250px;
      margin: 40% auto 0 auto;
      background-color: var(--card-bg, #ffffff);
      border-radius: 5px;
      padding: 20px;
      box-sizing: content-box;
      text-align: center;

      .pay-qrcode-popup-info {
        text-align: center;
        padding: 10px;

        .pay-qrcode-popup-info-fee {
          color: red;
          font-size: 30px;
          font-weight: bold;
        }
      }

      .pay-qrcode-popup-image {
        width: 225px;
        height: 225px;
      }
    }
  }

  /* 二维码支付弹窗结束 */
</style>
```

## 开通

- 前往 [微信虚拟支付官方文档](https://developers.weixin.qq.com/miniprogram/dev/platform-capabilities/industry/virtual-payment.html#_1-%E4%BA%A7%E5%93%81%E4%BB%8B%E7%BB%8D)

## 配置微信小程序消息推送

微信虚拟支付的异步回调依赖微信小程序消息推送，请按下图所示配置

其中 URL（服务器地址）填：`https://vk-pay的云函数URL地址/vk-pay-notify/wxpay-virtual_mp-weixin`

正确示例：`https://env-00jxho66o66.dev-hz.cloudbasefunction.cn/http/vk-pay/vk-pay-notify/wxpay-virtual_mp-weixin`

![](https://cdn.fsq.pub/vkdoc/vk-pay/bbc229ba-8635-4dab-82c2-3d462bb9a71b.png)

## API

### 代币充值、道具直购

`充值代币` 和 `道具直购` 涉及到前端 API，需要搭配 `vk-uni-pay` 组件使用，详情见上方示例代码

### queryUserBalance（查询用户代币余额）

**接口名**

`queryUserBalance`

**入参说明**

| 参数名 |  类型  | 必填 | 默认值 |      说明      |
| :----: | :----: | :--: | :----: | :------------: |
| openid | String |  是  |   -    | 用户的 openid  |
| userIp | String |  是  |   -    | 用户的 ip 地址 |

**返回值说明**

|     参数名     |  类型   |                  说明                  |
| :------------: | :-----: | :------------------------------------: |
|    balance     | Number  |     代币总余额，包括有价和赠送部分     |
| presentBalance | Number  |           赠送账户的代币余额           |
|    sumSave     | Number  |          累计有价货币充值数量          |
|   sumPresent   | Number  |          累计赠送无价货币数量          |
|   sumBalance   | Number  |          历史总增加的代币金额          |
|    sumCost     | Number  |           历史总消耗代币金额           |
| firstSaveFlag  | Boolean | 是否满足首充活动标记。0:不满足。1:满足 |

**使用示例**

```js
// 引入 vk-uni-pay 公共模块
const vkPay = require('vk-uni-pay');

exports.main = async (event, context) => {
  // 获取微信虚拟支付实例
  const wxpayVirtualManager = await vkPay.getWxpayVirtualManager();
  // 查询代币余额
  let res = await wxpayVirtualManager.queryUserBalance({
    openid: '', // 用户的openid
    userIp: '', // 用户的ip地址
  });
  console.log('res: ', res);
  return res;
};
```

### currencyPay（扣减代币）

扣减代币，一般用于代币支付

**接口名**

`currencyPay`

**注意**

此 API 需要用到用户的 `sessionKey`，如果用户长时间没有活跃过小程序，则无法请求扣减代币接口，会报用户 sessionKey 不存在或已过期，请重新登录的错误

微信小程序虚拟支付退款后，如果退款的是代币充值订单，则退款成功后原本用户充值的代币不会自动扣减，需要执行此 API 才能扣减，而用户长时间没有活跃过小程序，则无法请求扣减代币接口，因此需要注意退款时间，时间相隔太长可能会导致出现无法扣减代币的尴尬情况

**入参说明**

|   参数名   |  类型  | 必填 | 默认值 |                                                           说明                                                            |
| :--------: | :----: | :--: | :----: | :-----------------------------------------------------------------------------------------------------------------------: |
|   openid   | String |  是  |   -    |                                                       用户的 openid                                                       |
|   userIp   | String |  是  |   -    |                                                      用户的 ip 地址                                                       |
|   amount   | Number |  是  |   -    |                                                      支付的代币数量                                                       |
| outTradeNo | String |  是  |   -    |                                                          订单号                                                           |
| deviceType | Number |  是  |   -    |                                                  平台类型 1-安卓 2-苹果                                                   |
|  payitem   | String |  否  |   -    | 物品信息。记录到账户流水中。如:[{"productid":"物品 id", "unit_price": 单价, "quantity": 数量}],注意只能是 json 字符串格式 |
|   remark   | String |  否  |   -    |                                                           备注                                                            |
| sessionKey | String |  否  |   -    |                                           用户的 sessionKey，不传会尝试自动获取                                           |

**返回值说明**

|      参数名       |  类型  |            说明            |
| :---------------: | :----: | :------------------------: |
|      balance      | Number | 总余额，包括有价和赠送部分 |
| usedPresentAmount | Number |   使用赠送部分的代币数量   |
|    outTradeNo     | String |       订单号原样返回       |

**使用示例**

```js
// 引入 vk-uni-pay 公共模块
const vkPay = require('vk-uni-pay');

exports.main = async (event, context) => {
  let openid = ''; // 用户的openid
  let userIp = ''; // 用户的ip地址
  let amount = 1; // 扣减代币数量
  let out_trade_no = ''; // 商户订单号

  // 获取用户的sessionKey
  let sessionKey = await wxpayVirtualManager.getSessionKey(openid);

  // 获取微信虚拟支付实例
  const wxpayVirtualManager = await vkPay.getWxpayVirtualManager();
  // 扣减代币余额
  let res = await wxpayVirtualManager.currencyPay({
    openid, // 用户的openid
    userIp, // 用户的ip地址
    amount: Number(amount), // 扣减代币数量
    outTradeNo: out_trade_no, // 商户订单号
    payitem, // 商品详情（需要转成json字符串）
    remark, // 备注
    deviceType: 1, // 平台类型1-安卓 仅支持传1
    sessionKey, // 用户的sessionKey
  });
  console.log('res: ', res);
  return res;
};
```

### cancelCurrencyPay（代币支付退款）

代币支付退款，currencyPay 接口的逆操作

**接口名**

`cancelCurrencyPay`

**入参说明**

|   参数名    |  类型  | 必填 | 默认值 |          说明          |
| :---------: | :----: | :--: | :----: | :--------------------: |
|   openid    | String |  是  |   -    |     用户的 openid      |
|   userIp    | String |  是  |   -    |     用户的 ip 地址     |
|   amount    | Number |  是  |   -    |        退款金额        |
| outTradeNo  | String |  是  |   -    |         订单号         |
| outRefundNo | String |  是  |   -    |    本次退款单的单号    |
| deviceType  | Number |  是  |   -    | 平台类型 1-安卓 2-苹果 |

**返回值说明**

|   参数名    |  类型  |    说明    |
| :---------: | :----: | :--------: |
| outRefundNo | String | 退款订单号 |

**使用示例**

```js
// 引入 vk-uni-pay 公共模块
const vkPay = require('vk-uni-pay');

exports.main = async (event, context) => {
  let openid = ''; // 用户的openid
  let userIp = ''; // 用户的ip地址
  let out_trade_no = ''; // 需要回退的商户订单号
  let amount = 1; // 需要回退的代币数量
  let lastFourDigits = Date.now().toString().substr(-4);

  // 获取微信虚拟支付实例
  const wxpayVirtualManager = await vkPay.getWxpayVirtualManager();
  // 回退扣减代币
  let res = await wxpayVirtualManager.cancelCurrencyPay({
    openid, // 用户的openid
    userIp, // 用户的ip地址
    amount: Number(amount), // 需要回退的代币数量
    outTradeNo: out_trade_no, // 需要回退的商户订单号
    outRefundNo: `${out_trade_no}-${lastFourDigits}`, // 商户退款单号
    deviceType: 1, // 平台类型1-安卓 仅支持传1
  });
  console.log('res: ', res);
  return res;
};
```

### presentCurrency（代币赠送）

**接口名**

`presentCurrency`

**入参说明**

|   参数名   |  类型  | 必填 | 默认值 |          说明          |
| :--------: | :----: | :--: | :----: | :--------------------: |
|   openid   | String |  是  |   -    |     用户的 openid      |
|   userIp   | String |  是  |   -    |     用户的 ip 地址     |
|   amount   | Number |  是  |   -    |        退款金额        |
| outTradeNo | String |  是  |   -    |         订单号         |
| deviceType | Number |  是  |   -    | 平台类型 1-安卓 2-苹果 |

**返回值说明**

|     参数名     |  类型  |         说明         |
| :------------: | :----: | :------------------: |
|    balance     | String | 赠送后用户的代币余额 |
| presentBalance | String | 用户收到的总赠送金额 |
|   outTradeNo   | String |       赠送单号       |

**使用示例**

```js
// 引入 vk-uni-pay 公共模块
const vkPay = require('vk-uni-pay');

exports.main = async (event, context) => {
  let openid = ''; // 用户的openid
  let userIp = ''; // 用户的ip地址
  let out_trade_no = ''; // 商户订单号
  let amount = 1; // 赠送代币数量

  // 获取微信虚拟支付实例
  const wxpayVirtualManager = await vkPay.getWxpayVirtualManager();
  // 赠送代币
  let res = await wxpayVirtualManager.presentCurrency({
    openid, // 用户的openid
    userIp, // 用户的ip地址
    amount: Number(amount), // 赠送代币数量
    outTradeNo: out_trade_no, // 商户订单号
    deviceType: 1, // 平台类型1-安卓 仅支持传1
  });
  console.log('res: ', res);
  return res;
};
```
