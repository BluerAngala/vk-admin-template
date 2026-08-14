<template>
  <view class="landing">
    <!-- 导航栏 -->
    <view class="nav" :class="{ 'nav--scrolled': scrolled }">
      <view class="nav__inner">
        <view class="nav__left">
          <image class="nav__logo" src="/static/logo.png" mode="aspectFit"></image>
          <text class="nav__brand">AI 商务定制</text>
        </view>
        <view class="nav__right" v-if="isLoggedIn">
          <text class="nav__user">{{ userInfo.nickname || userInfo.username || '用户' }}</text>
          <text class="nav__btn" @click="goAdmin">进入后台</text>
        </view>
        <view class="nav__right" v-else>
          <text class="nav__link" @click="goLogin">登录</text>
          <text class="nav__btn" @click="goRegister">免费注册</text>
        </view>
      </view>
    </view>

    <!-- Hero -->
    <view class="hero">
      <view class="hero__inner">
        <text class="hero__title">AI自动化<br/>商务定制化平台</text>
        <text class="hero__sub">智能管理，高效运营<br/>一站式产品授权、卡密管理、积分商城</text>
        <view class="hero__actions">
          <text class="btn btn--primary" @click="scrollToFeatures">了解更多</text>
          <text class="btn btn--ghost" @click="goLogin">{{ isLoggedIn ? '进入后台' : '登录后台' }}</text>
        </view>
      </view>
    </view>

    <!-- 特性 -->
    <view class="features" id="features">
      <view class="features__inner">
        <text class="section__title">核心功能</text>
        <text class="section__subtitle">为您的业务提供全方位智能化管理</text>
        <view class="features__grid">
          <view class="feature-card" v-for="(item, i) in features" :key="i">
            <text class="feature-card__icon">{{ item.icon }}</text>
            <text class="feature-card__title">{{ item.title }}</text>
            <text class="feature-card__desc">{{ item.desc }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 优势 -->
    <view class="advantages">
      <view class="advantages__inner">
        <text class="section__title">为什么选择我们</text>
        <text class="section__subtitle">稳定可靠的技术底座，助力业务快速增长</text>
        <view class="advantages__list">
          <view class="adv-item" v-for="(item, i) in advantages" :key="i">
            <text class="adv-item__num">{{ String(i + 1).padStart(2, '0') }}</text>
            <view class="adv-item__content">
              <text class="adv-item__title">{{ item.title }}</text>
              <text class="adv-item__desc">{{ item.desc }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- CTA -->
    <view class="cta">
      <view class="cta__inner">
        <text class="cta__title">准备好开始了吗？</text>
        <text class="cta__sub">几分钟即可完成注册，立即体验智能化管理</text>
        <text class="btn btn--primary btn--lg" @click="isLoggedIn ? goAdmin() : goLogin()">{{ isLoggedIn ? '进入后台' : '免费注册' }}</text>
      </view>
    </view>

    <!-- Footer -->
    <view class="footer">
      <view class="footer__inner">
        <text class="footer__text">© 2024 AI 商务定制化平台. All rights reserved.</text>
      </view>
    </view>
  </view>
</template>

<script>
  let vk = uni.vk;
  export default {
    data() {
      return {
        scrolled: false,
        features: [
          { icon: '📦', title: '产品管理', desc: '统一管理您的产品授权，支持多种授权类型，灵活分配与回收' },
          { icon: '🔑', title: '卡密系统', desc: '一键生成卡密，支持批量操作，自动校验激活状态' },
          { icon: '💰', title: '积分商城', desc: '灵活的积分体系，支持多种套餐购买，助力用户留存与转化' },
          { icon: '🎫', title: '工单支持', desc: '完善的工单系统，快速响应客户需求，提升服务质量' },
          { icon: '🤝', title: '邀请返利', desc: '邀请好友注册即可获得返利，裂变式增长获客成本低' },
          { icon: '🤖', title: 'AI 赋能', desc: '集成 AI 能力，智能辅助业务决策，提升运营效率' },
        ],
        advantages: [
          { title: '云端部署，即开即用', desc: '基于 uniCloud 云开发，无需自建服务器，分钟级上线' },
          { title: '数据安全，权限可控', desc: '完善的权限管理体系，数据隔离，操作可追溯' },
          { title: '多端适配，统一管理', desc: '支持 H5、小程序、App 多端访问，一套代码全平台覆盖' },
          { title: '持续迭代，功能丰富', desc: '持续更新迭代，更多实用功能陆续上线' },
        ],
      };
    },
    computed: {
      isLoggedIn() {
        return this.vk.checkToken();
      },
      userInfo() {
        return this.vk.getVuex('$user.userInfo') || {};
      },
    },
    onLoad() {
      vk = this.vk;
    },
    onPageScroll(e) {
      this.scrolled = e.scrollTop > 20;
    },
    methods: {
      goLogin() {
        if (this.isLoggedIn) {
          vk.reLaunch({ url: '/pages/index/index' });
        } else {
          vk.navigateTo({ url: '/pages/login/index' });
        }
      },
      goAdmin() {
        vk.reLaunch({ url: '/pages/index/index' });
      },
      scrollToFeatures() {
        uni.createSelectorQuery().select('#features').boundingClientRect(rect => {
          if (rect) {
            uni.pageScrollTo({ scrollTop: rect.top - 50, duration: 300 });
          }
        }).exec();
      },
    },
  };
</script>

<style lang="scss" scoped>
  // 变量
  $accent: #409eff;
  $accent-hover: #66b1ff;
  $dark: #1a1a2e;
  $text: #303133;
  $text-secondary: #606266;
  $text-tertiary: #909399;
  $bg: #ffffff;
  $bg-alt: #f5f7fa;
  $border: #e4e7ed;
  $radius: 8px;

  .landing {
    min-height: 100vh;
    background-color: $bg;
    color: $text;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  }

  // ---- 导航 ----
  .nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid transparent;
    transition: all 0.3s;

    &--scrolled {
      border-bottom-color: $border;
      box-shadow: 0 1px 8px rgba(0, 0, 0, 0.04);
    }

    &__inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    &__left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    &__logo {
      width: 32px;
      height: 32px;
      border-radius: 6px;
    }

    &__brand {
      font-size: 18px;
      font-weight: 700;
      color: $dark;
    }

    &__right {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    &__user {
      font-size: 14px;
      color: $dark;
      font-weight: 500;
    }

    &__link {
      font-size: 14px;
      color: $text-secondary;
      cursor: pointer;

      &:hover {
        color: $accent;
      }
    }

    &__btn {
      font-size: 14px;
      color: #fff;
      background: $accent;
      padding: 8px 20px;
      border-radius: $radius;
      cursor: pointer;
      font-weight: 500;

      &:hover {
        background: $accent-hover;
      }
    }
  }

  // ---- Hero ----
  .hero {
    padding: 160px 24px 100px;
    text-align: center;
    background: linear-gradient(180deg, $bg 0%, $bg-alt 100%);

    &__inner {
      max-width: 720px;
      margin: 0 auto;
    }

    &__title {
      display: block;
      font-size: clamp(32px, 5vw, 48px);
      font-weight: 800;
      line-height: 1.2;
      color: $dark;
      margin-bottom: 20px;
      letter-spacing: -0.5px;
    }

    &__sub {
      display: block;
      font-size: 17px;
      line-height: 1.7;
      color: $text-secondary;
      margin-bottom: 36px;
    }

    &__actions {
      display: flex;
      justify-content: center;
      gap: 16px;
    }
  }

  // ---- 按钮 ----
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 44px;
    padding: 0 28px;
    border-radius: $radius;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    &--primary {
      background: $accent;
      color: #fff;
      border: none;

      &:hover {
        background: $accent-hover;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
      }
    }

    &--ghost {
      background: transparent;
      color: $text;
      border: 1px solid $border;

      &:hover {
        border-color: $accent;
        color: $accent;
      }
    }

    &--lg {
      height: 50px;
      padding: 0 36px;
      font-size: 16px;
    }
  }

  // ---- 特性 ----
  .features {
    padding: 80px 24px;
    background: $bg;

    &__inner {
      max-width: 1200px;
      margin: 0 auto;
      text-align: center;
    }

    &__grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
      margin-top: 48px;
    }
  }

  .section__title {
    display: block;
    font-size: 28px;
    font-weight: 800;
    color: $dark;
    margin-bottom: 12px;
  }

  .section__subtitle {
    display: block;
    font-size: 16px;
    color: $text-secondary;
  }

  .feature-card {
    background: $bg;
    border: 1px solid $border;
    border-radius: 12px;
    padding: 32px 24px;
    text-align: left;
    transition: all 0.2s;

    &:hover {
      border-color: $accent;
      box-shadow: 0 4px 20px rgba(64, 158, 255, 0.08);
      transform: translateY(-2px);
    }

    &__icon {
      display: block;
      font-size: 32px;
      margin-bottom: 16px;
    }

    &__title {
      display: block;
      font-size: 17px;
      font-weight: 700;
      color: $dark;
      margin-bottom: 8px;
    }

    &__desc {
      display: block;
      font-size: 14px;
      line-height: 1.6;
      color: $text-secondary;
    }
  }

  // ---- 优势 ----
  .advantages {
    padding: 80px 24px;
    background: $bg-alt;

    &__inner {
      max-width: 900px;
      margin: 0 auto;
      text-align: center;
    }

    &__list {
      margin-top: 48px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
  }

  .adv-item {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    text-align: left;
    padding: 24px;
    background: $bg;
    border-radius: 12px;
    border: 1px solid $border;
    transition: all 0.2s;

    &:hover {
      border-color: $accent;
      box-shadow: 0 2px 12px rgba(64, 158, 255, 0.06);
    }

    &__num {
      font-size: 28px;
      font-weight: 800;
      color: $accent;
      min-width: 48px;
      line-height: 1;
    }

    &__content {
      flex: 1;
    }

    &__title {
      display: block;
      font-size: 17px;
      font-weight: 700;
      color: $dark;
      margin-bottom: 6px;
    }

    &__desc {
      display: block;
      font-size: 14px;
      line-height: 1.6;
      color: $text-secondary;
    }
  }

  // ---- CTA ----
  .cta {
    padding: 80px 24px;
    background: $dark;
    text-align: center;

    &__inner {
      max-width: 600px;
      margin: 0 auto;
    }

    &__title {
      display: block;
      font-size: 28px;
      font-weight: 800;
      color: #fff;
      margin-bottom: 12px;
    }

    &__sub {
      display: block;
      font-size: 16px;
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 32px;
    }
  }

  // ---- Footer ----
  .footer {
    padding: 24px;
    background: $bg-alt;
    text-align: center;

    &__text {
      font-size: 13px;
      color: $text-tertiary;
    }
  }
</style>
