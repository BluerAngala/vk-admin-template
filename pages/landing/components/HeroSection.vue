<template>
  <view class="hero" :style="{ background: data.bg_color || '#0a1628' }">
    <view class="hero__inner">
      <text class="hero__title">{{ data.title || '' }}</text>
      <text class="hero__sub">{{ data.subtitle || '' }}</text>
      <view class="hero__actions">
        <text class="btn btn--primary" @click="handlePrimary">{{ (data.btn_primary || {}).text || '了解更多' }}</text>
        <text class="btn btn--ghost" @click="handleGhost">{{ (data.btn_ghost || {}).text || '登录后台' }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    data: { type: Object, default: () => ({}) }
  },
  methods: {
    handlePrimary() {
      const action = (this.data.btn_primary || {}).action;
      if (action === 'scroll') {
        this.$emit('scroll-to-features');
      }
    },
    handleGhost() {
      const action = (this.data.btn_ghost || {}).action;
      if (action === 'login') {
        this.$emit('navigate', '/pages/login/index');
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 120px 24px 80px;

  &__inner {
    max-width: 800px;
  }

  &__title {
    display: block;
    font-size: 48px;
    font-weight: 800;
    color: #ffffff;
    line-height: 1.2;
    letter-spacing: -1px;
    white-space: pre-line;
    margin-bottom: 24px;
  }

  &__sub {
    display: block;
    font-size: 18px;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.6;
    white-space: pre-line;
    margin-bottom: 48px;
  }

  &__actions {
    display: flex;
    justify-content: center;
    gap: 16px;
    flex-wrap: wrap;
  }
}

.btn {
  display: inline-block;
  padding: 14px 36px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &--primary {
    background: #3b82f6;
    color: #ffffff;

    &:hover {
      background: #2563eb;
    }
  }

  &--ghost {
    background: transparent;
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.3);

    &:hover {
      border-color: rgba(255, 255, 255, 0.6);
    }
  }
}
</style>
