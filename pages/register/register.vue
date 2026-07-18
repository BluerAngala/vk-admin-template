<template>
  <view class="app register">
    <!-- 页面内容开始 -->
    <view class="content">
      <!-- 头部logo -->
      <view class="header">
        <image class="logo" :src="logoImage"></image>
        <view class="site-title">
          <view class="title-main">AI自动化商务定制化</view>
          <view class="title-sub">智能管理，高效运营</view>
        </view>
      </view>
      <!-- 主体 -->
      <form @submit="registerByUsername">
        <view class="form-view">
          <view class="form-item form-border">
            <text class="form-label"
              >用户名<text class="required-star">*</text></text
            >
            <input
              class="form-input"
              name="username"
              v-model="form1.username"
              type="text"
              placeholder="支持中文/英文/数字/下划线，3-32位"
              placeholder-style="'color':'#8e8e8e'"
              required
            />
          </view>

          <view class="form-item form-border">
            <text class="form-label"
              >密码<text class="required-star">*</text></text
            >
            <input
              class="form-input"
              name="password"
              v-model="form1.password"
              type="password"
              placeholder="请输入密码"
              placeholder-style="'color':'#8e8e8e'"
              required
            />
          </view>
          <view class="form-item form-border">
            <text class="form-label"
              >确认密码<text class="required-star">*</text></text
            >
            <input
              class="form-input"
              name="password2"
              v-model="form1.password2"
              type="password"
              placeholder="请再次输入密码"
              placeholder-style="'color':'#8e8e8e'"
              required
            />
          </view>

          <view class="captcha-container">
            <!-- 图形验证码 -->
            <uni-captcha scene="register" v-model="form1.captcha"></uni-captcha>
          </view>
          
          <!-- 邀请码 -->
          <view class="form-item form-border" v-if="inviteCode || inviterInfo">
            <text class="form-label">邀请人</text>
            <view class="inviter-info" v-if="inviterInfo">
              <text class="inviter-name">{{ inviterInfo.nickname || inviterInfo.username || '用户' }}</text>
              <el-tag size="mini" type="success">已绑定</el-tag>
            </view>
            <text class="invite-code-text" v-else>{{ inviteCode }}</text>
          </view>
        </view>
        <!-- 底部信息 - 同意协议和立即登录在同一行 -->
        <view class="footer-combined">
          <view class="agreement-label">
            <label>
              <checkbox-group @change="checkboxChange">
                <checkbox
                  class="footer-checkbox"
                  value="true"
                  :checked="form1.agreement"
                  active-color="#737373"
                  shape="circle"
                ></checkbox>
                <text>同意</text>
              </checkbox-group>
            </label>
            <text class="agreement-link" @click="openAgreement">《用户协议》</text>
          </view>

          <!-- 返回登录 -->
          <view class="back-to-login">
            <text @click="backToLogin">已有账号？</text>
            <text class="link-text" @click="backToLogin">立即登录</text>
          </view>
        </view>
        <view class="login-btn">
          <button
            class="btn success circle"
            hover-class="hover"
            shape="circle"
            form-type="submit"
            :plain="false"
            :hair-line="false"
            type="success"
          >
            注 册
          </button>
        </view>
      </form>
    </view>

    <!-- 页面内容结束 -->
  </view>
</template>

<script>
let vk = uni.vk;
export default {
  data() {
    // 页面数据变量
    return {
      // init请求返回的数据
      data: {},
      // 表单请求数据
      form1: {
        agreement: true,
        username: "",
        password: "",
        password2: "",
        captcha: "",
      },
      scrollTop: 0,
      isRotate: false,
      logoImage: "/static/logo.png",
      // 邀请码相关
      inviteCode: "",
      inviterInfo: null,
    };
  },
  onPageScroll(e) {
    this.scrollTop = e.scrollTop;
  },
  // 监听 - 页面每次【加载时】执行(如：前进)
  onLoad(options) {
    vk = uni.vk;
    // 统一解析邀请码（优先从options获取，H5环境再从URL hash中解析）
    const inviteCode = this.parseInviteCode(options);
    if (inviteCode) {
      options.inviteCode = inviteCode;
    }
    this.init(options);
  },
  // 监听 - 页面【首次渲染完成时】执行。注意如果渲染速度快，会在页面进入动画完成前触发
  onReady() {},
  // 监听 - 页面每次【显示时】执行(如：前进和返回) (页面每次出现在屏幕上都触发，包括从下级页面点返回露出当前页面)
  onShow() {
    // 如果还没有邀请码，再次尝试解析（防止直接打开链接时参数丢失）
    if (!this.inviteCode) {
      const inviteCode = this.parseInviteCode({});
      if (inviteCode) {
        this.setInviteCode(inviteCode);
      }
    }
  },
  // 监听 - 页面每次【隐藏时】执行(如：返回)
  onHide() {},
  // 监听 - 页面下拉刷新
  onPullDownRefresh() {
    setTimeout(() => {
      uni.stopPullDownRefresh();
    }, 1000);
  },
  // 监听 - 点击右上角转发时
  onShareAppMessage(options) {},
  // 函数
  methods: {
    // 统一解析邀请码的方法
    parseInviteCode(options = {}) {
      // 优先从options中获取
      if (options.inviteCode) {
        return options.inviteCode;
      }
      
      // H5环境下，从URL hash中解析邀请码
      // #ifdef H5
      if (window.location && window.location.hash) {
        const hash = window.location.hash;
        // 支持多种格式：#/pages/register/register?inviteCode=XXX 或 #/pages/register/register&inviteCode=XXX
        const hashMatch = hash.match(/[?&]inviteCode=([^&#]+)/);
        if (hashMatch && hashMatch[1]) {
          return decodeURIComponent(hashMatch[1]);
        }
      }
      // #endif
      
      return null;
    },
    // 设置邀请码并加载邀请人信息
    setInviteCode(code) {
      if (code && code !== this.inviteCode) {
        this.inviteCode = code;
        this.loadInviterInfo(code);
      }
    },
    // 页面数据初始化函数
    init(options = {}) {
      console.log("init: ", options);
      // 处理邀请码
      const inviteCode = options.inviteCode || this.parseInviteCode(options);
      if (inviteCode) {
        this.setInviteCode(inviteCode);
      }
    },
    // 加载邀请人信息
    loadInviterInfo(code) {
      let that = this;
      vk.callFunction({
        url: 'user/pub/getUserInfoByInviteCode',
        data: { code: code },
        success: (data) => {
          if (data.userInfo) {
            that.inviterInfo = data.userInfo;
          }
        },
        fail: (err) => {
          console.warn('获取邀请人信息失败：', err);
        }
      });
    },
    pageTo(path) {
      vk.navigateTo(path);
    },
    checkboxChange(e) {
      let that = this;
      let value = e.detail.value || [];
      if (value.length > 0 && value[0]) {
        that.form1.agreement = true;
      } else {
        that.form1.agreement = false;
      }
    },
    // 用户名+密码注册
    registerByUsername(e) {
      let that = this;
      // 阻止默认表单提交行为
      if (e) e.preventDefault();

      if (that.isRotate) {
        //判断是否加载中，避免重复点击请求
        return false;
      }
      const { agreement, username, password, password2, captcha } = that.form1;
      if (!agreement) {
        vk.toast("请阅读并同意用户服务及隐私协议", "none");
        return;
      }
      if (!username || username.trim() === "") {
        vk.toast("请输入用户名", "none");
        return;
      }
      // 验证用户名：支持中文、英文、数字和下划线，长度3-32
      const usernameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9_]{3,32}$/;
      if (!usernameRegex.test(username)) {
        vk.toast("用户名长度在3~32之间，可以包含中文、英文、数字和下划线", "none");
        return;
      }
      if (!vk.pubfn.test(password, "pwd")) {
        vk.toast(
          "密码以字母开头，长度在6~18之间，只能包含字母、数字和下划线",
          "none"
        );
        return;
      }
      if (!vk.pubfn.test(password2, "pwd")) {
        vk.toast(
          "密码以字母开头，长度在6~18之间，只能包含字母、数字和下划线",
          "none"
        );
        return;
      }
      if (password != password2) {
        vk.toast("两次密码必须相同!", "none");
        return;
      }
      if (!captcha || captcha.trim() === "") {
        vk.toast("请输入图形验证码", "none");
        return;
      }
      that.isRotate = true;

      // 调用注册接口
      vk.userCenter.register({
        data: {
          username: username,
          password: password,
          captcha: captcha,
          inviteCode: that.inviteCode || undefined,
        },
        success: (data) => {
          that.isRotate = false;
          vk.toast("注册成功!");
          // 先清空下菜单缓存
          vk.setVuex("$app.inited", false);
          vk.setVuex("$app.navMenu", []);
          // 再执行init函数
          getApp().init();
          setTimeout(() => {
            // 注册成功后自动登录,跳转到首页
            vk.navigateToHome();
          }, 1000);
        },
        fail: (err) => {
          that.isRotate = false;
          vk.toast(err.msg || "注册失败", "none");
        },
        complete: () => {
          that.isRotate = false;
        },
      });
    },
    // 返回登录页面
    backToLogin() {
      console.log("返回登录页面");
      uni.navigateBack({
        delta: 1,
      });
    },
    // 打开用户协议
    openAgreement() {
      const url = 'https://bluerangala.feishu.cn/docx/IXoedH1Oso18iDxxjWsck9SBnfb?from=from_copylink';
      // #ifdef H5
      window.open(url, '_blank');
      // #endif
      // #ifndef H5
      uni.navigateTo({
        url: '/pages/webview/webview?url=' + encodeURIComponent(url)
      });
      // #endif
    },
  },
  // 计算属性
  computed: {},
};
</script>
<style lang="scss" scoped>
@import url("@/common/css/main.css");

.register {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;

  .content {
    width: 100%;
    max-width: 30%;
    margin: 0 auto;
  }
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .register .content {
    max-width: 100%;
    padding: 0 20rpx;
  }
}

/* 验证码容器样式 */
.captcha-container {
  padding: 0 70rpx;
  margin: 26rpx 0;

  /* 调整验证码大小 */
  ::v-deep .captcha-img-box,
  ::v-deep .captcha-img,
  ::v-deep .loding {
    height: 60px !important;
    width: 150px !important;
  }

  ::v-deep .captcha {
    height: 60px !important;
    line-height: 60px !important;
    font-size: 16px !important;
  }
}

/* 表单标签样式 */
.form-label {
  font-size: 28rpx;
  color: #333333;
  margin-right: 20rpx;
  white-space: nowrap;
}

/* 必填星号样式 */
.required-star {
  color: #ff0000;
  margin-left: 4rpx;
}

/* 底部组合样式 - 协议和登录链接在同一行 */
.footer-combined {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  font-size: 28rpx;
  margin-top: 40rpx;
  padding: 0 70rpx;
  color: rgba(0, 0, 0, 0.7);

  .agreement-label {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex: 1;

    .footer-checkbox {
      transform: scale(0.7);
    }

    .agreement-link {
      color: #007aff;
      text-decoration: none;
      margin-left: 5rpx;
    }
  }

  .back-to-login {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-shrink: 0;

    .link-text {
      color: #007aff;
      margin-left: 10rpx;
      cursor: pointer;
    }

    text {
      cursor: pointer;
    }
  }
}

/* 头部样式 */
.header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 40rpx;

  .logo {
    width: 80px;
    height: 80px;
    flex-shrink: 0;
  }

  .site-title {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;

    .title-main {
      font-size: 24px;
      font-weight: 600;
      color: #2c3e50;
      line-height: 1.2;
      white-space: nowrap;
    }

    .title-sub {
      font-size: 14px;
      color: #8492a6;
      line-height: 1.2;
      white-space: nowrap;
    }
  }
}

/* 移动端头部适配 */
@media screen and (max-width: 768px) {
  .header {
    gap: 15px;

    .logo {
      width: 60px;
      height: 60px;
    }

    .site-title {
      .title-main {
        font-size: 20px;
      }

      .title-sub {
        font-size: 12px;
      }
    }
  }
}

/* 邀请人信息样式 */
.inviter-info {
  display: flex;
  align-items: center;
  gap: 10rpx;
  flex: 1;
  
  .inviter-name {
    color: #409EFF;
    font-weight: 500;
  }
}

.invite-code-text {
  color: #909399;
  font-family: monospace;
}
</style>
