<template>
  <view class="hero">
    <view class="hero__inner">
      <text class="hero__title">{{ data.title || '' }}</text>
      <text class="hero__sub">{{ data.subtitle || '' }}</text>
      <view class="hero__actions">
        <text class="btn btn--primary" @click="handlePrimary">{{ (data.btn_primary || {}).text || '了解更多' }}</text>
        <text class="btn btn--outline" @click="handleGhost">{{ (data.btn_ghost || {}).text || '登录后台' }}</text>
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
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 24px;
  background: #ffffff;

  &__inner {
    max-width: 800px;
  }

  &__title {
    display: block;
    font-size: 48px;
    font-weight: 800;
    color: #1e293b;
    line-height: 1.2;
    letter-spacing: -1px;
    white-space: pre-line;
    margin-bottom: 24px;
  }

  &__sub {
    display: block;
    font-size: 18px;
    color: #64748b;
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

  &--outline {
    background: transparent;
    color: #3b82f6;
    border: 1px solid #3b82f6;

    &:hover {
      background: #3b82f6;
      color: #ffffff;
    }
  }
}
</style>
