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

    <!-- 动态渲染区块 -->
    <view v-for="(section, i) in sections" :key="i">
      <HeroSection
        v-if="section.type === 'hero' && section.enable"
        :data="section.data"
        @scroll-to-features="scrollToFeatures"
        @navigate="navigateTo"
      />
      <StatsSection
        v-if="section.type === 'stats' && section.enable"
        :data="section.data"
      />
      <FeaturesSection
        v-if="section.type === 'features' && section.enable"
        :data="section.data"
      />
      <AdvantagesSection
        v-if="section.type === 'advantages' && section.enable"
        :data="section.data"
      />
      <CTASection
        v-if="section.type === 'cta' && section.enable"
        :data="section.data"
        @navigate="navigateTo"
      />
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
import HeroSection from './components/HeroSection.vue';
import StatsSection from './components/StatsSection.vue';
import FeaturesSection from './components/FeaturesSection.vue';
import AdvantagesSection from './components/AdvantagesSection.vue';
import CTASection from './components/CTASection.vue';

let vk = uni.vk;

export default {
  components: { HeroSection, StatsSection, FeaturesSection, AdvantagesSection, CTASection },
  data() {
    return {
      scrolled: false,
      sections: []
    };
  },
  computed: {
    isLoggedIn() {
      return this.vk.checkToken();
    },
    userInfo() {
      return this.vk.getVuex('$user.userInfo') || {};
    }
  },
  onLoad() {
    vk = this.vk;
    this.loadPageConfig();
  },
  onPageScroll(e) {
    this.scrolled = e.scrollTop > 20;
  },
  methods: {
    // 加载落地页配置
    loadPageConfig() {
      vk.callFunction({
        url: 'admin/landing-page/sys/get',
        data: {},
        success: (res) => {
          if (res.data && res.data.sections) {
            this.sections = res.data.sections;
          }
        },
        fail: () => {
          // 静默失败，使用默认空数据
        }
      });
    },

    // 滚动到功能区块
    scrollToFeatures() {
      uni.createSelectorQuery().select('#features').boundingClientRect(rect => {
        if (rect) {
          uni.pageScrollTo({ scrollTop: rect.top - 50, duration: 300 });
        }
      }).exec();
    },

    // 页面跳转
    navigateTo(url) {
      if (this.isLoggedIn) {
        vk.reLaunch({ url: '/pages/index/index' });
      } else {
        vk.navigateTo({ url });
      }
    },

    goLogin() {
      if (this.isLoggedIn) {
        vk.reLaunch({ url: '/pages/index/index' });
      } else {
        vk.navigateTo({ url: '/pages/login/index' });
      }
    },

    goRegister() {
      vk.navigateTo({ url: '/pages/login/index' });
    },

    goAdmin() {
      vk.reLaunch({ url: '/pages/index/index' });
    }
  }
};
</script>

<style lang="scss" scoped>
.landing {
  min-height: 100vh;
  background: #ffffff;
}

// 导航栏
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid transparent;
  transition: all 0.3s;

  &--scrolled {
    border-bottom-color: #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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
  }

  &__brand {
    font-size: 18px;
    font-weight: 700;
    color: #1e293b;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__user {
    font-size: 14px;
    color: #64748b;
  }

  &__link {
    font-size: 14px;
    color: #64748b;
    cursor: pointer;

    &:hover {
      color: #1e293b;
    }
  }

  &__btn {
    padding: 8px 20px;
    background: #3b82f6;
    color: #ffffff;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;

    &:hover {
      background: #2563eb;
    }
  }
}

// Footer
.footer {
  padding: 32px 24px;
  background: #f8fafc;
  text-align: center;

  &__text {
    font-size: 13px;
    color: #94a3b8;
  }
}
</style>
