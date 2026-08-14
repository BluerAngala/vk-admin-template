<template>
  <view class="cta">
    <view class="cta__inner">
      <text class="cta__title">{{ data.title || '准备好开始了吗？' }}</text>
      <text class="cta__sub">{{ data.subtitle || '' }}</text>
      <text class="btn btn--primary btn--lg" @click="handleClick">{{ data.btn_text || '免费注册' }}</text>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    data: { type: Object, default: () => ({}) }
  },
  methods: {
    handleClick() {
      this.$emit('navigate', '/pages/login/index');
    }
  }
};
</script>

<style lang="scss" scoped>
.cta {
  padding: 80px 24px;
  text-align: center;

  &__inner {
    max-width: 600px;
    margin: 0 auto;
  }

  &__title {
    display: block;
    font-size: 32px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 12px;
  }

  &__sub {
    display: block;
    font-size: 16px;
    color: #64748b;
    margin-bottom: 36px;
  }
}

.btn {
  display: inline-block;
  padding: 14px 36px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;

  &--primary {
    background: #3b82f6;
    color: #ffffff;
  }

  &--lg {
    padding: 16px 48px;
    font-size: 18px;
  }
}
</style>
