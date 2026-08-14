<template>
  <view class="advantages">
    <view class="advantages__inner">
      <text class="section__title">{{ data.title || '为什么选择我们' }}</text>
      <text class="section__subtitle">{{ data.subtitle || '' }}</text>
      <view class="advantages__list">
        <view class="adv-item" v-for="(item, i) in data.items" :key="i">
          <text class="adv-item__num">{{ String(i + 1).padStart(2, '0') }}</text>
          <view class="adv-item__content">
            <text class="adv-item__title">{{ item.title }}</text>
            <text class="adv-item__desc">{{ item.desc }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    data: { type: Object, default: () => ({}) }
  }
};
</script>

<style lang="scss" scoped>
.advantages {
  padding: 80px 24px;
  background: #f8fafc;

  &__inner {
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
  }

  &__list {
    margin-top: 48px;
    text-align: left;
  }
}

.section {
  &__title {
    display: block;
    font-size: 32px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 12px;
  }

  &__subtitle {
    display: block;
    font-size: 16px;
    color: #64748b;
  }
}

.adv-item {
  display: flex;
  gap: 24px;
  padding: 24px 0;
  border-bottom: 1px solid #e2e8f0;

  &:last-child {
    border-bottom: none;
  }

  &__num {
    font-size: 24px;
    font-weight: 700;
    color: #3b82f6;
    min-width: 40px;
  }

  &__content {
    flex: 1;
  }

  &__title {
    display: block;
    font-size: 18px;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 6px;
  }

  &__desc {
    display: block;
    font-size: 14px;
    color: #64748b;
    line-height: 1.6;
  }
}
</style>
