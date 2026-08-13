# 个人支付接口

> vk-pay 的版本需 >= 1.11.0

## 哪些应用适合接入？

1. 没有营业执照的个人想接入在线支付
2. 有营业执照的企业但对公账户因某种原因不可用时或就想收款到个人时
3. 多商户（多租户）平台给每一个商户（租户）开通自己的在线支付（租户可能不是企业，是个人），收款直接到商户（租户）自己的商户号中，而不是平台企业代收，可以规避平台二清风险，欢迎多商户平台联系 QQ：[370725567](tencent://message/?uin=370725567) 咨询合作（无需 ICP 许可证）。

## 企业合作

如果你的公司有 `ICP许可证` 或 `EDI许可证`，可联系 QQ：[370725567](tencent://message/?uin=370725567) 咨询更进一步的合作。

[传送门 - ICP 许可证代办 - 阿里云官方](https://tm.aliyun.com/channel/product/icp?scm=20140722.S_card%40%40%E5%95%86%E5%93%81%40%40453951.S_card0.ID_card%40%40%E5%95%86%E5%93%81%40%40453951-RL_ICP%E8%AE%B8%E5%8F%AF%E8%AF%81-LOC_search%7EUND%7Ecard%7EUND%7Eitem-OR_ser-V_3-P0_0&source=5176.11533457&userCode=eeg47b5x)

[传送门 - ICP、EDI 许可证代办 - 阿里云云市场](https://market.aliyun.com/products/56838014/cmfw00042320.html?innerSource=search_ICP#sku=yuncode3632000002&source=5176.11533457&userCode=eeg47b5x)

## 配置

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-cf0c5e69-620c-4f3c-84ab-f4619262939f/c209fb67-fe1a-4a7e-8e43-11cbffadb50c.png)

对应支付配置的节点是 `vkspay`

`vkspay` 的支付配置及其简单，如下

```js
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
  /**
   * VksPay商户支付配置
   * 支持个人无需营业执照即可签约开户，正规通道，非市面上的挂机免签。（同时也支持企业签约）
   * 消费者付款资金直接进入您签约的支付宝、微信支付商户号里，支付资金由支付宝、微信支付官方结算，避免二次清算。
   * 开户联系QQ：370725567
   */
  vkspay: {
    mchId: '', // 商户门店号（在支付后台商户设置 - 接口信息 - 复制门店号和key，一个商户可以有多个门店号，不同的门店号可以用来区分收款渠道金额）
    key: '', // 商户key
  },
};
```

## 开通

请联系 QQ：[370725567](tencent://message/?uin=370725567)

## 示例代码

建议下载示例项目，查看页面 `/pages/vkspay/vkspay` 进行体验。

```vue
<template>
  <view class="app">
    <!-- 页面示例开始 -->
    <view class="page-content">
      <view class="card">
        <view class="title">支付示例</view>
        <view class="content">
          <view style="margin-bottom: 8px">支付金额（单位分 100 = 1元）：</view>
          <input class="input" type="text" v-model="form1.total_fee" placeholder="支付金额" />
          <view style="margin-bottom: 8px">订单号</view>
          <input class="input" type="text" v-model="form1.out_trade_no" placeholder="订单号" />
          <button class="button" type="primary" @click="callPayment('auto')">发起支付（智能模式）</button>
          <button class="button button-green" type="primary" @click="callPayment('wxpay')">发起微信支付</button>
          <button class="button" type="primary" @click="callPayment('alipay')">发起支付宝支付</button>
          <button class="button" type="default" @click="afreshPayment" v-if="form1.out_trade_no">原订单发起支付</button>
          <button class="button" type="default" @click="queryPayment">支付结果查询</button>
        </view>
      </view>

      <view class="card">
        <view class="title">退款示例</view>
        <view class="content">
          <view style="margin-bottom: 8px">订单号</view>
          <input class="input" type="text" v-model="form1.out_trade_no" placeholder="需要退款的订单号" />
          <view style="margin-bottom: 8px">退款（单位分 100 = 1元）：</view>
          <input class="input" type="text" v-model="form1.refund_fee" placeholder="退款金额" />
          <view class="tips">不填退款金额代表全额退款</view>
          <button class="button" type="warn" @click="refund">申请退款</button>
          <button class="button" type="default" @click="queryRefund">退款结果查询</button>
        </view>
      </view>
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

    <!-- 弹窗开始 -->
    <!-- 二维码支付弹窗开始 -->
    <!--
			如果觉得这个弹窗组件样式不好看，可以自己把组件复制一份，改个名字，如改成my-pay-qrcode-popup，然后重写这个弹窗组件页面样式
			友情提示：放在 /uni_modules/vk-uni-pay/components/xxx/xxx.vue 满足这样的目录，组件就会自动按需加载
			如：uni_modules/vk-uni-pay/components/my-pay-qrcode-popup/my-pay-qrcode-popup.vue
		-->
    <vk-uni-pay-qrcode-popup
      v-if="form1.provider === 'vkspay'"
      :provider="form1.provider"
      :provider-pay-method="form1.provider_pay_method"
      :status="vkPay.status"
      :code-url="vkPay.codeUrl"
      :qrcode-image="vkPay.qrcodeImage"
      :total-fee="form1.total_fee"
      :out-trade-no="form1.out_trade_no"
      @close="cancelPay"
      @afresh="afreshPayment"
      @query="queryPayment"
    ></vk-uni-pay-qrcode-popup>
    <!-- 二维码支付弹窗结束 -->

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
          // 启用轮询检测订单支付状态
          polling: true,
          // 支付成功后，是否需要等待异步回调全部执行完成后才通知前端（当awaitNotify和payOrderInfo均为false时，支付成功的响应速度最快）
          awaitNotify: true,
          // 支付成功后，是否需要返回支付订单数据（当awaitNotify和payOrderInfo均为false时，支付成功的响应速度最快）
          payOrderInfo: false,
          // 是否自动获取小程序的openid（VksPay个人支付接口必须传false）
          autoGetOpenid: false,
        },
        // 表单请求数据
        form1: {
          provider: 'vkspay', // 支付供应商
          provider_pay_method: 'auto', // 供应商支付方式 wxpay 微信支付 alipay 支付宝支付 auto或不传视为聚合支付
          total_fee: 1,
          out_trade_no: '',
          subject: '测试订单标题',
          body: '测试订单详情',
          type: 'recharge',
          openid: '',
          refund_fee: '',
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
    onReady() {
      let { options = {} } = this;
      // 在onReady内执行是为了先让组件加载完成
      // 如果是同步回调过来的，执行下查询
      if (options.return && options.out_trade_no) {
        this.form1.out_trade_no = options.out_trade_no;
        this.queryPayment();
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
        this.$refs.vkPay.createPayment({
          // 如果是非路由框架，则外层action不再是json，而为字符串，值为云函数名称，如 action: "你的云函数名称"
          // 如果是路由框架，则按下方配置填写
          // 如果云函数为 vk-pay，则无需改动 action
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
          // 成功回调
          success: (res) => {
            // 此处一般是写支付成功的提示或跳转到支付成功的页面。
            this.toast('支付成功', 'success');
            console.log('paySuccess', res);
          },
          // 失败回调
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
      },
      // 调起支付
      callPayment(channel) {
        // 指定支付供应商的支付渠道 wxpay 微信支付 alipay 支付宝支付
        this.form1.provider_pay_method = channel;
        this.createPayment();
      },
      // 重新支付
      afreshPayment() {
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
            this.toast(data.msg);
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
            this.toast(data.msg);
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
            this.alert(data.msg);
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
              if (needAlert && res.msg) this.alert(res.msg);
              if (typeof obj.fail == 'function') obj.fail(res);
            }
          },
          fail: (res = {}) => {
            if (obj.title) uni.hideLoading();
            if (needAlert && res.msg) this.alert(res.msg);
            if (typeof obj.fail == 'function') obj.fail(res);
          },
        });
      },

      // uni.showToast的简易封装
      toast(title, icon = 'none', mask = false) {
        uni.showToast({
          title,
          icon,
          mask,
          duration: 1500,
        });
      },
      // uni.showModal的简易封装
      alert(content, title = '提示') {
        uni.showModal({
          title,
          content,
          showCancel: false,
        });
      },
      // 跳页面
      pageTo(url) {
        uni.navigateTo({
          url,
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
    background-color: #f8f8f8;
  }
  .page-content {
    padding: 1px 0;
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
  }
  .card {
    margin: 10px;
    background-color: #ffffff;
    border-radius: 10px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    .title {
      padding: 15px;
      font-weight: bold;
      font-size: 17px;
      border-bottom: 1px solid #ebeef5;
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
      background-color: #ffffff;
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

## 常见问题

### 如何开户？

请联系 QQ：[370725567](tencent://message/?uin=370725567)

### 哪些行业、业务禁止接入？

1. 支付宝官方禁止接入行业：[传送门](https://cshall.alipay.com/enterprise/knowledgeDetail.htm?knowledgeId=201602055422)
2. 微信支付官方禁止接入行业：[传送门](https://kf.qq.com/faq/140225MveaUz150123raQRNN.html)

除以上之外，所有国家法规规定禁止的或经鉴定不适合接入的请勿签约，我们对违规行为零容忍，一经发现将关闭支付接口权限，关联商户清退并视违规情况报警处理。

### 支持哪些主体签约开户？

1. 个人（无需营业执照）
2. 个体工商户
3. 企业

### 我的资金是否安全？

消费者付款资金直接进入您签约的支付宝、微信支付商户号里，支付资金由支付宝、微信支付官方结算，安全稳定，且避免二次清算。

### 交易款到账时间？

D+1 自动到账你绑定的银行卡

### 需要有公众号吗？需要营业执照吗？

不需要，没有公众号、没有营业执照也可签约。

### 需要上传我的支付宝、微信个人收款码吗？需要下载 APP 吗？需要准备一部手机吗？

全部不需要！

并非市面上的挂机、代收等形式。

直接与支付宝、微信支付官方签约，签约后资金全部由支付宝、微信支付负责，消费者付款资金直接进入您签约的支付宝、微信支付商户号里，支付资金由支付宝、微信支付官方结算，安全稳定，且避免二次清算。

### API 接口支持哪些支付方式？

**支付宝**

1. 扫码支付
2. 支付宝内 H5 支付
3. 支付宝外 H5 支付
4. 小程序支付
5. APP 支付
6. 微信内 H5 支付（仅限 IOS 手机）

**微信支付**

1. 扫码支付
2. 微信内 H5 支付
3. 微信外 H5 支付
4. 小程序支付
5. APP 支付

**通用**

1. 异步回调
2. 支付结果查询
3. 申请退款
4. 退款结果查询
